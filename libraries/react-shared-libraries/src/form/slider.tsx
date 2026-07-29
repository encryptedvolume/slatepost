'use client';

import { FC, useCallback } from 'react';
import clsx from 'clsx';
export const Slider: FC<{
  value: 'on' | 'off';
  fill?: boolean;
  onChange: (value: 'on' | 'off') => void;
}> = (props) => {
  const { value, onChange, fill } = props;
  const change = useCallback(() => {
    onChange(value === 'on' ? 'off' : 'on');
  }, [value]);
  return (
    <div
      className={clsx(
        'w-[56px] h-control p-[4px] border-fifth border rounded-pill',
        value === 'on' && fill && 'bg-customColor4'
      )}
      onClick={change}
    >
      <div className="w-full h-full relative rounded-pill">
        <div
          className={clsx(
            'absolute left-0 top-0 w-[26px] h-[26px] bg-customColor5 rounded-pill transition-all cursor-pointer',
            value === 'on' ? 'left-[100%] -translate-x-[100%]' : 'left-0'
          )}
        />
      </div>
    </div>
  );
};
