import { forwardRef } from 'react';
import styled from 'styled-components';

import Calendar from '@/components/sidebar/Calendar';
import Hint from '@/components/sidebar/Hint';
import PuzzleInfo from '@/components/sidebar/PuzzleInfo';

const SidebarRoot = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
`;

const Sidebar = forwardRef<HTMLElement>((_, ref) => (
  <SidebarRoot ref={ref} aria-label="Puzzle sidebar">
    <PuzzleInfo />
    <Calendar />
    <Hint />
  </SidebarRoot>
));

Sidebar.displayName = 'Sidebar';

export default Sidebar;
