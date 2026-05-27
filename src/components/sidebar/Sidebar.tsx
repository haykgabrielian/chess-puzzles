import styled from 'styled-components';

import Calendar from '@/components/sidebar/Calendar';
import Hint from '@/components/sidebar/Hint';
import PuzzleInfo from '@/components/sidebar/PuzzleInfo';

const SidebarRoot = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
`;

const Sidebar = () => (
  <SidebarRoot aria-label="Puzzle sidebar">
    <PuzzleInfo />
    <Calendar />
    <Hint />
  </SidebarRoot>
);

export default Sidebar;
