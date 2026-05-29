import { type ReactNode, useState } from 'react';
import styled from 'styled-components';

import { useIsMobile } from '@/hooks/useIsMobile';

const MOBILE = '@media (max-width: 900px)';

const CardRoot = styled.section`
  background-color: ${({ theme }) => theme.card.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;
`;

const cardHeaderStyles = `
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 14px;
  font-size: 0.875rem;
  font-weight: 600;
  color: inherit;
  box-sizing: border-box;
`;

const CardHeader = styled.header<{ $collapsed?: boolean }>`
  ${cardHeaderStyles}
  border-bottom: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text.primary};

  ${MOBILE} {
    ${({ $collapsed }) =>
      $collapsed
        ? `
      border-bottom: none;
    `
        : ''}
  }
`;

const CardHeaderButton = styled.button<{ $collapsed?: boolean }>`
  ${cardHeaderStyles}
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.card.background};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  text-align: left;

  ${MOBILE} {
    ${({ $collapsed }) =>
      $collapsed
        ? `
      border-bottom: none;
    `
        : ''}
  }
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
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyHeight?: string;
  collapsibleOnMobile?: boolean;
  defaultMobileCollapsed?: boolean;
};

const Card = ({
  title,
  icon,
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
      <CardHeaderMain>
        {icon}
        {title}
      </CardHeaderMain>
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
          $collapsed={isCollapsed}
          aria-expanded={!isCollapsed}
          onClick={() => setMobileCollapsed(prev => !prev)}
        >
          {headerContent}
        </CardHeaderButton>
      ) : (
        <CardHeader $collapsed={isCollapsed}>{headerContent}</CardHeader>
      )}
      <CardBody $bodyHeight={bodyHeight} $hiddenOnMobile={isCollapsed}>
        {children}
      </CardBody>
    </CardRoot>
  );
};

export default Card;
