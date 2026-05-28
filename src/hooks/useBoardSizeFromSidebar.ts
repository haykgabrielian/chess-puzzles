import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const MOBILE_MEDIA = '(max-width: 900px)';

export const useBoardSizeFromSidebar = (isHintRevealed: boolean, layoutKey: string) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const baselineHeightRef = useRef<number | null>(null);
  const [boardSide, setBoardSide] = useState<number | null>(null);

  const measure = useCallback(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar || window.matchMedia(MOBILE_MEDIA).matches) {
      setBoardSide(null);
      return;
    }

    if (isHintRevealed && baselineHeightRef.current != null) {
      setBoardSide(baselineHeightRef.current);
      return;
    }

    const height = sidebar.offsetHeight;
    baselineHeightRef.current = height;
    setBoardSide(height);
  }, [isHintRevealed]);

  useLayoutEffect(() => {
    baselineHeightRef.current = null;
    measure();
  }, [layoutKey, measure]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const observer = new ResizeObserver(() => {
      if (!isHintRevealed) {
        measure();
      }
    });

    observer.observe(sidebar);
    return () => observer.disconnect();
  }, [isHintRevealed, measure]);

  useLayoutEffect(() => {
    const handleResize = () => measure();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measure]);

  return { sidebarRef, boardSide };
};
