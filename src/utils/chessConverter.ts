import { Chess } from 'chess.js';

export type ChessInputFormat =
  | 'auto'
  | 'chess_com_html'
  | 'lichess_html'
  | 'pgn'
  | 'san_moves'
  | 'uci_lan'
  | 'json_moves'
  | 'columnar_text'
  | 'fen';

export type ChessOutputFormat =
  | 'pgn'
  | 'pgn_minimal'
  | 'fen_final'
  | 'fen_history'
  | 'uci'
  | 'json'
  | 'columnar'
  | 'csv'
  | 'markdown';

export interface PgnHeaders {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  whiteElo?: string;
  blackElo?: string;
  eco?: string;
}

export interface ChessPly {
  ply: number;
  moveNumber: number;
  color: 'w' | 'b';
  san: string;
  uci: string;
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  fen: string;
  isCheck: boolean;
  isCheckmate: boolean;
}

export interface ChessTurn {
  moveNumber: number;
  white?: ChessPly;
  black?: ChessPly;
}

export interface ChessConversionResult {
  success: boolean;
  detectedFormat: ChessInputFormat;
  error?: string;
  warning?: string;
  headers: PgnHeaders;
  plies: ChessPly[];
  turns: ChessTurn[];
  pgn: string;
  pgnMinimal: string;
  finalFen: string;
  startingFen: string;
  uciString: string;
  stats: {
    totalPlies: number;
    totalTurns: number;
    whiteCaptures: number;
    blackCaptures: number;
    totalChecks: number;
    hasCheckmate: boolean;
    result: string;
  };
}

// Unicode figurine mappings
const UNICODE_FIGURINES: Record<string, string> = {
  '♔': 'K', '♚': 'K',
  '♕': 'Q', '♛': 'Q',
  '♖': 'R', '♜': 'R',
  '♗': 'B', '♝': 'B',
  '♘': 'N', '♞': 'N',
};

/**
 * Auto-detect the format of the chess input
 */
export function detectChessFormat(input: string): ChessInputFormat {
  const trimmed = input.trim();
  if (!trimmed) return 'san_moves';

  // 1. Chess.com HTML move list (like the user's snippet)
  if (
    trimmed.includes('main-line-row') ||
    trimmed.includes('move-list-row') ||
    trimmed.includes('white-move') ||
    trimmed.includes('black-move') ||
    trimmed.includes('data-whole-move-number') ||
    trimmed.includes('icon-font-chess')
  ) {
    return 'chess_com_html';
  }

  // 2. Generic / Lichess HTML
  if (
    /<(?:div|span|u8t|move|san)[^>]*class=["'][^"']*(?:move|ply|node|san)[^"']*["']/i.test(trimmed) ||
    /data-figurine=/i.test(trimmed)
  ) {
    return 'lichess_html';
  }

  // 3. FEN position string (6 space-separated tokens)
  if (/^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s+[wb]\s+[-KQkq]+\s+[-a-h1-8]+\s+\d+\s+\d+$/.test(trimmed)) {
    return 'fen';
  }

  // 4. JSON move array or object
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) || parsed.moves || parsed.pgn || parsed.turns) {
        return 'json_moves';
      }
    } catch {
      // not JSON
    }
  }

  // 5. Standard PGN with headers [Event "..."]
  if (/^\s*\[[A-Za-z]+\s+"[^"]*"\]/m.test(trimmed)) {
    return 'pgn';
  }

  // 6. UCI Long Algebraic Notation (pure sequence of e2e4 g8f6 e7e5 ...)
  const uciTokens = trimmed.split(/\s+/).filter(Boolean);
  if (uciTokens.length >= 2 && uciTokens.every((t) => /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(t))) {
    return 'uci_lan';
  }

  // 7. Columnar / Tabular text: "1.  d4   Nf6\n2.  Nf3  e6"
  if (/^\s*\d+\.\s+[A-Za-z0-9+#=x-]+\s+[A-Za-z0-9+#=x-]+/m.test(trimmed)) {
    return 'columnar_text';
  }

  return 'san_moves';
}

