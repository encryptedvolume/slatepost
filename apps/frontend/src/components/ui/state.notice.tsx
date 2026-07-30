'use client';

import { FC, ReactNode } from 'react';
import clsx from 'clsx';
import { Button } from '@gitroom/react/form/button';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

/**
 * The one frame for "there is nothing here" and "this did not load".
 *
 * Both states are the same object — a centred sentence with at most one thing
 * to do next — so they are one component with one layout, and the only thing
 * `tone` changes is whether the block is quiet or is marked as a failure. Two
 * separately-drawn frames is how a product ends up with four different empty
 * states and three different error boxes.
 *
 * Rules the frame enforces so call sites cannot drift:
 *
 *   - Exactly one action. `action` is a single slot, not a list: an empty state
 *     that offers three choices has not decided what the user should do. A
 *     second, lower-commitment escape hatch (a text link back) is allowed and
 *     is what `hint` is for.
 *   - The frame never renders an error object, a status code, a stack or a
 *     response body. There is no prop that would let it: `title` and `body`
 *     are copy written by the caller, and the caller is expected to write a
 *     sentence, not to interpolate `error.message`. Diagnostics belong in the
 *     console and in Sentry, which is where they already go.
 *   - Structure is a hairline card (failure) or nothing at all (empty). No
 *     shadow, no illustration by default — the restrained ramp carries it.
 */
export const StateNotice: FC<{
  title: string;
  body?: ReactNode;
  /** One control. Usually a `Button`; the frame owns layout, not behaviour. */
  action?: ReactNode;
  /** Optional low-commitment escape hatch, e.g. a text link. */
  hint?: ReactNode;
  tone?: 'quiet' | 'failure';
  /** Narrow columns: the 240px channel rail, a mention dropdown, a panel. */
  compact?: boolean;
  className?: string;
}> = ({
  title,
  body,
  action,
  hint,
  tone = 'quiet',
  compact = false,
  className,
}) => (
  <div
    {...(tone === 'failure' ? { role: 'alert' } : {})}
    className={clsx(
      'flex flex-col items-center justify-center text-center',
      compact ? 'gap-[8px] p-[16px]' : 'gap-[16px] p-[24px]',
      tone === 'failure' &&
        'bg-criticalTint border border-criticalBorder rounded-card',
      className
    )}
  >
    <div className="flex flex-col gap-[4px] max-w-[420px]">
      <div className={clsx(compact ? 't-body-emphasis' : 't-title-3', 'text-ink')}>
        {title}
      </div>
      {!!body && <p className="t-secondary text-inkSecondary">{body}</p>}
    </div>
    {!!action && <div className="flex">{action}</div>}
    {!!hint && <div className="t-secondary text-inkTertiary">{hint}</div>}
  </div>
);

/**
 * "There is nothing here yet" — pass the one thing that fixes that.
 */
export const EmptyState: FC<{
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  hint?: ReactNode;
  compact?: boolean;
  className?: string;
}> = (props) => <StateNotice {...props} tone="quiet" />;

/**
 * "This did not load."
 *
 * The copy is plain and the retry is the action, because a retry is what fixes
 * the overwhelming majority of these (a dropped request, a backend restart, a
 * laptop that just woke up). Callers pass `onRetry` — usually SWR's `mutate` —
 * and may override the sentence when they know something more useful than
 * "something went wrong", e.g. "We couldn't load your channels".
 */
export const ErrorState: FC<{
  title?: string;
  body?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  hint?: ReactNode;
  compact?: boolean;
  className?: string;
}> = ({ title, body, onRetry, retryLabel, hint, compact, className }) => {
  const t = useT();
  return (
    <StateNotice
      tone="failure"
      compact={compact}
      className={className}
      title={title || t('something_went_wrong', 'Something went wrong')}
      body={
        body ||
        t(
          'could_not_load_try_again',
          'We could not load this. Check your connection and try again.'
        )
      }
      action={
        onRetry ? (
          <Button secondary={true} onClick={onRetry}>
            {retryLabel || t('try_again', 'Try again')}
          </Button>
        ) : undefined
      }
      hint={hint}
    />
  );
};
