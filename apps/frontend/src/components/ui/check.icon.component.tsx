/**
 * Check glyph — 20px on the 20 grid, 1.5px monochrome stroke, currentColor.
 *
 * Neon green (#00FF00) was not a palette step at any level and computed 1.31:1
 * on the light canvas. The colour now comes from the wrapper, so marketing
 * bullets can sit on `text-inkSecondary` and functional confirmations on
 * `text-success` without the glyph carrying a hue of its own.
 */
export const CheckIconComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10.5L8 14.5L16 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
