'use client';

import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import Link from 'next/link';
import { Button } from '@gitroom/react/form/button';
import { Input } from '@gitroom/react/form/input';
import { useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { LoginUserDto } from '@gitroom/nestjs-libraries/dtos/auth/login.user.dto';
import { GithubProvider } from '@gitroom/frontend/components/auth/providers/github.provider';
import { OauthProvider } from '@gitroom/frontend/components/auth/providers/oauth.provider';
import { GoogleProvider } from '@gitroom/frontend/components/auth/providers/google.provider';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { FarcasterProvider } from '@gitroom/frontend/components/auth/providers/farcaster.provider';
import WalletProvider from '@gitroom/frontend/components/auth/providers/wallet.provider';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
type Inputs = {
  email: string;
  password: string;
  providerToken: '';
  provider: 'LOCAL';
};

/**
 * Single-sign-on buttons are owned by the provider components. They are pulled
 * onto the neutral ramp from here — surface fill, 1px hairline, 44px control,
 * and every third-party mark forced to monochrome currentColor — so the login
 * screen keeps a single palette without touching those files.
 */
export const ssoRowClassName =
  'flex gap-[8px] [&>div]:!bg-surface [&>div]:!text-ink [&>div]:!border [&>div]:!border-line ' +
  '[&>div]:!h-large [&>div]:!rounded-control [&>div]:!text-control ' +
  '[&>div]:transition-colors [&>div]:duration-state [&>div]:ease-state [&>div:hover]:!bg-surfaceHover ' +
  '[&_svg]:!w-[16px] [&_svg]:!h-[16px] [&_svg_path]:!fill-current [&_svg_path]:!stroke-current';

export function Login() {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [notActivated, setNotActivated] = useState(false);
  const { isGeneral, neynarClientId, billingEnabled, genericOauth } =
    useVariables();
  const resolver = useMemo(() => {
    return classValidatorResolver(LoginUserDto);
  }, []);
  const form = useForm<Inputs>({
    resolver,
    defaultValues: {
      providerToken: '',
      provider: 'LOCAL',
    },
  });
  const fetchData = useFetch();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    setNotActivated(false);
    const login = await fetchData('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        provider: 'LOCAL',
      }),
    });
    if (login.status === 400) {
      const errorMessage = await login.text();
      if (errorMessage === 'User is not activated') {
        setNotActivated(true);
      } else {
        form.setError('email', {
          message: errorMessage,
        });
      }
      setLoading(false);
    }
  };
  return (
    <FormProvider {...form}>
      <form className="flex-1 flex" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col flex-1">
          <h1 className="t-title-1 text-ink">{t('sign_in', 'Sign In')}</h1>

          <div className="t-secondary text-inkTertiary mt-[32px] mb-[12px]">
            {t('continue_with', 'Continue With')}
          </div>
          <div className={ssoRowClassName}>
            {isGeneral && genericOauth ? (
              <OauthProvider />
            ) : !isGeneral ? (
              <GithubProvider />
            ) : (
              <>
                <GoogleProvider />
                {!!neynarClientId && <FarcasterProvider />}
                {billingEnabled && <WalletProvider />}
              </>
            )}
          </div>

          {/* Hairline rule with the label sitting on the canvas. */}
          <div className="relative my-[32px] h-[18px]">
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-hairline" />
            <div className="absolute inset-0 flex justify-center">
              <span className="bg-canvas px-[12px] t-secondary text-inkTertiary">
                {t('or', 'or')}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
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
          </div>

          {notActivated && (
            <div className="mt-[8px] mb-[24px] rounded-control border border-line bg-surfaceSunken p-[16px] flex flex-col gap-[8px]">
              <p className="t-secondary text-inkSecondary">
                {t(
                  'account_not_activated',
                  'Your account is not activated yet. Please check your email for the activation link.'
                )}
              </p>
              <Link
                href="/auth/activate"
                className="t-secondary text-ink underline underline-offset-2 w-fit"
              >
                {t('resend_activation_email', 'Resend Activation Email')}
              </Link>
            </div>
          )}

          <Button
            type="submit"
            className="w-full !h-large mt-[24px]"
            loading={loading}
          >
            {t('sign_in_1', 'Sign in')}
          </Button>

          <div className="mt-[24px] flex flex-col gap-[8px]">
            <p className="t-secondary text-inkSecondary">
              {t('don_t_have_an_account', "Don't Have An Account?")}&nbsp;
              <Link
                href="/auth"
                className="text-ink underline underline-offset-2"
              >
                {t('sign_up', 'Sign Up')}
              </Link>
            </p>
            <Link
              href="/auth/forgot"
              className="t-secondary text-inkSecondary underline underline-offset-2 w-fit"
            >
              {t('forgot_password', 'Forgot password')}
            </Link>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
