'use client';

import {
  DetailedHTMLProps,
  FC,
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useMemo,
} from 'react';
import { clsx } from 'clsx';
import { useFormContext, useWatch } from 'react-hook-form';
import { TranslatedLabel } from '../translation/translated-label';

export const Input: FC<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    removeError?: boolean;
    error?: any;
    disableForm?: boolean;
    customUpdate?: () => void;
    label: string;
    name: string;
    icon?: ReactNode;
    translationKey?: string;
    translationParams?: Record<string, string | number>;
  }
> = (props) => {
  const {
    label,
    icon,
    removeError,
    customUpdate,
    className,
    disableForm,
    error,
    translationKey,
    translationParams,
    ...rest
  } = props;
  const form = useFormContext();
  const err = useMemo(() => {
    if (error) return error;
    if (!form || !form.formState.errors[props?.name!]) return;
    return form?.formState?.errors?.[props?.name!]?.message! as string;
  }, [form?.formState?.errors?.[props?.name!]?.message, error]);
  const watch = customUpdate ? form?.watch(props.name) : null;
  useEffect(() => {
    if (customUpdate) {
      customUpdate();
    }
  }, [watch]);
  return (
    <div className="flex flex-col gap-[8px]">
      {!!label && (
        <div className="t-control text-inkSecondary">
          <TranslatedLabel
            label={label}
            translationKey={translationKey}
            translationParams={translationParams}
          />
        </div>
      )}
      {/* 36px control, 10 radius, 1px hairline. The border is never the accent
          and never the critical color — an invalid field is announced by its
          message, not by a colored outline. */}
      <div
        className={clsx(
          'bg-surface h-control border border-lineControl rounded-control text-ink flex items-center justify-center',
          'transition-colors duration-state ease-state focus-within:border-ink',
          className
        )}
      >
        {icon && <div className="ps-[12px] text-inkTertiary">{icon}</div>}
        <input
          className={clsx(
            'h-full bg-transparent outline-none flex-1 t-control text-ink placeholder:text-inkTertiary',
            icon ? 'ps-[8px] pe-[12px]' : 'px-[12px]'
          )}
          {...(disableForm ? {} : form.register(props.name))}
          {...rest}
        />
      </div>
      {!removeError && (
        <div className="text-critical t-secondary">{err || <>&nbsp;</>}</div>
      )}
    </div>
  );
};
