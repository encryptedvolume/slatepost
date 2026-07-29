'use client';

import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FC,
  useEffect,
  useRef,
  useState,
} from 'react';
import { clsx } from 'clsx';
const ReactLoading = ({
  color = 'currentColor',
  width = 20,
  height = 20,
}: {
  type?: string;
  color?: string;
  width?: number;
  height?: number;
}) => {
  const size = Math.min(width, height);
  const borderWidth = Math.max(2, Math.round(size / 8));
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `${borderWidth}px solid transparent`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
};
/**
 * Slate button.
 *
 * Primary actions are ink — #0F0F0F with white text in light, #FAFAFA with ink
 * text in dark. Signal Amber never fills a button; that scarcity is what makes
 * the accent mean something. 36px default height, 10 radius, control type,
 * no shadow ever. Disabled is opacity 0.4 on the whole control.
 */
export const Button: FC<
  DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    secondary?: boolean;
    loading?: boolean;
    innerClassName?: string;
  }
> = ({ children, loading, innerClassName, secondary, ...props }) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    setHeight(ref.current?.offsetHeight || 36);
  }, []);
  return (
    <button
      {...props}
      type={props.type || 'button'}
      ref={ref}
      className={clsx(
        (props.disabled || loading) && 'opacity-40 pointer-events-none',
        secondary
          ? 'bg-surface text-ink border border-lineControl hover:bg-surfaceHover'
          : 'bg-primaryBg text-primaryText hover:bg-primaryBgHover',
        'px-[16px] h-control rounded-control t-control',
        'cursor-pointer items-center justify-center flex relative',
        'transition-colors duration-state ease-state',
        props?.className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ReactLoading
            type="spin"
            color="currentColor"
            width={height! / 2}
            height={height! / 2}
          />
        </div>
      )}
      <div
        className={clsx(
          innerClassName,
          'flex-1 items-center justify-center flex gap-[8px]',
          loading && 'invisible'
        )}
      >
        {children}
      </div>
    </button>
  );
};
