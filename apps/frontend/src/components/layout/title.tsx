'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useMenuItem } from '@gitroom/frontend/components/layout/top.menu';

export const Title = () => {
  const path = usePathname();
  const { all: menuItems } = useMenuItem();

  // Match the first path segment, not a substring of the whole pathname:
  // `indexOf(item.path) > -1` matched any nav path appearing anywhere in the
  // URL. The segment match also covers nested routes (/launches/... still
  // reads "Calendar"); the prefix pass is only a fallback for future
  // multi-segment nav paths.
  const currentTitle = useMemo(() => {
    const segment = `/${path.split('/')[1] || ''}`;
    return (
      menuItems.find((item) => item.path === segment)?.name ||
      menuItems.find((item) => path.startsWith(item.path))?.name ||
      ''
    );
  }, [menuItems, path]);

  if (!currentTitle) {
    return null;
  }

  return <h1>{currentTitle}</h1>;
};
