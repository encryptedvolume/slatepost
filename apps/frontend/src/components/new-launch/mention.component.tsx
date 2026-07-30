'use client';

import React, { FC, useEffect, useImperativeHandle, useState } from 'react';
import { computePosition, flip, shift } from '@floating-ui/dom';
import { posToDOMRect, ReactRenderer } from '@tiptap/react';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { Skeleton } from '@gitroom/frontend/components/ui/skeleton';

// Debounce utility for TipTap
const debounce = <T extends any[]>(
  func: (...args: any[]) => Promise<T>,
  wait: number
) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]): Promise<T> => {
    clearTimeout(timeout);
    return new Promise((resolve, reject) => {
      timeout = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          // A failed lookup is rejected rather than turned into an empty array,
          // because the dropdown has two different things to say: "there is
          // nobody by that name" and "we could not check". Swallowing the error
          // here made every failure read as the first one.
          console.error('Debounced function error:', error);
          reject(error);
        }
      }, wait);
    });
  };
};

/**
 * The wait inside the mention dropdown: two rows in the shape of a result —
 * avatar plus name — rather than the word "Loading" in an empty panel.
 */
const SearchingHandles: FC = () => {
  const t = useT();

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col gap-[8px] p-[8px]"
    >
      <span className="sr-only">
        {t('searching_handles', 'Searching handles')}
      </span>
      {[0, 1].map((row) => (
        <div key={row} className="flex gap-[8px] items-center">
          <Skeleton className="w-[32px] h-[32px] rounded-pill shrink-0" />
          <Skeleton className="h-[16px] flex-1 rounded-thumb" />
        </div>
      ))}
    </div>
  );
};

const MentionList: FC = (props: any) => {
  const t = useT();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(props.ref, () => ({
    onKeyDown: ({ event }: { event: any }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  if (props?.stop) {
    return null;
  }

  return (
    <div className="dropdown-menu bg-surfaceOverlay border border-line rounded-card shadow-overlay max-h-[240px] overflow-y-auto p-[8px]">
      {props?.items?.none ? (
        <div className="flex items-center justify-center p-[8px] t-secondary text-inkSecondary text-center">
          {t(
            'mentions_not_supported',
            'This channel has no handle lookup. Type the @handle yourself and it posts as written.'
          )}
        </div>
      ) : props?.failed ? (
        <div className="flex items-center justify-center p-[8px] t-secondary text-inkSecondary text-center">
          {t(
            'mentions_lookup_failed',
            'We could not look that up just now. Keep typing — the handle posts as written.'
          )}
        </div>
      ) : props?.loading ? (
        <SearchingHandles />
      ) : props?.items ? (
        props.items.length === 0 ? (
          <div className="p-[8px] t-secondary text-inkSecondary text-center">
            {t('no_handles_found', 'No handles match that')}
          </div>
        ) : (
          props?.items?.map((item: any, index: any) => (
            <button
              className={`flex gap-[8px] w-full p-[8px] text-start rounded-control hover:bg-surfaceHover ${
                index === selectedIndex ? 'bg-surfaceActive' : ''
              }`}
              key={item.id || index}
              onClick={() => selectItem(index)}
            >
              <img
                src={item.image || '/no-picture.jpg'}
                alt={item.label}
                className="w-[32px] h-[32px] rounded-pill object-cover"
              />
              <div className="flex-1 text-ink">{item.label}</div>
            </button>
          ))
        )
      ) : (
        <SearchingHandles />
      )}
    </div>
  );
};

const updatePosition = (editor: any, element: any) => {
  if (!editor?.view || !element) {
    return;
  }

  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to
      ),
  };

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content';
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.zIndex = '1000';
  });
};

export const suggestion = (
  loadList: (
    query: string
  ) => Promise<{ image: string; label: string; id: string }[]>
) => {
  // Create debounced version of loadList once
  const debouncedLoadList = debounce(loadList, 500);
  let component: any;

  return {
    allowSpaces: true,
    items: async ({ query }: { query: string }) => {
      if (!query || query.length < 2) {
        component.updateProps({ loading: true, stop: true });
        return [];
      }

      try {
        component.updateProps({ loading: true, stop: false, failed: false });
        const result = await debouncedLoadList(query);
        return result;
      } catch (error) {
        // Say the lookup failed rather than letting the empty list below claim
        // nobody goes by that handle.
        component.updateProps({ loading: false, stop: false, failed: true });
        return [];
      }
    },

    render: () => {
      let currentQuery = '';
      let isLoadingQuery = false;

      return {
        onBeforeStart: (props: any) => {
          component = new ReactRenderer(MentionList, {
            props: {
              ...props,
              loading: true,
            },
            editor: props.editor,
          });
          component.updateProps({ ...props, loading: true, stop: false });
          updatePosition(props.editor, component.element);
        },
        onStart: (props: any) => {
          currentQuery = props.query || '';
          isLoadingQuery = currentQuery.length >= 2;

          if (!props.clientRect) {
            return;
          }

          component.element.style.position = 'absolute';
          component.element.style.zIndex = '1000';

          const container =
            document.querySelector('.mantine-Paper-root') || document.body;
          container.appendChild(component.element);

          updatePosition(props.editor, component.element);
          component.updateProps({ ...props, loading: true });
        },

        onUpdate(props: any) {
          const newQuery = props.query || '';
          const queryChanged = newQuery !== currentQuery;
          currentQuery = newQuery;

          // If query changed and is valid, we're loading until results come in
          if (queryChanged && newQuery.length >= 2) {
            isLoadingQuery = true;
          }

          // If we have results, we're no longer loading
          if (props.items && props.items.length > 0) {
            isLoadingQuery = false;
          }

          // Show loading if we have a valid query but no results yet
          const shouldShowLoading =
            isLoadingQuery &&
            newQuery.length >= 2 &&
            (!props.items || props.items.length === 0);

          component.updateProps({ ...props, loading: false, stop: false });

          if (!props.clientRect) {
            return;
          }

          updatePosition(props.editor, component.element);
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            component.destroy();

            return true;
          }

          return component.ref?.onKeyDown(props);
        },

        onExit() {
          component.element.remove();
          component.destroy();
        },
      };
    },
  };
};
