import styled from 'styled-components';
import { useContext, useEffect, useRef, useState } from 'react';

import { BoardThemeContext } from '@/context/BoardThemeContext';
import { boardCoordinateModes, boardThemes } from '@/helpers/boardThemes';

const Wrapper = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
`;

const Menu = styled.div`
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  width: 280px;
  padding: 16px;
  background-color: ${({ theme }) => theme.popover.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
`;

const MenuTitle = styled.p`
  margin: 0 0 14px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.muted};
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 16px;
`;

const ThemeOption = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
`;

const PreviewWrapper = styled.div<{ $selected: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  outline: ${({ $selected, theme }) =>
    $selected ? `2px solid ${theme.accent}` : '2px solid transparent'};
  outline-offset: 1px;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  width: 100%;
  height: 100%;
`;

const PreviewSquare = styled.div<{ $color: string }>`
  background-color: ${({ $color }) => $color};
`;

const Checkmark = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.onAccent};

  svg {
    width: 10px;
    height: 10px;
    display: block;
  }
`;

const ThemeLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
`;

const MenuDivider = styled.hr`
  margin: 16px 0 14px;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const CoordinateSectionTitle = styled(MenuTitle)`
  margin-bottom: 8px;
`;

const CoordinateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 72px);
  justify-content: start;
  gap: 6px 12px;
`;

const CoordinateOption = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
`;

const CoordinatePreview = styled.div<{ $selected: boolean; $light: string; $dark: string; $coordinate: string; $frame: string }>`
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 5px;
  overflow: hidden;
  outline: ${({ $selected, theme }) =>
    $selected ? `2px solid ${theme.accent}` : '2px solid transparent'};
  outline-offset: 1px;
  background-color: ${({ $frame }) => $frame};
`;

const CoordinateLabel = styled.span`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.text.secondary};
  text-align: left;
`;

const CoordinateCheckmark = styled(Checkmark)`
  top: 2px;
  right: 2px;
  width: 12px;
  height: 12px;

  svg {
    width: 7px;
    height: 7px;
  }
`;

const AsidePreview = styled.div<{ $light: string; $dark: string; $coordinate: string }>`
  display: grid;
  grid-template-columns: 8px 1fr 8px;
  grid-template-rows: 8px 1fr 8px;
  gap: 2px;
  width: 100%;
  height: 100%;
  padding: 4px;
  box-sizing: border-box;

  &::before {
    content: 'a';
    grid-column: 2;
    grid-row: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6px;
    font-weight: 600;
    color: ${({ $coordinate }) => $coordinate};
  }

  &::after {
    content: 'a';
    grid-column: 2;
    grid-row: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6px;
    font-weight: 600;
    color: ${({ $coordinate }) => $coordinate};
  }
`;

const AsidePreviewSideLabel = styled.span<{ $coordinate: string; $position: 'left' | 'right' }>`
  grid-column: ${({ $position }) => ($position === 'left' ? 1 : 3)};
  grid-row: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6px;
  font-weight: 600;
  color: ${({ $coordinate }) => $coordinate};
`;

const AsidePreviewBoard = styled.div<{ $light: string; $dark: string }>`
  grid-column: 2;
  grid-row: 2;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  border-radius: 2px;
  overflow: hidden;

  span:nth-child(1) {
    background-color: ${({ $light }) => $light};
  }

  span:nth-child(2) {
    background-color: ${({ $dark }) => $dark};
  }

  span:nth-child(3) {
    background-color: ${({ $dark }) => $dark};
  }

  span:nth-child(4) {
    background-color: ${({ $light }) => $light};
  }
`;

const InsidePreviewBoard = styled.div<{ $light: string; $dark: string }>`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  width: 100%;
  height: 100%;
  padding: 4px;
  box-sizing: border-box;
  border-radius: 2px;
  overflow: hidden;

  span {
    position: relative;
  }

  span:nth-child(1) {
    background-color: ${({ $light }) => $light};

    &::before {
      content: '8';
      position: absolute;
      top: 2px;
      left: 3px;
      font-size: 8px;
      font-weight: 600;
      line-height: 1;
      color: ${({ $dark }) => $dark};
    }
  }

  span:nth-child(2) {
    background-color: ${({ $dark }) => $dark};
  }

  span:nth-child(3) {
    background-color: ${({ $dark }) => $dark};

    &::before {
      content: '1';
      position: absolute;
      top: 2px;
      left: 3px;
      font-size: 8px;
      font-weight: 600;
      line-height: 1;
      color: ${({ $light }) => $light};
    }

    &::after {
      content: 'a';
      position: absolute;
      bottom: 2px;
      right: 3px;
      font-size: 8px;
      font-weight: 600;
      line-height: 1;
      color: ${({ $light }) => $light};
    }
  }

  span:nth-child(4) {
    background-color: ${({ $light }) => $light};

    &::after {
      content: 'b';
      position: absolute;
      bottom: 2px;
      right: 3px;
      font-size: 8px;
      font-weight: 600;
      line-height: 1;
      color: ${({ $dark }) => $dark};
    }
  }
`;

const TriggerWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
`;

const MenuTail = styled.div`
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid ${({ theme }) => theme.popover.background};
`;

const TriggerButton = styled.button`
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

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 15.6 12 3.6 3.6 0 0 1 12 15.6z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ThemePreview = ({ light, dark }: { light: string; dark: string }) => {
  const squares = [...Array(16)];

  return (
    <PreviewGrid aria-hidden="true">
      {squares.map((_, i) => (
        <PreviewSquare
          key={i}
          $color={(Math.floor(i / 4) + i) % 2 === 0 ? light : dark}
        />
      ))}
    </PreviewGrid>
  );
};

const BoardThemePicker = () => {
  const { boardTheme, setBoardThemeId, coordinateMode, setCoordinateMode } =
    useContext(BoardThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <Wrapper ref={wrapperRef}>
      {isOpen && (
        <Menu role="dialog" aria-label="Chess board theme">
          <MenuTitle>Chess Theme ({boardThemes.length} Options)</MenuTitle>
          <ThemeGrid>
            {boardThemes.map(theme => {
              const selected = boardTheme.id === theme.id;
              return (
                <ThemeOption
                  key={theme.id}
                  type="button"
                  $selected={selected}
                  aria-pressed={selected}
                  onClick={() => setBoardThemeId(theme.id)}
                >
                  <PreviewWrapper $selected={selected}>
                    <ThemePreview light={theme.light} dark={theme.dark} />
                    {selected && (
                      <Checkmark aria-hidden="true">
                        <CheckIcon />
                      </Checkmark>
                    )}
                  </PreviewWrapper>
                  <ThemeLabel>{theme.name}</ThemeLabel>
                </ThemeOption>
              );
            })}
          </ThemeGrid>
          <MenuDivider />
          <CoordinateSectionTitle>Coordinates</CoordinateSectionTitle>
          <CoordinateGrid>
            {boardCoordinateModes.map(mode => {
              const selected = coordinateMode === mode.id;
              return (
                <CoordinateOption
                  key={mode.id}
                  type="button"
                  $selected={selected}
                  aria-pressed={selected}
                  onClick={() => setCoordinateMode(mode.id)}
                >
                  <CoordinatePreview
                    $selected={selected}
                    $light={boardTheme.light}
                    $dark={boardTheme.dark}
                    $coordinate={boardTheme.coordinate}
                    $frame={boardTheme.frame}
                  >
                    {mode.id === 'aside' ? (
                      <AsidePreview
                        $light={boardTheme.light}
                        $dark={boardTheme.dark}
                        $coordinate={boardTheme.coordinate}
                      >
                        <AsidePreviewSideLabel
                          $coordinate={boardTheme.coordinate}
                          $position="left"
                          aria-hidden="true"
                        >
                          8
                        </AsidePreviewSideLabel>
                        <AsidePreviewBoard $light={boardTheme.light} $dark={boardTheme.dark}>
                          <span aria-hidden="true" />
                          <span aria-hidden="true" />
                          <span aria-hidden="true" />
                          <span aria-hidden="true" />
                        </AsidePreviewBoard>
                        <AsidePreviewSideLabel
                          $coordinate={boardTheme.coordinate}
                          $position="right"
                          aria-hidden="true"
                        >
                          8
                        </AsidePreviewSideLabel>
                      </AsidePreview>
                    ) : (
                      <InsidePreviewBoard
                        $light={boardTheme.light}
                        $dark={boardTheme.dark}
                      >
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                      </InsidePreviewBoard>
                    )}
                    {selected && (
                      <CoordinateCheckmark aria-hidden="true">
                        <CheckIcon />
                      </CoordinateCheckmark>
                    )}
                  </CoordinatePreview>
                  <CoordinateLabel>{mode.name}</CoordinateLabel>
                </CoordinateOption>
              );
            })}
          </CoordinateGrid>
        </Menu>
      )}
      <TriggerWrapper>
        {isOpen && <MenuTail aria-hidden="true" />}
        <TriggerButton
          type="button"
          aria-label="Chess board theme settings"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(prev => !prev)}
        >
          <SettingsIcon />
        </TriggerButton>
      </TriggerWrapper>
    </Wrapper>
  );
};

export default BoardThemePicker;
