'use client';

import React, { ReactNode, useCallback } from 'react';
import Link from 'next/link';
import { Logo } from '@gitroom/frontend/components/new-layout/logo';
const ModeComponent = dynamic(
  () => import('@gitroom/frontend/components/layout/mode.component'),
  {
    ssr: false,
  }
);

import dynamic from 'next/dynamic';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { ToolTip } from '@gitroom/frontend/components/layout/top.tip';
import { ShowMediaBoxModal } from '@gitroom/frontend/components/media/media.component';
import { MediaSettingsLayout } from '@gitroom/frontend/components/launches/helpers/media.settings.component';
import { Toaster } from '@gitroom/react/toaster/toaster';
import { ShowPostSelector } from '@gitroom/frontend/components/post-url-selector/post.url.selector';
import { ContinueProvider } from '@gitroom/frontend/components/layout/continue.provider';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { Title } from '@gitroom/frontend/components/layout/title';
import { TopMenu } from '@gitroom/frontend/components/layout/top.menu';

export const LayoutComponent = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch();

  const load = useCallback(async (path: string) => {
    return await (await fetch(path)).json();
  }, []);
  const { data: user } = useSWR('/user/self', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
  });

  if (!user) return null;

  return (
    <ContextWrapper user={user}>
      <MantineWrapper>
        <ToolTip />
        <Toaster />
        <ShowMediaBoxModal />
        <MediaSettingsLayout />
        <ShowPostSelector />
        <ContinueProvider />
        {/* App shell: a fixed 240px nav rail plus fluid content capped at
            1280px and centered. Separation is 1px hairlines — no cards,
            no shadows, no rounded panels floating on a grey field. */}
        <div className="flex flex-col min-h-screen min-w-screen bg-canvas text-ink">
          <div className="flex-1 flex">
            <div className="w-[240px] mobile:w-[64px] shrink-0">
              <div
                id="left-menu"
                className="fixed top-0 bottom-0 start-0 w-[240px] mobile:w-[64px] flex flex-col bg-canvas border-e border-hairline"
              >
                {/* 24px matches the icon column below: the menu list
                    is px-[12px] and MenuItem adds px-[12px], so the
                    mark and every nav icon share one left edge. */}
                <div className="h-[64px] flex items-center px-[24px] mobile:justify-center mobile:px-0 shrink-0">
                  {/* Clicking the wordmark is how people expect to get back to
                      the start of an app. The queue is that place here. */}
                  <Link href="/launches" aria-label="Slate — go to the calendar">
                    <Logo />
                  </Link>
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
                  {/* Everything that used to sit here — streak, org
                      selector, language, extension, notifications —
                      belonged to a multi-network, multi-tenant product.
                      Light/dark is the only control left. */}
                  <div className="flex items-center text-inkSecondary hover:text-ink transition-colors duration-state ease-state">
                    <ModeComponent />
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
        </div>
      </MantineWrapper>
    </ContextWrapper>
  );
};
