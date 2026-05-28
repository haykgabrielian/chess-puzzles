import styled from 'styled-components';

import BoardThemePicker from '@/components/board/BoardThemePicker';
import ChessBoard from '@/components/board/ChessBoard';
import PuzzleBoardFooter from '@/components/board/PuzzleBoardFooter';
import Header from '@/components/Header';
import Sidebar from '@/components/sidebar/Sidebar';
import PuzzleProvider from '@/context/PuzzleContext';
import PuzzleGameProvider, { usePuzzleGame } from '@/context/PuzzleGameContext';

const Page = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.text.primary};
`;

const Content = styled.main`
  display: grid;
  grid-template-columns: 1fr min(380px, 36%);
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const BoardSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 0;
`;

const BoardColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: min(100%, 720px);
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
  } = usePuzzleGame();

  return (
    <Page>
      <Header />
      <Content>
        <BoardSection aria-label="Chess puzzle board">
          <BoardColumn>
            <ChessBoard
              fen={fen}
              orientation={orientation}
              selectedSquare={selectedSquare}
              legalTargets={legalTargets}
              lastMove={lastMove}
              hintSquares={hintSquares}
              wrongMoveSquares={wrongMoveSquares}
              canInteract={canInteract}
              onSquareClick={onSquareClick}
            />
            <PuzzleBoardFooter />
          </BoardColumn>
        </BoardSection>
        <Sidebar />
      </Content>
      <BoardThemePicker />
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
