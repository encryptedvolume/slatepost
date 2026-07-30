import { SentryComponent } from '@gitroom/frontend/components/layout/sentry.component';

export const dynamic = 'force-dynamic';
import '../global.scss';
import 'react-tooltip/dist/react-tooltip.css';
import LayoutContext from '@gitroom/frontend/components/layout/layout.context';
import { ReactNode } from 'react';
import clsx from 'clsx';
import { VariableContextComponent } from '@gitroom/react/helpers/variable.context';
import { cookies } from 'next/headers';
import {
  cookieName,
  fallbackLng,
} from '@gitroom/react/translation/i18n.config';
import { HtmlComponent } from '@gitroom/frontend/components/layout/html.component';
import { ChangeDirClient } from '@gitroom/frontend/components/new-layout/change.dir.client';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const language = cookieStore.get(cookieName)?.value || fallbackLng;
  // Theme is resolved server-side from the same `mode` cookie the toggle
  // writes, so light-mode users never get a dark first paint.
  const mode = cookieStore.get('mode')?.value === 'light' ? 'light' : 'dark';
  return (
    // `color-scheme` has to be on <html>, not on the themed <body>: it is what
    // paints the UA's own chrome — the macOS rubber-band gutter, native
    // scrollbars, date and select popups, form control defaults. Without it a
    // dark page sat in a light gutter with light native popups. `theme-color`
    // matches --slate-canvas so the mobile browser bar is the same surface.
    <html
      lang={language}
      style={{ colorScheme: mode === 'light' ? 'light' : 'dark' }}
    >
      <head>
        <meta
          name="theme-color"
          content={mode === 'light' ? '#fafafa' : '#0f0f0f'}
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/app-icon-1024.png" />
      </head>
      <ChangeDirClient />
      {/* Slate ships the system UI stack at three weights (400/500/600) and
          never italic — no webfont, no extra network round-trip. */}
      <body className={clsx(mode, 'text-ink !bg-canvas')}>
        <VariableContextComponent
          storageProvider={
            process.env.STORAGE_PROVIDER! as 'local' | 'cloudflare'
          }
          environment={process.env.NODE_ENV!}
          backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL!}
          plontoKey={process.env.NEXT_PUBLIC_POLOTNO!}
          /* The Stripe publishable key used to be published here as
             `stripeClient`, which put it on `window.vars` in every browser that
             loaded the app. Its only reader was the embedded checkout form,
             and that is gone with the rest of billing. */
          billingEnabled={!!process.env.STRIPE_PUBLISHABLE_KEY}
          frontEndUrl={process.env.FRONTEND_URL!}
          isGeneral={!!process.env.IS_GENERAL}
          genericOauth={!!process.env.POSTIZ_GENERIC_OAUTH}
          oauthLogoUrl={process.env.NEXT_PUBLIC_POSTIZ_OAUTH_LOGO_URL!}
          oauthDisplayName={process.env.NEXT_PUBLIC_POSTIZ_OAUTH_DISPLAY_NAME!}
          uploadDirectory={process.env.NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY!}
          cloudflareUrl={process.env.CLOUDFLARE_BUCKET_URL || ''}
          mainUrl={process.env.MAIN_URL || ''}
          mcpUrl={process.env.MCP_URL}
          telegramBotName={process.env.TELEGRAM_BOT_NAME!}
          neynarClientId={process.env.NEYNAR_CLIENT_ID!}
          isSecured={!process.env.NOT_SECURED}
          disableImageCompression={!!process.env.DISABLE_IMAGE_COMPRESSION}
          disableXAnalytics={!!process.env.DISABLE_X_ANALYTICS}
          sentryDsn={process.env.NEXT_PUBLIC_SENTRY_DSN!}
          extensionId={process.env.EXTENSION_ID || ''}
          language={language}
          transloadit={
            process.env.TRANSLOADIT_AUTH && process.env.TRANSLOADIT_TEMPLATE
              ? [
                  process.env.TRANSLOADIT_AUTH!,
                  process.env.TRANSLOADIT_TEMPLATE!,
                ]
              : []
          }
        >
          {/* Sentry is the only third party the app is allowed to talk to for
              its own sake, it is error monitoring only, and with no DSN set it
              makes no network call at all. Nothing else is loaded here: no
              product analytics, no pixels, no tag manager, no session
              recording of a marketing kind. The Privacy Policy says so. */}
          <SentryComponent>
            {/*<SetTimezone />*/}
            <HtmlComponent />
            <LayoutContext>{children}</LayoutContext>
          </SentryComponent>
        </VariableContextComponent>
      </body>
    </html>
  );
}
