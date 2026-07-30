'use client';

import { FC, ReactNode } from 'react';
import clsx from 'clsx';

/**
 * Loading placeholders.
 *
 * Two rules, both inherited from the token system rather than invented here:
 *
 *   1. A placeholder is a flat `bg-skeleton` block and nothing else. The
 *      animation scale ships exactly two looping animations (the 1.2s upload
 *      bar and the busy ring), and neither is "a rectangle breathing on a
 *      blank screen" — a shimmer would be a third loop and a token bypass, so
 *      the block is static. What tells the user it is loading is that the
 *      placeholders are in the *shape of the thing that is coming*, which is
 *      why every caller builds its own arrangement out of `Skeleton` instead
 *      of dropping a generic spinner into an empty page.
 *
 *   2. Geometry (width, height, radius) belongs to the call site, because it
 *      is copied from the real row the placeholder stands in for. `Skeleton`
 *      only owns the fill and the fact that the block is invisible to screen
 *      readers.
 *
 * Announcement is `SkeletonRegion`'s job: the placeholders are decoration, the
 * region is what says "loading" once, in words, to assistive tech.
 */
export const Skeleton: FC<{ className?: string }> = ({ className }) => (
  <div aria-hidden="true" className={clsx('bg-skeleton', className)} />
);

/**
 * Wraps a group of `Skeleton` blocks so the wait is announced once rather than
 * being silent (placeholders are `aria-hidden`) or announced 16 times (one per
 * block). `label` is a plain sentence, not a spinner: "Loading your calendar".
 */
export const SkeletonRegion: FC<{
  label: string;
  className?: string;
  children: ReactNode;
}> = ({ label, className, children }) => (
  <div role="status" aria-busy="true" aria-live="polite" className={className}>
    <span className="sr-only">{label}</span>
    {children}
  </div>
);
