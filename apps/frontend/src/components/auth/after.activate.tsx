'use client';

import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

/**
 * The screen an activation link lands on.
 *
 * It used to be a 100px spinner on an otherwise empty page: no words while it
 * worked, and nothing at all when it failed — a thrown `json()` left the loader
 * true and the spinner turning forever. All three outcomes now say what
 * happened. The wait deliberately persists on success: the backend answers with
 * a `reload` header and the fetch wrapper navigates, so the last thing this
 * screen does is tell the user they are being signed in.
 */
export const AfterActivate = () => {
  const fetch = useFetch();
  const params = useParams();
  const [state, setState] = useState<'activating' | 'activated' | 'failed'>(
    'activating'
  );
  const run = useRef(false);
  const t = useT();

  const loadCode = useCallback(async () => {
    if (!params.code) {
      return;
    }

    try {
      const response = await fetch(`/auth/activate`, {
        method: 'POST',
        body: JSON.stringify({
          code: params.code,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const { can } = await response.json();

      if (!can) {
        setState('activated');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setState('failed');
    }
  }, []);

  useEffect(() => {
    if (!run.current) {
      run.current = true;
      loadCode();
    }
  }, []);

  if (state === 'activated') {
    return (
      <div className="flex flex-col gap-[16px]">
        <h1 className="t-title-1 text-ink">
          {t('account_already_active', 'This account is already active')}
        </h1>
        <p className="t-secondary text-inkSecondary">
          {t(
            'account_already_active_body',
            'Nothing left to do here — sign in and your calendar is waiting.'
          )}
        </p>
        <Link
          href="/auth/login"
          className="t-control text-ink underline underline-offset-2"
        >
          {t(
            'click_here_to_go_back_to_login',
            'Click here to go back to login'
          )}
        </Link>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="flex flex-col gap-[16px]" role="alert">
        <h1 className="t-title-1 text-ink">
          {t('activation_failed', 'We could not activate the account')}
        </h1>
        <p className="t-secondary text-inkSecondary">
          {t(
            'activation_failed_body',
            'The link may have been used already, or the server did not answer. Try signing in — if that does not work, ask for a new activation email.'
          )}
        </p>
        <div className="flex gap-[16px]">
          <Link
            href="/auth/login"
            className="t-control text-ink underline underline-offset-2"
          >
            {t('go_to_login', 'Go to sign in')}
          </Link>
          <Link
            href="/auth/activate"
            className="t-control text-inkSecondary underline underline-offset-2"
          >
            {t('resend_activation', 'Send a new activation email')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-[8px]"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <h1 className="t-title-1 text-ink">
        {t('activating_account', 'Activating your account')}
      </h1>
      <p className="t-secondary text-inkSecondary">
        {t(
          'activating_account_body',
          'One moment — we are confirming your email address and signing you in.'
        )}
      </p>
    </div>
  );
};
