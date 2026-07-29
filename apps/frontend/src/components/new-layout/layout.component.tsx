'use client';

import React, { ReactNode, useCallback } from 'react';
import { Logo } from '@gitroom/frontend/components/new-layout/logo';
const ModeComponent = dynamic(
  () => import('@gitroom/frontend/components/layout/mode.component'),
  {
    ssr: false,
  }
);

import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { CheckPayment } from '@gitroom/frontend/components/layout/check.payment';
import { ToolTip } from '@gitroom/frontend/components/layout/top.tip';
import { ShowMediaBoxModal } from '@gitroom/frontend/components/media/media.component';
import { MediaSettingsLayout } from '@gitroom/frontend/components/launches/helpers/media.settings.component';
import { Toaster } from '@gitroom/react/toaster/toaster';
import { ShowPostSelector } from '@gitroom/frontend/components/post-url-selector/post.url.selector';
import { NewSubscription } from '@gitroom/frontend/components/layout/new.subscription';
import { Support } from '@gitroom/frontend/components/layout/support';
import { ContinueProvider } from '@gitroom/frontend/components/layout/continue.provider';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';
import { CopilotKit } from '@copilotkit/react-core';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { Impersonate } from '@gitroom/frontend/components/layout/impersonate';
import { AnnouncementBanner } from '@gitroom/frontend/components/layout/announcement.banner';
import { Title } from '@gitroom/frontend/components/layout/title';
import { TopMenu } from '@gitroom/frontend/components/layout/top.menu';
import { LanguageComponent } from '@gitroom/frontend/components/layout/language.component';
import { ChromeExtensionComponent } from '@gitroom/frontend/components/layout/chrome.extension.component';
import NotificationComponent from '@gitroom/frontend/components/notifications/notification.component';
import { OrganizationSelector } from '@gitroom/frontend/components/layout/organization.selector';
import { StreakComponent } from '@gitroom/frontend/components/layout/streak.component';
import { PreConditionComponent } from '@gitroom/frontend/components/layout/pre-condition.component';
import { AttachToFeedbackIcon } from '@gitroom/frontend/components/new-layout/sentry.feedback.component';
import { FirstBillingComponent } from '@gitroom/frontend/components/billing/first.billing.component';
import { TrialTracker } from '@gitroom/frontend/components/layout/gtm.component';

export const LayoutComponent = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch();

  const { backendUrl, billingEnabled, isGeneral } = useVariables();

  // Feedback icon component attaches Sentry feedback to a top-bar icon when DSN is present
  const searchParams = useSearchParams();
  const load = useCallback(async (path: string) => {
    return await (await fetch(path)).json();
  }, []);
  const { data: user, mutate } = useSWR('/user/self', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
  });

  if (!user) return null;

  return (
    <ContextWrapper user={user}>
      <CopilotKit
        credentials="include"
        runtimeUrl={backendUrl + '/copilot/chat'}
        showDevConsole={false}
      >
        <MantineWrapper>
          <ToolTip />
          <Toaster />
          <TrialTracker />
          <CheckPayment check={searchParams.get('check') || ''} mutate={mutate}>
            <ShowMediaBoxModal />
            <MediaSettingsLayout />
            <ShowPostSelector />
            <PreConditionComponent />
            <NewSubscription />
            <ContinueProvider />
            {/* App shell: a fixed 240px nav rail plus fluid content capped at
                1280px and centered. Separation is 1px hairlines — no cards,
                no shadows, no rounded panels floating on a grey field. */}
            <div className="flex flex-col min-h-screen min-w-screen bg-canvas text-ink">
              <div>{user?.admin ? <Impersonate /> : <div />}</div>
              {user.tier === 'FREE' && isGeneral && billingEnabled ? (
                <FirstBillingComponent />
              ) : (
                <>
                  <AnnouncementBanner />
                  <div className="flex-1 flex">
                    <Support />
                    <div className="w-[240px] mobile:w-[64px] shrink-0">
                      <div
                        id="left-menu"
                        className={clsx(
                          'fixed top-0 bottom-0 start-0 w-[240px] mobile:w-[64px] flex flex-col',
                          'bg-canvas border-e border-hairline',
                          // The rail is fixed, so it has to clear the
                          // Impersonate bar above it. That bar is a token
                          // 48px tall — 60 was a magic number off the
                          // spacing set guessing at its height.
                          user?.admin && 'pt-[48px]'
                        )}
                      >
                        {/* 24px matches the icon column below: the menu list
                            is px-[12px] and MenuItem adds px-[12px], so the
                            mark and every nav icon share one left edge. */}
                        <div className="h-[64px] flex items-center px-[24px] mobile:justify-center mobile:px-0 shrink-0">
                          <Logo />
                        </div>
                        <div className="flex flex-col flex-1 gap-[32px] px-[12px] mobile:px-[8px] pb-[16px] overflow-y-auto">
                          <TopMenu />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col blurMe">
                      {/* The hairline runs full-bleed, but the row inside it
                          sits in the same 1280 column as the content below,
                          so the page title and the content it labels share a
                          left edge on every viewport width. */}
                      <div className="h-[64px] shrink-0 border-b border-hairline">
                        <div className="h-full w-full max-w-[1280px] mx-auto px-[24px] flex items-center gap-[24px]">
                          <div className="t-title-1 flex-1 min-w-0 truncate">
                            <Title />
                          </div>
                          <div className="flex items-center gap-[16px] text-inkSecondary">
                            <StreakComponent />
                            <div className="w-[1px] h-[16px] bg-hairline" />
                            <OrganizationSelector />
                            <div className="hover:text-ink transition-colors duration-state ease-state">
                              <ModeComponent />
                            </div>
                            <div className="w-[1px] h-[16px] bg-hairline" />
                            <LanguageComponent />
                            <ChromeExtensionComponent />
                            <div className="w-[1px] h-[16px] bg-hairline" />
                            <AttachToFeedbackIcon />
                            <NotificationComponent />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex flex-1 w-full max-w-[1280px] mx-auto min-w-0">
                          {children}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CheckPayment>
        </MantineWrapper>
      </CopilotKit>
    </ContextWrapper>
  );
};
