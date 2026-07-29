'use client';

/**
 * Slate mark — monochrome, currentColor, no accent.
 *
 * One mark ships. This is the same stepped-ribbon geometry as public/logo.svg,
 * public/favicon.svg, public/logo-text.svg and public/app-icon-1024.svg, so the
 * nav rail, the browser tab and the app icon are finally the same brand. Every
 * coordinate is a multiple of 4 on a 32 grid and the path has exact 180-degree
 * rotational symmetry about (16,16).
 *
 * It is a filled path, not a stroked rounded rect: `rx="4.25"` was not one of
 * the five permitted radii, and the accent budget forbids Signal Amber on
 * logos, so the mark is pure ink and inherits the surrounding text colour in
 * both themes.
 *
 * Size has to keep the 32 grid on whole pixels or the grid is pointless: only
 * 32 / 24 / 16 do. At 20 the scale is 0.625 and the coordinates 12 and 20 land
 * on 7.5px and 12.5px, which rendered ten half-covered pixels along the steps.
 * 24 is the shipped size and renders zero antialiased pixels.
 */
export const LogoMark = ({ size = 24 }: { size?: number }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path d="M0,0H16V12H24V24H32V32H16V20H8V8H0Z" fill="currentColor" />
    </svg>
  );
};

/**
 * The drawn wordmark, lifted verbatim out of public/logo-text.svg.
 *
 * The viewBox starts at x=32 — the mark's right edge — so it carries the
 * lockup's own 12.415 clearance and the two SVGs butt together with no gap and
 * reproduce the master drawing exactly. Nothing here is re-derived: change a
 * coordinate in public/logo-text.svg and change it here too, or the master and
 * the shipped lockup drift apart, which is how three lockups happened in the
 * first place.
 *
 * The master's `@media (prefers-color-scheme)` block is deliberately not
 * carried over. The product's theme comes from the `mode` cookie, not from the
 * OS, so an OS query would put a light wordmark on a light header for anyone
 * who has chosen light on a dark machine. Here the paths take `currentColor`
 * and inherit the lockup's `text-ink` like every other glyph in the product.
 */
const Wordmark = ({ height = 24 }: { height?: number }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      width={(height * 76.35) / 32}
      viewBox="32 0 76.35 32"
      fill="none"
      aria-hidden="true"
    >
      <g fill="currentColor">
        {/* S */}
        <path d="M54.705,9.135A4.065,4.065 0 1 0 50.885,14.590A6.885,6.885 0 1 1 44.415,23.830L47.065,22.865A4.065,4.065 0 1 0 50.885,17.410A6.885,6.885 0 1 1 57.355,8.170Z" />
        {/* l */}
        <path d="M63.470,4.000L63.470,28.000L60.650,28.000L60.650,4.000Z" />
        {/* a : arch + stem */}
        <path d="M66.254,16.404A6.570,6.570 0 0 1 72.680,11.200L74.420,11.200A6.570,6.570 0 0 1 80.990,17.770L80.990,28.000L78.170,28.000L78.170,17.770A3.750,3.750 0 0 0 74.420,14.020L72.680,14.020A3.750,3.750 0 0 0 69.012,16.990Z" />
        {/* a : bowl — a flat-bottomed stadium, so it sits on the baseline at
            28.000 with the 'l' and the 't' and takes no round-letter
            overshoot. At 28.300 it left a 1.410 x 0.300 ledge protruding
            below the stem at the union's bottom-right. */}
        <path d="M79.580,19.220L71.910,19.220A2.980,2.980 0 0 0 71.910,25.180L79.580,25.180L79.580,28.000L71.910,28.000A5.800,5.800 0 0 1 71.910,16.400L79.580,16.400Z" />
        {/* t : stem + tail */}
        <path d="M87.560,6.880L87.560,22.990A2.190,2.190 0 0 0 89.750,25.180L89.750,28.000A5.010,5.010 0 0 1 84.740,22.990L84.740,6.880Z" />
        {/* t : crossbar */}
        <path d="M82.300,11.200L91.310,11.200L91.310,14.020L82.300,14.020Z" />
        {/* e : ring */}
        <path d="M105.530,20.170L105.530,17.350A3.630,3.630 0 0 0 101.900,13.720L99.920,13.720A3.630,3.630 0 0 0 96.290,17.350L96.290,21.850A3.630,3.630 0 0 0 99.920,25.480L101.900,25.480A3.630,3.630 0 0 0 103.824,24.928L105.318,27.320A6.450,6.450 0 0 1 101.900,28.300L99.920,28.300A6.450,6.450 0 0 1 93.470,21.850L93.470,17.350A6.450,6.450 0 0 1 99.920,10.900L101.900,10.900A6.450,6.450 0 0 1 108.350,17.350L108.350,20.170Z" />
        {/* e : crossbar */}
        <path d="M94.880,17.350L106.940,17.350L106.940,20.170L94.880,20.170Z" />
      </g>
    </svg>
  );
};

/**
 * The lockup. One drawing, everywhere the brand is signed: the app shell, the
 * auth and billing screens, the OAuth consent and public preview pages, and
 * the legal pages.
 *
 * Three of these used to ship — mark + t-title-3, mark + t-title-2, and bare
 * text with no mark at all on the legal pages, which is the surface app review
 * actually looks at. Now there is one, and it is the drawn master in
 * public/logo-text.svg rather than a type-set approximation of it: mark at 24,
 * wordmark cap height at 3/4 of the mark, the master's own clearance between
 * the two. The .svg is the same drawing for contexts with no DOM, and it had
 * no call site at all until this component started rendering it.
 *
 * The whole lockup is one `role="img"` with one accessible name, so a screen
 * reader announces "Slate" once instead of reading two graphics.
 */
export const Logo = () => {
  return (
    <div
      role="img"
      aria-label="Slate"
      className="flex items-center text-ink select-none"
    >
      <LogoMark size={24} />
      <Wordmark height={24} />
    </div>
  );
};
