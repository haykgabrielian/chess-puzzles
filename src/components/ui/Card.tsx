import { type ReactNode, useState } from 'react';
import styled from 'styled-components';

import { useIsMobile } from '@/hooks/useIsMobile';

const MOBILE = '@media (max-width: 900px)';

const CardRoot = styled.section`
  background-color: transparent;
  border: none;
  border-radius: 0;
  overflow: visible;

  &:not(:last-child) {
    position: relative;
  }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 0;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`;

const CardHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 16px 14px 2px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.muted};
  box-sizing: border-box;
`;

const CardHeaderButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 16px 14px 2px;
  border: none;
  background-color: transparent;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.muted};
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
`;

const CardHeaderMain = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const CollapseChevron = styled.span<{ $expanded: boolean }>`
  display: none;
  flex-shrink: 0;
  color: ${({ theme }) => theme.text.secondary};

  ${MOBILE} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    width: 18px;
    height: 18px;
    display: block;
    transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
    transition: transform 0.2s ease;
  }
`;

const CardBody = styled.div<{ $bodyHeight?: string; $hiddenOnMobile?: boolean }>`
  padding: 14px;
  box-sizing: border-box;

  ${({ $bodyHeight }) =>
    $bodyHeight
      ? `
    height: ${$bodyHeight};
    overflow-y: auto;
  `
      : ''}

  ${MOBILE} {
    ${({ $hiddenOnMobile }) => ($hiddenOnMobile ? 'display: none;' : '')}
  }

  @media (max-width: 600px) {
    padding: 14px;
  }
`;

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

type CardProps = {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  bodyHeight?: string;
  collapsibleOnMobile?: boolean;
  defaultMobileCollapsed?: boolean;
};

const Card = ({
  title,
  children,
  className,
  bodyHeight,
  collapsibleOnMobile = false,
  defaultMobileCollapsed = true,
}: CardProps) => {
  const isMobile = useIsMobile();
  const [mobileCollapsed, setMobileCollapsed] = useState(defaultMobileCollapsed);
  const isCollapsible = collapsibleOnMobile && isMobile;
  const isCollapsed = isCollapsible && mobileCollapsed;

  const headerContent = (
    <>
      <CardHeaderMain>{title}</CardHeaderMain>
      {isCollapsible && (
        <CollapseChevron $expanded={!isCollapsed} aria-hidden="true">
          <ChevronDown />
        </CollapseChevron>
      )}
    </>
  );

  return (
    <CardRoot className={className}>
      {isCollapsible ? (
        <CardHeaderButton
          type="button"
          aria-expanded={!isCollapsed}
          onClick={() => setMobileCollapsed(prev => !prev)}
        >
          {headerContent}
        </CardHeaderButton>
      ) : (
        <CardHeader>{headerContent}</CardHeader>
      )}
      <CardBody $bodyHeight={bodyHeight} $hiddenOnMobile={isCollapsed}>
        {children}
      </CardBody>
    </CardRoot>
  );
};

export default Card;
