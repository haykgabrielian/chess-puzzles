import { Link } from "@tanstack/react-router";
import styled from "styled-components";

import aboutBannerImg from "@/assets/about_banner.png";
import aboutBannerBackgroundImg from "@/assets/about_banner_background.png";
import londonSystemImg from "@/assets/board_annotation_london_system.png";
import sicilianDefenseImg from "@/assets/board_annotation_sicilian_defense.png";
import boardAnnotationsImg from "@/assets/board_annotations.png";
import moveHintsImg from "@/assets/move_hints.png";
import {
  CalendarIcon,
  FreeroamIcon,
  HintIcon,
  PuzzleInfoIcon,
} from "@/components/ui/CardIcons";
import { formatDateForUrl, getToday } from "@/helpers/date";

const MOBILE = "@media (max-width: 900px)";

const Page = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.text.primary};
`;

const Hero = styled.section`
  position: relative;
  background-color: ${({ theme }) => theme.background.secondary};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url(${aboutBannerBackgroundImg});
    background-repeat: repeat;
    background-size: min(960px, 92vw) auto;
    opacity: 0.7;
    pointer-events: none;
  }
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(12px, 2vw, 24px);
  align-items: center;
  max-width: 960px;
  margin: 0 auto;
  padding: clamp(32px, 5vw, 52px) 24px;

  ${MOBILE} {
    grid-template-columns: 1fr;
    padding: 32px 20px 40px;
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
`;

const HeroTitle = styled.h1`
  margin: 0 0 16px;
  font-size: clamp(1.75rem, 3.5vw, 2.625rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: ${({ theme }) => theme.text.primary};

  em {
    font-style: normal;
    color: ${({ theme }) => theme.accent};
  }
`;

const HeroLead = styled.p`
  margin: 0 0 28px;
  max-width: 46ch;
  font-size: clamp(0.9375rem, 1.5vw, 1.0625rem);
  line-height: 1.65;
  color: ${({ theme }) => theme.text.secondary};
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PrimaryButton = styled.span`
  & > a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 22px;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 600;
    text-decoration: none;
    color: ${({ theme }) => theme.onAccent};
    background-color: ${({ theme }) => theme.accent};
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.9;
    }

    svg {
      width: 18px;
      height: 18px;
    }

    span {
      color: inherit;
    }
  }
`;

const SecondaryButton = styled.span`
  & > a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 22px;
    border: 1px solid ${({ theme }) => theme.accent};
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 600;
    text-decoration: none;
    color: ${({ theme }) => theme.accent};
    background-color: transparent;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${({ theme }) => theme.accentMuted};
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const HeroVisual = styled.div`
  display: flex;
  justify-content: flex-start;
  min-width: 0;

  img {
    display: block;
    width: 100%;
    max-width: 380px;
    height: auto;
  }

  ${MOBILE} {
    order: -1;
    justify-content: center;

    img {
      max-width: 280px;
    }
  }
`;

const FeatureSection = styled.section<{ $alt?: boolean }>`
  background-color: ${({ theme, $alt }) =>
    $alt ? theme.background.primary : theme.background.secondary};
`;

const FeatureInner = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(20px, 3vw, 40px);
  align-items: center;
  max-width: 960px;
  margin: 0 auto;
  padding: clamp(28px, 4vw, 48px) 24px;

  ${MOBILE} {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 28px 20px;
  }
`;

const FeatureCopy = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const FeatureLabel = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 8px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.muted};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.accent};
  }
`;

const FeatureTitle = styled.h2`
  margin: 0 0 10px;
  font-size: clamp(1.375rem, 2.5vw, 1.75rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.text.primary};

  em {
    font-style: normal;
    color: ${({ theme }) => theme.accent};
  }
`;

const FeatureText = styled.p`
  margin: 0;
  max-width: 42ch;
  font-size: 0.875rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.secondary};

  ${MOBILE} {
    max-width: none;
  }
`;

const FeatureVisual = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;

  ${MOBILE} {
    justify-content: flex-start;
  }

  img {
    display: block;
    width: 100%;
    max-width: 280px;
    height: auto;
    border-radius: 8px;
  }
`;

