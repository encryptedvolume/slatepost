'use client';

import {
  AddProviderButton,
  useAddProvider,
} from '@gitroom/frontend/components/launches/add.provider.component';
import { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { orderBy } from 'lodash';
import { CalendarWeekProvider } from '@gitroom/frontend/components/launches/calendar.context';
import { Filters } from '@gitroom/frontend/components/launches/filters';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import {
  EmptyState,
  ErrorState,
} from '@gitroom/frontend/components/ui/state.notice';
import {
  Skeleton,
  SkeletonRegion,
} from '@gitroom/frontend/components/ui/skeleton';
import { Button } from '@gitroom/react/form/button';
import clsx from 'clsx';
import { Menu } from '@gitroom/frontend/components/launches/menu/menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { Integration } from '@prisma/client';
import ImageWithFallback from '@gitroom/react/helpers/image.with.fallback';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Calendar } from './calendar';
import { DNDProvider } from '@gitroom/frontend/components/launches/helpers/dnd.provider';
import { NewPost } from '@gitroom/frontend/components/launches/new.post';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useIntegrationList } from '@gitroom/frontend/components/launches/helpers/use.integration.list';
import { Onboarding } from '@gitroom/frontend/components/onboarding/onboarding';
import { PlatformGlyph } from '@gitroom/frontend/components/ui/platform.glyph';

interface MenuComponentInterface {
  refreshChannel: (
    integration: Integration & {
      identifier: string;
    }
  ) => () => void;
  continueIntegration: (integration: Integration) => () => void;
  mutate: (shouldReload?: boolean) => void;
  update: (shouldReload: boolean) => void;
}

/**
 * One connected channel, drawn as a row.
 *
 * Slate holds one channel, so this is not a rail item any more: there is no
 * drag handle (nothing to reorder, no groups to drop into), no collapsed
 * variant, and no quota tooltip. It sits in the queue screen's own header row
 * beside Create Post, which is where the thing you are posting to belongs.
 */
export const ChannelRow: FC<
  MenuComponentInterface & {
    integration: Integration & {
      identifier: string;
      refreshNeeded?: boolean;
    };
  }
> = (props) => {
  const { continueIntegration, refreshChannel, mutate, update, integration } =
    props;
  const t = useT();
  return (
    <div
      {...(integration.refreshNeeded && {
        onClick: refreshChannel(integration),
        'data-tooltip-id': 'tooltip',
        'data-tooltip-content': t(
          'channel_disconnected_click_to_reconnect',
          'Channel disconnected, click to reconnect.'
        ),
      })}
      className={clsx(
        'flex gap-[12px] items-center bg-surface border border-hairline rounded-control ps-[8px] pe-[12px] py-[8px] group/profile transition-colors duration-state ease-state hover:bg-surfaceHover',
        integration.refreshNeeded && 'cursor-pointer'
      )}
    >
      <div
        className={clsx(
          'relative gap-[8px] flex justify-center items-center',
          integration.disabled && 'opacity-50'
        )}
      >
        {(integration.inBetweenSteps || integration.refreshNeeded) && (
          <div
            className="absolute start-0 top-0 w-[36px] h-[36px] cursor-pointer"
            onClick={
              integration.refreshNeeded
                ? refreshChannel(integration)
                : continueIntegration(integration)
            }
          >
            <div className="bg-criticalTint text-critical border border-criticalBorder w-[16px] h-[16px] rounded-pill start-[4px] top-[4px] absolute z-[200] t-caption flex justify-center items-center">
              !
            </div>
            <div className="bg-scrim w-[36px] h-[36px] start-0 top-0 absolute rounded-control z-[199]" />
          </div>
        )}
        <ImageWithFallback
          fallbackSrc={'/no-picture.jpg'}
          src={integration.picture || '/no-picture.jpg'}
          className="rounded-control min-w-[36px] min-h-[36px]"
          alt={integration.name}
          width={36}
          height={36}
        />
        <PlatformGlyph
          identifier={integration.identifier}
          className="absolute z-10 bottom-0 -end-[4px] text-ink"
        />
      </div>
      <div
        className={clsx(
          'flex-1 min-w-0 whitespace-nowrap text-ellipsis overflow-hidden t-control text-ink',
          integration.disabled && 'opacity-50'
        )}
      >
        {integration.name}
      </div>
      <Menu
        refreshChannel={refreshChannel}
        mutate={mutate}
        onChange={update}
        id={integration.id}
        canEnable={integration.disabled}
        canDisable={!integration.disabled}
      />
    </div>
  );
};

