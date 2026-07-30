import { initializeSentryBasic } from '@gitroom/react/sentry/initialize.sentry.next.basic';

// Error monitoring only, and only when the operator sets a DSN.
//
// What used to be here: session replay at a 1.0 sample rate with
// `maskAllText: false`, canvas replay, browser tracing, browser profiling and
// the user-feedback widget. That is a recording of the operator's own screen —
// post drafts, media, the connected TikTok account — shipped to a third party
// on every session, plus a page-view beacon on every navigation. Slate
// schedules posts for one person and nobody was ever going to watch the tape.
// The browser sends exceptions and nothing else.
export const initializeSentryClient = (environment: string, dsn: string) =>
  initializeSentryBasic(environment, dsn, {});
