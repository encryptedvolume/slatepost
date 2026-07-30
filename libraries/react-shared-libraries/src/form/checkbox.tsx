'use client';

import { FC, forwardRef, useCallback, useState } from 'react';
import clsx from 'clsx';
import { useFormContext, useWatch } from 'react-hook-form';
export const Checkbox = forwardRef<
  null,
  {
    checked?: boolean;
    disableForm?: boolean;
    name?: string;
    className?: string;
    label?: string;
    onChange?: (event: {
      target: {
        name?: string;
        value: boolean;
      };
    }) => void;
    variant?: 'default' | 'hollow';
  }
>((props, ref: any) => {
  const { checked, className, label, disableForm, variant } = props;
  const form = useFormContext();
  const register = disableForm ? {} : form.register(props.name!);
  const watch = disableForm ? false : form.watch(props.name!);
  const val = watch || checked;

  const changeStatus = useCallback(() => {
    props?.onChange?.({
      target: {
        name: props.name!,
        value: !val,
      },
    });
    if (!disableForm) {
      // @ts-ignore
      register?.onChange?.({
        target: {
          name: props.name!,
          value: !val,
        },
      });
    }
  }, [val]);
  return (
    <div className="flex gap-[8px]">
      <div
        ref={ref}
        {...disableForm ? {} : form.register(props.name!)}
        onClick={changeStatus}
        /*
         * The tick draws in `currentColor`, so the box and its text colour have
         * to be set together. The default variant was `bg-forth` — which is
         * `--slate-primary-bg`, the *ink* token — inside a box that inherited
         * `text-ink`: identical ramp step, 1.00:1, an invisible tick in both
         * themes. A filled box takes the primary pair (ink fill, inverse mark),
         * which is the same pairing every primary button uses. The hollow
         * variant is a control boundary, so it is one hairline of
         * `lineControl` (3:1, SC 1.4.11) — it used to be a 2px
         * `--color-custom1` rule, and the system allows 1px only.
         */
        className={clsx(
          'cursor-pointer rounded-thumb select-none w-[24px] h-[24px] justify-center items-center flex',
          variant === 'default' || !variant
            ? 'bg-primaryBg text-primaryText'
            : 'border border-lineControl bg-surface text-ink',
          className
        )}
      >
        {val && (
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        )}
      </div>
      {!!label && <div>{label}</div>}
    </div>
  );
});
