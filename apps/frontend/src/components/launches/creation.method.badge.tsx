import { FC } from 'react';
import clsx from 'clsx';

type CreationMethod = 'UNKNOWN' | 'WEB' | 'API' | 'MCP' | 'AUTOPOST' | 'CLI';

interface Props {
  creationMethod?: CreationMethod | string | null;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  ringColor?: string;
}

const tooltipFor = (m: string) =>
  m === 'AUTOPOST' ? 'Auto-posted by system' : `Created via ${m}`;

export const CreationMethodBadge: FC<Props> = ({
  creationMethod,
  size = 'xs',
  className,
}) => {
  if (!creationMethod || creationMethod === 'UNKNOWN') return null;

  // 12/16/500 caption is the floor: nothing in the product renders below
  // 11px, and the status-chip token is the one the spec names for badges.
  // The chip is a neutral surfaceActive pill — badge colour is not a brand
  // signal and the accent is reserved for post state.
  const sizeClasses =
    size === 'md' ? 'h-[24px] px-[8px]' : 'h-[20px] px-[8px]';

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center rounded-pill bg-surfaceActive text-inkSecondary t-caption uppercase cursor-default',
        sizeClasses,
        className
      )}
      data-tooltip-id="tooltip"
      data-tooltip-content={tooltipFor(creationMethod)}
    >
      {creationMethod}
    </div>
  );
};
