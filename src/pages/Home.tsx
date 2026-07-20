import BoardSizer from "@/components/board/BoardSizer";
import ChessBoard from "@/components/board/ChessBoard";
import SolveConfetti from "@/components/board/SolveConfetti";
import BoardLayout from "@/components/layout/BoardLayout";
import Calendar from "@/components/sidebar/Calendar";
import Hint from "@/components/sidebar/Hint";
import PuzzleActions from "@/components/sidebar/PuzzleActions";
import PuzzleInfo from "@/components/sidebar/PuzzleInfo";
import PuzzleProvider, { usePuzzle } from "@/context/PuzzleContext";
import PuzzleGameProvider, { usePuzzleGame } from "@/context/PuzzleGameContext";
import { getSideToMove } from "@/helpers/fen";

const HomeContent = () => {
  const { isLoading } = usePuzzle();
  const {
    fen,
    orientation,
    selectedSquare,
    legalTargets,
    lastMove,
    hintSquares,
    wrongMoveSquares,
    canInteract,
    onSquareClick,
    onClearSelection,
    onPromotionSelect,
    pendingPromotion,
    status,
    animationRequest,
  } = usePuzzleGame();

  return (
    <BoardLayout
      boardLabel="Chess puzzle board"
      board={
        <BoardSizer>
          <ChessBoard
            fen={fen}
            orientation={orientation}
            selectedSquare={selectedSquare}
            legalTargets={legalTargets}
            lastMove={lastMove}
            hintSquares={hintSquares}
            wrongMoveSquares={wrongMoveSquares}
            canInteract={canInteract}
            isSolved={status === "solved"}
            hidePieces={isLoading}
            promotionPicker={
              pendingPromotion
                ? {
                    square: pendingPromotion.to,
                    color: getSideToMove(fen),
                    onSelect: onPromotionSelect,
                  }
                : null
            }
            animationRequest={animationRequest}
            onSquareClick={onSquareClick}
            onClearSelection={onClearSelection}
          />
          <SolveConfetti
            isSolved={status === "solved"}
            lastMoveTo={lastMove?.to ?? null}
          />
        </BoardSizer>
      }
    >
      <PuzzleActions />
      <PuzzleInfo />
      <Calendar />
      <Hint />
    </BoardLayout>
  );
};

const Home = () => (
  <PuzzleProvider>
    <PuzzleGameProvider>
      <HomeContent />
    </PuzzleGameProvider>
  </PuzzleProvider>
);

export default Home;
