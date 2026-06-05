import styled from 'styled-components';

import BoardSizer from '@/components/board/BoardSizer';
import ChessBoard from '@/components/board/ChessBoard';
import SolveConfetti from '@/components/board/SolveConfetti';
import Header from '@/components/Header';
import Sidebar from '@/components/sidebar/Sidebar';
import PuzzleProvider, { usePuzzle } from '@/context/PuzzleContext';
import PuzzleGameProvider, { usePuzzleGame } from '@/context/PuzzleGameContext';
import { getSideToMove } from '@/helpers/fen';

const MOBILE = '@media (max-width: 900px)';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.text.primary};
  overflow-x: clip;
`;

const Content = styled.main`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr min(440px, 40%);
  gap: 24px;
  padding: 24px 24px 0;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  align-items: start;

  ${MOBILE} {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 16px;
    padding: 24px 0 0;
  }
`;

const BoardSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  width: 100%;

  ${MOBILE} {
    width: 100%;
  }
`;

const BoardColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const HomeContent = () => {
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
    status,
  } = usePuzzleGame();

  return (
    <Page>
      <Header />
      <Content>
        <BoardSection aria-label="Chess puzzle board">
          <BoardColumn>
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
            </BoardSizer>
          </BoardColumn>
        </BoardSection>
        <Sidebar />
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
