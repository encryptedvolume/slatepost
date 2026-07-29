'use client';

import React, { FC, useCallback, useMemo, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { orderBy } from 'lodash';
import clsx from 'clsx';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { AddProviderComponent } from '@gitroom/frontend/components/launches/add.provider.component';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { Button } from '@gitroom/react/form/button';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: FC<OnboardingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const modals = useModals();
  const t = useT();

  return (
    <div className="w-full min-h-full flex-1 p-[32px] flex relative">
      <style>
        {`#support-discord {display: none}`}
      </style>
      <div className="flex flex-1 bg-surface border border-line rounded-card flex-col relative">
        <button
          className="outline-none absolute end-[16px] top-[16px] w-[28px] h-compact rounded-control flex items-center justify-center text-inkSecondary hover:bg-surfaceHover hover:text-ink cursor-pointer transition-colors duration-state ease-state before:absolute before:-inset-[8px] before:content-['']"
          type="button"
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
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-[16px]">
              <div className="flex items-center gap-[8px]">
                <div
                  className={clsx(
                    'w-[32px] h-[32px] rounded-pill flex items-center justify-center t-control transition-colors duration-state ease-state',
                    step === 1
                      ? 'bg-boxFocused text-textItemFocused'
                      : 'bg-newTableHeader'
                  )}
                >
                  1
                </div>
                <span
                  className={clsx(
                    't-control',
                    step === 1 ? 'text-ink' : 'text-inkSecondary'
                  )}
                >
                  {t('connect_channels', 'Connect Channels')}
                </span>
              </div>
              <div className="w-[48px] h-[1px] bg-line" />
              <div className="flex items-center gap-[8px]">
                <div
                  className={clsx(
                    'w-[32px] h-[32px] rounded-pill flex items-center justify-center t-control transition-colors duration-state ease-state',
                    step === 2
                      ? 'bg-boxFocused text-textItemFocused'
                      : 'bg-newTableHeader'
                  )}
                >
                  2
                </div>
                <span
                  className={clsx(
                    't-control',
                    step === 2 ? 'text-ink' : 'text-inkSecondary'
                  )}
                >
                  {t('watch_tutorial', 'Watch Tutorial')}
                </span>
              </div>
            </div>

            {/* Step content */}
            {step === 1 && (
              <OnboardingStep1
                onNext={() => setStep(2)}
                onSkip={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <OnboardingStep2 onBack={() => setStep(1)} onFinish={onClose} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OnboardingStep1: FC<{ onNext: () => void; onSkip: () => void }> = ({
  onNext,
  onSkip,
}) => {
  const fetch = useFetch();
  const t = useT();

  const getIntegrations = useCallback(async () => {
    return (await fetch('/integrations')).json();
  }, []);

  const load = useCallback(async (path: string) => {
    const list = (await (await fetch(path)).json()).integrations;
    return list;
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

  const { data } = useSWR('get-all-integrations-onboarding', getIntegrations);

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex gap-[4px] flex-col text-center">
        <div className="t-title-2">
          {t('connect_your_channels', 'Connect Your Channels')}
        </div>
        <div className="t-body text-inkSecondary">
          {t(
            'connect_social_media_to_start',
            'Connect your social media accounts to start scheduling posts'
          )}
        </div>
      </div>

      {/* Connected channels */}
      {sortedIntegrations.length > 0 && (
        <div className="bg-surfaceSunken border border-line rounded-card p-[16px]">
          <div className="t-body-emphasis mb-[12px]">
            {t('connected_channels', 'Connected Channels')} (
            {sortedIntegrations.length})
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
                    alt={integration.identifier}
                    width={28}
                    height={28}
                  />
                  <SafeImage
                    src={`/icons/platforms/${integration.identifier}.png`}
                    className="rounded-pill absolute -bottom-[4px] -end-[4px] border border-line"
                    alt={integration.identifier}
                    width={14}
                    height={14}
                  />
                </div>
                <span className="t-secondary">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available platforms - using AddProviderComponent */}
      <div className="flex flex-col gap-[12px]">
        <div className="t-body-emphasis">
          {t('click_channel_to_add', 'Click a channel to add it')}
        </div>
        {data && (
          <AddProviderComponent
            invite={false}
            social={data.social || []}
            article={data.article || []}
            onboarding={true}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end pt-[24px] mt-[8px]">
        <Button onClick={onNext} className="px-[24px]">
          {sortedIntegrations.length > 0
            ? t('continue', 'Continue')
            : t('continue_without_channels', 'Continue without channels')}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 10h12" />
            <path d="m10 4 6 6-6 6" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

const OnboardingStep2: FC<{ onBack: () => void; onFinish: () => void }> = ({
  onBack,
  onFinish,
}) => {
  const t = useT();

  return (
    <div className="flex flex-col gap-[24px] flex-1">
      <div className="flex gap-[4px] flex-col text-center">
        <div className="t-title-2">
          {t('watch_tutorial_title', 'Learn How to Use Slate')}
        </div>
        <div className="t-body text-inkSecondary">
          {t(
            'watch_tutorial_description',
            'Watch this short video to learn how to get the most out of Slate'
          )}
        </div>
      </div>

      {/* YouTube Video Embed */}
      <div className="relative flex-1 rounded-card overflow-hidden">
        <div className="absolute left-0 top-0 w-full h-full flex justify-center">
          <iframe
            className="h-full aspect-video"
            src="https://www.youtube.com/embed/BdsCVvEYgHU?si=vvhaZJ8I5oXXvVJS?autoplay=1"
            title="Slate Tutorial"
            allow="autoplay"
            allowFullScreen
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between pt-[24px] mt-[8px]">
        <Button secondary={true} onClick={onBack} className="px-[24px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m10 16-6-6 6-6" />
            <path d="M16 10H4" />
          </svg>
          {t('back', 'Back')}
        </Button>
        <Button onClick={onFinish} className="px-[24px]">
          {t('get_started', 'Get Started')}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 10h12" />
            <path d="m10 4 6 6-6 6" />
          </svg>
        </Button>
      </div>
    </div>
  );
};
