import { ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { legal } from './legal.config';
import { ActiveMarker } from '@gitroom/frontend/components/ui/active.marker';
import { Logo } from '@gitroom/frontend/components/new-layout/logo';

/*
 * Public legal document surface.
 *
 * These pages are unauthenticated and must render with no session, no app
 * shell and no data fetching: TikTok's app review verifies that the Terms of
 * Service and Privacy Policy URLs are live, and the AGPL-3.0 source offer has
 * to be reachable by anyone interacting with the service over the network,
 * not only by signed-in users.
 *
 * Everything below uses the Slate tokens from colors.scss / tailwind.config.cjs
 * and the .t-* type scale from global.scss. Signal Amber appears exactly once
 * per page — the 2px x 16px active-document marker in the nav rail. The focus
 * ring (the other sanctioned use here) comes from the global base layer.
 */

export interface LegalTocEntry {
  id: string;
  label: string;
}

const documents = [
  { key: 'terms', href: '/terms', label: 'Terms of Service' },
  { key: 'privacy', href: '/privacy', label: 'Privacy Policy' },
] as const;

export type LegalDocumentKey = (typeof documents)[number]['key'];

/* -------------------------------------------------------------- primitives */

export const P = ({ children }: { children: ReactNode }) => (
  <p className="t-body measure text-inkSecondary mb-[16px] last:mb-0">
    {children}
  </p>
);

export const Lead = ({ children }: { children: ReactNode }) => (
  <span className="t-body-emphasis text-ink">{children}</span>
);

export const Bullets = ({ children }: { children: ReactNode }) => (
  <ul className="measure flex flex-col gap-[12px] mb-[16px] last:mb-0">
    {children}
  </ul>
);

export const Bullet = ({ children }: { children: ReactNode }) => (
  <li className="relative t-body text-inkSecondary ps-[24px]">
    <span
      aria-hidden="true"
      className="absolute start-0 top-[12px] w-[8px] h-[1px] bg-lineStrong"
    />
    {children}
  </li>
);

export const Code = ({ children }: { children: ReactNode }) => (
  <span className="t-numeric text-ink">{children}</span>
);

/*
 * Links in running text are ink with an underline. Signal Amber is a status
 * colour and is explicitly forbidden on links.
 *
 * The underline — not the colour shift — is what identifies the link. Ink on
 * inkSecondary body copy differentiates by only ~2.4:1, which SC 1.4.1 does
 * not accept on its own, so the rule is drawn in inkTertiary (>= 4.5:1 on
 * surface) rather than lineStrong (2.52:1). decoration-* is not a hairline.
 */
const linkClass =
  'text-ink underline decoration-inkTertiary underline-offset-[3px] decoration-1 hover:decoration-ink transition-colors duration-state ease-state';

export const A = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  if (/^mailto:/i.test(href)) {
    return (
      <a href={href} className={linkClass}>
        {children}
      </a>
    );
  }

  if (/^https?:/i.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={linkClass}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
};

/** Cards are 14-radius, 1px-bordered, 20px-padded and shadowless. Forever. */
export const Note = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="bg-surface border border-line rounded-card p-[20px] mb-[16px] last:mb-0 flex flex-col gap-[12px]">
    <p className="t-body-emphasis text-ink">{title}</p>
    {children}
  </div>
);

