import styled from 'styled-components';

import Calendar from '@/components/sidebar/Calendar';
import Hint from '@/components/sidebar/Hint';
import PuzzleInfo from '@/components/sidebar/PuzzleInfo';

const MOBILE = '@media (max-width: 900px)';

const SidebarRoot = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;

  ${MOBILE} {
    padding: 0 12px;
    box-sizing: border-box;
  }
`;

const SidebarItem = styled.div<{ $mobileOrder: number }>`
  ${MOBILE} {
    order: ${({ $mobileOrder }) => $mobileOrder};
  }
`;

const Sidebar = () => (
  <SidebarRoot aria-label="Puzzle sidebar">
    <SidebarItem $mobileOrder={1}>
      <PuzzleInfo />
    </SidebarItem>
    <SidebarItem $mobileOrder={2}>
      <Hint />
    </SidebarItem>
    <SidebarItem $mobileOrder={3}>
      <Calendar />
    </SidebarItem>
  </SidebarRoot>
);

export default Sidebar;
