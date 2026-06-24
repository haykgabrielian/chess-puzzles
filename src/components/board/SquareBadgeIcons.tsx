type BadgeIconProps = {
  className?: string;
};

export const HintBadgeIcon = ({ className }: BadgeIconProps) => (
  <svg
    className={className}
    viewBox="0 0 50 50"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M 25 3 C 16.730469 3 10 9.730469 10 18 C 10 24.167969 12.785156 27.140625 14.8125 29.3125 C 16.089844 30.683594 17 31.667969 17 33 L 17 38 L 24 38 L 24 23.40625 L 20.28125 19.71875 C 19.890625 19.328125 19.890625 18.671875 20.28125 18.28125 C 20.671875 17.890625 21.328125 17.890625 21.71875 18.28125 L 25 21.59375 L 28.28125 18.28125 C 28.671875 17.890625 29.328125 17.890625 29.71875 18.28125 C 30.109375 18.671875 30.109375 19.328125 29.71875 19.71875 L 26 23.40625 L 26 38 L 33 38 L 33 33 C 33 31.085938 34.105469 29.925781 35.5 28.46875 C 37.507813 26.371094 40 23.773438 40 18 C 40 9.730469 33.269531 3 25 3 Z M 17 40 L 17 43 C 17 44.652344 18.347656 46 20 46 L 21.15625 46 C 21.601563 47.722656 23.140625 49 25 49 C 26.859375 49 28.398438 47.722656 28.84375 46 L 30 46 C 31.652344 46 33 44.652344 33 43 L 33 40 Z" />
  </svg>
);

export const WrongBadgeIcon = ({ className }: BadgeIconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M7 7l10 10" />
    <path d="M17 7 7 17" />
  </svg>
);

export const SolvedBadgeIcon = ({ className }: BadgeIconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6.5 12.5 10 16 17.5 8.5" />
  </svg>
);

export const CheckmateBadgeIcon = ({ className }: BadgeIconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <g transform="rotate(-90 12 12)">
      <g transform="translate(12 12) scale(0.46) translate(-22.5 -22.5)">
        <path d="M 22.5,11.63 L 22.5,6" fill="none" />
        <path d="M 20,8 L 25,8" fill="none" />
        <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
        <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" />
      </g>
    </g>
  </svg>
);