/**
 * Extracts moves from Chess.com HTML move list DOM or regex
 */
export function parseChessComHtml(html: string): string[] {
  const extractedMoves: string[] = [];

  // Try browser DOMParser if available in browser environment
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Look for rows or move nodes
      const rows = doc.querySelectorAll('.main-line-row, .move-list-row, [data-whole-move-number]');
      if (rows.length > 0) {
        rows.forEach((row) => {
          // White ply
          const whiteNode = row.querySelector('.white-move, [data-node$="-0"], [data-node$="-2"], [data-node$="-4"], [data-node$="-6"], [data-node$="-8"]');
          if (whiteNode) {
            const move = extractNodeMove(whiteNode);
            if (move) extractedMoves.push(move);
          }

          // Black ply
          const blackNode = row.querySelector('.black-move, [data-node$="-1"], [data-node$="-3"], [data-node$="-5"], [data-node$="-7"], [data-node$="-9"]');
          if (blackNode) {
            const move = extractNodeMove(blackNode);
            if (move) extractedMoves.push(move);
          }
        });

        if (extractedMoves.length > 0) {
          return extractedMoves;
        }
      }

      // Alternative query for all move nodes
      const allMoveNodes = doc.querySelectorAll('.node, .main-line-ply, .move-text');
      if (allMoveNodes.length > 0) {
        allMoveNodes.forEach((node) => {
          const move = extractNodeMove(node);
          if (move) extractedMoves.push(move);
        });
        if (extractedMoves.length > 0) {
          return extractedMoves;
        }
      }
    } catch {
      // Fallback to regex
    }
  }

  // Regex fallback: extracts move rows and nodes cleanly
  return parseChessComHtmlRegex(html);
}

function extractNodeMove(node: Element): string {
  let figurine = '';
  const figurineEl = node.querySelector('[data-figurine], .icon-font-chess, [class*="knight-"], [class*="bishop-"], [class*="rook-"], [class*="queen-"], [class*="king-"]');
  if (figurineEl) {
    const attr = figurineEl.getAttribute('data-figurine');
    if (attr) {
      figurine = attr;
    } else {
      const cls = figurineEl.className.toLowerCase();
      if (cls.includes('knight')) figurine = 'N';
      else if (cls.includes('bishop')) figurine = 'B';
      else if (cls.includes('rook')) figurine = 'R';
      else if (cls.includes('queen')) figurine = 'Q';
      else if (cls.includes('king')) figurine = 'K';
    }
  }

  // Text inside the node (excluding figurines if any text inside)
  const clone = node.cloneNode(true) as Element;
  const figInClone = clone.querySelector('[data-figurine], .icon-font-chess');
  if (figInClone) {
    figInClone.remove();
  }
  let text = clone.textContent || '';
  text = text.trim();

  // Combine
  let fullMove = figurine ? `${figurine}${text}` : text;
  return cleanMoveSan(fullMove);
}

/**
 * Robust Regex parser for Chess.com and Lichess HTML snippets
 */
