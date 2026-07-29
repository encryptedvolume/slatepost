/**
 * The 2px x 16px active marker — the single most repeated use of Signal Amber
 * and the one that has to be identical everywhere it appears.
 *
 * Square ends, no radius: the mark's geometry is radius-0 and a 2px-wide pill
 * is a 1px cap on each end, which reads as a rendering artefact rather than a
 * decision. It was drawn six different ways (one `rounded-pill`, five without,
 * two different spellings of the vertical centring); this is the only drawing.
 *
 * Bound to selection or current-page state, never to :hover. The parent must
 * be `relative`.
 */
export const ActiveMarker = () => (
  <span
    aria-hidden="true"
    className="absolute start-0 top-1/2 -translate-y-1/2 w-[2px] h-[16px] bg-accent"
  />
);
