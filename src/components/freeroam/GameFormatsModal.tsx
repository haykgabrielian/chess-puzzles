import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import {
  type FreeroamImportResult,
  parseFenImport,
  parsePgnImport,
  type PgnGameInfo,
  preparePgnForDownload,
} from '@/helpers/gameImport';

type PgnExportContext = {
  startingFen: string;
  moves: string[];
  pgnInfo: PgnGameInfo | null;
};

type ImportTab = 'pgn' | 'fen';

type GameFormatsModalProps = {
  currentPgn: string;
  currentFen: string;
  pgnExportContext: PgnExportContext;
  onClose: () => void;
  onApply: (result: FreeroamImportResult) => void;
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.45);
`;

const Dialog = styled.div`
  display: flex;
  flex-direction: column;
  width: min(100%, 620px);
  max-height: min(90dvh, 720px);
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.card.background};
  color: ${({ theme }) => theme.text.primary};
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: none;
  color: ${({ theme }) => theme.text.secondary};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.button.background};
    color: ${({ theme }) => theme.text.primary};
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px 14px;
  flex-wrap: wrap;
`;

const TabGroup = styled.div`
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.button.background};
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 7px 16px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $active, theme }) =>
    $active ? theme.text.primary : theme.text.secondary};
  background-color: ${({ $active, theme }) =>
    $active ? theme.card.background : 'transparent'};
  box-shadow: ${({ $active }) =>
    $active ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none'};

  &:hover {
    color: ${({ theme }) => theme.text.primary};
  }
`;

const ToolbarActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ToolbarActionButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid ${({ theme }) => theme.accent};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  background-color: ${({ $active, theme }) =>
    $active ? theme.accentMuted : 'transparent'};

  &:hover {
    background-color: ${({ theme }) => theme.accentMuted};
  }
`;

const DialogBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 20px 16px;
  min-height: 0;
  flex: 1;
`;

const EditorWrap = styled.div`
  position: relative;
  min-height: 240px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 240px;
  max-height: min(42vh, 360px);
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  resize: none;
  box-sizing: border-box;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.text.primary};
  background-color: ${({ theme }) => theme.background.secondary};

  &:focus {
    outline: 2px solid ${({ theme }) => theme.accentMuted};
    border-color: ${({ theme }) => theme.accent};
  }
`;

const DropZone = styled.div<{ $dragging: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  border: 2px dashed
    ${({ $dragging, theme }) => ($dragging ? theme.accent : theme.border)};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.card.background};
  text-align: center;
  box-sizing: border-box;
`;

const DropTitle = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const DropHint = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const DropFileInput = styled.input`
  margin-top: 8px;
  max-width: 100%;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.secondary};

  &::file-selector-button {
    margin-right: 10px;
    padding: 6px 12px;
    border: 1px solid ${({ theme }) => theme.accent};
    border-radius: 8px;
    background: none;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 600;
    color: ${({ theme }) => theme.accent};

    &:hover {
      background-color: ${({ theme }) => theme.accentMuted};
    }
  }
`;

