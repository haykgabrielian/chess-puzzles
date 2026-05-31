import styled from 'styled-components';
import { Link } from '@tanstack/react-router';

import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import { CalendarIcon, FreeroamIcon, PuzzleInfoIcon } from '@/components/ui/CardIcons';
import { formatDateForUrl, getToday } from '@/helpers/date';

const MOBILE = '@media (max-width: 900px)';

const Page = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.text.primary};
`;

const Content = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 64px;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 28px 16px 48px;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  ${MOBILE} {
    grid-template-columns: 1fr;
  }
`;

const FeatureText = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.text.secondary};
`;

const FeatureLinkWrap = styled.div`
  margin-top: 14px;

  & > a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    color: ${({ theme }) => theme.accent};
    text-decoration: none;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.8;
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const InfoCard = styled(Card)`
  margin-bottom: 0;
`;

const InfoList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.text.secondary};

  &::before {
    content: '';
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    margin-top: 0.55em;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.accent};
  }
`;

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const About = () => {
  const todayDate = formatDateForUrl(getToday());

  return (
    <Page>
      <Header />
      <Content>
        <FeatureGrid>
          <Card title="Daily Puzzles" icon={<CalendarIcon />}>
            <FeatureText>
              Browse puzzles by date with the calendar sidebar. Each day loads the official daily
              puzzle — work through the solution line, use hints when you need them, and celebrate
              when you find the winning move.
            </FeatureText>
            <FeatureLinkWrap>
              <Link to="/$date" params={{ date: todayDate }}>
                Play today&apos;s puzzle
                <ArrowIcon />
              </Link>
            </FeatureLinkWrap>
          </Card>

          <Card title="Sandbox" icon={<FreeroamIcon />}>
            <FeatureText>
              A full chess board with no puzzle rules. Move either side from the starting position,
              track captured pieces, and reset anytime. Perfect for trying ideas or playing through
              lines at your own speed.
            </FeatureText>
            <FeatureLinkWrap>
              <Link to="/freeroam">
                Open Sandbox
                <ArrowIcon />
              </Link>
            </FeatureLinkWrap>
          </Card>
        </FeatureGrid>

        <InfoCard title="What you get" icon={<PuzzleInfoIcon />}>
          <InfoList>
            <InfoItem>Date-based URLs so every puzzle has its own link to share or revisit</InfoItem>
            <InfoItem>Multiple board themes, piece sets, and light or dark mode</InfoItem>
            <InfoItem>Move hints, wrong-move feedback, and confetti when you solve a puzzle</InfoItem>
            <InfoItem>Puzzle data synced locally from Chess.com — no account required</InfoItem>
          </InfoList>
        </InfoCard>
      </Content>
    </Page>
  );
};

export default About;
