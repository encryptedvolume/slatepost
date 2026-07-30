'use client';

import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import Link from 'next/link';
import { Button } from '@gitroom/react/form/button';
import { Input } from '@gitroom/react/form/input';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { CreateOrgUserDto } from '@gitroom/nestjs-libraries/dtos/auth/create.org.user.dto';
import { GithubProvider } from '@gitroom/frontend/components/auth/providers/github.provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@gitroom/frontend/components/ui/skeleton';
import {
  readAuthError,
  ssoRowClassName as ssoRow,
} from '@gitroom/frontend/components/auth/login';
import { GoogleProvider } from '@gitroom/frontend/components/auth/providers/google.provider';
import { OauthProvider } from '@gitroom/frontend/components/auth/providers/oauth.provider';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { FarcasterProvider } from '@gitroom/frontend/components/auth/providers/farcaster.provider';
import dynamic from 'next/dynamic';
import { WalletUiProvider } from '@gitroom/frontend/components/auth/providers/placeholder/wallet.ui.provider';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import useCookie from 'react-use-cookie';
const WalletProvider = dynamic(
  () => import('@gitroom/frontend/components/auth/providers/wallet.provider'),
  {
    ssr: false,
    loading: () => <WalletUiProvider />,
  }
);
type Inputs = {
  email: string;
  password: string;
  providerToken: string;
  provider: string;
};
export function Register() {
  const t = useT();
  const getQuery = useSearchParams();
  const fetch = useFetch();
  const [provider] = useState(getQuery?.get('provider')?.toUpperCase());
  const [code, setCode] = useState(getQuery?.get('code') || '');
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (provider && code) {
      load();
    }
  }, []);
  const load = useCallback(async () => {
    const { token } = await (
      await fetch(`/auth/oauth/${provider?.toUpperCase() || 'LOCAL'}/exists`, {
        method: 'POST',
        body: JSON.stringify({
          code,
        }),
      })
    ).json();
    if (token) {
      setCode(token);
      setShow(true);
    }
  }, [provider, code]);
  if (!code && !provider) {
    return <RegisterAfter token="" provider="LOCAL" />;
  }
  // Waiting on the provider's token exchange. It is the same column the form is
  // about to occupy, with the heading already in place and the fields drawn as
  // placeholders, so the screen does not go blank behind a spinner mid-sign-up.
  if (!show) {
    return (
      <div className="flex-1 flex flex-col" aria-busy="true">
        <h1 className="t-title-1 text-ink">{t('sign_up', 'Sign Up')}</h1>
        <p className="t-secondary text-inkSecondary mt-[8px]">
          {t(
            'finishing_sign_up',
            'Checking your account with your sign-in provider. This takes a second.'
          )}
        </p>
        <div className="flex flex-col gap-[16px] mt-[32px]">
          <Skeleton className="h-large w-full rounded-control" />
          <Skeleton className="h-large w-full rounded-control" />
          <Skeleton className="h-large w-full rounded-control" />
        </div>
      </div>
    );
  }
  return (
    <RegisterAfter token={code} provider={provider?.toUpperCase() || 'LOCAL'} />
  );
}
export function RegisterAfter({
  token,
  provider,
}: {
  token: string;
  provider: string;
}) {
  const t = useT();
  const { isGeneral, genericOauth, neynarClientId, billingEnabled } =
    useVariables();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isAfterProvider = useMemo(() => {
    return !!token && !!provider;
  }, [token, provider]);
  const resolver = useMemo(() => {
    return classValidatorResolver(CreateOrgUserDto);
  }, []);
  const form = useForm<Inputs>({
    resolver,
    defaultValues: {
      providerToken: token,
      provider: provider,
    },
  });
  const fetchData = useFetch();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);

    // The API rejects a registration with a sentence ("Email already exists",
    // "Registration is disabled"), and that sentence is worth showing. What is
    // not worth showing — and what this used to print into the email field — is
    // `e.toString()` with "please check your browser console" bolted on.
    try {
      const response = await fetchData('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.status === 200) {
        if (response.headers.get('activate') === 'true') {
          setLoading(false);
          router.push('/auth/activate');
          return;
        }

        // No activation step means the response already signed this user in: it
        // set the `auth` cookie and an `onboarding` header, and the fetch
        // interceptor (components/layout/layout.context.tsx) has already sent
        // the browser to /launches?onboarding=true on the strength of it.
        //
        // So there is nothing to do here. This used to `router.push('/auth/login')`
        // on the same 200 — a second navigation racing the first, from one
        // response, asking an already-signed-in user to sign in again. Whichever
        // won was luck. The interceptor owns this redirect because it needs a
        // full document load for the server components to read the new cookie,
        // which `router.push` would not give it.
        //
        // `loading` deliberately stays true: the page is on its way out, and
        // re-enabling the button would invite a second registration.
        return;
      }

      setLoading(false);

      form.setError('email', {
        message: await readAuthError(
          response,
          t(
            'sign_up_failed',
            'We could not create the account just now. Please try again in a moment.'
          )
        ),
      });
    } catch {
      setLoading(false);
      form.setError('email', {
        message: t(
          'sign_up_unreachable',
          'We could not reach Slate. Check your connection and try again.'
        ),
      });
    }
  };
  return (
    <FormProvider {...form}>
      <form className="flex-1 flex" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col flex-1">
          <h1 className="t-title-1 text-ink">{t('sign_up', 'Sign Up')}</h1>
          {!isAfterProvider && (
            <div className="t-secondary text-inkTertiary mt-[32px] mb-[12px]">
              {t('continue_with', 'Continue With')}
            </div>
          )}
          <div className="flex flex-col">
            {!isAfterProvider &&
              (!isGeneral ? (
                <div className={ssoRow}>
                  <GithubProvider />
                </div>
              ) : (
                <div className={ssoRow}>
                  {genericOauth && isGeneral ? (
                    <OauthProvider />
                  ) : (
                    <GoogleProvider />
                  )}
                  {!!neynarClientId && <FarcasterProvider />}
                  {billingEnabled && <WalletProvider />}
                </div>
              ))}
            {!isAfterProvider && (
              <div className="relative my-[32px] h-[18px]">
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-hairline" />
                <div className="absolute inset-0 flex justify-center">
                  <span className="bg-canvas px-[12px] t-secondary text-inkTertiary">
                    {t('or', 'or')}
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-[16px]">
              <div>
                {!isAfterProvider && (
                  <>
                    <Input
                      label="Email"
                      translationKey="label_email"
                      {...form.register('email')}
                      type="email"
                      placeholder={t('email_address', 'Email Address')}
                    />
                    <Input
                      label="Password"
                      translationKey="label_password"
                      {...form.register('password')}
                      autoComplete="off"
                      type="password"
                      placeholder={t('label_password', 'Password')}
                    />
                  </>
                )}
              </div>
              <div className="t-secondary text-inkSecondary measure">
                {t(
                  'by_registering_you_agree_to_our',
                  'By registering you agree to our'
                )}
                &nbsp;
                <a
                  href={`https://slatepost.lol/terms`}
                  className="text-ink underline underline-offset-2"
                  rel="nofollow"
                >
                  {t('terms_of_service', 'Terms of Service')}
                </a>
                &nbsp;
                {t('and', 'and')}&nbsp;
                <a
                  href={`https://slatepost.lol/privacy`}
                  rel="nofollow"
                  className="text-ink underline underline-offset-2"
                >
                  {t('privacy_policy', 'Privacy Policy')}
                </a>
                &nbsp;
              </div>
              <div className="flex flex-col gap-[24px] mt-[8px]">
                <Button
                  type="submit"
                  className="w-full !h-large"
                  loading={loading}
                >
                  {t('create_account', 'Create Account')}
                </Button>
                <p className="t-secondary text-inkSecondary">
                  {t('already_have_an_account', 'Already Have An Account?')}
                  &nbsp;
                  <Link
                    href="/auth/login"
                    className="text-ink underline underline-offset-2"
                  >
                    {t('sign_in', 'Sign In')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
