export function BrandMark({ monogram }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      {monogram ? (
        <span className="brand-mark__text">{monogram}</span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1.4L13.6 8L8 14.6L2.4 8L8 1.4Z"
            fill="#020304"
            stroke="#C8DCD8"
            strokeOpacity="0.52"
            strokeWidth="0.9"
          />
          <circle cx="6.45" cy="7.9" r="0.85" fill="#F2F7F6" />
          <circle cx="9.55" cy="7.9" r="0.85" fill="#F2F7F6" />
        </svg>
      )}
    </span>
  );
}