export const DataTable = ({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: ReactNode[][];
}) => (
  /* The document column caps at the 34rem measure. A table is not running
     text, so it is the one block allowed to opt out: it runs full-bleed to
     the old 720 column with a logical end margin, which flips under RTL.

     Gated at xl, not lg. At lg the grid track is 100vw - 48 (page gutters)
     - 240 (rail) - 64 (gap), main is capped at 544 and starts at x=328, so
     a -176 bleed puts the right edge at 1048 — 24px past a 1024 viewport
     and past the gutter on anything under 1072. Below xl the table simply
     scrolls inside its own overflow-x container, which is what that
     container is for. */
  <div className="overflow-x-auto border border-line mb-[16px] last:mb-0 me-[-176px] tablet:me-0">
    <table className="w-full min-w-[560px] border-collapse">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {head.map((cell) => (
            <th
              key={cell}
              scope="col"
              className="h-large t-overline text-inkSecondary text-start whitespace-nowrap bg-surfaceSunken border-b border-line px-[16px] py-0 align-middle"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className="h-large border-b border-hairline last:border-b-0"
          >
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className={clsx(
                  't-secondary align-middle px-[16px] py-[12px]',
                  cellIndex === 0 ? 'text-ink' : 'text-inkSecondary'
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) => (
  <section id={id} className="pt-[48px] scroll-mt-[32px]">
    <h2 className="t-title-2 text-ink mb-[16px]">{title}</h2>
    {children}
  </section>
);

/* -------------------------------------------------------------------- shell */

export const LegalShell = ({
  current,
  title,
  lede,
  updated,
  updatedLabel,
  toc,
  children,
}: {
  current: LegalDocumentKey;
  title: string;
  lede: string;
  /** ISO date for the <time> element. */
  updated: string;
  /** Human-readable date. */
  updatedLabel: string;
  toc: LegalTocEntry[];
  children: ReactNode;
}) => {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#document"
        className="sr-only focus:not-sr-only focus:absolute focus:top-[12px] focus:start-0 focus:ms-[12px] focus:z-10 focus:bg-surface focus:text-ink focus:border focus:border-line focus:rounded-control focus:px-[16px] focus:py-[8px] t-control"
      >
        Skip to document
      </a>

      <header className="border-b border-hairline">
        <div className="max-w-[1280px] mx-auto px-[24px] h-[64px] flex items-center justify-between gap-[24px]">
          <Link
            href="/"
            className="flex items-center gap-[12px] no-underline text-ink"
          >
            <Logo />
            <span className="t-secondary text-inkTertiary inline phone:hidden">
              One channel. Every post on time.
            </span>
          </Link>
          <Link
            href="/"
            className="t-control text-inkSecondary hover:text-ink hover:bg-surfaceHover rounded-control px-[12px] py-[8px] transition-colors duration-state ease-state"
          >
            Back to Slate
          </Link>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-[24px] pt-[48px] pb-[96px] grid grid-cols-[240px_minmax(0,1fr)] gap-[64px] mobile:grid-cols-1 mobile:gap-[48px] items-start">
        {/* Sticky rails need a ceiling: without one the tail of an 18-entry
            TOC is clipped and unreachable on any viewport under ~1000px tall. */}
        <aside className="sticky top-[48px] max-h-[calc(100vh-96px)] overflow-y-auto mobile:static mobile:top-auto mobile:max-h-none mobile:overflow-visible flex flex-col gap-[32px]">
          <nav
            aria-label="Legal documents"
            className="flex flex-col gap-[12px]"
          >
            <p className="t-overline text-inkSecondary ps-[24px]">Documents</p>
            <ul className="flex flex-col">
              {documents.map((doc) => {
                const isCurrent = doc.key === current;
                return (
                  <li key={doc.key} className="relative">
                    {/* Sanctioned accent use: the 2px x 16px active nav marker. */}
                    {isCurrent && (
                      <ActiveMarker />
                    )}
                    <Link
                      href={doc.href}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={clsx(
                        't-control flex items-center min-h-large rounded-control ps-[24px] pe-[12px] py-[8px] transition-colors duration-state ease-state',
                        isCurrent
                          ? 'text-ink bg-surfaceActive'
                          : 'text-inkSecondary hover:text-ink hover:bg-surfaceHover'
                      )}
                    >
                      {doc.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Below lg the grid is one column and the aside comes first, so a
              phone would meet ~950px of in-page anchors before the <h1>. The
              document nav (two entries) stays; the TOC does not. */}
          <nav
            aria-label="On this page"
            className="flex mobile:hidden flex-col gap-[12px]"
          >
            <p className="t-overline text-inkSecondary ps-[24px]">
              On this page
            </p>
            <ul className="flex flex-col">
              {toc.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="t-secondary flex items-center min-h-large text-inkSecondary hover:text-ink hover:bg-surfaceHover rounded-control ps-[24px] pe-[12px] py-[8px] transition-colors duration-state ease-state"
                  >
                    {entry.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main id="document" className="min-w-0 max-w-[34rem]">
          <div className="flex flex-col gap-[16px] pb-[32px] border-b border-hairline">
            <h1 className="t-title-1 text-ink">{title}</h1>
            <p className="t-body measure text-inkSecondary">{lede}</p>
            <p className="t-secondary text-inkTertiary">
              Last updated <time dateTime={updated}>{updatedLabel}</time>
            </p>
          </div>
          {children}
        </main>
      </div>

      <footer className="border-t border-hairline">
        <div className="max-w-[1280px] mx-auto px-[24px] pt-[32px] pb-[48px] flex flex-col gap-[24px]">
          <nav
            aria-label="Legal"
            className="flex flex-wrap gap-x-[24px] gap-y-[12px]"
          >
            {documents.map((doc) => (
              <Link
                key={doc.key}
                href={doc.href}
                className="t-control text-inkSecondary hover:text-ink transition-colors duration-state ease-state"
              >
                {doc.label}
              </Link>
            ))}
            <Link
              href="/"
              className="t-control text-inkSecondary hover:text-ink transition-colors duration-state ease-state"
            >
              Slate
            </Link>
          </nav>

          {/*
            AGPL-3.0 section 13: anyone interacting with this service over a
            network must be offered the Corresponding Source of the running
            version, free of charge and without signing in. This footer is that
            offer, and it renders on public pages by design.
          */}
          <p className="t-secondary measure text-inkTertiary">
            Slate is free software licensed under the{' '}
            <a
              href="https://www.gnu.org/licenses/agpl-3.0.en.html"
              rel="noreferrer noopener"
              target="_blank"
              className="text-inkSecondary hover:text-ink underline decoration-inkTertiary underline-offset-[3px] transition-colors duration-state ease-state"
            >
              GNU Affero General Public License v3.0
            </a>
            . It is a modified version of Postiz, Copyright &copy; 2025 Nevo
            David. The complete Corresponding Source for the revision running on
            this site, including our modifications, is published at{' '}
            <A href={legal.sourceRepoUrl}>{legal.sourceRepoUrl}</A>. Slate is
            not affiliated with, endorsed by, or sponsored by Postiz or Nevo
            David.
          </p>

          <p className="t-secondary text-inkTertiary">
            &copy; 2026 {legal.entityName}
          </p>
        </div>
      </footer>
    </div>
  );
};
