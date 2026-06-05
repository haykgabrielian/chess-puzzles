import styled from 'styled-components';

import ChessBoard from '@/components/board/ChessBoard';
import PuzzleBoardFooter from '@/components/board/PuzzleBoardFooter';
import SolveConfetti from '@/components/board/SolveConfetti';
import Header from '@/components/Header';
import Sidebar from '@/components/sidebar/Sidebar';
import PuzzleProvider, { usePuzzle } from '@/context/PuzzleContext';
import PuzzleGameProvider, { usePuzzleGame } from '@/context/PuzzleGameContext';
import { formatDateForUrl } from '@/helpers/date';
import { getSideToMove } from '@/helpers/fen';
import { useBoardSizeFromSidebar } from '@/hooks/useBoardSizeFromSidebar';

const MOBILE = '@media (max-width: 900px)';

const Page = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.text.primary};
  overflow-x: clip;
`;

const Content = styled.main`
  display: grid;
  grid-template-columns: 1fr min(440px, 40%);
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: start;

  ${MOBILE} {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 16px;
    padding: 12px 0;
  }
`;

const BoardSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  width: 100%;

  ${MOBILE} {
    width: 100%;
  }
`;

const BoardColumn = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const BoardSlot = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;

  ${MOBILE} {
    justify-content: stretch;
  }
`;

const BoardStack = styled.div<{ $side: number | null }>`
  position: relative;
  width: ${({ $side }) => ($side != null ? `min(100%, ${$side}px)` : '100%')};
  max-width: 100%;

  ${MOBILE} {
    width: 100%;
  }
`;

const BoardFooterSlot = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;

  ${MOBILE} {
    position: relative;
    top: auto;
    margin-top: 12px;
    justify-content: stretch;
    width: 100%;
    padding: 0 12px;
    box-sizing: border-box;
  }
`;

const HomeContent = () => {
  const { selectedDate, isLoading, hasPuzzle } = usePuzzle();
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
    onPromotionSelect,
    pendingPromotion,
    isHintRevealed,
    status,
  } = usePuzzleGame();
  const layoutKey = `${formatDateForUrl(selectedDate)}-${hasPuzzle}-${isLoading}`;
  const { sidebarRef, boardSide } = useBoardSizeFromSidebar(isHintRevealed, layoutKey);

  return (
    <Page>
      <Header />
      <Content>
        <BoardSection aria-label="Chess puzzle board">
          <BoardColumn>
            <BoardSlot>
              <BoardStack $side={boardSide}>
                <ChessBoard
                  fen={fen}
                  orientation={orientation}
                  selectedSquare={selectedSquare}
                  legalTargets={legalTargets}
                  lastMove={lastMove}
                  hintSquares={hintSquares}
                  wrongMoveSquares={wrongMoveSquares}
                  canInteract={canInteract}
                  isSolved={status === 'solved'}
                  promotionPicker={
                    pendingPromotion
                      ? {
                          square: pendingPromotion.to,
                          color: getSideToMove(fen),
                          onSelect: onPromotionSelect,
                        }
                      : null
                  }
                  onSquareClick={onSquareClick}
                />
                <SolveConfetti isSolved={status === 'solved'} lastMoveTo={lastMove?.to ?? null} />
                <BoardFooterSlot>
                  <PuzzleBoardFooter />
                </BoardFooterSlot>
              </BoardStack>
            </BoardSlot>
          </BoardColumn>
        </BoardSection>
        <Sidebar ref={sidebarRef} />
      </Content>
    </Page>
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
