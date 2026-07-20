import type { ReactNode } from "react";
import styled from "styled-components";

import { BOARD_VIEWPORT_INSET } from "@/components/board/BoardSizer";
import RightPanel from "@/components/layout/RightPanel";

const MOBILE = "@media (max-width: 900px)";
const BOARD_MAX = `calc(100dvh - ${BOARD_VIEWPORT_INSET * 2}px)`;

const Page = styled.div`
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.text.primary};
  overflow-x: clip;
`;

const Content = styled.main`
  display: grid;
  grid-template-columns: minmax(0, ${BOARD_MAX}) min(440px, 40vw);
  gap: 24px;
  padding: ${BOARD_VIEWPORT_INSET}px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  align-items: start;
  justify-content: center;

  ${MOBILE} {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px 0;
  }
`;

const BoardSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-width: 0;
  width: 100%;
  position: sticky;
  top: ${BOARD_VIEWPORT_INSET}px;

  ${MOBILE} {
    position: static;
    justify-content: stretch;
    padding: 0 12px;
    box-sizing: border-box;
  }
`;

type BoardLayoutProps = {
  board: ReactNode;
  children: ReactNode;
  boardLabel?: string;
};

const BoardLayout = ({ board, children, boardLabel }: BoardLayoutProps) => (
  <Page>
    <Content>
      <BoardSection aria-label={boardLabel}>{board}</BoardSection>
      <RightPanel>{children}</RightPanel>
    </Content>
  </Page>
);

export default BoardLayout;
