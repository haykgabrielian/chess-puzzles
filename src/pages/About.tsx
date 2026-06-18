import { Link } from "@tanstack/react-router";
import { useContext } from "react";
import styled from "styled-components";

import londonSystemImg from "@/assets/board_annotation_london_system.png";
import boardAnnotationsImg from "@/assets/board_annotations.png";
import moveHintsImg from "@/assets/move_hints.png";
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import {
  CalendarIcon,
  FreeroamIcon,
  HintIcon,
  PuzzleInfoIcon,
} from "@/components/ui/CardIcons";
import { PieceSetContext } from "@/context/PieceSetContext";
import { formatDateForUrl, getToday } from "@/helpers/date";
import type { Piece } from "@/helpers/fen";

const MOBILE = "@media (max-width: 900px)";

const Page = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.text.primary};
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 72px;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 28px 16px 56px;
  }
`;

const Hero = styled.section`
  margin-bottom: 48px;
  padding-bottom: 40px;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 600px) {
    margin-bottom: 36px;
    padding-bottom: 32px;
  }
`;

const HeroInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  max-width: 640px;
`;

const HeroTitle = styled.h1`
  margin: 0 0 10px;
  font-size: clamp(1.625rem, 3vw, 2.125rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

const HeroLead = styled.p`
  margin: 0 0 28px;
  max-width: 52ch;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.text.secondary};
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const HeroActionLink = styled.span`
  & > a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px solid ${({ theme }) => theme.accent};
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 500;
    text-decoration: none;
    color: ${({ theme }) => theme.accent};
    background-color: transparent;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${({ theme }) => theme.accentMuted};
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const SectionHeading = styled.h2`
  margin: 0 0 28px;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const ShowcaseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-bottom: 48px;
`;

const Showcase = styled.article<{ $reverse?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 28px;
  align-items: stretch;

  ${({ $reverse }) =>
    $reverse
      ? `
    direction: rtl;

    & > * {
      direction: ltr;
    }
  `
      : ""}

  ${MOBILE} {
    grid-template-columns: 1fr;
    gap: 18px;
    direction: ltr;

    & > * {
      direction: ltr;
    }
  }
`;

const ShowcaseFigure = styled.figure`
  margin: 0;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.card.background};
  box-shadow: 0 10px 28px ${({ theme }) => theme.accentMuted};
`;

const ShowcaseImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  vertical-align: middle;
`;

const ShowcaseCaption = styled.figcaption`
  padding: 10px 14px;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.muted};
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const ShowcaseBody = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const ShowcaseAccent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  margin-top: 20px;
`;

const ShowcaseAccentPiece = styled.img<{ $opacity: number }>`
  width: min(176px, 78%);
  height: auto;
  opacity: ${({ $opacity }) => $opacity};
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.12));

  ${MOBILE} {
    width: min(132px, 64%);
  }
`;

const ShowcaseLabel = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
`;

const ShowcaseTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.25;
`;

const ShowcaseText = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.text.secondary};
`;

const ModeGrid = styled.div`
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

const InfoList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 20px;

  ${MOBILE} {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.text.secondary};

  &::before {
    content: "";
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    margin-top: 0.55em;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.accent};
  }
`;

type ShowcaseAccentKey = "hints" | "arrows" | "sandbox";

const SHOWCASE_ACCENT_PIECES: Record<
  ShowcaseAccentKey,
  { piece: Piece; opacity: number }
> = {
  hints: { piece: "q", opacity: 0.2 },
  arrows: { piece: "b", opacity: 0.2 },
  sandbox: { piece: "k", opacity: 0.2 },
};

