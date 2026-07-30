'use client';

import { FC, useCallback } from 'react';
import clsx from 'clsx';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useShallow } from 'zustand/react/shallow';
import { useExistingData } from '@gitroom/frontend/components/launches/helpers/use.existing.data';
import ImageWithFallback from '@gitroom/react/helpers/image.with.fallback';
import { PlatformGlyph } from '@gitroom/frontend/components/ui/platform.glyph';

export const PicksSocialsComponent: FC<{ toolTip?: boolean }> = ({
  toolTip,
}) => {
  const exising = useExistingData();

  const {
    locked,
    addOrRemoveSelectedIntegration,
    integrations,
    selectedIntegrations,
  } = useLaunchStore(
    useShallow((state) => ({
      integrations: state.integrations,
      selectedIntegrations: state.selectedIntegrations,
      addOrRemoveSelectedIntegration: state.addOrRemoveSelectedIntegration,
      locked: state.locked,
    }))
  );

  const isSelected = useCallback(
    (id: string) =>
      selectedIntegrations.some((p) => p.integration.id === id),
    [selectedIntegrations]
  );

  return (
    <div className={clsx('flex', locked && 'opacity-50 pointer-events-none')}>
      <div className="flex flex-1">
        <div className="innerComponent flex-1 flex">
          <div className="flex flex-wrap gap-[12px] flex-1">
            {integrations
              .filter((f) => {
                if (exising.integration) {
                  return f.id === exising.integration;
                }
                return !f.inBetweenSteps && !f.disabled;
              })
              .map((integration) => (
                <div
                  key={integration.id}
                  className="flex gap-[8px] items-center"
                  {...(toolTip && {
                    'data-tooltip-id': 'tooltip',
                    'data-tooltip-content': integration.name,
                  })}
                >
                  <button
                    type="button"
                    aria-pressed={isSelected(integration.id)}
                    aria-label={integration.name}
                    onClick={() => {
                      if (exising.integration) {
                        return;
                      }
                      addOrRemoveSelectedIntegration(integration, {});
                    }}
                    className={clsx(
                      'cursor-pointer border relative rounded-pill flex justify-center items-center bg-hairline filter transition-all duration-state ease-state',
                      isSelected(integration.id)
                        ? 'border-primaryBg'
                        : 'grayscale border-transparent'
                    )}
                  >
                    <ImageWithFallback
                      fallbackSrc="/no-picture.jpg"
                      src={integration.picture || '/no-picture.jpg'}
                      className={clsx(
                        'rounded-pill transition-all min-w-[42px] border min-h-[42px]',
                        isSelected(integration.id)
                          ? 'border-primaryText'
                          : 'border-transparent'
                      )}
                      alt={integration.name}
                      width={42}
                      height={42}
                    />
                    <PlatformGlyph
                      identifier={integration.identifier}
                      className="absolute z-10 bottom-0 -end-[4px] text-ink"
                    />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
