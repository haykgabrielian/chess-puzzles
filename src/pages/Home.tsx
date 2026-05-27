import styled from 'styled-components';

import BoardThemePicker from '@/components/board/BoardThemePicker';
import ChessBoard from '@/components/board/ChessBoard';
import Header from '@/components/Header';
import Sidebar from '@/components/sidebar/Sidebar';
import PuzzleProvider, { usePuzzle } from '@/context/PuzzleContext';

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
  justify-content: center;
  align-items: flex-start;
  min-width: 0;
`;

const HomeContent = () => {
  const { puzzle } = usePuzzle();

  return (
    <Page>
      <Header />
      <Content>
        <BoardSection aria-label="Chess puzzle board">
          <ChessBoard fen={puzzle.parsed.fen} />
        </BoardSection>
        <Sidebar />
      </Content>
      <BoardThemePicker />
    </Page>
  );
};

const Home = () => (
  <PuzzleProvider>
    <HomeContent />
  </PuzzleProvider>
);

export default Home;
