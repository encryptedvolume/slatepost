'use client';

import React, {
  FC,
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CalendarContext,
  Integrations,
  useCalendar,
} from '@gitroom/frontend/components/launches/calendar.context';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/he';
import 'dayjs/locale/ru';
import 'dayjs/locale/zh';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';
import 'dayjs/locale/pt';
import 'dayjs/locale/de';
import 'dayjs/locale/it';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/ar';
import 'dayjs/locale/tr';
import 'dayjs/locale/vi';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import clsx from 'clsx';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { ExistingDataContextProvider } from '@gitroom/frontend/components/launches/helpers/use.existing.data';
import { useDrag, useDrop } from 'react-dnd';
import { Integration, Post, State, Tags } from '@prisma/client';
import { useAddProvider } from '@gitroom/frontend/components/launches/add.provider.component';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { groupBy, random, sortBy } from 'lodash';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { extend } from 'dayjs';
import { isUSCitizen } from './helpers/isuscitizen.utils';
import { useInterval } from '@mantine/hooks';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import i18next from 'i18next';
import { AddEditModal } from '@gitroom/frontend/components/new-launch/add.edit.modal';
import { CreationMethodBadge } from '@gitroom/frontend/components/launches/creation.method.badge';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { PlatformGlyph } from '@gitroom/frontend/components/ui/platform.glyph';
import copy from 'copy-to-clipboard';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import { newDayjs } from '@gitroom/frontend/components/layout/set.timezone';
import { Button } from '@gitroom/react/form/button';
import {
  EmptyState,
  ErrorState,
} from '@gitroom/frontend/components/ui/state.notice';
import {
  Skeleton,
  SkeletonRegion,
} from '@gitroom/frontend/components/ui/skeleton';

// Extend dayjs with necessary plugins
extend(isSameOrAfter);
extend(isSameOrBefore);
extend(localizedFormat);

// Initialize language
const updateDayjsLocale = () => {
  const currentLanguage = i18next.resolvedLanguage || 'en';
  dayjs.locale(currentLanguage);
};

// Set dayjs locale whenever i18next language changes
i18next.on('languageChanged', () => {
  updateDayjsLocale();
});

// Initial setup
updateDayjsLocale();

const convertTimeFormatBasedOnLocality = (time: number) => {
  if (isUSCitizen()) {
    return `${time === 12 ? 12 : time % 12}:00 ${time >= 12 ? 'PM' : 'AM'}`;
  } else {
    return `${time}:00`;
  }
};

export const hours = Array.from(
  {
    length: 24,
  },
  (_, i) => i
);

// Shared hook for post actions (edit, duplicate, delete)
const usePostActions = (onMutate?: () => void) => {
  const t = useT();
  const fetch = useFetch();
  const modal = useModals();
  const toaster = useToaster();
  const { integrations, reloadCalendarView } = useCalendar();

  const mutate = useCallback(() => {
    reloadCalendarView();
    onMutate?.();
  }, [reloadCalendarView, onMutate]);

  const editPost = useCallback(
    (loadPost: any, isDuplicate?: boolean) => async () => {
      const post = {
        ...loadPost,
        publishDate: loadPost.actualDate || loadPost.publishDate,
      };

      // Opening the composer needs the post it is going to edit. When that
      // request fails the click used to do nothing at all — the row simply did
      // not respond — so the failure is reported and the post stays as it is.
      const groupResponse = await fetch(`/posts/group/${post.group}`);

      if (!groupResponse.ok) {
        toaster.show(
          t(
            'post_open_failed',
            'We could not open this post. Nothing has changed — try again in a moment.'
          ),
          'warning'
        );
        return;
      }

      const data = await groupResponse.json();
      const date = !isDuplicate
        ? null
        : (await (await fetch('/posts/find-slot')).json())?.date;
      const publishDate = dayjs
        .utc(date || data.posts[0].publishDate)
        .local();
      const ExistingData = !isDuplicate
        ? ExistingDataContextProvider
        : Fragment;
      modal.openModal({
        id: 'add-edit-modal',
        closeOnClickOutside: false,
        removeLayout: true,
        closeOnEscape: false,
        withCloseButton: false,
        askClose: true,
        fullScreen: true,
        classNames: {
          modal: 'w-[100%] max-w-[1400px] text-ink',
        },
        children: (
          <ExistingData value={data}>
            <AddEditModal
              {...(isDuplicate
                ? {
                    onlyValues: data.posts.map(
                      ({ image, settings, content }: any) => ({
                        image,
                        settings,
                        content,
                      })
                    ),
                  }
                : {})}
              allIntegrations={integrations.map((p) => ({ ...p }))}
              reopenModal={editPost(post)}
              mutate={mutate}
              integrations={
                isDuplicate
                  ? integrations
                  : integrations
                      .slice(0)
                      .filter((f) => f.id === data.integration)
                      .map((p) => ({
                        ...p,
                        picture: data.integrationPicture,
                      }))
              }
              date={publishDate}
            />
          </ExistingData>
        ),
        size: '80%',
        title: ``,
      });
    },
    [integrations, fetch, modal, mutate]
  );

  const copyDebugJson = useCallback(
    (post: any) => () => {
      modal.openModal({
        title: t('copy_debug_json', 'Copy Debug JSON'),
        closeOnClickOutside: true,
        closeOnEscape: true,
        withCloseButton: true,
        classNames: {
          modal: 'w-[100%] max-w-[500px]',
        },
        children: <DebugJsonModal post={post} />,
      });
    },
    [modal, t]
  );

  const deletePost = useCallback(
    (post: any) => async () => {
      if (
        !(await deleteDialog(
          t(
            'are_you_sure_you_want_to_delete_post',
            'Are you sure you want to delete post?'
          )
        ))
      ) {
        return;
      }

      // A refused delete used to report success, the calendar refreshed, and the
      // post reappeared with no explanation for why it came back.
      const deleted = await fetch(`/posts/${post.group}`, {
        method: 'DELETE',
      });

      if (!deleted.ok) {
        toaster.show(
          t(
            'post_delete_failed',
            'We could not delete this post. It is still scheduled — try again in a moment.'
          ),
          'warning'
        );
        return;
      }

      toaster.show(
        t('post_deleted_successfully', 'Post deleted successfully'),
        'success'
      );

      mutate();
    },
    [toaster, t, fetch, mutate]
  );

  return { editPost, deletePost, copyDebugJson };
};

