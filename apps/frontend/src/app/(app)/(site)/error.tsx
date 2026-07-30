'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { ErrorState } from '@gitroom/frontend/components/ui/state.notice';

/**
 * Error boundary for the signed-in screens — calendar, media, settings.
 *
 * Without it, a throw anywhere in those trees fell through to `global-error`,
 * which discards the whole shell for a page that says "Application error".
 * Here the nav survives, so the user is still somewhere: they can retry the
 * segment (`reset` re-renders it without a full reload) or walk back to the
 * calendar, which is the one screen this product is about.
 *
 * `error.message` and `error.digest` are deliberately not rendered. In
 * production Next replaces the message with a digest anyway, so showing it
 * would put a hash in front of the user in place of a sentence.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  const { sentryDsn } = useVariables();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
    if (!sentryDsn) {
      return;
    }
    Sentry.captureException(error);
  }, [error, sentryDsn]);

  return (
    <div className="bg-canvas flex flex-1 items-center justify-center p-[24px]">
      <ErrorState
        title={t('screen_failed_title', 'This screen did not load')}
        body={t(
          'screen_failed_body',
          'Slate hit an error drawing this page. Your channel and everything you have scheduled are untouched.'
        )}
        onRetry={reset}
        hint={
          <Link href="/launches" className="underline underline-offset-2">
            {t('back_to_calendar', 'Back to the calendar')}
          </Link>
        }
      />
    </div>
  );
}
