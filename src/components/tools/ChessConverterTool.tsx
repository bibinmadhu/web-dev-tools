import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Crown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Copy,
  Check,
  Download,
  Upload,
  ExternalLink,
  Settings2,
  Maximize2,
  Minimize2,
  Trash2,
  Sparkles,
  FileText,
  FileCode,
  Table,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRightLeft,
  Code
} from 'lucide-react';
import {
  ChessInputFormat,
  ChessOutputFormat,
  convertChessGame,
  detectChessFormat,
  generateColumnarText,
  generateChessCsv,
  generateChessMarkdown,
  generateFenHistory,
  generateAnalysisLinks,
  PgnHeaders
} from '../../utils/chessConverter';
import { CHESS_PRESETS, ChessPreset } from '../../utils/chessPresets';
import { ChessBoardView } from './chess-converter/ChessBoardView';

export interface ChessConverterToolProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const ChessConverterTool: React.FC<ChessConverterToolProps> = ({
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  // Input State (Default to the user's attached snippet)
  const defaultPreset = CHESS_PRESETS[0];
  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultPreset.id);
  const [inputText, setInputText] = useState<string>(defaultPreset.data);
  const [inputFormat, setInputFormat] = useState<ChessInputFormat>('auto');

  // Output Tab
  const [activeOutputTab, setActiveOutputTab] = useState<ChessOutputFormat>('pgn');

  // Playback / Interactive Board State
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number>(0); // 0 = start position
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1000); // ms per move
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // PGN Headers Customization
  const [customHeaders, setCustomHeaders] = useState<PgnHeaders>({
    event: 'DevHub Online Match',
    site: 'Chess Converter Platform',
    date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    round: '1',
    white: 'White Player',
    black: 'Black Player',
    result: '*',
  });
  const [isHeaderDrawerOpen, setIsHeaderDrawerOpen] = useState<boolean>(false);

  // Feedback states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const moveListContainerRef = useRef<HTMLDivElement>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Run Conversion
  const conversionResult = useMemo(() => {
    return convertChessGame(inputText, inputFormat, customHeaders);
  }, [inputText, inputFormat, customHeaders]);

  // When game conversion completes, reset playback to the end or beginning
  useEffect(() => {
    if (conversionResult.success) {
      setCurrentPlyIndex(conversionResult.plies.length);
    } else {
      setCurrentPlyIndex(0);
    }
    setIsPlaying(false);
  }, [conversionResult.plies.length]);

  // Autoplay timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentPlyIndex((prev) => {
        if (prev >= conversionResult.plies.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, conversionResult.plies.length]);

  // Current active ply object & FEN for the interactive board
  const activePly = useMemo(() => {
    if (currentPlyIndex <= 0 || !conversionResult.plies[currentPlyIndex - 1]) {
      return null;
    }
    return conversionResult.plies[currentPlyIndex - 1];
  }, [currentPlyIndex, conversionResult.plies]);

  const activeFen = useMemo(() => {
    if (!activePly) {
      return conversionResult.startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
    return activePly.fen;
  }, [activePly, conversionResult.startingFen]);

  const lastMoveSquares = useMemo(() => {
    if (!activePly) return null;
    return { from: activePly.from, to: activePly.to };
  }, [activePly]);

  // Captured pieces calculation up to current ply
  const capturedPieces = useMemo(() => {
    const whiteCaps: string[] = [];
    const blackCaps: string[] = [];
    for (let i = 0; i < currentPlyIndex; i++) {
      const ply = conversionResult.plies[i];
      if (ply && ply.captured) {
        if (ply.color === 'w') {
          whiteCaps.push(ply.captured.toUpperCase());
        } else {
          blackCaps.push(ply.captured.toLowerCase());
        }
      }
    }
    return { whiteCaps, blackCaps };
  }, [currentPlyIndex, conversionResult.plies]);

  // Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const p = CHESS_PRESETS.find((preset) => preset.id === presetId);
    if (p) {
      setSelectedPresetId(p.id);
      setInputText(p.data);
      setInputFormat('auto');
      showStatus(`Loaded "${p.name}" (${p.moveCount} moves)`);
    }
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      setInputFormat('auto');
      showStatus(`Loaded file ${file.name}`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showStatus('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Download helper
  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus(`Downloaded ${filename}`);
  };

  // Generated outputs
  const columnarText = useMemo(() => generateColumnarText(conversionResult.turns), [conversionResult.turns]);
  const csvText = useMemo(() => generateChessCsv(conversionResult.turns), [conversionResult.turns]);
  const markdownText = useMemo(
    () => generateChessMarkdown(conversionResult.turns, conversionResult.stats.result),
    [conversionResult.turns, conversionResult.stats.result]
  );
  const fenHistoryText = useMemo(() => generateFenHistory(conversionResult.plies), [conversionResult.plies]);
  const analysisLinks = useMemo(
    () => generateAnalysisLinks(conversionResult.pgn, conversionResult.finalFen),
    [conversionResult.pgn, conversionResult.finalFen]
  );

  const jsonGameObject = useMemo(() => {
    return JSON.stringify(
      {
        headers: conversionResult.headers,
        stats: conversionResult.stats,
        finalFen: conversionResult.finalFen,
        movesCount: conversionResult.turns.length,
        pliesCount: conversionResult.plies.length,
        uci: conversionResult.uciString,
        turns: conversionResult.turns,
      },
      null,
      2
    );
  }, [conversionResult]);

  return (
    <div className="space-y-4">
      {/* Top Header & Preset Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Left: Brand & Presets */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Chess Move & Map Converter
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                  {conversionResult.stats.totalTurns} Turns • {conversionResult.stats.totalPlies} Plies
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Sample:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {CHESS_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.moveCount} moves)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload HTML, PGN, or text file"
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Upload File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.pgn,.txt,.json"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* PGN Header Options Drawer */}
          <button
            onClick={() => setIsHeaderDrawerOpen(!isHeaderDrawerOpen)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isHeaderDrawerOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>PGN Tags</span>
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400 transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* Quick Copy PGN */}
          <button
            onClick={() => handleCopy(conversionResult.pgn, 'top-pgn')}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {copiedKey === 'top-pgn' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'top-pgn' ? 'Copied' : 'Copy PGN'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible PGN Headers Editor */}
      {isHeaderDrawerOpen && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>PGN Header Tag Customization:</span>
            <span className="text-[11px] text-slate-400 font-normal">
              Appended to generated PGN file export
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Event:
              </label>
              <input
                type="text"
                value={customHeaders.event || ''}
                onChange={(e) => setCustomHeaders({ ...customHeaders, event: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Site:
              </label>
              <input
                type="text"
                value={customHeaders.site || ''}
                onChange={(e) => setCustomHeaders({ ...customHeaders, site: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                White Player:
              </label>
              <input
                type="text"
                value={customHeaders.white || ''}
                onChange={(e) => setCustomHeaders({ ...customHeaders, white: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Black Player:
              </label>
              <input
                type="text"
                value={customHeaders.black || ''}
                onChange={(e) => setCustomHeaders({ ...customHeaders, black: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Warning or Error Notification */}
      {conversionResult.warning && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>{conversionResult.warning}</span>
        </div>
      )}

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Grid: 2 Columns (Left: Input & Formats, Right: Visual Board & Move Seek) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 Cols): Source Input & Quick Conversion */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          {/* Format Selector Bar */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                INPUT FORMAT:
              </span>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value as ChessInputFormat)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="auto">Auto-Detect</option>
                <option value="chess_com_html">Chess.com HTML Move Map</option>
                <option value="lichess_html">Lichess HTML Map</option>
                <option value="pgn">PGN Notation</option>
                <option value="san_moves">SAN Algebraic Text</option>
                <option value="uci_lan">UCI / LAN Engine Format</option>
                <option value="json_moves">JSON Move Array</option>
                <option value="columnar_text">Two-Column Table</option>
                <option value="fen">FEN Position</option>
              </select>
            </div>

            <button
              onClick={() => setInputText('')}
              className="text-slate-400 hover:text-rose-500 text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          {/* Input Textarea */}
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm overflow-hidden flex-1 min-h-[320px]">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste Chess.com HTML move list snippet, PGN, SAN moves, UCI, or JSON array here..."
              spellCheck={false}
              rows={isFullScreen ? 24 : 16}
              className="w-full h-full p-4 font-mono text-xs text-slate-200 bg-transparent focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
            />
          </div>

          {/* Detected Format Badge */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Detected Format:{' '}
              <strong className="text-slate-900 dark:text-slate-100 uppercase font-mono">
                {conversionResult.detectedFormat.replace(/_/g, ' ')}
              </strong>
            </span>
            <span className="font-mono text-[11px]">
              Result: <strong className="text-indigo-600 dark:text-indigo-400">{conversionResult.stats.result}</strong>
            </span>
          </div>
        </div>

        {/* Right Column (7 Cols): Visual Board, Move Navigation & Output Tabs */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Visual Board & Player Controls Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            {/* Top Board Bar: Captures & Material Balance */}
            <div className="flex items-center justify-between text-xs px-1">
              {/* Black Side Tray */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {conversionResult.headers.black || 'Black'}:
                </span>
                <div className="flex items-center gap-0.5 text-slate-800 dark:text-slate-200 font-mono text-sm tracking-tight">
                  {capturedPieces.whiteCaps.join(' ') || <span className="text-[11px] text-slate-400">No captures</span>}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {activePly?.isCheckmate ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] animate-pulse">
                    Checkmate!
                  </span>
                ) : activePly?.isCheck ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                    Check!
                  </span>
                ) : null}

                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Ply {currentPlyIndex} / {conversionResult.plies.length}
                </span>
              </div>
            </div>

            {/* Chessboard View */}
            <ChessBoardView
              fen={activeFen}
              lastMove={lastMoveSquares}
              flipped={isFlipped}
            />

            {/* White Side Tray */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {conversionResult.headers.white || 'White'}:
                </span>
                <div className="flex items-center gap-0.5 text-slate-800 dark:text-slate-200 font-mono text-sm tracking-tight">
                  {capturedPieces.blackCaps.map((p) => p.toUpperCase()).join(' ') || (
                    <span className="text-[11px] text-slate-400">No captures</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Flip Board</span>
              </button>
            </div>

            {/* Interactive Playback Scrubber & Navigation Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {/* Ply Slider */}
              <input
                type="range"
                min={0}
                max={conversionResult.plies.length}
                value={currentPlyIndex}
                onChange={(e) => setCurrentPlyIndex(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />

              {/* Controls Bar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPlyIndex(0)}
                    disabled={currentPlyIndex === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 cursor-pointer"
                    title="Start of game"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPlyIndex((p) => Math.max(0, p - 1))}
                    disabled={currentPlyIndex === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 cursor-pointer"
                    title="Previous move"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1 cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Auto Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    onClick={() => setCurrentPlyIndex((p) => Math.min(conversionResult.plies.length, p + 1))}
                    disabled={currentPlyIndex >= conversionResult.plies.length}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 cursor-pointer"
                    title="Next move"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPlyIndex(conversionResult.plies.length)}
                    disabled={currentPlyIndex >= conversionResult.plies.length}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 cursor-pointer"
                    title="End of game"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed toggle */}
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span>Speed:</span>
                  {[
                    { label: '0.5x', ms: 1600 },
                    { label: '1x', ms: 1000 },
                    { label: '2x', ms: 500 },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setPlaySpeed(s.ms)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        playSpeed === s.ms
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clickable Move List Pills */}
            <div
              ref={moveListContainerRef}
              className="max-h-24 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5 text-xs font-mono"
            >
              {conversionResult.turns.map((t) => {
                const whitePlyIdx = (t.moveNumber - 1) * 2 + 1;
                const blackPlyIdx = (t.moveNumber - 1) * 2 + 2;
                const isWhiteActive = currentPlyIndex === whitePlyIdx;
                const isBlackActive = currentPlyIndex === blackPlyIdx;

                return (
                  <span key={t.moveNumber} className="inline-flex items-center gap-1 mr-1">
                    <span className="text-slate-400 text-[11px]">{t.moveNumber}.</span>
                    {t.white && (
                      <button
                        onClick={() => setCurrentPlyIndex(whitePlyIdx)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          isWhiteActive
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {t.white.san}
                      </button>
                    )}
                    {t.black && (
                      <button
                        onClick={() => setCurrentPlyIndex(blackPlyIdx)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          isBlackActive
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {t.black.san}
                      </button>
                    )}
                  </span>
                );
              })}
            </div>

            {/* Active Position FEN Bar */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono">
              <span className="text-slate-500 truncate mr-2 select-all">
                {activeFen}
              </span>
              <button
                onClick={() => handleCopy(activeFen, 'active-fen')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 font-sans text-xs cursor-pointer flex items-center gap-1"
              >
                {copiedKey === 'active-fen' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'active-fen' ? 'Copied' : 'Copy FEN'}</span>
              </button>
            </div>
          </div>

          {/* Output Formats Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            {/* Output Format Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold overflow-x-auto scrollbar-none gap-2">
              <div className="flex items-center gap-1">
                {[
                  { id: 'pgn', label: 'Full PGN', icon: FileText },
                  { id: 'pgn_minimal', label: 'Moves Only', icon: Code },
                  { id: 'fen_final', label: 'Final FEN', icon: Crown },
                  { id: 'fen_history', label: 'FEN History', icon: Layers },
                  { id: 'uci', label: 'UCI / LAN', icon: FileCode },
                  { id: 'json', label: 'JSON Object', icon: Sparkles },
                  { id: 'columnar', label: '2-Column', icon: Table },
                  { id: 'markdown', label: 'Markdown', icon: FileText },
                  { id: 'csv', label: 'CSV', icon: Table },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeOutputTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveOutputTab(tab.id as ChessOutputFormat)}
                      className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* External Analysis Quick Links */}
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={analysisLinks.lichessPgn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="Open PGN in Lichess Analysis"
                >
                  <span>Lichess</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <a
                  href={analysisLinks.chessComAnalysis}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="Open position in Chess.com Analysis"
                >
                  <span>Chess.com</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Tab Output Box */}
            <div className="relative">
              {activeOutputTab === 'pgn' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Standard Portable Game Notation (PGN):</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(conversionResult.pgn, 'pgn-out')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'pgn-out' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'pgn-out' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => handleDownload(conversionResult.pgn, 'game.pgn', 'application/x-chess-pgn')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download .pgn</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={conversionResult.pgn}
                    rows={6}
                    className="w-full font-mono text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {activeOutputTab === 'pgn_minimal' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Clean Move Sequence (Without Headers):</span>
                    <button
                      onClick={() => handleCopy(conversionResult.pgnMinimal, 'min-pgn')}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'min-pgn' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'min-pgn' ? 'Copied' : 'Copy Moves'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={conversionResult.pgnMinimal}
                    rows={5}
                    className="w-full font-mono text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {activeOutputTab === 'fen_final' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Final Board State FEN (Forsyth-Edwards Notation):</span>
                    <button
                      onClick={() => handleCopy(conversionResult.finalFen, 'final-fen')}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'final-fen' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'final-fen' ? 'Copied' : 'Copy FEN'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={conversionResult.finalFen}
                    rows={3}
                    className="w-full font-mono text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {activeOutputTab === 'fen_history' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>FEN after every half-move (Ply by ply):</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(fenHistoryText, 'fen-hist')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'fen-hist' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'fen-hist' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => handleDownload(fenHistoryText, 'fen_history.txt', 'text/plain')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download .txt</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={fenHistoryText}
                    rows={6}
                    className="w-full font-mono text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {activeOutputTab === 'uci' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Universal Chess Interface (UCI / Stockfish format):</span>
                    <button
                      onClick={() => handleCopy(conversionResult.uciString, 'uci-out')}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'uci-out' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'uci-out' ? 'Copied' : 'Copy UCI'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={conversionResult.uciString}
                    rows={5}
                    className="w-full font-mono text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {activeOutputTab === 'json' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Structured JSON Representation:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(jsonGameObject, 'json-out')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'json-out' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'json-out' ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                      <button
                        onClick={() => handleDownload(jsonGameObject, 'chess_game.json', 'application/json')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download .json</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={jsonGameObject}
                    rows={6}
                    className="w-full font-mono text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {activeOutputTab === 'columnar' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Two-Column Move Sheet:</span>
                    <button
                      onClick={() => handleCopy(columnarText, 'col-out')}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'col-out' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'col-out' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={columnarText}
                    rows={6}
                    className="w-full font-mono text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {activeOutputTab === 'markdown' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Markdown Move Table:</span>
                    <button
                      onClick={() => handleCopy(markdownText, 'md-out')}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'md-out' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'md-out' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={markdownText}
                    rows={6}
                    className="w-full font-mono text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {activeOutputTab === 'csv' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Comma-Separated Values (CSV Table):</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(csvText, 'csv-out')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'csv-out' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'csv-out' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => handleDownload(csvText, 'moves.csv', 'text/csv')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download .csv</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={csvText}
                    rows={6}
                    className="w-full font-mono text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
