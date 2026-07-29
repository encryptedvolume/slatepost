'use client';

import { StarsAndForks } from '@gitroom/frontend/components/analytics/stars.and.forks';
import { FC, useCallback } from 'react';
import { StarsTableComponent } from '@gitroom/frontend/components/analytics/stars.table.component';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
export const AnalyticsComponent: FC = () => {
  const fetch = useFetch();
  const load = useCallback(async (path: string) => {
    return await (await fetch(path)).json();
  }, []);
  const { isLoading: isLoadingAnalytics, data: analytics } = useSWR(
    '/analytics',
    load
  );
  const { isLoading: isLoadingTrending, data: trending } = useSWR(
    '/analytics/trending',
    load
  );
  if (isLoadingAnalytics || isLoadingTrending) {
    return <LoadingComponent />;
  }
  return (
    <div className="flex gap-[24px] flex-1">
      <div className="flex flex-col gap-[24px] flex-1">
        <StarsAndForks list={analytics} trending={trending} />
        <StarsTableComponent />
      </div>
      {/*<div className="w-[318px] bg-third mt-[-44px] p-[16px]">*/}
      {/*    <h2 className="t-title-2">News Feed</h2>*/}
      {/*    <div className="my-[32px] flex h-[32px]">*/}
      {/*        <div className="flex-1 bg-forth flex justify-center items-center">*/}
      {/*            Global*/}
      {/*        </div>*/}
      {/*        <div className="flex-1 bg-primary flex justify-center items-center">*/}
      {/*            My Feed*/}
      {/*        </div>*/}
      {/*    </div>*/}
      {/*    <div>*/}
      {/*        <div className="w-full flex-col justify-start items-start gap-[16px] inline-flex">*/}
      {/*            <div className="self-stretch justify-start items-start gap-[8px] inline-flex pb-[16.5px] border-b-[1px] border-fifth">*/}
      {/*                <img className="w-[32px] h-[32px] rounded-pill" src="https://via.placeholder.com/32x32"/>*/}
      {/*                <div className="grow shrink basis-0 flex-col justify-start items-start gap-[4px] inline-flex">*/}
      {/*                    <div className="justify-center items-center gap-[4px] inline-flex">*/}
      {/*                        <div className="text-textColor t-secondary-emphasis leading-tight">Nevo David</div>*/}
      {/*                        <div className="text-inkTertiary t-overline">05/06/2024</div>*/}
      {/*                    </div>*/}
      {/*                    <div className="self-stretch text-inkSecondary t-caption">O atual sistema político precisa mudar para valorizar o trabalho e garantir igualdade de oportunidad</div>*/}
      {/*                    <div className="self-stretch justify-start items-center gap-[4px] inline-flex">*/}
      {/*                        <div className="text-customColor10 t-caption">See Tweet</div>*/}
      {/*                        <div className="w-[16px] h-[16px] relative"/>*/}
      {/*                    </div>*/}
      {/*                </div>*/}
      {/*            </div>*/}
      {/*            <div className="self-stretch justify-start items-start gap-[8px] inline-flex pb-[16.5px] border-b-[1px] border-fifth">*/}
      {/*                <img className="w-[32px] h-[32px] rounded-pill" src="https://via.placeholder.com/32x32"/>*/}
      {/*                <div className="grow shrink basis-0 flex-col justify-start items-start gap-[4px] inline-flex">*/}
      {/*                    <div className="justify-center items-center gap-[4px] inline-flex">*/}
      {/*                        <div className="text-textColor t-secondary-emphasis leading-tight">Nevo David</div>*/}
      {/*                        <div className="text-inkTertiary t-overline">05/06/2024</div>*/}
      {/*                    </div>*/}
      {/*                    <div className="self-stretch text-inkSecondary t-caption">O atual sistema político precisa mudar para valorizar o trabalho e garantir igualdade de oportunidad</div>*/}
      {/*                    <div className="self-stretch justify-start items-center gap-[4px] inline-flex">*/}
      {/*                        <div className="text-customColor10 t-caption">See Tweet</div>*/}
      {/*                        <div className="w-[16px] h-[16px] relative"/>*/}
      {/*                    </div>*/}
      {/*                </div>*/}
      {/*            </div>*/}
      {/*            <div className="self-stretch justify-start items-start gap-[8px] inline-flex pb-[16.5px] border-b-[1px] border-fifth">*/}
      {/*                <img className="w-[32px] h-[32px] rounded-pill" src="https://via.placeholder.com/32x32"/>*/}
      {/*                <div className="grow shrink basis-0 flex-col justify-start items-start gap-[4px] inline-flex">*/}
      {/*                    <div className="justify-center items-center gap-[4px] inline-flex">*/}
      {/*                        <div className="text-textColor t-secondary-emphasis leading-tight">Nevo David</div>*/}
      {/*                        <div className="text-inkTertiary t-overline">05/06/2024</div>*/}
      {/*                    </div>*/}
      {/*                    <div className="self-stretch text-inkSecondary t-caption">O atual sistema político precisa mudar para valorizar o trabalho e garantir igualdade de oportunidad</div>*/}
      {/*                    <div className="self-stretch justify-start items-center gap-[4px] inline-flex">*/}
      {/*                        <div className="text-customColor10 t-caption">See Tweet</div>*/}
      {/*                        <div className="w-[16px] h-[16px] relative"/>*/}
      {/*                    </div>*/}
      {/*                </div>*/}
      {/*            </div>*/}
      {/*            <div className="self-stretch justify-start items-start gap-[8px] inline-flex pb-[16.5px] border-b-[1px] border-fifth">*/}
      {/*                <img className="w-[32px] h-[32px] rounded-pill" src="https://via.placeholder.com/32x32"/>*/}
      {/*                <div className="grow shrink basis-0 flex-col justify-start items-start gap-[4px] inline-flex">*/}
      {/*                    <div className="justify-center items-center gap-[4px] inline-flex">*/}
      {/*                        <div className="text-textColor t-secondary-emphasis leading-tight">Nevo David</div>*/}
      {/*                        <div className="text-inkTertiary t-overline">05/06/2024</div>*/}
      {/*                    </div>*/}
      {/*                    <div className="self-stretch text-inkSecondary t-caption">O atual sistema político precisa mudar para valorizar o trabalho e garantir igualdade de oportunidad</div>*/}
      {/*                    <div className="self-stretch justify-start items-center gap-[4px] inline-flex">*/}
      {/*                        <div className="text-customColor10 t-caption">See Tweet</div>*/}
      {/*                        <div className="w-[16px] h-[16px] relative"/>*/}
      {/*                    </div>*/}
      {/*                </div>*/}
      {/*            </div>*/}
      {/*            <div className="self-stretch justify-start items-start gap-[8px] inline-flex pb-[16.5px] border-b-[1px] border-fifth">*/}
      {/*                <img className="w-[32px] h-[32px] rounded-pill" src="https://via.placeholder.com/32x32"/>*/}
      {/*                <div className="grow shrink basis-0 flex-col justify-start items-start gap-[4px] inline-flex">*/}
      {/*                    <div className="justify-center items-center gap-[4px] inline-flex">*/}
      {/*                        <div className="text-textColor t-secondary-emphasis leading-tight">Nevo David</div>*/}
      {/*                        <div className="text-inkTertiary t-overline">05/06/2024</div>*/}
      {/*                    </div>*/}
      {/*                    <div className="self-stretch text-inkSecondary t-caption">O atual sistema político precisa mudar para valorizar o trabalho e garantir igualdade de oportunidad</div>*/}
      {/*                    <div className="self-stretch justify-start items-center gap-[4px] inline-flex">*/}
      {/*                        <div className="text-customColor10 t-caption">See Tweet</div>*/}
      {/*                        <div className="w-[16px] h-[16px] relative"/>*/}
      {/*                    </div>*/}
      {/*                </div>*/}
      {/*            </div>*/}
      {/*        </div>*/}
      {/*    </div>*/}
      {/*</div>*/}
    </div>
  );
};