export function parseChessComHtmlRegex(html: string): string[] {
  const moves: string[] = [];

  // Match move divs: <div data-node="..." class="node [white|black]-move ...">...</div>
  const nodeRegex = /<div[^>]*class=["'][^"']*\bnode\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
  let match: RegExpExecArray | null;

  while ((match = nodeRegex.exec(html)) !== null) {
    const innerHtml = match[1];

    // Check for figurine attribute: data-figurine="N" or class="icon-font-chess knight-black"
    let figurine = '';
    const figAttrMatch = innerHtml.match(/data-figurine=["']([NBKRQ])["']/i);
    if (figAttrMatch) {
      figurine = figAttrMatch[1].toUpperCase();
    } else {
      const figClassMatch = innerHtml.match(/icon-font-chess\s+([a-z]+)-(?:white|black)/i);
      if (figClassMatch) {
        const pieceName = figClassMatch[1].toLowerCase();
        if (pieceName === 'knight') figurine = 'N';
        else if (pieceName === 'bishop') figurine = 'B';
        else if (pieceName === 'rook') figurine = 'R';
        else if (pieceName === 'queen') figurine = 'Q';
        else if (pieceName === 'king') figurine = 'K';
      }
    }

    // Strip tags to get the move text (e.g. "d4", "f6", "xc3", "O-O", "bd2")
    const stripped = innerHtml.replace(/<[^>]+>/g, ' ').trim();
    if (stripped) {
      // Clean leading numbers or annotations
      const cleanText = stripped.replace(/^\d+\.\s*/, '').trim();
      const combined = figurine ? `${figurine}${cleanText}` : cleanText;
      const sanitized = cleanMoveSan(combined);
      if (sanitized) {
        moves.push(sanitized);
      }
    }
  }

  // If nodeRegex didn't catch anything, fallback to row extraction
  if (moves.length === 0) {
    // Look for spans with class node-highlight-content
    const spanRegex = /<span[^>]*class=["'][^"']*node-highlight-content[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi;
    while ((match = spanRegex.exec(html)) !== null) {
      const inner = match[1];
      let figurine = '';
      const figMatch = inner.match(/data-figurine=["']([NBKRQ])["']/i);
      if (figMatch) figurine = figMatch[1].toUpperCase();
      const text = inner.replace(/<[^>]+>/g, '').trim();
      const combined = figurine ? `${figurine}${text}` : text;
      const sanitized = cleanMoveSan(combined);
      if (sanitized) {
        moves.push(sanitized);
      }
    }
  }

  return moves;
}

/**
 * Parses generic Lichess or other HTML format
 */
export function parseLichessHtml(html: string): string[] {
  // Replace Unicode figurines first
  let processed = html;
  for (const [uni, letter] of Object.entries(UNICODE_FIGURINES)) {
    processed = processed.split(uni).join(letter);
  }

  // Use chess.com parser which also handles generic nodes
  const moves = parseChessComHtml(processed);
  if (moves.length > 0) return moves;

  // Fallback: strip tags and parse as PGN text
  const stripped = processed.replace(/<[^>]+>/g, ' ');
  return parseSanTextMoves(stripped);
}

/**
 * Parses standard SAN / PGN move text
 * e.g. "1. d4 Nf6 2. Nf3 e6 3. e3 c5 ..."
 */
export function parseSanTextMoves(text: string): string[] {
  // Strip PGN comments { ... }, [%clk ...], (; ...), annotations ($1, $2, !?, ?!)
  let cleaned = text
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/;[^\r\n]*/g, ' ')
    .replace(/\$[0-9]+/g, ' ')
    .replace(/\b(1-0|0-1|1\/2-1\/2|\*)\b/g, ' ');

  // Replace unicode chess symbols
  for (const [uni, letter] of Object.entries(UNICODE_FIGURINES)) {
    cleaned = cleaned.split(uni).join(letter);
  }

  // Remove move numbers like 1. or 1... or 12.
  cleaned = cleaned.replace(/\b\d+\s*\.{1,3}\s*/g, ' ');

  // Tokenize
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  const moves: string[] = [];

  for (const token of rawTokens) {
    const san = cleanMoveSan(token);
    if (san && isValidSanCandidate(san)) {
      moves.push(san);
    }
  }

  return moves;
}

/**
 * Parses UCI / LAN moves (e.g. "d2d4 g8f6 g1f3 e7e6 ...")
 */
export function parseUciMoves(text: string): string[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  const uciMoves: string[] = [];

  for (const t of tokens) {
    const clean = t.toLowerCase().replace(/[^a-h1-8qrbn]/g, '');
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(clean)) {
      uciMoves.push(clean);
    }
  }

  return uciMoves;
}

/**
 * Parses JSON move array or structured object
 */
export function parseJsonMoves(jsonStr: string): string[] {
  try {
    const data = JSON.parse(jsonStr);

    if (Array.isArray(data)) {
      const moves: string[] = [];
      for (const item of data) {
        if (typeof item === 'string') {
          moves.push(cleanMoveSan(item));
        } else if (typeof item === 'object' && item !== null) {
          if (typeof item.white === 'string') moves.push(cleanMoveSan(item.white));
          if (typeof item.black === 'string') moves.push(cleanMoveSan(item.black));
          if (typeof item.san === 'string') moves.push(cleanMoveSan(item.san));
          if (typeof item.move === 'string') moves.push(cleanMoveSan(item.move));
        }
      }
      return moves.filter(Boolean);
    }

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data.moves)) {
        return data.moves.map((m: any) => (typeof m === 'string' ? cleanMoveSan(m) : m.san || '')).filter(Boolean);
      }
      if (typeof data.pgn === 'string') {
        return parseSanTextMoves(data.pgn);
      }
      if (typeof data.moves === 'string') {
        return parseSanTextMoves(data.moves);
      }
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Parses Columnar / Two-column move text
 * 1.  d4   Nf6
 * 2.  Nf3  e6
 */
export function parseColumnarMoves(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const moves: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('[') || trimmed.startsWith('#')) continue;

    // Remove move number: "1." or "1"
    const withoutNum = trimmed.replace(/^\s*\d+[\.\s:]+/, '').trim();
    const parts = withoutNum.split(/\s+/).filter(Boolean);

    if (parts.length >= 1) {
      const w = cleanMoveSan(parts[0]);
      if (w && isValidSanCandidate(w)) moves.push(w);
    }
    if (parts.length >= 2) {
      const b = cleanMoveSan(parts[1]);
      if (b && isValidSanCandidate(b)) moves.push(b);
    }
  }

  return moves;
}

/**
 * Clean and normalize a SAN move string
 */
export function cleanMoveSan(raw: any): string {
  if (typeof raw !== 'string') return '';
  let s = raw.trim();

  // Replace unicode figurines
  for (const [uni, letter] of Object.entries(UNICODE_FIGURINES)) {
    s = s.split(uni).join(letter);
  }

  // Remove whitespace inside move (e.g. "N xc3" -> "Nxc3", "B d2" -> "Bd2")
  s = s.replace(/\s+/g, '');

  // Normalize castling: 0-0 -> O-O, 0-0-0 -> O-O-O
  s = s.replace(/^0-0-0$/i, 'O-O-O').replace(/^0-0$/i, 'O-O');

  // Strip evaluation annotations (!, ?, !?, ?!)
  s = s.replace(/[!?]+$/, '');

  return s;
}

function isValidSanCandidate(str: string): boolean {
  if (!str || str.length < 2 || str.length > 8) return false;
  // Standard algebraic pattern
  if (/^(?:O-O(?:-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?)[+#]?$/.test(str)) {
    return true;
  }
  return false;
}

/**
 * Extracts PGN header tags [Tag "Value"]
 */
export function extractPgnHeaders(pgnText: string): PgnHeaders {
  const headers: PgnHeaders = {
    event: 'DevHub Chess Game',
    site: 'DevHub Online',
    date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    round: '1',
    white: 'White Player',
    black: 'Black Player',
    result: '*',
  };

  const headerRegex = /\[([A-Za-z]+)\s+"([^"]*)"\]/g;
  let match: RegExpExecArray | null;

  while ((match = headerRegex.exec(pgnText)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2];
    if (key === 'event') headers.event = val;
    else if (key === 'site') headers.site = val;
    else if (key === 'date') headers.date = val;
    else if (key === 'round') headers.round = val;
    else if (key === 'white') headers.white = val;
    else if (key === 'black') headers.black = val;
    else if (key === 'result') headers.result = val;
    else if (key === 'whiteelo') headers.whiteElo = val;
    else if (key === 'blackelo') headers.blackElo = val;
    else if (key === 'eco') headers.eco = val;
  }

  return headers;
}

/**
 * Main Conversion Function
 * Parses input in any format, simulates through chess.js, and produces all chess formats
 */
export function convertChessGame(
  input: string,
  preferredFormat: ChessInputFormat = 'auto',
  customHeaders?: Partial<PgnHeaders>,
  startingFen?: string
): ChessConversionResult {
  const trimmed = input.trim();
  const format = preferredFormat === 'auto' ? detectChessFormat(trimmed) : preferredFormat;

  const defaultHeaders: PgnHeaders = {
    event: 'Chess Game',
    site: 'DevHub Suite',
    date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    round: '1',
    white: 'White',
    black: 'Black',
    result: '*',
    ...customHeaders,
  };

  if (!trimmed) {
    return {
      success: false,
      detectedFormat: format,
      error: 'Input move map or PGN text is empty',
      headers: defaultHeaders,
      plies: [],
      turns: [],
      pgn: '',
      pgnMinimal: '',
      finalFen: startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      startingFen: startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      uciString: '',
      stats: {
        totalPlies: 0,
        totalTurns: 0,
        whiteCaptures: 0,
        blackCaptures: 0,
        totalChecks: 0,
        hasCheckmate: false,
        result: '*',
      },
    };
  }

  // If input is purely a FEN string
  if (format === 'fen') {
    try {
      const c = new Chess(trimmed);
      return {
        success: true,
        detectedFormat: 'fen',
        headers: defaultHeaders,
        plies: [],
        turns: [],
        pgn: `[FEN "${trimmed}"]\n*`,
        pgnMinimal: '',
        finalFen: trimmed,
        startingFen: trimmed,
        uciString: '',
        stats: {
          totalPlies: 0,
          totalTurns: 0,
          whiteCaptures: 0,
          blackCaptures: 0,
          totalChecks: c.inCheck() ? 1 : 0,
          hasCheckmate: c.isCheckmate(),
          result: '*',
        },
      };
    } catch (e: any) {
      return {
        success: false,
        detectedFormat: 'fen',
        error: `Invalid FEN string: ${e.message}`,
        headers: defaultHeaders,
        plies: [],
        turns: [],
        pgn: '',
        pgnMinimal: '',
        finalFen: '',
        startingFen: '',
        uciString: '',
        stats: {
          totalPlies: 0,
          totalTurns: 0,
          whiteCaptures: 0,
          blackCaptures: 0,
          totalChecks: 0,
          hasCheckmate: false,
          result: '*',
        },
      };
    }
  }

  // 1. Extract raw move tokens according to format
  let rawMoveTokens: string[] = [];
  let parsedHeaders: PgnHeaders = { ...defaultHeaders };

  if (format === 'pgn') {
    parsedHeaders = { ...defaultHeaders, ...extractPgnHeaders(trimmed), ...customHeaders };
    rawMoveTokens = parseSanTextMoves(trimmed);
  } else if (format === 'chess_com_html') {
    rawMoveTokens = parseChessComHtml(trimmed);
  } else if (format === 'lichess_html') {
    rawMoveTokens = parseLichessHtml(trimmed);
  } else if (format === 'uci_lan') {
    rawMoveTokens = parseUciMoves(trimmed);
  } else if (format === 'json_moves') {
    rawMoveTokens = parseJsonMoves(trimmed);
  } else if (format === 'columnar_text') {
    rawMoveTokens = parseColumnarMoves(trimmed);
  } else {
    // san_moves or default
    rawMoveTokens = parseSanTextMoves(trimmed);
  }

  // If extraction yielded 0 moves and format was auto, try fallback parsers
  if (rawMoveTokens.length === 0) {
    rawMoveTokens = parseChessComHtmlRegex(trimmed);
  }
  if (rawMoveTokens.length === 0) {
    rawMoveTokens = parseSanTextMoves(trimmed);
  }
  if (rawMoveTokens.length === 0) {
    rawMoveTokens = parseUciMoves(trimmed);
  }

  if (rawMoveTokens.length === 0) {
    return {
      success: false,
      detectedFormat: format,
      error: 'Could not extract any valid chess moves from the input text.',
      headers: parsedHeaders,
      plies: [],
      turns: [],
      pgn: '',
      pgnMinimal: '',
      finalFen: startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      startingFen: startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      uciString: '',
      stats: {
        totalPlies: 0,
        totalTurns: 0,
        whiteCaptures: 0,
        blackCaptures: 0,
        totalChecks: 0,
        hasCheckmate: false,
        result: '*',
      },
    };
  }

  // 2. Simulate game with chess.js
  const chess = startingFen ? new Chess(startingFen) : new Chess();
  const startFenActual = chess.fen();

  const plies: ChessPly[] = [];
  const turns: ChessTurn[] = [];
  const uciList: string[] = [];

  let whiteCapturesCount = 0;
  let blackCapturesCount = 0;
  let totalChecks = 0;
  let moveFailError: string | undefined;

  for (let i = 0; i < rawMoveTokens.length; i++) {
    const rawMove = rawMoveTokens[i];
    const plyNumber = i + 1;
    const moveNumber = Math.floor(i / 2) + 1;
    const color: 'w' | 'b' = i % 2 === 0 ? 'w' : 'b';

    try {
      const moveObj = chess.move(rawMove);
      if (!moveObj) {
        moveFailError = `Illegal move "${rawMove}" at move ${moveNumber} (${color === 'w' ? 'White' : 'Black'}, ply ${plyNumber}).`;
        break;
      }

      const uciMove = `${moveObj.from}${moveObj.to}${moveObj.promotion || ''}`;
      uciList.push(uciMove);

      if (moveObj.captured) {
        if (color === 'w') whiteCapturesCount++;
        else blackCapturesCount++;
      }

      if (chess.inCheck()) {
        totalChecks++;
      }

      const plyData: ChessPly = {
        ply: plyNumber,
        moveNumber,
        color,
        san: moveObj.san,
        uci: uciMove,
        from: moveObj.from,
        to: moveObj.to,
        piece: moveObj.piece,
        captured: moveObj.captured,
        promotion: moveObj.promotion,
        fen: chess.fen(),
        isCheck: chess.inCheck(),
        isCheckmate: chess.isCheckmate(),
      };

      plies.push(plyData);

      // Structure into turns
      let currentTurn = turns.find((t) => t.moveNumber === moveNumber);
      if (!currentTurn) {
        currentTurn = { moveNumber };
        turns.push(currentTurn);
      }
      if (color === 'w') {
        currentTurn.white = plyData;
      } else {
        currentTurn.black = plyData;
      }
    } catch (err: any) {
      moveFailError = `Invalid move "${rawMove}" at move ${moveNumber} (${color === 'w' ? 'White' : 'Black'}, ply ${plyNumber}): ${err.message}`;
      break;
    }
  }

  // Determine game result if checkmate or draw
  let finalResult = parsedHeaders.result || '*';
  if (chess.isCheckmate()) {
    finalResult = chess.turn() === 'b' ? '1-0' : '0-1';
  } else if (chess.isDraw()) {
    finalResult = '1/2-1/2';
  }
  parsedHeaders.result = finalResult;

  // Build clean minimal PGN string
  const pgnMinimal = turns
    .map((t) => {
      let str = `${t.moveNumber}. ${t.white?.san || ''}`;
      if (t.black) {
        str += ` ${t.black.san}`;
      }
      return str;
    })
    .join(' ');

  // Build full standard PGN with headers
  const headerBlock = [
    `[Event "${parsedHeaders.event || 'Chess Game'}"]`,
    `[Site "${parsedHeaders.site || 'DevHub'}"]`,
    `[Date "${parsedHeaders.date || '????.??.??'}"]`,
    `[Round "${parsedHeaders.round || '1'}"]`,
    `[White "${parsedHeaders.white || 'White'}"]`,
    `[Black "${parsedHeaders.black || 'Black'}"]`,
    `[Result "${finalResult}"]`,
  ];
  if (parsedHeaders.whiteElo) headerBlock.push(`[WhiteElo "${parsedHeaders.whiteElo}"]`);
  if (parsedHeaders.blackElo) headerBlock.push(`[BlackElo "${parsedHeaders.blackElo}"]`);
  if (parsedHeaders.eco) headerBlock.push(`[ECO "${parsedHeaders.eco}"]`);

  const fullPgn = `${headerBlock.join('\n')}\n\n${pgnMinimal} ${finalResult}`;

  return {
    success: plies.length > 0,
    detectedFormat: format,
    warning: moveFailError,
    headers: parsedHeaders,
    plies,
    turns,
    pgn: fullPgn,
    pgnMinimal,
    finalFen: chess.fen(),
    startingFen: startFenActual,
    uciString: uciList.join(' '),
    stats: {
      totalPlies: plies.length,
      totalTurns: turns.length,
      whiteCaptures: whiteCapturesCount,
      blackCaptures: blackCapturesCount,
      totalChecks,
      hasCheckmate: chess.isCheckmate(),
      result: finalResult,
    },
  };
}

/**
 * Generates Columnar Move List Table (2 Columns)
 */
export function generateColumnarText(turns: ChessTurn[]): string {
  const header = 'Move   White         Black\n-----------------------------';
  const rows = turns.map((t) => {
    const num = `${t.moveNumber}.`.padEnd(6, ' ');
    const white = (t.white?.san || '').padEnd(14, ' ');
    const black = t.black?.san || '';
    return `${num}${white}${black}`;
  });
  return `${header}\n${rows.join('\n')}\n`;
}

/**
 * Generates CSV Export
 */
export function generateChessCsv(turns: ChessTurn[]): string {
  const header = 'move_number,white_san,white_uci,white_fen,black_san,black_uci,black_fen';
  const rows = turns.map((t) => {
    return [
      t.moveNumber,
      t.white?.san || '',
      t.white?.uci || '',
      `"${t.white?.fen || ''}"`,
      t.black?.san || '',
      t.black?.uci || '',
      `"${t.black?.fen || ''}"`,
    ].join(',');
  });
  return `${header}\n${rows.join('\n')}\n`;
}

/**
 * Generates Markdown Move Table
 */
export function generateChessMarkdown(turns: ChessTurn[], result: string): string {
  let md = `### Chess Game (${turns.length} Moves)\n\n`;
  md += '| Move | White | Black |\n|:---:|:---|:---|\n';
  for (const t of turns) {
    md += `| **${t.moveNumber}** | \`${t.white?.san || '-'}\` | \`${t.black?.san || '-'}\` |\n`;
  }
  md += `\n**Result:** \`${result}\`\n`;
  return md;
}

/**
 * Generates Move-by-Move FEN sequence
 */
export function generateFenHistory(plies: ChessPly[]): string {
  return plies
    .map((p) => {
      const label = `${p.moveNumber}${p.color === 'w' ? '.' : '...'}`;
      return `${label.padEnd(7, ' ')} ${p.san.padEnd(8, ' ')} ${p.fen}`;
    })
    .join('\n');
}

/**
 * Generates analysis URL links for Lichess and Chess.com
 */
export function generateAnalysisLinks(pgn: string, finalFen: string) {
  const encodedPgn = encodeURIComponent(pgn);
  const encodedFen = encodeURIComponent(finalFen);

  return {
    lichessPgn: `https://lichess.org/analysis/pgn/${encodedPgn}`,
    lichessFen: `https://lichess.org/analysis/${encodedFen.replace(/%20/g, '_')}`,
    chessComAnalysis: `https://www.chess.com/analysis?fen=${encodedFen}`,
  };
}