const ErrorMessage = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.boardHighlight.danger};
`;

const DialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px 18px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const FooterButton = styled.button<{ $primary?: boolean }>`
  min-width: 96px;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid
    ${({ $primary, theme }) => ($primary ? theme.accent : theme.accent)};
  color: ${({ $primary, theme }) =>
    $primary ? theme.onAccent : theme.accent};
  background-color: ${({ $primary, theme }) =>
    $primary ? theme.accent : 'transparent'};

  &:hover:not(:disabled) {
    background-color: ${({ $primary, theme }) =>
      $primary ? theme.accent : theme.accentMuted};
    color: ${({ $primary, theme }) =>
      $primary ? theme.onAccent : theme.accent};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const UploadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M12 3v12" />
    <path d="m7 8 5-5 5 5" />
    <path d="M5 21h14" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M12 3v12" />
    <path d="m7 13 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

const CopyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const getPgnDownloadFilename = (pgnText: string): string => {
  const eventMatch = pgnText.match(/\[Event\s+"([^"]*)"\]/i);
  const event = eventMatch?.[1]?.trim();

  if (event && event !== '?') {
    const sanitized = event
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();

    if (sanitized) {
      return `${sanitized}.pgn`;
    }
  }

  return 'freeroam-game.pgn';
};

const GameFormatsModal = ({
  currentPgn,
  currentFen,
  pgnExportContext,
  onClose,
  onApply,
}: GameFormatsModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const [tab, setTab] = useState<ImportTab>('pgn');
  const [pgnText, setPgnText] = useState(currentPgn);
  const [fenText, setFenText] = useState(currentFen);
  const [showDropZone, setShowDropZone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTab, setCopiedTab] = useState<ImportTab | null>(null);

  const resetDropZone = useCallback(() => {
    setShowDropZone(false);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(
    () => () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    },
    [],
  );

  const handleCopy = async () => {
    const text = tab === 'pgn' ? pgnText : fenText;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tab);
      setError(null);

      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedTab(null);
        copyTimeoutRef.current = null;
      }, 1600);
    } catch {
      setError(`Could not copy ${tab.toUpperCase()} to clipboard.`);
    }
  };

  const handleDownload = () => {
    try {
      const downloadPgn = preparePgnForDownload(pgnText, pgnExportContext);
      const blob = new Blob([downloadPgn], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getPgnDownloadFilename(downloadPgn);
      link.click();
      URL.revokeObjectURL(url);
      setError(null);
    } catch {
      setError('Could not download PGN.');
    }
  };

  const handleApply = () => {
    const outcome =
      tab === 'pgn' ? parsePgnImport(pgnText) : parseFenImport(fenText);

    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }

    onApply(outcome.result);
    onClose();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    try {
      const contents = await readFileAsText(file);
      setPgnText(contents.trimEnd());
      setError(null);
      resetDropZone();
    } catch {
      setError('Could not read the selected file.');
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  };

  const hasChanges = useMemo(
    () =>
      tab === 'pgn'
        ? pgnText.trimEnd() !== currentPgn.trimEnd()
        : fenText.trim() !== currentFen.trim(),
    [currentFen, currentPgn, fenText, pgnText, tab],
  );

  return createPortal(
    <Backdrop
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-formats-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <Title id="game-formats-title">Game Formats</Title>
          <CloseButton type="button" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </DialogHeader>

        <Toolbar>
          <TabGroup role="tablist" aria-label="Import format">
            <TabButton
              type="button"
              role="tab"
              aria-selected={tab === 'pgn'}
              $active={tab === 'pgn'}
              onClick={() => {
                setTab('pgn');
                setError(null);
                resetDropZone();
              }}
            >
              PGN
            </TabButton>
            <TabButton
              type="button"
              role="tab"
              aria-selected={tab === 'fen'}
              $active={tab === 'fen'}
              onClick={() => {
                setTab('fen');
                setError(null);
                resetDropZone();
              }}
            >
              FEN
            </TabButton>
          </TabGroup>

          <ToolbarActions>
            <ToolbarActionButton
              type="button"
              onClick={() => {
                void handleCopy();
              }}
            >
              <CopyIcon />
              {copiedTab === tab ? 'Copied' : 'Copy'}
            </ToolbarActionButton>

            {tab === 'pgn' && (
              <>
                <ToolbarActionButton type="button" onClick={handleDownload}>
                  <DownloadIcon />
                  Download
                </ToolbarActionButton>

                <ToolbarActionButton
                  type="button"
                  $active={showDropZone}
                  onClick={() => {
                    setShowDropZone((previous) => !previous);
                    setIsDragging(false);
                  }}
                >
                  <UploadIcon />
                  Upload
                </ToolbarActionButton>
              </>
            )}
          </ToolbarActions>
        </Toolbar>

        <DialogBody>
          <EditorWrap>
            <TextArea
              value={tab === 'pgn' ? pgnText : fenText}
              onChange={(event) => {
                setError(null);

                if (tab === 'pgn') {
                  setPgnText(event.target.value);
                  return;
                }

                setFenText(event.target.value);
              }}
              spellCheck={false}
              aria-label={tab === 'pgn' ? 'PGN input' : 'FEN input'}
            />

            {tab === 'pgn' && showDropZone && (
              <DropZone
                $dragging={isDragging}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  if (event.currentTarget === event.target) {
                    setIsDragging(false);
                  }
                }}
                onDrop={handleDrop}
              >
                <DropTitle>Drop PGN file here</DropTitle>
                <DropHint>or choose a file (.pgn, .txt)</DropHint>
                <DropFileInput
                  ref={fileInputRef}
                  type="file"
                  accept=".pgn,.txt,text/plain"
                  onChange={handleFileInputChange}
                  onClick={(event) => event.stopPropagation()}
                />
              </DropZone>
            )}
          </EditorWrap>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </DialogBody>

        <DialogFooter>
          <FooterButton type="button" onClick={onClose}>
            Close
          </FooterButton>
          <FooterButton
            type="button"
            $primary
            onClick={handleApply}
            disabled={!hasChanges}
          >
            Apply
          </FooterButton>
        </DialogFooter>
      </Dialog>
    </Backdrop>,
    document.body,
  );
};

export default GameFormatsModal;