const SectionBand = styled.section`
  background-color: ${({ theme }) => theme.background.secondary};
`;

const SectionInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(48px, 7vw, 80px) 24px;

  ${MOBILE} {
    padding: 40px 20px;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 32px;
  font-size: clamp(1.375rem, 2.5vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: ${({ theme }) => theme.text.primary};
`;

const ModeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;

  ${MOBILE} {
    grid-template-columns: 1fr;
  }
`;

const ModeCard = styled.article`
  display: flex;
  flex-direction: column;
  padding: clamp(24px, 3vw, 32px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.card.background};
`;

const ModeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;

  svg {
    width: 22px;
    height: 22px;
    color: ${({ theme }) => theme.accent};
  }
`;

const ModeTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
`;

const ModeText = styled.p`
  margin: 0 0 18px;
  flex: 1;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.text.secondary};
`;

const ModeLink = styled.span`
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

const ExtrasPanel = styled.div`
  margin-top: clamp(32px, 4vw, 48px);
  padding: clamp(28px, 4vw, 36px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.card.background};
`;

const ExtrasHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;

  svg {
    width: 22px;
    height: 22px;
    color: ${({ theme }) => theme.accent};
  }

  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
  }
`;

const InfoList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 28px;

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

const DeviceSection = styled.section`
  background-color: ${({ theme }) => theme.background.primary};
`;

const DeviceInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 640px;
  margin: 0 auto;
  padding: clamp(48px, 7vw, 80px) 24px;
  text-align: center;

  ${MOBILE} {
    padding: 40px 20px;
  }
`;

const DeviceTitle = styled.h2`
  margin: 0 0 14px;
  font-size: clamp(1.375rem, 2.5vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const DeviceText = styled.p`
  margin: 0 0 28px;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.text.secondary};
`;

const DeviceIcons = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
`;

const DeviceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
  background-color: ${({ theme }) => theme.card.background};

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.accent};
  }
`;

const BoardToolsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17L17 7" />
    <path d="M7 7l3 3" />
    <path d="M7 7l-3 3" />
    <path d="M17 17l-3-3" />
    <path d="M17 17l3-3" />
  </svg>
);

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

const DesktopIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
);

const TabletIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M12 18h.01" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M12 18h.01" />
  </svg>
);

const FEATURES = [
  {
    label: "Puzzle mode",
    icon: <HintIcon />,
    title: (
      <>
        <em>Hints</em> that nudge, not spoil
      </>
    ),
    text: "Each daily puzzle plays out move by move. When you need help, request a hint to see the next square pair, legal move dots, and capture rings — plus a lightbulb badge on the source square. Wrong tries are marked in red so you can adjust quickly, and confetti celebrates the winning move.",
    image: moveHintsImg,
    alt: "Chess board showing move hints with highlighted squares, move dots, and a lightbulb hint badge",
  },
  {
    label: "Board tools",
    icon: <BoardToolsIcon />,
    title: (
      <>
        Annotate positions with <em>arrows</em>
      </>
    ),
    text: "Right-click and drag between squares to draw arrows in yellow, green, blue, or red. Use them while solving to trace candidate lines, or in Sandbox to walk through an opening plan. Arrows clear when the position changes so the board stays readable.",
    image: boardAnnotationsImg,
    alt: "Chess board with colored annotation arrows showing tactical lines toward the king",
  },
  {
    label: "Sandbox",
    icon: <FreeroamIcon />,
    title: (
      <>
        A <em>board</em> for your own lines
      </>
    ),
    text: "Sandbox drops the puzzle rules and gives you a full chess board from the starting position. Move either side, step through move history, track captures, and reset anytime. It's the same polished board — themes, sounds, drag-and-drop — without a clock or scoreboard.",
    image: londonSystemImg,
    alt: "Chess board in a London System setup with yellow arrows showing typical development moves",
  },
  {
    label: "Openings",
    icon: <FreeroamIcon />,
    title: (
      <>
        Walk through <em>opening</em> ideas
      </>
    ),
    text: "Use Sandbox to set up any opening and mark the plans with arrows. Trace knight development, pawn breaks, and pressure on the center — whether you're studying the Sicilian, the London, or your own repertoire. Annotations stay on the board until you move or reset.",
    image: sicilianDefenseImg,
    alt: "Sicilian Defense position after 1.e4 c5 with red arrows showing typical knight development and pressure on the e4 pawn",
  },
];

