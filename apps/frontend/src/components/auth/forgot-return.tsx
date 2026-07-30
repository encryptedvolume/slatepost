'use client';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import Link from 'next/link';
import { Button } from '@gitroom/react/form/button';
import { Input } from '@gitroom/react/form/input';
import { useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ForgotReturnPasswordDto } from '@gitroom/nestjs-libraries/dtos/auth/forgot-return.password.dto';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
type Inputs = {
  password: string;
  repeatPassword: string;
  token: string;
};
export function ForgotReturn({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const t = useT();
  const [state, setState] = useState(false);
  const resolver = useMemo(() => {
    return classValidatorResolver(ForgotReturnPasswordDto);
  }, []);
  const form = useForm<Inputs>({
    resolver,
    mode: 'onChange',
    defaultValues: {
      token,
    },
  });
  const fetchData = useFetch();
  // The success panel used to be switched on before the answer was read, so an
  // expired link and a dead server both ended on "We successfully reset your
  // password" — with the real explanation set on a field that had just been
  // unmounted. The form now only steps forward when the reset actually happened.
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);

    try {
      const response = await fetchData('/auth/forgot-return', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const { reset } = await response.json();

      if (!reset) {
        setLoading(false);
        form.setError('password', {
          type: 'manual',
          message: t(
            'password_reset_link_expired',
            'Your password reset link has expired. Please try again.'
          ),
        });
        return;
      }

      setState(true);
      setLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setLoading(false);
      form.setError('password', {
        type: 'manual',
        message: t(
          'password_reset_unreachable',
          'We could not change your password just now. Your old password still works — try again in a moment.'
        ),
      });
    }
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <h1 className="t-title-1 text-start mb-[16px] cursor-pointer">
            {t('forgot_password_1', 'Forgot Password')}
          </h1>
        </div>
        {!state ? (
          <>
            <div className="space-y-[16px] text-ink">
              <Input
                label="New Password"
                translationKey="label_new_password"
                {...form.register('password')}
                type="password"
                placeholder={t('label_password', 'Password')}
              />
              <Input
                label="Repeat Password"
                translationKey="label_repeat_password"
                {...form.register('repeatPassword')}
                type="password"
                placeholder={t('label_repeat_password', 'Repeat Password')}
              />
            </div>
            <div className="text-center mt-[24px]">
              <div className="w-full flex">
                <Button type="submit" className="flex-1" loading={loading}>
                  {t('change_password', 'Change Password')}
                </Button>
              </div>
              <p className="mt-[16px] t-secondary">
                <Link href="/auth/login" className="underline cursor-pointer">
                  {t('go_back_to_login', 'Go back to login')}
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-start mt-[24px]">
              {t(
                'we_successfully_reset_your_password_you_can_now_login_with_your',
                'We successfully reset your password. You can now login with your'
              )}
            </div>
            <p className="mt-[16px] t-secondary">
              <Link href="/auth/login" className="underline cursor-pointer">
                {t('go_back_to_login', 'Go back to login')}
              </Link>
            </p>
          </>
        )}
      </form>
    </FormProvider>
  );
}
