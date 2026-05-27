import styled from 'styled-components';
import { useContext } from 'react';

import logo from '@/assets/logo.png';
import logoDarkMode from '@/assets/logo_dark_mode.png';
import { ThemeToggleContext } from '@/context/ThemeContext';

const HeaderBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  color: ${({ theme }) => theme.header.text};
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.img`
  height: 50px;
  width: auto;
`;

const Title = styled.h1`
  display: flex;
  flex-direction: column;
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.15;
  color: ${({ theme }) => theme.header.text};
`;

const TitleLine = styled.span`
  display: block;
`;

const PawnButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.header.text};
  background-color: ${({ theme }) => `${theme.header.text}18`};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.header.text}33`};
  }

  svg {
    width: 30px;
    height: 30px;
    display: block;
  }
`;

const PAWN_PATH =
  'M2427 4470 c-350 -63 -617 -310 -697 -643 -25 -102 -26 -267 -4 -375 31 -149 119 -317 218 -412 l47 -45 -248 -5 -248 -5 -3 -212 -2 -213 321 0 322 0 -6 -107 c-38 -685 -503 -1289 -1159 -1508 l-118 -39 0 -238 0 -238 1710 0 1710 0 0 239 0 239 -87 27 c-375 117 -704 367 -923 701 -153 233 -254 539 -267 812 l-6 112 322 0 321 0 -2 213 -3 212 -249 3 -248 2 63 68 c280 298 293 777 30 1104 -157 195 -378 305 -631 313 -63 2 -137 0 -163 -5z';

const PawnIcon = ({
  fill,
  stroke = 'none',
  strokeWidth = 0,
}: {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}) => (
  <svg viewBox="0 0 512 512" aria-hidden="true">
    <g transform="translate(0,512) scale(0.1,-0.1)" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
      <path d={PAWN_PATH} />
    </g>
  </svg>
);

const WhitePawnIcon = () => <PawnIcon fill="#ffffff" stroke="currentColor" strokeWidth={18} />;

const BlackPawnIcon = () => <PawnIcon fill="currentColor" />;

const Header = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeToggleContext);

  return (
    <HeaderBar>
      <Brand>
        <Logo src={isDarkMode ? logoDarkMode : logo} alt="Chess Puzzles" />
        <Title>
          <TitleLine>Chess</TitleLine>
          <TitleLine>Puzzles</TitleLine>
        </Title>
      </Brand>
      <PawnButton
        type="button"
        onClick={toggleTheme}
        aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDarkMode ? <WhitePawnIcon /> : <BlackPawnIcon />}
      </PawnButton>
    </HeaderBar>
  );
};

export default Header;
