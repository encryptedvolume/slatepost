'use client';

import { FC, ReactNode } from 'react';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { MenuItem } from '@gitroom/frontend/components/new-layout/menu-item';

interface MenuItemInterface {
  name: string;
  icon: ReactNode;
  path: string;
}

/**
 * The whole signed-in shell. Three rows, one for each surface the product
 * has: the queue, the media it posts, and the one account. There is no
 * second menu, no role gate and no tier gate — a single-channel scheduler
 * has nothing to gate.
 */
export const useMenuItem = () => {
  const t = useT();

  const all = [
    {
      name: t('calendar', 'Calendar'),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.75 7.25h14.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 2.75v2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.5 2.75v2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.25 4h9.5a2.5 2.5 0 0 1 2.5 2.5v8.25a2.5 2.5 0 0 1-2.5 2.5h-9.5a2.5 2.5 0 0 1-2.5-2.5V6.5a2.5 2.5 0 0 1 2.5-2.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      path: '/launches',
    },
    {
      name: t('media', 'Media'),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4.25 3.25h11.5a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H4.25a1.5 1.5 0 0 1-1.5-1.5V4.75a1.5 1.5 0 0 1 1.5-1.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.75 12.25 6.25 9l3.75 3.5 2.5-2.25 4.75 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.25 6.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      path: '/media',
    },
    {
      name: t('settings', 'Settings'),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8.4 3.1a1 1 0 0 1 .98-.85h1.24a1 1 0 0 1 .98.85l.16 1.06c.4.14.78.34 1.12.58l1-.4a1 1 0 0 1 1.23.44l.62 1.07a1 1 0 0 1-.25 1.29l-.84.66c.04.22.06.44.06.67s-.02.45-.06.67l.84.66a1 1 0 0 1 .25 1.29l-.62 1.07a1 1 0 0 1-1.23.44l-1-.4c-.34.24-.72.44-1.12.58l-.16 1.06a1 1 0 0 1-.98.85H9.38a1 1 0 0 1-.98-.85l-.16-1.06c-.4-.14-.78-.34-1.12-.58l-1 .4a1 1 0 0 1-1.23-.44l-.62-1.07a1 1 0 0 1 .25-1.29l.84-.66a4.6 4.6 0 0 1 0-1.34l-.84-.66a1 1 0 0 1-.25-1.29l.62-1.07a1 1 0 0 1 1.23-.44l1 .4c.34-.24.72-.44 1.12-.58L8.4 3.1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.25 10a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      path: '/settings',
    },
  ] satisfies MenuItemInterface[] as MenuItemInterface[];

  return {
    all,
  };
};

export const TopMenu: FC = () => {
  const user = useUser();
  const { all } = useMenuItem();
  return (
    <div className="flex flex-1 flex-col gap-[4px] blurMe">
      {
        // @ts-ignore
        user?.orgId &&
          all.map((item) => (
            <MenuItem
              path={item.path}
              label={item.name}
              icon={item.icon}
              key={item.name}
            />
          ))
      }
    </div>
  );
};
