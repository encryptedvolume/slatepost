'use client';

import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { jsonOrThrow, useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { orderBy } from 'lodash';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { AddProviderComponent } from '@gitroom/frontend/components/launches/add.provider.component';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { ErrorState } from '@gitroom/frontend/components/ui/state.notice';
import {
  Skeleton,
  SkeletonRegion,
} from '@gitroom/frontend/components/ui/skeleton';
import { PlatformGlyph } from '@gitroom/frontend/components/ui/platform.glyph';

interface OnboardingModalProps {
  onClose: () => void;
}

/**
 * First run: connect the one channel.
 *
 * This used to be two steps. Step two autoplayed a youtube.com embed of the
 * upstream Postiz tour — 28 channels, billing, analytics — under "Learn How to
 * Use Slate", which is a tour of a product this fork is not, on a screen that
 * promises nothing competes for your attention, from a third-party host the
 * privacy policy says nothing loads from. There is one thing to do here, so
 * there is one step, and it closes itself the moment the channel exists rather
 * than asking the user to confirm that it worked.
 */
export const OnboardingModal: FC<OnboardingModalProps> = ({ onClose }) => {
  const fetch = useFetch();
  const t = useT();
  const modals = useModals();

  const getIntegrations = useCallback(async () => {
    return jsonOrThrow<{ social: any[] }>(await fetch('/integrations'));
  }, []);

  const load = useCallback(async (path: string) => {
    const { integrations } = await jsonOrThrow<{ integrations: any[] }>(
      await fetch(path)
    );
    return integrations;
  }, []);

  const { data: integrations } = useSWR('/integrations/list', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    fallbackData: [],
  });

  const sortedIntegrations = useMemo(() => {
    return orderBy(
      integrations,
      ['type', 'disabled', 'identifier'],
      ['desc', 'asc', 'asc']
    );
  }, [integrations]);

  const {
    data,
    isLoading,
    error,
    mutate: reloadPlatforms,
  } = useSWR('get-all-integrations-onboarding', getIntegrations);

  // The channel is the whole point of this screen, so arriving at one is the
  // signal to leave. Nothing to confirm, no "Get Started" to press.
  const connected = sortedIntegrations.length > 0;
  useEffect(() => {
    if (connected) {
      onClose();
    }
  }, [connected, onClose]);

  return (
    <div className="w-full min-h-full flex-1 p-[32px] flex relative">
      <div className="flex flex-1 bg-surface border border-line rounded-card flex-col relative">
        <button
          className="outline-none absolute end-[16px] top-[16px] w-[28px] h-compact rounded-control flex items-center justify-center text-inkSecondary hover:bg-surfaceHover hover:text-ink cursor-pointer transition-colors duration-state ease-state before:absolute before:-inset-[8px] before:content-['']"
          type="button"
          aria-label={t('close', 'Close')}
          onClick={modals.closeAll}
        >
          <svg
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
          >
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <div className="flex-1 flex p-[32px]">
          <div className="flex flex-col gap-[24px] flex-1">
            <div className="flex gap-[4px] flex-col text-center">
              <div className="t-title-2">
                {t('connect_your_tiktok_account', 'Connect your TikTok account')}
              </div>
              <div className="t-body text-inkSecondary">
                {t(
                  'connect_your_tiktok_account_body',
                  'One channel, every post on time. Connect TikTok and this becomes your queue.'
                )}
              </div>
            </div>

            {/* Already connected — shown for the moment before this modal
                closes itself, and when a second channel is somehow present. */}
            {connected && (
              <div className="bg-surfaceSunken border border-line rounded-card p-[16px]">
                <div className="t-body-emphasis mb-[12px]">
                  {t('connected_channel', 'Connected channel')}
                </div>
                <div className="flex flex-wrap gap-[12px]">
                  {sortedIntegrations.map((integration: any) => (
                    <div
                      key={integration.id}
                      className="flex items-center gap-[8px] bg-surfaceActive rounded-thumb px-[12px] py-[8px]"
                    >
                      <div className="relative w-[28px] h-compact">
                        <SafeImage
                          src={integration.picture}
                          className="rounded-pill"
                          alt={integration.name}
                          width={28}
                          height={28}
                        />
                        <PlatformGlyph
                          identifier={integration.identifier}
                          size={14}
                          className="absolute -bottom-[4px] -end-[4px] text-ink"
                        />
                      </div>
                      <span className="t-secondary">{integration.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* The connect row is the primary action. It used to sit under a
                heading reading "Click a channel to add it" while the only
                *button* on the step said "Continue without channels" — which
                dropped a brand-new user on an empty queue. */}
            <div className="flex flex-col gap-[12px]">
              {isLoading && (
                <SkeletonRegion
                  label={t('loading_channels_to_connect', 'Loading channels')}
                  className="flex flex-col gap-[24px]"
                >
                  <Skeleton className="h-[16px] w-[280px] rounded-thumb" />
                  <div className="rounded-card border border-line bg-surface overflow-hidden">
                    <div className="h-large px-[16px] flex items-center gap-[12px]">
                      <Skeleton className="w-[16px] h-[16px] rounded-thumb shrink-0" />
                      <Skeleton className="h-[16px] w-[120px] rounded-thumb" />
                    </div>
                  </div>
                </SkeletonRegion>
              )}

              {/* Onboarding is the first thing a new install shows, so a
                  failure here cannot be silent: without this the step sat empty
                  forever with no way forward. */}
              {!isLoading && !!error && (
                <ErrorState
                  compact={true}
                  title={t(
                    'onboarding_channels_failed_title',
                    'We could not load the channels you can connect'
                  )}
                  body={t(
                    'onboarding_channels_failed_body',
                    'Nothing is wrong with your account. Try again, or skip for now and connect TikTok from the queue.'
                  )}
                  onRetry={() => reloadPlatforms()}
                />
              )}

              {!isLoading && !error && !!data && (
                <AddProviderComponent
                  social={data.social || []}
                  onboarding={true}
                />
              )}
            </div>

            {/* A secondary link, not the primary button. */}
            <div className="flex justify-center pt-[8px]">
              <button
                type="button"
                onClick={onClose}
                className="t-secondary text-inkSecondary hover:text-ink underline cursor-pointer transition-colors duration-state ease-state"
              >
                {t('skip_for_now', 'Skip for now')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
