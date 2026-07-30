'use client';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { HttpStatusCode } from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Redirect } from '@gitroom/frontend/components/layout/redirect';
import { StateNotice } from '@gitroom/frontend/components/ui/state.notice';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import dayjs from 'dayjs';
import { continueProviderList } from '@gitroom/frontend/components/new-launch/providers/continue-provider/list';
import { IntegrationContext } from '@gitroom/frontend/components/launches/helpers/use.integration';
import { newDayjs } from '@gitroom/frontend/components/layout/set.timezone';
import { useVariables } from '@gitroom/react/helpers/variable.context';

interface TwoStepState {
  integrationId: string;
  onboarding: boolean;
  pages: any[];
  returnURL?: string;
}

interface SuccessState {
  message: string;
}

export const ContinueIntegration: FC<{
  provider: string;
  searchParams: any;
  logged: boolean;
}> = (props) => {
  const { provider, searchParams, logged } = props;
  const { push } = useRouter();
  const t = useT();
  const fetch = useFetch();
  const { extensionId, backendUrl } = useVariables();
  const [error, setError] = useState(false);
  const [twoStepState, setTwoStepState] = useState<TwoStepState | null>(null);
  const [successState, setSuccessState] = useState<SuccessState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to handle navigation - redirects if logged or returnURL exists, otherwise shows inline
  const navigateOrShow = useCallback(
    (path: string, returnURL: string | undefined, successMessage: string) => {
      if (returnURL) {
        // If returnURL exists, always redirect to it with the path params
        const params = path.includes('?') ? path.split('?')[1] : '';
        push(params ? `${returnURL}?${params}` : returnURL);
      } else if (logged) {
        // If logged in without returnURL, use normal navigation
        push(path);
      } else {
        // If not logged in without returnURL, show success inline
        setSuccessState({ message: successMessage });
      }
    },
    [logged, push]
  );
  const modifiedParams = useMemo(() => {
    if (provider === 'mewe') {
      return {
        state: searchParams.state || '',
        code: searchParams.loginRequestToken || '',
        refresh: searchParams.refresh || '',
      };
    }
    if (provider === 'x') {
      return {
        state: searchParams.oauth_token || '',
        code: searchParams.oauth_verifier || '',
        refresh: searchParams.refresh || '',
      };
    }

    if (provider === 'vk') {
      return {
        ...searchParams,
        state: searchParams.state || '',
        code: searchParams.code + '&&&&' + searchParams.device_id,
      };
    }

    if (provider === 'mewe') {
      const hash =
        typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
      const hashParams = new URLSearchParams(hash);
      return {
        state: hashParams.get('state') || searchParams.state || '',
        code: hashParams.get('loginRequestToken') || '',
        refresh: searchParams.refresh || '',
      };
    }

    return searchParams;
  }, []);

  useEffect(() => {
    (async () => {
      const timezone = String(dayjs.tz().utcOffset());

      // Try public endpoint first (handles both public and fallback scenarios)
      let data = await fetch(`/integrations/social-connect/${provider}`, {
        method: 'POST',
        body: JSON.stringify({ ...modifiedParams, timezone }),
      });

      // If public endpoint fails with specific errors, try authenticated endpoint
      if (data.status === HttpStatusCode.BadRequest) {
        const errorData = await data.json().catch(() => ({}));
        // "Invalid connection type" means this wasn't started as a public flow
        if (
          errorData.message?.includes('Invalid connection type') ||
          errorData.message?.includes('Invalid or expired state')
        ) {
          data = await fetch(`/integrations/social-connect/${provider}`, {
            method: 'POST',
            body: JSON.stringify({ ...modifiedParams, timezone }),
          });
        }
      }

      if (data.status === HttpStatusCode.PreconditionFailed) {
        const { returnURL } = await data.json().catch(() => ({}));
        navigateOrShow(
          `/launches?precondition=true`,
          returnURL,
          'Precondition failed'
        );
        return;
      }

      if (data.status === HttpStatusCode.NotAcceptable) {
        const { msg, returnURL } = await data.json();
        navigateOrShow(`/launches?msg=${msg}`, returnURL, msg);
        return;
      }

      if (
        data.status !== HttpStatusCode.Ok &&
        data.status !== HttpStatusCode.Created
      ) {
        const errorData = await data.json().catch(() => ({}));
        const reason =
          errorData.message || errorData.msg || 'Could not add provider';
        // Kept for the console and Sentry only — the screen shows a sentence.
        // eslint-disable-next-line no-console
        console.error('social-connect failed', data.status, reason);
        setError(true);
        return;
      }

      const {
        inBetweenSteps,
        id,
        onboarding: resOnboarding,
        pages,
        returnURL,
        extensionToken,
      } = await data.json();
      const onboarding = resOnboarding || searchParams.onboarding === 'true';

      // Store refresh token in extension for background cookie refresh
      if (
        extensionToken &&
        extensionId &&
        typeof chrome !== 'undefined' &&
        chrome?.runtime?.sendMessage
      ) {
        try {
          chrome.runtime.sendMessage(
            extensionId,
            {
              type: 'STORE_REFRESH_TOKEN',
              provider,
              integrationId: id,
              jwt: extensionToken,
              backendUrl,
            },
            () => {}
          );
        } catch {
          // Silently ignore — extension may not be available
        }
      }

      // If it's a two-step provider, show the selection UI inline
      if (inBetweenSteps && !searchParams.refresh) {
        setTwoStepState({
          integrationId: id,
          onboarding,
          pages: pages || [],
          returnURL,
        });
        return;
      }

      navigateOrShow(
        `/launches?added=${provider}&msg=Channel Updated${
          onboarding ? '&onboarding=true' : ''
        }`,
        returnURL,
        'Channel Updated'
      );
    })();
  }, []);

  const onSave = useCallback(
    async (data: any) => {
      if (!twoStepState) return;

      setIsSaving(true);

      try {
        // Use public or authenticated endpoint based on the flow
        const endpoint = logged
          ? `/integrations/provider/${twoStepState.integrationId}/connect`
          : `/integrations/public/provider/${twoStepState.integrationId}/connect`;

        const response = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({ ...modifiedParams, ...data }),
        });

        if (
          response.status !== HttpStatusCode.Ok &&
          response.status !== HttpStatusCode.Created
        ) {
          const errorData = await response.json().catch(() => ({}));
          const reason =
            errorData.message || 'Failed to save channel configuration';
          // eslint-disable-next-line no-console
          console.error('channel connect failed', response.status, reason);
            setError(true);
          return;
        }

        navigateOrShow(
          `/launches?added=${provider}&msg=Channel Added${
            twoStepState.onboarding ? '&onboarding=true' : ''
          }`,
          twoStepState.returnURL,
          'Channel Added'
        );
      } finally {
        setIsSaving(false);
      }
    },
    [twoStepState, fetch, modifiedParams, provider, navigateOrShow]
  );

  const Provider = useMemo(() => {
    return (
      continueProviderList[provider as keyof typeof continueProviderList] ||
      null
    );
  }, [provider]);

  // One channel ships, so this is its display name rather than a table of
  // other networks' display names.
  const providerDisplayName = useMemo(() => {
    return provider === 'tiktok' ? 'TikTok' : provider;
  }, [provider]);

  // Success state for non-logged users without returnURL
  if (successState) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas text-ink">
        <div className="text-center">
          <div className="w-[24px] h-[24px] mx-auto mb-[24px] text-success">
            <svg
              className="w-[24px] h-[24px]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="t-title-2 mb-[12px]">
            {t('channel_connected', 'Channel Connected!')}
          </div>
          <div className="t-body text-inkSecondary max-w-[34rem]">
            {successState.message ||
              t(
                'channel_connected_description',
                `Your ${providerDisplayName} channel has been successfully connected. You can close this window now.`
              )}
          </div>
        </div>
      </div>
    );
  }

  // Show the two-step selection UI
  if (twoStepState && Provider) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas text-ink">
        <div className="w-full max-w-[480px] mx-auto px-[24px]">
          <div className="bg-surface border border-line rounded-card p-[24px] flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[8px] text-center">
              <h1 className="t-title-2">
                {t('configure_your_channel', 'Configure Your Channel')}
              </h1>
              <p className="t-secondary text-inkSecondary">
                {t(
                  'select_the_page_or_account',
                  `Select the ${providerDisplayName} page or account you want to connect.`
                )}
              </p>
            </div>

            <IntegrationContext.Provider
              value={{
                date: newDayjs(),
                value: [],
                allIntegrations: [],
                integration: {
                  editor: 'normal',
                  additionalSettings: '',
                  display: '',
                  time: [{ time: 0 }],
                  id: twoStepState.integrationId,
                  type: '',
                  name: '',
                  picture: '',
                  inBetweenSteps: true,
                  changeNickName: false,
                  changeProfilePicture: false,
                  identifier: provider,
                },
              }}
            >
              <Provider
                onSave={onSave}
                existingId={[]}
                initialData={twoStepState.pages}
                isSaving={isSaving}
              />
            </IntegrationContext.Provider>
          </div>
        </div>
      </div>
    );
  }

  // What comes back from a refused OAuth exchange is a backend sentence at
  // best and a NestJS envelope, an expired-state message or a provider's own
  // error code at worst — none of it something to hand a user mid-connect. The
  // raw text goes to the console (see the `console.error` calls above) and
  // the screen says what happened and what to do about it.
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas p-[24px]">
        <StateNotice
          tone="failure"
          title={t('could_not_add_channel', 'We could not connect that channel')}
          body={t(
            'could_not_add_channel_body',
            'TikTok did not finish handing the connection over. Nothing was saved, so it is safe to try again from the calendar.'
          )}
          action={
            <Link
              href="/launches"
              className="t-control text-ink underline underline-offset-2"
            >
              {t('back_to_calendar', 'Back to the calendar')}
            </Link>
          }
          hint={
            logged
              ? t('taking_you_back', 'Taking you back in a moment…')
              : undefined
          }
        />
        {logged && <Redirect url="/launches" delay={3000} />}
      </div>
    );
  }

  // The wait between the OAuth redirect and the channel existing. It is a
  // sentence, not a spinner: the user has just come back from TikTok and needs
  // to know this screen is mid-handshake rather than stuck.
  return (
    <div className="flex flex-1 items-center justify-center bg-canvas text-ink">
      <div
        className="text-center"
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="t-title-2 mb-[12px]">
          {t('adding_channel', 'Adding Channel')}
        </div>
        <div className="t-body text-inkSecondary">
          {t('please_wait', 'Please wait while we connect your account...')}
        </div>
      </div>
    </div>
  );
};
