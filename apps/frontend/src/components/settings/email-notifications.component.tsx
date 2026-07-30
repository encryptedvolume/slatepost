'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { jsonOrThrow, useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { Slider } from '@gitroom/react/form/slider';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { ErrorState } from '@gitroom/frontend/components/ui/state.notice';
import {
  Skeleton,
  SkeletonRegion,
} from '@gitroom/frontend/components/ui/skeleton';

/**
 * Two emails, both about a post: it went out, or it did not.
 *
 * A third toggle used to sit here — "Streak Reminder Emails", "when your posting
 * streak is about to end" — for a streak indicator this fork deliberately
 * removed from the shell as a multi-network, multi-tenant device. The feature
 * was gone and the notification for it was not, so the setting promised mail
 * about something the product no longer measures.
 */
interface EmailNotifications {
  sendSuccessEmails: boolean;
  sendFailureEmails: boolean;
}

export const useEmailNotifications = () => {
  const fetch = useFetch();

  // Throwing on a failed load is what lets the panel below say so, instead of
  // drawing three toggles in their default positions as if those were the
  // user's saved choices.
  const load = useCallback(async () => {
    return jsonOrThrow<EmailNotifications>(
      await fetch('/user/email-notifications')
    );
  }, []);

  return useSWR<EmailNotifications>('email-notifications', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  });
};

const EmailNotificationsComponent = () => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const { data, isLoading, error, mutate } = useEmailNotifications();

  const [localSettings, setLocalSettings] = useState<EmailNotifications>({
    sendSuccessEmails: true,
    sendFailureEmails: true,
  });

  // Keep a ref to always have the latest state
  const settingsRef = useRef(localSettings);
  settingsRef.current = localSettings;

  // Sync local state with fetched data
  useEffect(() => {
    if (data) {
      setLocalSettings(data);
    }
  }, [data]);

  const updateSetting = useCallback(
    async (key: keyof EmailNotifications, value: boolean) => {
      // Use ref to get the latest state
      const currentSettings = settingsRef.current;
      const newData = {
        ...currentSettings,
        [key]: value,
      };

      // Update local state immediately
      setLocalSettings(newData);

      // The toggle moves before the server has agreed, which is the right trade
      // for a switch — but only if a refusal moves it back. Saying "Settings
      // updated" over a failed write leaves the user believing they turned an
      // email off that will keep arriving.
      try {
        const response = await fetch('/user/email-notifications', {
          method: 'POST',
          body: JSON.stringify(newData),
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setLocalSettings(currentSettings);
        toaster.show(
          t(
            'email_notifications_save_failed',
            'We could not save that. Your email settings are unchanged — try again in a moment.'
          ),
          'warning'
        );
        return;
      }

      toaster.show(t('settings_updated', 'Settings updated'), 'success');
    },
    []
  );

  const handleSuccessEmailsChange = useCallback(
    (value: 'on' | 'off') => {
      updateSetting('sendSuccessEmails', value === 'on');
    },
    [updateSetting]
  );

  const handleFailureEmailsChange = useCallback(
    (value: 'on' | 'off') => {
      updateSetting('sendFailureEmails', value === 'on');
    },
    [updateSetting]
  );

  // Placeholders in the shape of the two toggle rows, inside the real card,
  // so the settings page keeps its layout while the values arrive.
  if (isLoading) {
    return (
      <SkeletonRegion
        label={t('loading_email_notifications', 'Loading email notifications')}
        className="my-[16px] mt-[16px] bg-surface border border-line rounded-card p-[20px] flex flex-col gap-[24px]"
      >
        <Skeleton className="h-[20px] w-[160px] rounded-thumb mt-[4px]" />
        {[0, 1].map((row) => (
          <div key={row} className="flex items-center justify-between gap-[24px]">
            <div className="flex flex-col gap-[4px] flex-1">
              <Skeleton className="h-[16px] w-[140px] rounded-thumb" />
              <Skeleton className="h-[12px] w-full max-w-[360px] rounded-thumb" />
            </div>
            <Skeleton className="h-[24px] w-[44px] rounded-pill shrink-0" />
          </div>
        ))}
      </SkeletonRegion>
    );
  }

  if (error) {
    return (
      <ErrorState
        className="my-[16px] mt-[16px]"
        compact={true}
        title={t(
          'email_notifications_failed_title',
          'We could not load your email notification settings'
        )}
        body={t(
          'email_notifications_failed_body',
          'Nothing has changed. Try again to see which emails are switched on.'
        )}
        onRetry={() => mutate()}
      />
    );
  }

  return (
    <div className="my-[16px] mt-[16px] bg-surface border border-line rounded-card p-[20px] flex flex-col gap-[24px]">
      <div className="mt-[4px]">
        {t('email_notifications', 'Email Notifications')}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="t-control">
            {t('success_emails', 'Success Emails')}
          </div>
          <div className="t-caption text-inkSecondary">
            {t(
              'success_emails_description',
              'Receive email notifications when posts are published successfully'
            )}
          </div>
        </div>
        <Slider
          value={localSettings.sendSuccessEmails ? 'on' : 'off'}
          onChange={handleSuccessEmailsChange}
          fill={true}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="t-control">
            {t('failure_emails', 'Failure Emails')}
          </div>
          <div className="t-caption text-inkSecondary">
            {t(
              'failure_emails_description',
              'Receive email notifications when posts fail to publish'
            )}
          </div>
        </div>
        <Slider
          value={localSettings.sendFailureEmails ? 'on' : 'off'}
          onChange={handleFailureEmailsChange}
          fill={true}
        />
      </div>
    </div>
  );
};

export default EmailNotificationsComponent;

