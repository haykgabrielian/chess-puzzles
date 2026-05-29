import { useEffect, useState } from 'react';

export const MOBILE_MEDIA = '(max-width: 900px)';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_MEDIA).matches);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MEDIA);
    const onChange = () => setIsMobile(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isMobile;
};