/**
 * The first paint of /queue.
 *
 * It draws the shape the screen is about to have — channel row, toolbar, week
 * grid — because the screen the user asked for has a shape, and showing that
 * shape is more honest and less jarring than a spinner alone on the canvas. The
 * grid is the real 96px-gutter, hairline-separated week grid with nothing in the
 * cells: no placeholder ever occupies a cell, so an empty queue cannot be
 * mistaken for a full one.
 */
const LaunchesSkeleton = () => {
  const t = useT();
  return (
    <SkeletonRegion
      label={t('loading_queue', 'Loading your queue')}
      className="flex flex-1 min-w-0"
    >
      <div className="bg-canvas flex-1 flex flex-col p-[24px] gap-[24px] min-w-0">
        <div className="flex items-center gap-[12px]">
          <Skeleton className="h-[54px] w-[240px] rounded-control" />
          <div className="flex-1" />
          <Skeleton className="h-control w-[128px] rounded-control" />
          <Skeleton className="h-large w-[128px] rounded-thumb" />
        </div>
        <div className="flex items-center gap-[8px]">
          <Skeleton className="h-large w-[280px] rounded-control" />
          <Skeleton className="h-large w-[72px] rounded-control" />
          <div className="flex-1" />
          <Skeleton className="h-control w-[200px] rounded-control" />
          <Skeleton className="h-control w-[72px] rounded-control" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="grid [grid-template-columns:96px_repeat(7,_minmax(0,_1fr))] gap-0">
            <div className="h-[64px] bg-surfaceSunken border-b border-e border-hairline" />
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <div
                key={day}
                className="h-[64px] bg-surfaceSunken border-b border-hairline [&:not(:last-child)]:border-e flex flex-col items-center justify-center gap-[4px]"
              >
                <Skeleton className="h-[14px] w-[64px] rounded-thumb" />
                <Skeleton className="h-[12px] w-[40px] rounded-thumb" />
              </div>
            ))}
            {[0, 1, 2, 3, 4, 5].map((hour) => (
              <Fragment key={hour}>
                <div className="h-[96px] border-b border-e border-hairline flex items-center justify-center">
                  <Skeleton className="h-[12px] w-[40px] rounded-thumb" />
                </div>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <div
                    key={day}
                    className="h-[96px] border-b border-e border-hairline"
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
};

export const LaunchesComponent = () => {
  const fetch = useFetch();
  const router = useRouter();
  const search = useSearchParams();
  const toast = useToaster();
  const t = useT();
  const [reload, setReload] = useState(false);
  const {
    isLoading,
    error: integrationsError,
    data: integrations,
    mutate,
  } = useIntegrationList();

  const sortedIntegrations = useMemo(() => {
    return orderBy(
      integrations,
      ['type', 'disabled', 'identifier'],
      ['desc', 'asc', 'asc']
    );
  }, [integrations]);
  const update = useCallback(async (shouldReload: boolean) => {
    if (shouldReload) {
      setReload(true);
    }
    await mutate();
    if (shouldReload) {
      setReload(false);
    }
  }, []);
  const addProvider = useAddProvider(() => update(true));
  const continueIntegration = useCallback(
    (integration: any) => async () => {
      router.push(
        `/launches?added=${integration.identifier}&continue=${integration.id}`
      );
    },
    []
  );
  const refreshChannel = useCallback(
    (
        integration: Integration & {
          identifier: string;
        }
      ) =>
      async () => {
        const { url } = await (
          await fetch(
            `/integrations/social/${integration.identifier}?refresh=${integration.internalId}`,
            {
              method: 'GET',
            }
          )
        ).json();
        window.location.href = url;
      },
    []
  );
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (search.get('msg')) {
      toast.show(search.get('msg')!, 'success');
      window?.opener?.postMessage(
        {
          msg: search.get('msg')!,
          success: false,
        },
        '*'
      );
    }
    if (search.get('added')) {
      window?.opener?.postMessage(
        {
          msg: t('channel_added', 'Channel added'),
          success: true,
        },
        '*'
      );
    }
    if (window.opener) {
      window.close();
    }
  }, []);
  if (isLoading || reload) {
    return <LaunchesSkeleton />;
  }

  // The channel list is the spine of this screen — the queue, the composer and
  // the channel row all read from it — so a failure here replaces the screen
  // rather than leaving a half-drawn one. It is also the one failure that must
  // not be mistaken for "you have no channels", which is why it never falls
  // through to the empty state below. It does step aside when a *reload* fails
  // and the previous list is still in hand: the channel is on screen and usable,
  // and swapping a working screen for an apology would be the worse trade.
  if (integrationsError && !integrations?.length) {
    return (
      <div className="bg-canvas p-[24px] flex flex-1 items-center justify-center">
        <ErrorState
          title={t('channels_failed_title', 'We could not load your channel')}
          body={t(
            'channels_failed_body',
            'Your channel and its queue are safe — this screen just could not reach them. Try again in a moment.'
          )}
          onRetry={() => update(true)}
        />
      </div>
    );
  }

  // @ts-ignore
  return (
    <DNDProvider>
      <Onboarding />
      <CalendarWeekProvider integrations={sortedIntegrations}>
        {/* One column. The 240px rail this screen used to open with was a
            multi-channel agency device — per-customer groups, drag-to-group,
            a collapse toggle and an `h2` reading "channels" — for a product
            that holds one channel. The channel is now a row in the screen's
            own header, next to the action that uses it, and the queue gets
            the full 1280px column. */}
        <div className="bg-canvas flex-1 flex-col flex p-[24px] gap-[24px] min-w-0">
          {sortedIntegrations.length > 0 && (
            <div className="flex items-center gap-[12px] flex-wrap">
              <div className="flex items-center gap-[8px] min-w-0">
                {sortedIntegrations.map((integration) => (
                  <ChannelRow
                    key={integration.id}
                    integration={integration}
                    mutate={mutate}
                    continueIntegration={continueIntegration}
                    update={update}
                    refreshChannel={refreshChannel}
                  />
                ))}
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-[8px] shrink-0">
                <AddProviderButton update={() => update(true)} />
                <NewPost />
              </div>
            </div>
          )}
          {/* With no channel there is nothing to navigate: the date range, the
              range tabs and the layout tabs all describe a queue that cannot
              hold a post yet, so the toolbar stays out of the way until the
              connection exists. */}
          {sortedIntegrations.length > 0 && <Filters />}
          <div className="flex-1 flex">
            {sortedIntegrations.length === 0 ? (
              <EmptyState
                className="m-auto"
                title={t(
                  'connect_your_tiktok_channel',
                  'Connect your TikTok channel'
                )}
                body={t(
                  'connect_your_tiktok_channel_body',
                  'One channel, every post on time. Connect TikTok and this becomes your queue — you will see exactly what goes out next.'
                )}
                action={
                  <Button onClick={addProvider}>
                    {t('connect_tiktok', 'Connect TikTok')}
                  </Button>
                }
              />
            ) : (
              <Calendar />
            )}
          </div>
          <div className="t-secondary text-inkTertiary tabular text-end">
            {process.env.NEXT_PUBLIC_VERSION
              ? process.env.NEXT_PUBLIC_VERSION
              : ''}
          </div>
        </div>
      </CalendarWeekProvider>
    </DNDProvider>
  );
};
