'use client';

import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import React, { FC, useCallback, useMemo } from 'react';
import { jsonOrThrow, useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Input } from '@gitroom/react/form/input';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { Button } from '@gitroom/react/form/button';
import { useRouter } from 'next/navigation';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import clsx from 'clsx';
import { PlatformGlyph } from '@gitroom/frontend/components/ui/platform.glyph';
import {
  EmptyState,
  ErrorState,
} from '@gitroom/frontend/components/ui/state.notice';

export const useAddProvider = (update?: () => void) => {
  const modal = useModals();
  const fetch = useFetch();
  const t = useT();

  // "Connect TikTok" is the one action the empty queue and onboarding both
  // point at. When the list of connectable channels failed to
  // load, this used to reject inside the click handler: no modal, no message,
  // a button that simply did nothing. The modal now opens either way and says
  // which of the two it is.
  return useCallback(async function openAddChannel(): Promise<void> {
    let data: { social?: any[] } | null = null;

    try {
      data = await jsonOrThrow(await fetch('/integrations'));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }

    modal.openModal({
      title: 'Add Channel',
      withCloseButton: true,
      children: !data ? (
        <ErrorState
          title={t(
            'add_channel_failed_title',
            'We could not load the channels you can connect'
          )}
          body={t(
            'add_channel_failed_body',
            'Nothing has changed on your account. Try again in a moment.'
          )}
          onRetry={() => {
            modal.closeAll();
            openAddChannel();
          }}
        />
      ) : (
        <AddProviderComponent update={update} {...(data as any)} />
      ),
    });
  }, []);
};
export const AddProviderButton: FC<{
  update?: () => void;
}> = (props) => {
  const { update } = props;
  const add = useAddProvider(update);
  const t = useT();

  return (
    /* One button. The chain-link button that used to sit beside this one
       copied an invite link for "a customer to add channel" — the Postiz
       agency flow — and was the second visible button on the main screen of a
       single-user, self-hosted app. */
    /* Primary action is ink — the accent is never spent on a button fill. */
    <button
      className="bg-primaryBg text-primaryText hover:bg-primaryBgHover h-control px-[16px] justify-center items-center flex rounded-control gap-[8px] t-control transition-colors duration-state ease-state"
      onClick={add}
    >
      <div className="w-[16px] h-[16px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M1.66675 10.0417C3.35907 10.2299 4.93698 10.9884 6.14101 12.1924C7.34504 13.3964 8.10353 14.9743 8.29175 16.6667M1.66675 13.4167C2.46749 13.58 3.20253 13.9751 3.7804 14.553C4.35827 15.1309 4.75344 15.8659 4.91675 16.6667M1.66675 16.6667H1.67508M11.6667 17.5H14.3334C15.7335 17.5 16.4336 17.5 16.9684 17.2275C17.4388 16.9878 17.8212 16.6054 18.0609 16.135C18.3334 15.6002 18.3334 14.9001 18.3334 13.5V6.5C18.3334 5.09987 18.3334 4.3998 18.0609 3.86502C17.8212 3.39462 17.4388 3.01217 16.9684 2.77248C16.4336 2.5 15.7335 2.5 14.3334 2.5H5.66675C4.26662 2.5 3.56655 2.5 3.03177 2.77248C2.56137 3.01217 2.17892 3.39462 1.93923 3.86502C1.66675 4.3998 1.66675 5.09987 1.66675 6.5V6.66667"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-start">{t('add_channel', 'Add Channel')}</div>
    </button>
  );
};

