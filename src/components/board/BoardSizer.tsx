import styled from 'styled-components';

export const BOARD_VIEWPORT_INSET = 24;

const BoardSizer = styled.div`
  position: relative;
  width: min(100%, calc(100dvh - ${BOARD_VIEWPORT_INSET * 2}px));
  max-width: 100%;
  aspect-ratio: 1;
  flex-shrink: 0;
`;

export default BoardSizer;
