'use client';

import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import React, { FC, Ref, useCallback, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { showMediaBox } from '@gitroom/frontend/components/media/media.component';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { UserDetailDto } from '@gitroom/nestjs-libraries/dtos/users/user.details.dto';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useSWRConfig } from 'swr';
import { LogoutComponent } from '@gitroom/frontend/components/layout/logout.component';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { GlobalSettings } from '@gitroom/frontend/components/settings/global.settings';
export const SettingsPopup: FC<{
  getRef?: Ref<any>;
}> = (props) => {
  const { getRef } = props;
  const fetch = useFetch();
  const toast = useToaster();
  const swr = useSWRConfig();
  const resolver = useMemo(() => {
    return classValidatorResolver(UserDetailDto);
  }, []);
  const form = useForm({
    resolver,
  });
  const picture = form.watch('picture');
  const modal = useModals();
  const close = useCallback(() => {
    return modal.closeAll();
  }, []);
  // One user, one account: the logout row is always available.
  const showLogout = true;
  const loadProfile = useCallback(async () => {
    const personal = await (await fetch('/user/personal')).json();
    form.setValue('fullname', personal.name || '');
    form.setValue('bio', personal.bio || '');
    form.setValue('picture', personal.picture);
  }, []);
  const openMedia = useCallback(() => {
    showMediaBox((values) => {
      form.setValue('picture', values);
    });
  }, []);
  const remove = useCallback(() => {
    form.setValue('picture', null);
  }, []);

  const submit = useCallback(async (val: any) => {
    await fetch('/user/personal', {
      method: 'POST',
      body: JSON.stringify(val),
    });
    if (getRef) {
      return;
    }
    toast.show(t('profile_updated', 'Profile updated'));
    close();
  }, []);

  const t = useT();

  useEffect(() => {
    loadProfile();
  }, []);

  /* One column. This screen used to open with a 260px hairline-separated rail
     whose list held exactly one row — "Global Settings" — which could never be
     deselected, and which spent one of the four Signal Amber uses (the active
     nav marker) marking the only thing there was to mark. There is one settings
     surface, so it renders directly, and logout moves to the bottom of the same
     column. "Global" also implied a per-org scope this product does not have. */
  return (
    <div className="flex-1 flex flex-col p-[24px] gap-[24px] min-w-0">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="flex-1">
          {!!getRef && (
            <button type="submit" className="hidden" ref={getRef}></button>
          )}
          <div className="w-full gap-[24px] flex flex-col relative">
            <GlobalSettings />
          </div>
        </form>
      </FormProvider>
      {showLogout && (
        <div className="pt-[8px] border-t border-hairline">
          <LogoutComponent />
        </div>
      )}
    </div>
  );
};
