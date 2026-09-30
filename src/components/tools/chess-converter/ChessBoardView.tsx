import React from 'react';
import { Chess } from 'chess.js';

interface ChessBoardViewProps {
  fen: string;
  lastMove?: { from: string; to: string } | null;
  flipped?: boolean;
  onSquareClick?: (square: string) => void;
}

// Crisp standard vector SVG chess piece paths
const PIECE_SVGS: Record<string, React.ReactNode> = {
  // White King
  K: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" strokeLinecap="butt" strokeLinejoin="miter" />
        <path d="M11.5 37c5.5 3.5 16.5 3.5 22 0l-1-7c0-2-2-4-4-5l-2-2-2 2c-2 1-4 3-4 5l-1 7z" fill="#fff" />
        <path d="M12 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3.5 15.5-3.5 21 0m-21 3.5c5.5-3.5 15.5-3.5 21 0" />
      </g>
    </svg>
  ),
  // White Queen
  Q: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <g fill="#fff" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm17 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-7-16-7 16-7-11 2 12zm0 3c9-1 18-1 27 0l1 4c-9.5-1-18.5-1-28 0l1-4zm1 7c8-1 16-1 25 0l1 3c-9-1-18-1-27 0l1-3z" strokeLinecap="butt" />
        <path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 3.5c3.5-1 17.5-1 21 0m-20.5 3.5c3.5-1 16.5-1 20 0" fill="none" />
      </g>
    </svg>
  ),
  // White Rook
  R: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <g fill="#fff" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5l1.5-13.5h14l1.5 13.5H14z" strokeLinecap="butt" />
        <path d="M14 18h17V9h-4v3h-3V9h-3v3h-3V9h-4v9z" strokeLinecap="butt" />
        <path d="M12 35.5c7.5-1.5 13.5-1.5 21 0M14 29.5c6.5-1 10.5-1 17 0M14 16.5c6.5-1 10.5-1 17 0" fill="none" />
      </g>
    </svg>
  ),
  // White Bishop
  B: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="#fff" strokeLinecap="butt">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
        </g>
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" />
      </g>
    </svg>
  ),
  // White Knight
  N: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff" />
        <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.062 4.37-1 5-1.464 1.15-3.28.47-4.5-1.5C3.39 29.35 6.5 22 11 17c4-4 8.5-7.5 13-7z" fill="#fff" />
        <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.5-10.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#000" />
      </g>
    </svg>
  ),
  // White Pawn
  P: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h25c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  // Black King
  k: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#262626" strokeLinecap="butt" strokeLinejoin="miter" />
        <path d="M11.5 37c5.5 3.5 16.5 3.5 22 0l-1-7c0-2-2-4-4-5l-2-2-2 2c-2 1-4 3-4 5l-1 7z" fill="#262626" />
        <path d="M12 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3.5 15.5-3.5 21 0m-21 3.5c5.5-3.5 15.5-3.5 21 0" stroke="#fff" />
      </g>
    </svg>
  ),
  // Black Queen
  q: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <g fill="#262626" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm17 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-7-16-7 16-7-11 2 12zm0 3c9-1 18-1 27 0l1 4c-9.5-1-18.5-1-28 0l1-4zm1 7c8-1 16-1 25 0l1 3c-9-1-18-1-27 0l1-3z" strokeLinecap="butt" />
        <path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 3.5c3.5-1 17.5-1 21 0m-20.5 3.5c3.5-1 16.5-1 20 0" stroke="#fff" fill="none" />
      </g>
    </svg>
  ),
  // Black Rook
  r: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <g fill="#262626" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5l1.5-13.5h14l1.5 13.5H14z" strokeLinecap="butt" />
        <path d="M14 18h17V9h-4v3h-3V9h-3v3h-3V9h-4v9z" strokeLinecap="butt" />
        <path d="M12 35.5c7.5-1.5 13.5-1.5 21 0M14 29.5c6.5-1 10.5-1 17 0M14 16.5c6.5-1 10.5-1 17 0" stroke="#fff" fill="none" />
      </g>
    </svg>
  ),
  // Black Bishop
  b: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="#262626" strokeLinecap="butt">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
        </g>
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" />
      </g>
    </svg>
  ),
  // Black Knight
  n: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#262626" />
        <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.062 4.37-1 5-1.464 1.15-3.28.47-4.5-1.5C3.39 29.35 6.5 22 11 17c4-4 8.5-7.5 13-7z" fill="#262626" />
        <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.5-10.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#fff" />
      </g>
    </svg>
  ),
  // Black Pawn
  p: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-xs">
      <path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h25c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#262626" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export const ChessBoardView: React.FC<ChessBoardViewProps> = ({
  fen,
  lastMove,
  flipped = false,
  onSquareClick,
}) => {
  // Parse FEN into 8x8 matrix
  const boardMatrix = React.useMemo(() => {
    try {
      const chess = new Chess(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      return chess.board();
    } catch {
      const chess = new Chess();
      return chess.board();
    }
  }, [fen]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = flipped ? [...files].reverse() : files;
  const displayRanks = flipped ? [...ranks].reverse() : ranks;

  return (
    <div className="relative aspect-square w-full max-w-[420px] mx-auto select-none rounded-xl overflow-hidden border-2 border-slate-700/60 dark:border-slate-800 shadow-2xl bg-amber-50">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayRanks.map((rank, rankIdx) => {
          const actualRowIdx = 8 - parseInt(rank, 10);

          return displayFiles.map((file, fileIdx) => {
            const actualColIdx = file.charCodeAt(0) - 'a'.charCodeAt(0);
            const squareName = `${file}${rank}`;
            const pieceObj = boardMatrix[actualRowIdx]?.[actualColIdx];

            const isLight = (rankIdx + fileIdx) % 2 === 0;
            const isLastMoveSquare =
              lastMove && (lastMove.from === squareName || lastMove.to === squareName);

            // Light / Dark square colors (Lichess classic wooden style)
            let bgClass = isLight ? 'bg-[#F0D9B5]' : 'bg-[#B58863]';
            if (isLastMoveSquare) {
              bgClass = isLight ? 'bg-[#CED26B]' : 'bg-[#AAA23A]';
            }

            const pieceKey = pieceObj
              ? pieceObj.color === 'w'
                ? pieceObj.type.toUpperCase()
                : pieceObj.type.toLowerCase()
              : null;

            return (
              <div
                key={squareName}
                onClick={() => onSquareClick?.(squareName)}
                className={`relative flex items-center justify-center ${bgClass} transition-colors cursor-pointer group`}
                title={`${squareName} ${pieceObj ? `(${pieceObj.color === 'w' ? 'White' : 'Black'} ${pieceObj.type.toUpperCase()})` : ''}`}
              >
                {/* Square Coordinate Labels */}
                {fileIdx === 0 && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] font-bold font-mono pointer-events-none select-none ${
                      isLight ? 'text-[#B58863]' : 'text-[#F0D9B5]'
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {rankIdx === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] font-bold font-mono pointer-events-none select-none ${
                      isLight ? 'text-[#B58863]' : 'text-[#F0D9B5]'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Piece Icon */}
                {pieceKey && PIECE_SVGS[pieceKey] && (
                  <div className="w-[82%] h-[82%] pointer-events-none transform transition-transform group-hover:scale-105">
                    {PIECE_SVGS[pieceKey]}
                  </div>
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
