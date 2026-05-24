const activityIcons = {
  call: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <path
        d="M3 2h3l1.5 3.5-2 1.2A9 9 0 0 0 9.3 10.5l1.2-2L14 10v3a1 1 0 0 1-1 1C6.3 14 2 9.7 2 3a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect
        x="1"
        y="3"
        width="14"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  meeting: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect
        x="2"
        y="3"
        width="12"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M5 2v2M11 2v2M2 7h12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  note: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect
        x="2"
        y="1"
        width="12"
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M5 5h6M5 8h6M5 11h4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export { activityIcons };