const About = () => {
  const todayDate = formatDateForUrl(getToday());

  return (
    <Page>
      <Hero>
        <HeroInner>
          <HeroCopy>
            <HeroTitle>
              Daily puzzles &amp; a free board for <em>chess practice</em>
            </HeroTitle>
            <HeroLead>
              Solve Chess.com tactics by date, use hints when you&apos;re stuck,
              or open Sandbox to explore lines — no account required.
            </HeroLead>
            <HeroActions>
              <PrimaryButton>
                <Link to="/$date" params={{ date: todayDate }}>
                  <CalendarIcon />
                  Today&apos;s puzzle
                </Link>
              </PrimaryButton>
              <SecondaryButton>
                <Link to="/freeroam">
                  <FreeroamIcon />
                  Open Sandbox
                </Link>
              </SecondaryButton>
            </HeroActions>
          </HeroCopy>
          <HeroVisual>
            <img src={aboutBannerImg} alt="Chess puzzle board with hints and annotations" />
          </HeroVisual>
        </HeroInner>
      </Hero>

      {FEATURES.map((feature, index) => (
        <FeatureSection key={feature.label} $alt={index % 2 === 1}>
          <FeatureInner>
            <FeatureCopy>
              <FeatureLabel>
                {feature.icon}
                {feature.label}
              </FeatureLabel>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureText>{feature.text}</FeatureText>
            </FeatureCopy>
            <FeatureVisual>
              <img src={feature.image} alt={feature.alt} />
            </FeatureVisual>
          </FeatureInner>
        </FeatureSection>
      ))}

      <SectionBand>
        <SectionInner>
          <SectionTitle>Two ways to play</SectionTitle>
          <ModeGrid>
            <ModeCard>
              <ModeHeader>
                <CalendarIcon />
                <ModeTitle>Daily Puzzles</ModeTitle>
              </ModeHeader>
              <ModeText>
                Browse puzzles by date with the calendar sidebar. Each day loads
                the official daily puzzle — work through the solution line, use
                hints when you need them, and share or revisit any date via its
                URL.
              </ModeText>
              <ModeLink>
                <Link to="/$date" params={{ date: todayDate }}>
                  Play today&apos;s puzzle
                  <ArrowIcon />
                </Link>
              </ModeLink>
            </ModeCard>

            <ModeCard>
              <ModeHeader>
                <FreeroamIcon />
                <ModeTitle>Sandbox</ModeTitle>
              </ModeHeader>
              <ModeText>
                A full chess board with no puzzle rules. Move either side from the
                starting position, annotate with arrows, track captured pieces,
                and reset anytime. Perfect for trying ideas at your own pace.
              </ModeText>
              <ModeLink>
                <Link to="/freeroam">
                  Open Sandbox
                  <ArrowIcon />
                </Link>
              </ModeLink>
            </ModeCard>
          </ModeGrid>

          <ExtrasPanel>
            <ExtrasHeader>
              <PuzzleInfoIcon />
              <h3>Everything else</h3>
            </ExtrasHeader>
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
          </ExtrasPanel>
        </SectionInner>
      </SectionBand>

      <DeviceSection>
        <DeviceInner>
          <DeviceTitle>Play on any device</DeviceTitle>
          <DeviceText>
            The board adapts to your screen — solve puzzles on desktop, review
            lines on a tablet, or grab a quick tactic on your phone.
          </DeviceText>
          <DeviceIcons>
            <DeviceBadge>
              <DesktopIcon />
              Desktop
            </DeviceBadge>
            <DeviceBadge>
              <TabletIcon />
              Tablet
            </DeviceBadge>
            <DeviceBadge>
              <PhoneIcon />
              Mobile
            </DeviceBadge>
          </DeviceIcons>
        </DeviceInner>
      </DeviceSection>
    </Page>
  );
};

export default About;
