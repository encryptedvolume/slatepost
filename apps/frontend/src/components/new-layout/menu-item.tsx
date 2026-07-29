'use client';
import { FC, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';
import { ActiveMarker } from '@gitroom/frontend/components/ui/active.marker';

/**
 * Nav rail row.
 *
 * 44px list row, 20px monochrome icon, control type. Selected state is
 * surfaceActive — not a colored fill — plus the one accent mark the rail is
 * allowed: a 2x16px Signal Amber bar on the leading edge of the active item.
 */
export const MenuItem: FC<{
  label: string;
  icon: ReactNode;
  path: string;
  onClick?: () => void;
}> = ({ label, icon, path, onClick }) => {
  const currentPath = usePathname();
  const isActive = currentPath.indexOf(path) === 0;

  const className = clsx(
    'group relative w-full h-large flex items-center gap-[12px] px-[12px] rounded-control',
    't-control transition-colors duration-state ease-state',
    'mobile:justify-center mobile:px-0',
    isActive
      ? 'bg-surfaceActive text-ink'
      : 'text-inkSecondary hover:bg-surfaceHover hover:text-ink'
  );

  const inner = (
    <>
      {isActive && (
        <ActiveMarker />
      )}
      {/* Every nav icon is drawn on the same 0 0 20 20 box at 1.5px, so the
          column has one optical weight and nothing has to be forced back to
          square with a sizing override. */}
      <span className="w-[20px] h-[20px] shrink-0 flex items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 truncate text-start mobile:hidden">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} title={label} className={className}>
        {inner}
      </button>
    );
  }

  return (
    <Link
      prefetch={true}
      href={path}
      title={label}
      {...(path.indexOf('http') === 0 && { target: '_blank' })}
      className={className}
    >
      {inner}
    </Link>
  );
};
