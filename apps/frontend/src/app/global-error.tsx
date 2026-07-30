'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { useVariables } from '@gitroom/react/helpers/variable.context';

/**
 * The last-resort error screen. It replaces the root layout, so it gets no
 * theme class, no design tokens and no fonts — which makes it the only screen
 * in the product allowed literal colours and inline styles. The values are the
 * two ends of the neutral ramp (`--n50` / `--n950`) and are switched by
 * `prefers-color-scheme`, since the class the `mode` cookie sets is not applied
 * this far out.
 *
 * It used to render Next's built-in error page, which says "Application error:
 * a client-side exception has occurred" over a bare status code. This says what
 * happened in plain words and offers the one action that clears almost every
 * occurrence. The exception goes to Sentry and to the console; a stack, a digest
 * and a status code are diagnostics, and diagnostics are never the message.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const { sentryDsn } = useVariables();

  useEffect(() => {
    // The console is the floor: whatever happens with Sentry, the operator of a
    // self-hosted install can still read what broke.
    // eslint-disable-next-line no-console
    console.error(error);

    if (!sentryDsn) {
      return;
    }
    // Capture only. No user-feedback dialog: this is a single-operator app,
    // there is nobody on the other end of a "send report" form, and the
    // dialog asked the one user for their name and email to tell them
    // something they already know.
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#fafafa',
          color: '#0f0f0f',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <style>{`
          @media (prefers-color-scheme: dark) {
            body { background: #0f0f0f !important; color: #fafafa !important; }
            #global-error-body { color: #a1a1a1 !important; }
            #global-error-reload {
              background: #fafafa !important;
              color: #0f0f0f !important;
            }
          }
        `}</style>
        <div style={{ maxWidth: '420px', textAlign: 'center' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '22px',
              lineHeight: '28px',
              letterSpacing: '-0.016em',
              fontWeight: 600,
            }}
          >
            Slate stopped loading
          </h1>
          <p
            id="global-error-body"
            style={{
              margin: '4px 0 16px',
              fontSize: '13px',
              lineHeight: '18px',
              color: '#525252',
            }}
          >
            Something failed before the page could finish loading. Nothing you
            have scheduled is affected — loading the page again usually clears
            it.
          </p>
          <button
            id="global-error-reload"
            type="button"
            onClick={() => window.location.reload()}
            style={{
              height: '36px',
              padding: '0 16px',
              borderRadius: '10px',
              border: 0,
              cursor: 'pointer',
              background: '#0f0f0f',
              color: '#ffffff',
              fontSize: '14px',
              lineHeight: '20px',
              fontWeight: 500,
              letterSpacing: '-0.004em',
            }}
          >
            Reload the page
          </button>
        </div>
      </body>
    </html>
  );
}
