import { forwardRef } from 'react';
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

const Sidebar = forwardRef<HTMLElement>((_, ref) => (
  <SidebarRoot ref={ref} aria-label="Puzzle sidebar">
    <SidebarItem $mobileOrder={2}>
      <PuzzleInfo />
    </SidebarItem>
    <SidebarItem $mobileOrder={3}>
      <Calendar />
    </SidebarItem>
    <SidebarItem $mobileOrder={1}>
      <Hint />
    </SidebarItem>
  </SidebarRoot>
));

Sidebar.displayName = 'Sidebar';

export default Sidebar;
