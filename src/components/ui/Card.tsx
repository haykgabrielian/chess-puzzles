import type { ReactNode } from 'react';
import styled from 'styled-components';

const CardRoot = styled.section`
  background-color: ${({ theme }) => theme.card.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;
`;

const CardHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const CardBody = styled.div`
  padding: 16px;
`;

type CardProps = {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

const Card = ({ title, icon, children, className }: CardProps) => (
  <CardRoot className={className}>
    <CardHeader>
      {icon}
      {title}
    </CardHeader>
    <CardBody>{children}</CardBody>
  </CardRoot>
);

export default Card;