export const CustomVariables: FC<{
  variables: Array<{
    key: string;
    label: string;
    defaultValue?: string;
    validation: string;
    type: 'text' | 'password';
    hint?: string;
  }>;
  close?: () => void;
  identifier: string;
  gotoUrl(url: string): void;
  onboarding?: boolean;
}> = (props) => {
  const { close, gotoUrl, identifier, variables, onboarding } = props;
  const fetch = useFetch();
  const modals = useModals();
  const schema = useMemo(() => {
    return object({
      ...variables.reduce((aIcc, item) => {
        const splitter = item.validation.split('/');
        const regex = new RegExp(
          splitter.slice(1, -1).join('/'),
          splitter.pop()
        );
        return {
          ...aIcc,
          [item.key]: string()
            .matches(regex, `${item.label} is invalid`)
            .required(),
        };
      }, {}),
    });
  }, [variables]);
  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    values: variables.reduce(
      (acc, item) => ({
        ...acc,
        ...(item.defaultValue
          ? {
              [item.key]: item.defaultValue,
            }
          : {}),
      }),
      {}
    ),
  });
  const submit = useCallback(
    async (data: FieldValues) => {
      const { url } = await (
        await fetch(
          `/integrations/social/${identifier}${
            onboarding ? '?onboarding=true' : ''
          }`
        )
      ).json();
      modals.closeAll();
      gotoUrl(
        `/integrations/social/${identifier}?state=${url}&code=${Buffer.from(
          JSON.stringify(data)
        ).toString('base64')}${onboarding ? '&onboarding=true' : ''}`
      );
    },
    [variables, onboarding]
  );

  const t = useT();

  return (
    <div className="relative">
      <FormProvider {...methods}>
        <form
          className="gap-[16px] flex flex-col"
          onSubmit={methods.handleSubmit(submit)}
        >
          {variables.map((variable) => (
            <div key={variable.key}>
              {variable.hint ? (
                <div className="flex flex-col gap-[8px]">
                  <div className="t-control text-inkSecondary flex items-center gap-[8px]">
                    <span>{variable.label}</span>
                    <span
                      data-tooltip-id="tooltip"
                      data-tooltip-content={variable.hint}
                      className="w-[16px] h-[16px] rounded-pill border border-line text-inkSecondary flex items-center justify-center t-caption cursor-help select-none"
                    >
                      i
                    </span>
                  </div>
                  <Input
                    label=""
                    name={variable.key}
                    type={variable.type == 'text' ? 'text' : 'password'}
                  />
                </div>
              ) : (
                <Input
                  label={variable.label}
                  name={variable.key}
                  type={variable.type == 'text' ? 'text' : 'password'}
                />
              )}
            </div>
          ))}
          <div className="flex pt-[8px]">
            <Button type="submit">{t('connect', 'Connect')}</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
export const AddProviderComponent: FC<{
  social: Array<{
    identifier: string;
    name: string;
    toolTip?: string;
    customFields?: Array<{
      key: string;
      label: string;
      validation: string;
      type: 'text' | 'password';
      hint?: string;
    }>;
  }>;
  update?: () => void;
  onboarding?: boolean;
  isMobile?: boolean;
}> = (props) => {
  const { update, social, onboarding, isMobile } = props;
  const toaster = useToaster();
  const router = useRouter();
  const fetch = useFetch();
  const modal = useModals();
  const getSocialLink = useCallback(
    (
        identifier: string,
        customFields?: Array<{
          key: string;
          label: string;
          validation: string;
          defaultValue?: string;
          type: 'text' | 'password';
          hint?: string;
        }>
      ) =>
      async () => {
        const onboardingParam = onboarding ? 'onboarding=true' : '';
        const gotoIntegration = async () => {
          const { url, err } = await (
            await fetch(
              `/integrations/social/${identifier}${
                onboardingParam ? `?${onboardingParam}` : ''
              }`
            )
          ).json();
          if (err) {
            toaster.show(
              t(
                'could_not_connect_to_channel',
                'Could not connect to the channel'
              ),
              'warning'
            );
            return;
          }

          window.location.href = url;
        };
        if (customFields) {
          modal.openModal({
            title: t('add_channel_title', 'Add Channel'),
            withCloseButton: true,
            ...(isMobile ? { removeLayout: true, fullScreen: true } : {}),
            classNames: {
              modal: 'bg-transparent text-ink',
            },
            children: (
              <div
                {...(isMobile ? { className: 'h-full bg-canvas p-[24px]' } : {})}
              >
                <CustomVariables
                  identifier={identifier}
                  gotoUrl={(url: string) => router.push(url)}
                  variables={customFields}
                  onboarding={onboarding}
                />
              </div>
            ),
          });
          return;
        }
        await gotoIntegration();
      },
    [onboarding]
  );

  const t = useT();

  const connectable = social;

  // An empty card with a hairline round it says nothing. This happens when the
  // server reports no connectable channel — a deployment with no TikTok
  // credentials configured — and the fix is on the server, so the state says
  // that plainly instead of offering a button that cannot work.
  if (!connectable.length) {
    return (
      <EmptyState
        title={t('no_channel_available', 'No channel available to connect')}
        body={t(
          'no_channel_available_body',
          'Slate posts to TikTok, and this server has no TikTok credentials configured yet. Add them to the environment and reopen this window.'
        )}
      />
    );
  }

  return (
    // A grouped list, not a wall of tiles: one 44px row per channel, a 16px
    // monochrome mark, and dividers inset 16px. With a single channel this
    // reads as a deliberate choice rather than an empty grid.
    <div className="w-full flex flex-col gap-[24px] relative">
      <p className="t-secondary text-inkSecondary measure">
        {t(
          'add_channel_help',
          'Connect a channel to start scheduling posts to it.'
        )}
      </p>
      <div className="flex flex-col rounded-card border border-line bg-surface overflow-hidden">
        <div
          className={clsx(
            'flex flex-col',
            '[&>*+*]:border-t [&>*+*]:border-hairline'
          )}
        >
          {connectable.map((item) => (
              <div
                key={item.identifier}
                onClick={getSocialLink(item.identifier, item.customFields)}
                {...(!!item.toolTip
                  ? {
                      'data-tooltip-id': 'tooltip',
                      'data-tooltip-content': item.toolTip,
                    }
                  : {})}
                className="w-full h-large px-[16px] bg-surface hover:bg-surfaceHover text-ink relative items-center flex gap-[12px] cursor-pointer transition-colors duration-state ease-state"
              >
                <span className="w-[16px] h-[16px] shrink-0 flex items-center justify-center text-ink">
                  <PlatformGlyph identifier={item.identifier} size={16} />
                </span>
                <span className="t-body-emphasis flex-1 min-w-0 truncate text-start">
                  {item.name}
                </span>
                <span className="text-inkTertiary flex items-center gap-[8px]">
                  {!!item.toolTip && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 26 26"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 0C10.4288 0 7.91543 0.762437 5.77759 2.1909C3.63975 3.61935 1.97351 5.64968 0.989572 8.02512C0.0056327 10.4006 -0.251811 13.0144 0.249797 15.5362C0.751405 18.0579 1.98953 20.3743 3.80762 22.1924C5.6257 24.0105 7.94208 25.2486 10.4638 25.7502C12.9856 26.2518 15.5995 25.9944 17.9749 25.0104C20.3503 24.0265 22.3807 22.3603 23.8091 20.2224C25.2376 18.0846 26 15.5712 26 13C25.9964 9.5533 24.6256 6.24882 22.1884 3.81163C19.7512 1.37445 16.4467 0.00363977 13 0ZM13 21C12.7033 21 12.4133 20.912 12.1667 20.7472C11.92 20.5824 11.7277 20.3481 11.6142 20.074C11.5007 19.7999 11.471 19.4983 11.5288 19.2074C11.5867 18.9164 11.7296 18.6491 11.9393 18.4393C12.1491 18.2296 12.4164 18.0867 12.7074 18.0288C12.9983 17.9709 13.2999 18.0007 13.574 18.1142C13.8481 18.2277 14.0824 18.42 14.2472 18.6666C14.412 18.9133 14.5 19.2033 14.5 19.5C14.5 19.8978 14.342 20.2794 14.0607 20.5607C13.7794 20.842 13.3978 21 13 21ZM14 14.91V15C14 15.2652 13.8946 15.5196 13.7071 15.7071C13.5196 15.8946 13.2652 16 13 16C12.7348 16 12.4804 15.8946 12.2929 15.7071C12.1054 15.5196 12 15.2652 12 15V14C12 13.7348 12.1054 13.4804 12.2929 13.2929C12.4804 13.1054 12.7348 13 13 13C14.6538 13 16 11.875 16 10.5C16 9.125 14.6538 8 13 8C11.3463 8 10 9.125 10 10.5V11C10 11.2652 9.89465 11.5196 9.70711 11.7071C9.51958 11.8946 9.26522 12 9.00001 12C8.73479 12 8.48044 11.8946 8.2929 11.7071C8.10536 11.5196 8.00001 11.2652 8.00001 11V10.5C8.00001 8.01875 10.2425 6 13 6C15.7575 6 18 8.01875 18 10.5C18 12.6725 16.28 14.4913 14 14.91Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="rtl:rotate-180"
                  >
                    <path
                      d="M6 3.5L10.5 8L6 12.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