/**
 * Opens the composer on the next free slot the backend offers.
 *
 * This exists so an empty state can carry a real next action instead of only
 * describing one. It is the same modal the calendar cells and the rail button
 * open, minus the date the cell would have supplied — with nothing on the
 * calendar there is no cell to click, so the slot comes from `/posts/find-slot`.
 */
const useScheduleNextSlot = () => {
  const fetch = useFetch();
  const modal = useModals();
  const toaster = useToaster();
  const t = useT();
  const { integrations, reloadCalendarView } = useCalendar();

  return useCallback(async () => {
    // This is the button an empty state offers, so it is the last place that can
    // afford to do nothing when it is pressed.
    const slotResponse = await fetch('/posts/find-slot');

    if (!slotResponse.ok) {
      toaster.show(
        t(
          'find_slot_failed',
          'We could not work out the next free slot. Try again in a moment.'
        ),
        'warning'
      );
      return;
    }

    const { date } = await slotResponse.json();

    modal.openModal({
      id: 'add-edit-modal',
      closeOnClickOutside: false,
      removeLayout: true,
      closeOnEscape: false,
      withCloseButton: false,
      askClose: true,
      fullScreen: true,
      classNames: {
        modal: 'w-[100%] max-w-[1400px] text-ink',
      },
      children: (
        <AddEditModal
          allIntegrations={integrations.map((p) => ({ ...p }))}
          integrations={integrations.map((p) => ({ ...p }))}
          mutate={reloadCalendarView}
          date={dayjs.utc(date).local()}
          reopenModal={() => ({})}
        />
      ),
      size: '80%',
    });
  }, [integrations, reloadCalendarView]);
};

