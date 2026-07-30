import * as Sentry from '@sentry/nestjs';
import { capitalize } from 'lodash';

// Error monitoring only, and only when the operator sets a DSN — the same
// contract the browser side keeps.
//
// What used to be here: `tracesSampleRate: 1.0`, so every request became a
// transaction sent to Sentry, and CPU profiling of the process at a 0.45
// session sample rate in production. That is performance telemetry about a
// server that schedules posts for one person, and the Privacy Policy names
// Sentry for error reports. Exceptions and warn/error console lines are what
// leave the process now; nothing describes what the operator was doing.
export const initializeSentry = (appName: string, allowLogs = false) => {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return null;
  }

  try {
    Sentry.init({
      initialScope: {
        tags: {
          service: appName,
          component: 'nestjs',
        },
        contexts: {
          app: {
            name: `Slate ${capitalize(appName)}`,
          },
        },
      },
      environment: process.env.NODE_ENV || 'development',
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      spotlight: process.env.SENTRY_SPOTLIGHT === '1',
      integrations: [
        // Warnings and errors only. The old levels list shipped every log,
        // info, debug and trace line to Sentry, and what this backend logs is
        // post bodies, media paths and TikTok API responses. The OpenAI
        // integration that followed it recorded prompt inputs and outputs
        // verbatim.
        Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
      ],
      // No IP addresses, cookies or request bodies attached to events, and no
      // `tracesSampleRate`, which leaves performance tracing off.
      sendDefaultPii: false,
      enableLogs: allowLogs,
    });
  } catch (err) {
    console.log(err);
  }
  return true;
};