const ShowcasePieceDecor = ({ piece }: { piece: ShowcaseAccentKey }) => {
  const { pieceSet } = useContext(PieceSetContext);
  const accent = SHOWCASE_ACCENT_PIECES[piece];

  return (
    <ShowcaseAccent aria-hidden="true">
      <ShowcaseAccentPiece
        src={pieceSet.images[accent.piece]}
        alt=""
        $opacity={accent.opacity}
      />
    </ShowcaseAccent>
  );
};

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
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
        <Hero>
          <HeroInfo>
            <HeroTitle>Daily puzzles &amp; a free board</HeroTitle>
            <HeroLead>
              Solve Chess.com tactics by date, use hints when you&apos;re stuck,
              or open Sandbox to explore lines — no account required.
            </HeroLead>
            <HeroActions>
              <HeroActionLink>
                <Link to="/$date" params={{ date: todayDate }}>
                  <CalendarIcon />
                  Today&apos;s puzzle
                </Link>
              </HeroActionLink>
              <HeroActionLink>
                <Link to="/freeroam">
                  <FreeroamIcon />
                  Sandbox
                </Link>
              </HeroActionLink>
            </HeroActions>
          </HeroInfo>
        </Hero>

        <SectionHeading>How it works</SectionHeading>

        <ShowcaseList>
          <Showcase>
            <ShowcaseFigure>
              <ShowcaseImage
                src={moveHintsImg}
                alt="Chess board showing move hints with highlighted squares, move dots, and a lightbulb hint badge"
              />
              <ShowcaseCaption>
                Hints highlight the next move, legal targets, and captures.
              </ShowcaseCaption>
            </ShowcaseFigure>
            <ShowcaseBody>
              <ShowcaseLabel>
                <HintIcon />
                Puzzle mode
              </ShowcaseLabel>
              <ShowcaseTitle>Hints that nudge, not spoil</ShowcaseTitle>
              <ShowcaseText>
                Each daily puzzle plays out move by move. When you need help,
                request a hint to see the next square pair, legal move dots,
                and capture rings — plus a lightbulb badge on the source
                square. Wrong tries are marked in red so you can adjust
                quickly, and confetti celebrates the winning move.
              </ShowcaseText>
              <ShowcasePieceDecor piece="hints" />
            </ShowcaseBody>
          </Showcase>

          <Showcase $reverse>
            <ShowcaseFigure>
              <ShowcaseImage
                src={boardAnnotationsImg}
                alt="Chess board with colored annotation arrows showing tactical lines toward the king"
              />
              <ShowcaseCaption>
                Draw arrows on the board to mark plans and threats.
              </ShowcaseCaption>
            </ShowcaseFigure>
            <ShowcaseBody>
              <ShowcaseLabel>
                <PuzzleInfoIcon />
                Board tools
              </ShowcaseLabel>
              <ShowcaseTitle>Annotate positions with arrows</ShowcaseTitle>
              <ShowcaseText>
                Right-click and drag between squares to draw arrows in yellow,
                green, blue, or red. Use them while solving to trace candidate
                lines, or in Sandbox to walk through an opening plan. Arrows
                clear when the position changes so the board stays readable.
              </ShowcaseText>
              <ShowcasePieceDecor piece="arrows" />
            </ShowcaseBody>
          </Showcase>

          <Showcase>
            <ShowcaseFigure>
              <ShowcaseImage
                src={londonSystemImg}
                alt="Chess board in a London System setup with yellow arrows showing typical development moves"
              />
              <ShowcaseCaption>
                Map out ideas in Sandbox with the same annotation tools.
              </ShowcaseCaption>
            </ShowcaseFigure>
            <ShowcaseBody>
              <ShowcaseLabel>
                <FreeroamIcon />
                Sandbox
              </ShowcaseLabel>
              <ShowcaseTitle>A board for your own lines</ShowcaseTitle>
              <ShowcaseText>
                Sandbox drops the puzzle rules and gives you a full chess board
                from the starting position. Move either side, step through move
                history, track captures, and reset anytime. It&apos;s the same
                polished board — themes, sounds, drag-and-drop — without a
                clock or scoreboard.
              </ShowcaseText>
              <ShowcasePieceDecor piece="sandbox" />
            </ShowcaseBody>
          </Showcase>
        </ShowcaseList>

        <SectionHeading>Two ways to play</SectionHeading>

        <ModeGrid>
          <Card title="Daily Puzzles" icon={<CalendarIcon />}>
            <FeatureText>
              Browse puzzles by date with the calendar sidebar. Each day loads
              the official daily puzzle — work through the solution line, use
              hints when you need them, and share or revisit any date via its
              URL.
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
              A full chess board with no puzzle rules. Move either side from the
              starting position, annotate with arrows, track captured pieces,
              and reset anytime. Perfect for trying ideas at your own pace.
            </FeatureText>
            <FeatureLinkWrap>
              <Link to="/freeroam">
                Open Sandbox
                <ArrowIcon />
              </Link>
            </FeatureLinkWrap>
          </Card>
        </ModeGrid>

        <Card title="Everything else" icon={<PuzzleInfoIcon />}>
          <InfoList>
            <InfoItem>
              Date-based URLs so every puzzle has its own link to share or
              revisit
            </InfoItem>
            <InfoItem>
              Puzzle data synced locally from Chess.com — no sign-in needed
            </InfoItem>
            <InfoItem>
              Multiple board themes, piece sets, and light or dark mode
            </InfoItem>
            <InfoItem>
              Move sounds for captures, checks, castles, and more
            </InfoItem>
            <InfoItem>
              Drag-and-drop pieces with optional move animation
            </InfoItem>
            <InfoItem>
              Keyboard-friendly move history navigation in Sandbox
            </InfoItem>
          </InfoList>
        </Card>
      </Content>
    </Page>
  );
};

export default About;