export const DayView = () => {
  const calendar = useCalendar();
  const { integrations, posts, startDate } = calendar;

  // Set dayjs locale based on current language
  const currentLanguage = i18next.resolvedLanguage || 'en';
  dayjs.locale(currentLanguage);

  const currentDay = dayjs.utc(startDate);

  const options = useMemo(() => {
    const createdPosts = posts.map((post) => ({
      integration: [integrations.find((i) => i.id === post.integration.id)!],
      image: post?.integration?.picture || '',
      identifier: post?.integration?.providerIdentifier || '',
      id: post?.integration?.id || '',
      name: post?.integration?.name || '',
      time: dayjs
        .utc(post.publishDate)
        .diff(dayjs.utc(post.publishDate).startOf('day'), 'minute'),
    }));
    return sortBy(
      Object.values(
        groupBy(
          [
            ...createdPosts,
            ...integrations.flatMap((p) =>
              p.time.flatMap((t) => ({
                integration: p,
                identifier: p?.identifier,
                name: p?.name,
                id: p?.id,
                image: p?.picture,
                time: t?.time,
              }))
            ),
          ],
          (p: any) => p.time
        )
      ),
      (p) => p[0].time
    );
  }, [integrations, posts]);

  return (
    <div className="flex flex-col gap-[8px] flex-1 relative">
      <div className="absolute start-0 top-0 w-full h-full flex flex-col overflow-auto scrollbar scrollbar-thumb-lineStrong scrollbar-track-transparent">
        {options.map((option) => (
          <Fragment key={option[0].time}>
            {/* Times take tabular figures so the column does not jitter. */}
            <div className="text-center t-secondary tabular text-inkSecondary min-h-[24px]">
              {newDayjs()
                .utc()
                .startOf('day')
                .add(option[0].time, 'minute')
                .local()
                .format(isUSCitizen() ? 'hh:mm A' : 'LT')}
            </div>
            <div
              key={option[0].time}
              className="min-h-[64px] rounded-none flex justify-center items-center gap-[8px] mb-[24px]"
            >
              <CalendarContext.Provider
                value={{
                  ...calendar,
                  integrations: option.flatMap((p) => p.integration),
                }}
              >
                <CalendarColumn
                  getDate={currentDay
                    .startOf('day')
                    .add(option[0].time, 'minute')
                    .local()}
                />
              </CalendarContext.Provider>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
export const WeekView = () => {
  const { startDate, endDate } = useCalendar();
  const t = useT();

  // Use dayjs to get localized day names
  const localizedDays = useMemo(() => {
    const currentLanguage = i18next.resolvedLanguage || 'en';
    dayjs.locale(currentLanguage);

    const days = [];
    const weekStart = newDayjs(startDate);
    for (let i = 0; i < 7; i++) {
      const day = weekStart.add(i, 'day');
      days.push({
        name: day.format('dddd'),
        day: day.format('L'),
        date: day,
      });
    }
    return days;
  }, [i18next.resolvedLanguage, startDate]);

  return (
    <div className="flex flex-col text-ink flex-1">
      <div className="flex-1 relative">
        {/* The calendar is a grid, not a card grid: radius 0, gap 0, and every
            cell separated by a 1px hairline. No shadow, forever. The gutter is
            96px — a spacing token — rather than the old 136. */}
        <div className="grid [grid-template-columns:96px_repeat(7,_minmax(0,_1fr))] gap-0 rounded-none absolute h-full start-0 top-0 w-full overflow-auto scrollbar scrollbar-thumb-lineStrong scrollbar-track-transparent">
          <div className="z-10 bg-surfaceSunken flex justify-center items-center flex-col h-[64px] rounded-none border-b border-e border-hairline sticky top-0"></div>
          {localizedDays.map((day, index) => (
            <div
              key={day.name}
              className="px-[8px] text-center bg-surfaceSunken flex justify-center items-center flex-col gap-[4px] h-[64px] rounded-none border-b border-hairline [&:not(:last-child)]:border-e sticky top-0 z-[20]"
            >
              <div className="t-control text-inkSecondary">{day.name}</div>
              {/* Calendar day numbers are the caption token, tabular. */}
              <div className="t-caption tabular flex items-center justify-center gap-[4px] text-ink">
                {day.day === newDayjs().format('L') && (
                  /* One of the four sanctioned uses of Signal Amber: the 6px
                     scheduled/queued/now dot. */
                  <div className="w-[6px] h-[6px] bg-accent rounded-pill" />
                )}
                {day.day}
              </div>
            </div>
          ))}
          {hours.map((hour) => (
            <Fragment key={hour}>
              <div className="px-[8px] text-center items-center justify-center flex t-secondary tabular text-inkSecondary border-b border-e border-hairline">
                {convertTimeFormatBasedOnLocality(hour)}
              </div>
              {localizedDays.map((day, indexDay) => (
                <Fragment
                  key={`${startDate}-${day.date.format('YYYY-MM-DD')}-${hour}`}
                >
                  <div className="relative border-b border-e border-hairline">
                    <CalendarColumn
                      getDate={day.date.hour(hour).startOf('hour')}
                    />
                  </div>
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
export const MonthView = () => {
  const { startDate } = useCalendar();
  const t = useT();

  // Use dayjs to get localized day names
  const localizedDays = useMemo(() => {
    const currentLanguage = i18next.resolvedLanguage || 'en';
    dayjs.locale(currentLanguage);

    const days = [];
    // Starting from Monday (1) to Sunday (7)
    for (let i = 1; i <= 7; i++) {
      days.push(newDayjs().day(i).format('dddd'));
    }
    return days;
  }, [i18next.resolvedLanguage]);

  const calendarDays = useMemo(() => {
    const monthStart = newDayjs(startDate);
    const currentMonth = monthStart.month();
    const currentYear = monthStart.year();

    const startOfMonth = newDayjs(new Date(currentYear, currentMonth, 1));

    // Calculate the day offset for Monday (isoWeekday() returns 1 for Monday)
    const startDayOfWeek = startOfMonth.isoWeekday(); // 1 for Monday, 7 for Sunday
    const daysBeforeMonth = startDayOfWeek - 1; // Days to show from the previous month

    // Get the start date (Monday of the first week that includes this month)
    const calendarStartDate = startOfMonth.subtract(daysBeforeMonth, 'day');

    // Create an array to hold the calendar days (6 weeks * 7 days = 42 days max)
    const calendarDays = [];
    let currentDay = calendarStartDate;
    for (let i = 0; i < 42; i++) {
      let label = 'current-month';
      if (currentDay.month() < currentMonth) label = 'previous-month';
      if (currentDay.month() > currentMonth) label = 'next-month';
      calendarDays.push({
        day: currentDay,
        label,
      });

      // Move to the next day
      currentDay = currentDay.add(1, 'day');
    }
    return calendarDays;
  }, [startDate]);

  return (
    <div className="flex flex-col text-ink flex-1">
      <div className="flex-1 flex relative">
        <div className="grid grid-cols-7 grid-rows-[64px_auto] gap-0 rounded-none absolute start-0 top-0 overflow-auto w-full h-full scrollbar scrollbar-thumb-lineStrong scrollbar-track-transparent">
          {localizedDays.map((day) => (
            <div
              key={day}
              className="z-[20] px-[8px] bg-surfaceSunken flex justify-center items-center flex-col h-[64px] rounded-none border-b border-e border-hairline sticky top-0"
            >
              <div className="t-control text-inkSecondary">{day}</div>
            </div>
          ))}
          {calendarDays.map((date, index) => (
            <div
              key={index}
              className="text-center items-center justify-center flex border-b border-e border-hairline"
            >
              <CalendarColumn
                getDate={newDayjs(date.day).endOf('day')}
                randomHour={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export const ListView = () => {
  const t = useT();
  const user = useUser();
  const { integrations, loading, listPosts, listState } = useCalendar();
  const scheduleNextSlot = useScheduleNextSlot();
  const addProvider = useAddProvider();

  // The empty state is written per filter, because "No posts" under the Draft
  // tab and "No posts" under the Published tab are different facts about the
  // account and only one of them is worth acting on in the same way.
  const empty = useMemo(() => {
    if (listState === 'scheduled') {
      return {
        title: t('no_upcoming_posts', 'Nothing scheduled'),
        body: t(
          'no_upcoming_posts_body',
          'No post is waiting to go out. Schedule one and it shows up here with the exact time it publishes.'
        ),
      };
    }
    if (listState === 'draft') {
      return {
        title: t('no_draft_posts', 'No drafts'),
        body: t(
          'no_draft_posts_body',
          'A draft is a post you have written but not scheduled. Start one and it waits here until you pick a time.'
        ),
      };
    }
    if (listState === 'published') {
      return {
        title: t('no_published_posts', 'Nothing published yet'),
        body: t(
          'no_published_posts_body',
          'Posts move here once TikTok confirms they went out.'
        ),
      };
    }
    return {
      title: t('no_posts', 'Your queue is empty'),
      body: t(
        'no_posts_body',
        'Every post you schedule is listed here, with the time it goes out. Write the first one to fill the queue.'
      ),
    };
  }, [listState, t]);

  // Use shared post actions hook
  const { editPost, deletePost, copyDebugJson } = usePostActions();

  // Group posts by date
  const groupedPosts = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    listPosts.forEach((post) => {
      const dateKey = newDayjs(post.publishDate).local().format('YYYY-MM-DD');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(post);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [listPosts]);

  // Placeholders in the shape of the list that is coming — two date groups of
  // three rows — rather than a spinner in the middle of an empty column.
  if (loading) {
    return (
      <SkeletonRegion
        label={t('loading_posts', 'Loading your posts')}
        className="flex flex-col gap-[8px] flex-1 relative"
      >
        <div className="absolute start-0 top-0 w-full h-full flex flex-col overflow-hidden">
          {[0, 1].map((group) => (
            <Fragment key={group}>
              <div className="flex justify-center min-h-[24px] mt-[8px]">
                <Skeleton className="h-[18px] w-[200px] rounded-thumb" />
              </div>
              <div className="flex flex-col gap-[8px] mb-[24px] px-[8px] mt-[8px]">
                {[0, 1, 2].map((row) => (
                  <Skeleton key={row} className="h-[84px] w-full rounded-none" />
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </SkeletonRegion>
    );
  }

  if (listPosts.length === 0) {
    // No channel is the more fundamental emptiness: scheduling is not reachable
    // until one is connected, so that is the action the state offers.
    return integrations.length === 0 ? (
      <EmptyState
        className="flex-1"
        title={t('no_channel_connected', 'No channel connected')}
        body={t(
          'no_channel_connected_body',
          'Slate posts to one TikTok channel. Connect it and your queue starts here.'
        )}
        action={
          <Button onClick={addProvider}>
            {t('connect_tiktok', 'Connect TikTok')}
          </Button>
        }
      />
    ) : (
      <EmptyState
        className="flex-1"
        title={empty.title}
        body={empty.body}
        action={
          <Button onClick={scheduleNextSlot}>
            {t('create_new_post', 'Create Post')}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-[8px] flex-1 relative">
      <div className="absolute start-0 top-0 w-full h-full flex flex-col overflow-auto scrollbar scrollbar-thumb-lineStrong scrollbar-track-transparent">
        {groupedPosts.map(([dateKey, datePosts]) => (
          <Fragment key={dateKey}>
            <div className="text-center t-body-emphasis tabular min-h-[24px] text-ink mt-[8px]">
              {newDayjs(dateKey).format(isUSCitizen() ? 'dddd, MMMM D, YYYY' : 'dddd, D MMMM YYYY')}
            </div>
            <div className="flex flex-col gap-[8px] mb-[24px] px-[8px]">
              {datePosts.map((post) => (
                <CalendarItem
                  key={post.id}
                  display="day"
                  isBeforeNow={false}
                  date={newDayjs(post.publishDate)}
                  state={post.state}
                  editPost={editPost(post, false)}
                  duplicatePost={editPost(post, true)}
                  copyDebugJson={user?.isSuperAdmin ? copyDebugJson(post) : undefined}
                  post={post}
                  integrations={integrations}
                  deletePost={deletePost(post)}
                  showTime={true}
                />
              ))}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export const Calendar = () => {
  const { display, loading, posts, loadError, reloadCalendarView } =
    useCalendar();
  const t = useT();

  // The grid views have no row to be empty — they are a scaffold of hours, and
  // a scaffold with nothing in it is indistinguishable from one that has not
  // finished loading. So the two are said out loud, in the same spot, in one
  // line each: the wait as a status, the emptiness as a nudge at the slot the
  // user is meant to click. Neither ever occupies a cell.
  const rangeIsEmpty = useMemo(() => {
    if (display === 'day') {
      return t('nothing_scheduled_today', 'Nothing scheduled today');
    }
    if (display === 'month') {
      return t('nothing_scheduled_month', 'Nothing scheduled this month');
    }
    return t('nothing_scheduled_week', 'Nothing scheduled this week');
  }, [display, t]);

  // One failure state for all four views: the request behind them is the same
  // one, and a grid drawn with no posts in it would read as "nothing is
  // scheduled", which is the one thing it must never say by accident.
  if (loadError) {
    return (
      <ErrorState
        className="m-auto"
        title={t('calendar_failed_title', 'We could not load your posts')}
        body={t(
          'calendar_failed_body',
          'The queue is still there — this screen just could not reach it. Try again in a moment.'
        )}
        onRetry={reloadCalendarView}
      />
    );
  }

  return (
    <div className="flex flex-1 relative min-w-0">
      {display !== 'list' && loading && (
        <div
          role="status"
          aria-busy="true"
          aria-live="polite"
          className="absolute start-[50%] -translate-x-[50%] top-[50%] -translate-y-[50%] z-[60] pointer-events-none px-[12px] h-compact flex items-center rounded-pill bg-surfaceOverlay border border-line t-secondary text-inkSecondary"
        >
          {t('loading_posts', 'Loading your posts')}
        </div>
      )}
      {display !== 'list' && !loading && !posts.length && (
        <div className="absolute start-[50%] -translate-x-[50%] top-[50%] -translate-y-[50%] z-[60] pointer-events-none px-[16px] py-[8px] max-w-[320px] text-center rounded-card bg-surfaceOverlay border border-line">
          <div className="t-body-emphasis text-ink">{rangeIsEmpty}</div>
          <div className="t-secondary text-inkSecondary">
            {t(
              'nothing_scheduled_hint',
              'Pick any slot in the grid to write a post for that time.'
            )}
          </div>
        </div>
      )}
      {display === 'list' ? (
        <ListView />
      ) : display === 'day' ? (
        <DayView />
      ) : display === 'week' ? (
        <WeekView />
      ) : (
        <MonthView />
      )}
    </div>
  );
};
export const CalendarColumn: FC<{
  getDate: dayjs.Dayjs;
  randomHour?: boolean;
}> = memo((props) => {
  const t = useT();

  const { getDate, randomHour } = props;
  const [num, setNum] = useState(0);
  const user = useUser();
  const {
    integrations,
    posts,
    changeDate,
    display,
    reloadCalendarView,
    sets,
    signature,
  } = useCalendar();
  const modal = useModals();
  const fetch = useFetch();
  const toaster = useToaster();

  // Use shared post actions hook
  const { editPost, deletePost, copyDebugJson } = usePostActions();
  const postList = useMemo(() => {
    return posts.filter((post) => {
      const pList = dayjs.utc(post.publishDate).local();
      const check =
        display === 'day'
          ? pList.format('YYYY-MM-DD HH:mm') ===
            getDate.format('YYYY-MM-DD HH:mm')
          : display === 'week'
          ? pList.isSameOrAfter(getDate.startOf('hour')) &&
            pList.isBefore(getDate.endOf('hour'))
          : pList.format('DD/MM/YYYY') === getDate.format('DD/MM/YYYY');
      return check;
    });
  }, [posts, display, getDate]);
  const [showAll, setShowAll] = useState(false);
  const showAllFunc = useCallback(() => {
    setShowAll(true);
  }, []);
  const showLessFunc = useCallback(() => {
    setShowAll(false);
  }, []);
  const list = useMemo(() => {
    if (showAll) {
      return postList;
    }
    return postList.slice(0, 3);
  }, [postList, showAll]);

  const isBeforeNow = useMemo(() => {
    const originalUtc = getDate.startOf('hour');
    return originalUtc
      .startOf('hour')
      .isBefore(newDayjs().startOf('hour').utc());
  }, [getDate, num]);

  // The "now" rule is drawn only in the hour cell that currently contains the
  // clock, and only in the two hour-resolution views. `num` ticks every couple
  // of minutes, which is what re-positions it.
  const isNowColumn = useMemo(() => {
    if (display !== 'week' && display !== 'day') {
      return false;
    }
    return getDate.local().isSame(newDayjs().local(), 'hour');
  }, [getDate, display, num]);

  const nowOffsetPercent = useMemo(
    () => (newDayjs().local().minute() / 60) * 100,
    [num]
  );

  const { start, stop } = useInterval(
    useCallback(() => {
      if (isBeforeNow) {
        return;
      }
      setNum(num + 1);
    }, [isBeforeNow]),
    random(120000, 150000)
  );

  useEffect(() => {
    start();
    return () => {
      stop();
    };
  }, []);
  const [{ canDrop }, drop] = useDrop(() => ({
    accept: 'post',
    drop: async (item: any) => {
      if (isBeforeNow) return;

      // Find the post to check its state
      const post = posts.find((p) => p.id === item.id);
      let action: 'schedule' | 'update' = 'schedule';

      // Check if post is already published or queued in the past
      if (
        post &&
        (post.state === 'PUBLISHED' ||
          (post.state === 'QUEUE' && dayjs().isAfter(dayjs.utc(post.publishDate))))
      ) {
        const whatToDo = await new Promise<'schedule' | 'update' | 'cancel'>(
          (resolve) => {
            modal.openModal({
              title: t('what_do_you_want_to_do', 'What do you want to do?'),
              children: (
                <div className="flex flex-col">
                  <div className="t-title-3 mb-[24px]">
                    {t(
                      'post_already_published_drag',
                      'This post was already published, what do you want to do?'
                    )}
                  </div>
                  <div className="flex w-full gap-[8px]">
                    <div className="flex-1 flex">
                      <Button
                        type="button"
                        className="flex-1"
                        onClick={() => {
                          modal.closeAll();
                          resolve('update');
                        }}
                      >
                        {t('just_update_post_details', 'Just update the post details')}
                      </Button>
                    </div>
                    <div className="flex-1 flex">
                      <Button
                        type="button"
                        className="flex-1"
                        onClick={() => {
                          modal.closeAll();
                          resolve('schedule');
                        }}
                      >
                        {t('reschedule_post', 'Reschedule the post')}
                      </Button>
                    </div>
                  </div>
                </div>
              ),
              onClose: () => resolve('cancel'),
            });
          }
        );

        if (whatToDo === 'cancel') {
          return;
        }
        action = whatToDo;
      }

      if (!item.interval) {
        changeDate(item.id, getDate);
      }
      const response = await fetch(`/posts/${item.id}/date`, {
        method: 'PUT',
        body: JSON.stringify({
          date: getDate.utc().format('YYYY-MM-DDTHH:mm:ss'),
          action,
        }),
      });

      // The card is moved optimistically, so a refused reschedule leaves the
      // post drawn at a time it is not going out at. Reloading puts it back
      // where the server says it is, and the sentence explains why it jumped.
      if (!response.ok) {
        toaster.show(
          t(
            'reschedule_failed',
            'We could not move this post. It still goes out at its original time.'
          ),
          'warning'
        );
        reloadCalendarView();
        return;
      }

      if (item.interval || action === 'schedule') {
        reloadCalendarView();
      }
    },
    collect: (monitor) => ({
      canDrop: isBeforeNow ? false : !!monitor.canDrop() && !!monitor.isOver(),
    }),
  }), [posts]);

  const addModal = useCallback(async () => {
    const set: any = !sets.length
      ? undefined
      : await new Promise((resolve) => {
          modal.openModal({
            title: t('select_set', 'Select a Set'),
            closeOnClickOutside: true,
            askClose: false,
            closeOnEscape: true,
            withCloseButton: true,
            onClose: () => resolve('exit'),
            children: (
              <SetSelectionModal
                sets={sets}
                onSelect={(selectedSet) => {
                  resolve(selectedSet);
                  modal.closeAll();
                }}
                onContinueWithoutSet={() => {
                  resolve(undefined);
                  modal.closeAll();
                }}
              />
            ),
          });
        });

    if (set === 'exit') return;

    modal.openModal({
      id: 'add-edit-modal',
      closeOnClickOutside: false,
      removeLayout: true,
      closeOnEscape: false,
      withCloseButton: false,
      askClose: true,
      fullScreen: true,
      classNames: {
        modal: 'w-[100%] max-w-[1400px] text-ink',
      },
      children: (
        <AddEditModal
          allIntegrations={integrations.map((p) => ({
            ...p,
          }))}
          integrations={integrations.slice(0).map((p) => ({
            ...p,
          }))}
          mutate={reloadCalendarView}
          {...(signature?.id && !set
            ? {
                onlyValues: [
                  {
                    content: '\n' + signature.content,
                  },
                ],
              }
            : {})}
          date={
            randomHour
              ? getDate.hour(Math.floor(Math.random() * 24))
              : getDate.format('YYYY-MM-DDTHH:mm:ss') ===
                newDayjs().startOf('hour').format('YYYY-MM-DDTHH:mm:ss')
              ? newDayjs().add(10, 'minute')
              : getDate
          }
          {...(set?.content ? { set: JSON.parse(set.content) } : {})}
          reopenModal={() => ({})}
        />
      ),
      size: '80%',
    });
  }, [integrations, getDate, sets, signature]);

  const addProvider = useAddProvider();
  return (
    <div
      className={clsx(
        'flex flex-col w-full min-h-full relative',
        isBeforeNow && 'repeated-strip',
        isBeforeNow ? 'cursor-not-allowed' : 'rounded-none'
      )}
      ref={drop as any}
    >
      {/* The 1px "now" rule — one of the four sanctioned uses of Signal Amber.
          It is drawn only in the cell that owns the current hour, positioned
          by the minute within it. */}
      {isNowColumn && (
        <div
          className="absolute start-0 end-0 h-[1px] bg-accent z-[30] pointer-events-none"
          style={{ top: `${nowOffsetPercent}%` }}
          aria-hidden="true"
        />
      )}
      {display === 'month' && (
        /* Calendar day numbers are the caption token, tabular. */
        <div className={clsx('pt-[8px] t-caption tabular text-inkSecondary')}>
          {getDate.date()}
        </div>
      )}
      <div
        className={clsx(
          'relative flex flex-col flex-1 rounded-none min-h-[96px]',
          // Selection/drop is surfaceActive plus a strong hairline — never a
          // coloured outline, and never the legacy purple.
          canDrop && 'border border-lineStrong bg-surfaceActive'
        )}
      >
        <div
          className={clsx(
            'flex-col t-caption pointer w-full flex scrollbar scrollbar-thumb-lineStrong scrollbar-track-transparent',
            isBeforeNow ? 'flex-1' : 'cursor-pointer',
            isBeforeNow && postList.length === 0 && 'col-calendar'
          )}
        >
          {/* No placeholder is drawn in a cell. A block in every cell of the
              grid is a calendar that looks fully booked while it loads, and
              then empties — the wait is announced once, above the grid, by
              `Calendar`. */}
          {list.map((post) => (
            <div
              key={post.id}
              className={clsx(
                'text-ink p-[4px] relative flex flex-col justify-center items-center'
              )}
            >
              <div className="relative w-full flex flex-col items-center">
                <CalendarItem
                  display={display as 'day' | 'week' | 'month'}
                  isBeforeNow={isBeforeNow}
                  date={getDate}
                  state={post.state}
                  editPost={editPost(post, false)}
                  duplicatePost={editPost(post, true)}
                  copyDebugJson={user?.isSuperAdmin ? copyDebugJson(post) : undefined}
                  post={post}
                  integrations={integrations}
                  deletePost={deletePost(post)}
                />
              </div>
            </div>
          ))}
          {!showAll && postList.length > 3 && (
            <div
              className="text-center hover:underline py-[4px] t-secondary text-inkSecondary"
              onClick={showAllFunc}
            >
              {t('show_more', '+ Show more')} ({postList.length - 3})
            </div>
          )}
          {showAll && postList.length > 3 && (
            <div
              className="text-center hover:underline py-[4px] t-secondary text-inkSecondary"
              onClick={showLessFunc}
            >
              {t('show_less', '- Show less')}
            </div>
          )}
        </div>
        {!isBeforeNow && (
          <div
            className="pb-[4px] px-[4px] flex-1 flex"
            onClick={integrations.length ? addModal : addProvider}
          >
            <div
              className={clsx(
                display === ('month' as any)
                  ? 'flex-1 min-h-large w-full'
                  : !postList.length
                  ? 'min-h-full w-full p-[4px]'
                  : 'min-h-large w-full',
                'flex items-center justify-center cursor-pointer pb-[4px]'
              )}
            >
              {display !== 'day' && (
                <div
                  className={clsx(
                    'group w-full h-full rounded-none flex justify-center items-center text-inkTertiary'
                  )}
                >
                  <div
                    className={`group-hover:before:content-["+"] flex justify-center items-center rounded-control transition-colors duration-state ease-state group-hover:bg-surfaceActive group-hover:text-ink w-full h-full max-w-[44px] max-h-large`}
                  />
                </div>
              )}
              {display === 'day' && (
                <div
                  className={`w-full h-full rounded-none py-[8px] flex-wrap hover:border hover:border-line flex justify-center items-center gap-[24px] opacity-30 grayscale hover:grayscale-0 hover:opacity-100`}
                >
                  {integrations.map((selectedIntegrations) => (
                    <div
                      className="relative"
                      key={selectedIntegrations.identifier}
                    >
                      <div
                        className={clsx(
                          'relative w-[32px] h-[32px] rounded-thumb flex justify-center items-center filter transition-opacity duration-state ease-state'
                        )}
                      >
                        <SafeImage
                          src={
                            selectedIntegrations.picture || '/no-picture.jpg'
                          }
                          className="rounded-thumb"
                          alt={selectedIntegrations.identifier}
                          width={32}
                          height={32}
                        />
                        <PlatformGlyph
                          identifier={selectedIntegrations.identifier}
                          size={20}
                          className="absolute z-10 -bottom-[4px] -end-[4px] text-ink"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
const CalendarItem: FC<{
  date: dayjs.Dayjs;
  isBeforeNow: boolean;
  editPost: () => void;
  duplicatePost: () => void;
  copyDebugJson?: () => void;
  deletePost: () => void;
  integrations: Integrations[];
  state: State;
  display: 'day' | 'week' | 'month';
  showTime?: boolean;
  post: Post & {
    integration: Integration;
    tags: {
      tag: Tags;
    }[];
  };
}> = memo((props) => {
  const t = useT();
  const {
    editPost,
    duplicatePost,
    copyDebugJson,
    post,
    date,
    isBeforeNow,
    state,
    display,
    deletePost,
    showTime,
  } = props;
  const user = useUser();
  const showCreationMethodBadge =
    user?.impersonate &&
    post.creationMethod &&
    post.creationMethod !== 'UNKNOWN';
  const preview = useCallback(() => {
    window.open(`/p/` + post.id + '?share=true', '_blank');
  }, [post]);
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: 'post',
      item: {
        id: post.id,
        interval: !!post.intervalInDays,
        date,
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0 : 1,
      }),
    }),
    []
  );
  return (
    <div
      // @ts-ignore
      ref={dragRef}
      className={clsx(
        'w-full flex h-full flex-1 flex-col group',
        'relative',
        // Error is a hairline tint, not a 2px coloured ring: a border is never
        // the critical colour and never wider than 1px.
        state === 'ERROR' && 'rounded-none border border-criticalBorder'
      )}
      style={{
        opacity,
      }}
    >
      {state === 'ERROR' && (
        <div
          className="absolute -top-[4px] -start-[4px] z-20 w-[16px] h-[16px] rounded-pill bg-criticalTint text-critical border border-criticalBorder flex items-center justify-center t-caption cursor-pointer"
          data-tooltip-id="tooltip"
          data-tooltip-content={post.error || 'An error occurred while publishing this post'}
        >
          !
        </div>
      )}
      {showCreationMethodBadge && (
        <div className="absolute -bottom-[4px] -right-[4px] z-10">
          <CreationMethodBadge
            creationMethod={post.creationMethod}
            ringColor="var(--slate-canvas)"
          />
        </div>
      )}
      {/* The chip fill is always a token surface (--slate-primary-bg). A tag's
          colour is user data and can be any hex, so it is never allowed to
          become the backdrop a label has to resolve against — it is carried by
          the 6px swatch dot below instead. */}
      <div
        className={clsx(
          'text-primaryText t-caption max-h-[24px] h-[24px] min-h-[24px] w-full rounded-none flex items-center justify-center gap-[8px] px-[8px] bg-primaryBg'
        )}
      >
        {/* The 6px scheduled/queued dot — one of the four sanctioned uses of
            Signal Amber, and the one that carries its declared meaning. It is
            the sole visual carrier of queued state, so SC 1.4.11 applies: the
            1px ring in the chip's own ink is what gives it a 3:1 boundary. */}
        {state === 'QUEUE' && (
          <div
            className="w-[6px] h-[6px] shrink-0 rounded-pill bg-accent border border-primaryText group-hover:hidden"
            data-tooltip-id="tooltip"
            data-tooltip-content="Queued"
          />
        )}
        {!!post?.tags?.[0]?.tag?.color && (
          <div
            className="w-[6px] h-[6px] shrink-0 rounded-pill group-hover:hidden"
            style={{ backgroundColor: post.tags[0].tag.color }}
          />
        )}
        <div className="group-hover:hidden cursor-pointer">
          {post.tags.map((p) => p.tag.name).join(', ')}
        </div>
        {copyDebugJson && (
          <div
            className="hidden group-hover:block hover:underline cursor-pointer"
            onClick={copyDebugJson}
          >
            <CopyDebug />
          </div>
        )}
        <div
          className="hidden group-hover:block hover:underline cursor-pointer"
          onClick={duplicatePost}
        >
          <Duplicate />
        </div>
        <div
          className="hidden group-hover:block hover:underline cursor-pointer"
          onClick={preview}
        >
          <Preview />
        </div>{' '}
        <div
          className="hidden group-hover:block hover:underline cursor-pointer"
          onClick={deletePost}
        >
          <DeletePost />
        </div>
      </div>
      <div
        onClick={editPost}
        className={clsx(
          'gap-[8px] w-full flex h-full flex-1 rounded-none p-[8px] t-secondary bg-surfaceActive',
          'relative',
          isBeforeNow && '!grayscale'
        )}
      >
        <div className={clsx('relative min-w-[20px]')}>
          <img
            className="w-[20px] h-[20px] rounded-thumb"
            src={post.integration.picture! || '/no-picture.jpg'}
          />
          <PlatformGlyph
            identifier={post.integration?.providerIdentifier}
            size={12}
            className="absolute z-10 top-[12px] end-0 text-ink"
          />
        </div>
        <div className="w-full flex-1 flex flex-col min-h-large">
          <div className="text-start">
            {state === 'DRAFT' ? t('draft', 'Draft') + ': ' : ''}
          </div>
            <div className="w-full relative">
              <div className="absolute top-0 start-0 w-full text-ellipsis break-words line-clamp-1 text-start">
                {stripHtmlValidation('none', post.content, false, true, false) ||
                  t('no_content', 'no content')}
              </div>
            </div>
        </div>
        {/* Secondary, not tertiary. The chip's backdrop is `newColColor` =
            --slate-surface-active, not --slate-surface: tertiary measures
            4.09:1 light (#737373 on #eeeeee) and 3.93:1 dark (#808080 on
            #242424), both under the 4.5:1 SC 1.4.3 floor at this 12px size.
            Secondary is 6.05:1 / 6.01:1 on the same surface. This is the
            most-read metadata in the product. */}
        {showTime && (
          <div className="text-inkSecondary t-caption tabular whitespace-nowrap flex items-center">
            {newDayjs(post.publishDate).local().format(isUSCitizen() ? 'hh:mm A' : 'HH:mm')}
          </div>
        )}
      </div>
    </div>
  );
});
const DebugJsonModal: FC<{ post: any }> = ({ post }) => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const { closeCurrent } = useModals();

  const copyPostId = useCallback(() => {
    copy(post.id);
    toaster.show(
      t('post_id_copied', 'Post ID copied to clipboard'),
      'success'
    );
    closeCurrent();
  }, [post, toaster, t, closeCurrent]);

  const copyJson = useCallback(async () => {
    try {
      const data = await (
        await fetch(`/posts/group/${post.group}/debug-export`)
      ).json();
      copy(JSON.stringify(data, null, 2));
      toaster.show(
        t('debug_json_copied', 'Debug JSON copied to clipboard'),
        'success'
      );
      closeCurrent();
    } catch {
      toaster.show(
        t('debug_json_copy_failed', 'Failed to copy debug data'),
        'warning'
      );
    }
  }, [fetch, post, toaster, t, closeCurrent]);

  return (
    <div className="flex flex-col gap-[16px] p-[16px]">
      <div className="t-body text-inkSecondary">
        {t('debug_choose_copy', 'Choose what you want to copy')}
      </div>
      <div className="flex gap-[8px]">
        <Button onClick={copyPostId}>
          {t('copy_post_id', 'Copy post id')}
        </Button>
        <Button secondary onClick={copyJson}>
          {t('copy_debug_json', 'Copy Debug JSON')}
        </Button>
      </div>
    </div>
  );
};
const CopyDebug = () => {
  const t = useT();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-tooltip-id="tooltip"
      data-tooltip-content={t('copy_debug_json', 'Copy Debug JSON')}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
};
const Duplicate = () => {
  const t = useT();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 32 32"
      fill="none"
      data-tooltip-id="tooltip"
      data-tooltip-content={t('duplicate_post', 'Duplicate Post')}
    >
      <path
        d="M27 5H9C8.46957 5 7.96086 5.21071 7.58579 5.58579C7.21071 5.96086 7 6.46957 7 7V9H5C4.46957 9 3.96086 9.21071 3.58579 9.58579C3.21071 9.96086 3 10.4696 3 11V25C3 25.5304 3.21071 26.0391 3.58579 26.4142C3.96086 26.7893 4.46957 27 5 27H23C23.5304 27 24.0391 26.7893 24.4142 26.4142C24.7893 26.0391 25 25.5304 25 25V23H27C27.5304 23 28.0391 22.7893 28.4142 22.4142C28.7893 22.0391 29 21.5304 29 21V7C29 6.46957 28.7893 5.96086 28.4142 5.58579C28.0391 5.21071 27.5304 5 27 5ZM23 11V13H5V11H23ZM23 25H5V15H23V25ZM27 21H25V11C25 10.4696 24.7893 9.96086 24.4142 9.58579C24.0391 9.21071 23.5304 9 23 9H9V7H27V21Z"
        fill="currentColor"
      />
    </svg>
  );
};
const Preview = () => {
  const t = useT();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 32 32"
      fill="none"
      data-tooltip-id="tooltip"
      data-tooltip-content={t('preview_post', 'Preview Post')}
    >
      <path
        d="M30.9137 15.595C30.87 15.4963 29.8112 13.1475 27.4575 10.7937C24.3212 7.6575 20.36 6 16 6C11.64 6 7.67874 7.6575 4.54249 10.7937C2.18874 13.1475 1.12499 15.5 1.08624 15.595C1.02938 15.7229 1 15.8613 1 16.0012C1 16.1412 1.02938 16.2796 1.08624 16.4075C1.12999 16.5062 2.18874 18.8538 4.54249 21.2075C7.67874 24.3425 11.64 26 16 26C20.36 26 24.3212 24.3425 27.4575 21.2075C29.8112 18.8538 30.87 16.5062 30.9137 16.4075C30.9706 16.2796 31 16.1412 31 16.0012C31 15.8613 30.9706 15.7229 30.9137 15.595ZM16 24C12.1525 24 8.79124 22.6012 6.00874 19.8438C4.86704 18.7084 3.89572 17.4137 3.12499 16C3.89551 14.5862 4.86686 13.2915 6.00874 12.1562C8.79124 9.39875 12.1525 8 16 8C19.8475 8 23.2087 9.39875 25.9912 12.1562C27.1352 13.2912 28.1086 14.5859 28.8812 16C27.98 17.6825 24.0537 24 16 24ZM16 10C14.8133 10 13.6533 10.3519 12.6666 11.0112C11.6799 11.6705 10.9108 12.6075 10.4567 13.7039C10.0026 14.8003 9.88377 16.0067 10.1153 17.1705C10.3468 18.3344 10.9182 19.4035 11.7573 20.2426C12.5965 21.0818 13.6656 21.6532 14.8294 21.8847C15.9933 22.1162 17.1997 21.9974 18.2961 21.5433C19.3924 21.0892 20.3295 20.3201 20.9888 19.3334C21.6481 18.3467 22 17.1867 22 16C21.9983 14.4092 21.3657 12.884 20.2408 11.7592C19.1159 10.6343 17.5908 10.0017 16 10ZM16 20C15.2089 20 14.4355 19.7654 13.7777 19.3259C13.1199 18.8864 12.6072 18.2616 12.3045 17.5307C12.0017 16.7998 11.9225 15.9956 12.0768 15.2196C12.2312 14.4437 12.6122 13.731 13.1716 13.1716C13.731 12.6122 14.4437 12.2312 15.2196 12.0769C15.9956 11.9225 16.7998 12.0017 17.5307 12.3045C18.2616 12.6072 18.8863 13.1199 19.3259 13.7777C19.7654 14.4355 20 15.2089 20 16C20 17.0609 19.5786 18.0783 18.8284 18.8284C18.0783 19.5786 17.0609 20 16 20Z"
        fill="currentColor"
      />
    </svg>
  );
};
export const DeletePost = () => {
  const t = useT();
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-tooltip-id="tooltip"
      data-tooltip-content={t('delete_post', 'Delete Post')}
    >
      <path
        d="M15 10V18H9V10H15ZM14 4H9.9L8.9 5H6V7H18V5H15L14 4ZM17 8H7V18C7 19.1 7.9 20 9 20H15C16.1 20 17 19.1 17 18V8Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const SetSelectionModal: FC<{
  sets: any[];
  onSelect: (set: any) => void;
  onContinueWithoutSet: () => void;
}> = ({ sets, onSelect, onContinueWithoutSet }) => {
  const t = useT();

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="t-title-3">
        {t('choose_set_or_continue', 'Choose a set or continue without one')}
      </div>

      <div className="flex flex-col gap-[8px] max-h-[240px] overflow-y-auto">
        {sets.map((set) => (
          <div
            key={set.id}
            onClick={() => onSelect(set)}
            className="p-[12px] border border-line rounded-control cursor-pointer hover:bg-surfaceHover transition-colors duration-state ease-state"
          >
            <div className="t-body-emphasis">{set.name}</div>
            {set.description && (
              <div className="t-secondary text-inkSecondary mt-[4px]">
                {set.description}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-[8px] pt-[8px] border-t border-line">
        <Button secondary onClick={onContinueWithoutSet} className="flex-1">
          {t('continue_without_set', 'Continue without set')}
        </Button>
      </div>
    </div>
  );
};
