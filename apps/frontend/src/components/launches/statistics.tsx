import React, { FC, Fragment, useCallback, useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { ChartSocial } from '@gitroom/frontend/components/analytics/chart-social';
import { Select } from '@gitroom/react/form/select';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { MissingReleaseModal } from '@gitroom/frontend/components/launches/missing-release.modal';

interface AnalyticsData {
  label: string;
  data: Array<{ total: number; date: string }>;
  percentageChange: number;
  average?: boolean;
}

export const StatisticsModal: FC<{
  postId: string;
}> = (props) => {
  const { postId } = props;
  const t = useT();
  const fetch = useFetch();
  const [dateRange, setDateRange] = useState(7);

  const loadStatistics = useCallback(async () => {
    return (await fetch(`/posts/${postId}/statistics`)).json();
  }, [postId, fetch]);

  const loadPostAnalytics = useCallback(async () => {
    return (await fetch(`/analytics/post/${postId}?date=${dateRange}`)).json();
  }, [postId, dateRange, fetch]);

  const { data: statisticsData, isLoading: isLoadingStatistics } = useSWR(
    `/posts/${postId}/statistics`,
    loadStatistics
  );

  const { data: analyticsData, isLoading: isLoadingAnalytics, mutate: mutateAnalytics } = useSWR(
    `/analytics/post/${postId}?date=${dateRange}`,
    loadPostAnalytics,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      revalidateOnMount: true,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    }
  );

  const isMissing = analyticsData && !Array.isArray(analyticsData) && analyticsData.missing;

  const dateOptions = useMemo(() => {
    return [
      { key: 7, value: t('7_days', '7 Days') },
      { key: 30, value: t('30_days', '30 Days') },
      { key: 90, value: t('90_days', '90 Days') },
    ];
  }, [t]);

  const totals = useMemo(() => {
    if (!analyticsData || !Array.isArray(analyticsData)) return [];
    return analyticsData.map((p: AnalyticsData) => {
      const value =
        (p?.data?.reduce((acc: number, curr: any) => acc + Number(curr.total), 0) || 0) /
        (p.average ? p.data.length : 1);
      if (p.average) {
        return value.toFixed(2) + '%';
      }
      return Math.round(value);
    });
  }, [analyticsData]);

  const isLoading = isLoadingStatistics || isLoadingAnalytics;

  return (
    <div className="relative min-h-[200px]">
      {isLoading ? (
        <div className="flex items-center justify-center py-[32px]">
          <LoadingComponent />
        </div>
      ) : isMissing ? (
        <MissingReleaseModal postId={postId} onSuccess={() => mutateAnalytics()} />
      ) : (
        <div className="flex flex-col gap-[24px]">
          {/* Post Analytics Section */}
          {analyticsData && Array.isArray(analyticsData) && analyticsData.length > 0 && (
            <div className="flex flex-col gap-[16px]">
              <div className="flex items-center justify-between">
                <h3 className="t-title-3">
                  {t('post_analytics', 'Post Analytics')}
                </h3>
                <div className="max-w-[150px]">
                  <Select
                    label=""
                    name="date"
                    disableForm={true}
                    hideErrors={true}
                    value={dateRange}
                    onChange={(e) => setDateRange(+e.target.value)}
                  >
                    {dateOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.value}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
                {analyticsData.map((p: AnalyticsData, index: number) => {
                  const colorVariants = [
                    'primary',
                    'secondary',
                    'tertiary',
                  ] as const;
                  const color = colorVariants[index % colorVariants.length];
                  return (
                    <div key={`analytics-${index}`} className="group">
                      <div className="flex flex-col h-full bg-newTableHeader border border-newTableBorder rounded-card overflow-hidden transition-colors duration-state ease-state hover:border-lineStrong">
                        <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[8px]">
                          <div className="flex items-center gap-[8px]">
                            <div
                              className={`w-[8px] h-[8px] rounded-pill ${
                                color === 'primary' ? 'bg-primaryBg' : ''
                              } ${
                                color === 'secondary' ? 'bg-inkSecondary' : ''
                              } ${
                                color === 'tertiary' ? 'bg-inkTertiary' : ''
                              }`}
                            />
                            <span className="t-body-emphasis text-newTableText">
                              {p.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 px-[12px] py-[8px]">
                          <div className="h-[120px] relative">
                            <ChartSocial data={p.data} color={color} key={`chart-${index}`} />
                          </div>
                        </div>
                        <div className="px-[16px] pb-[16px]">
                          <div className="t-display tabular">
                            {totals[index]}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Short Links Statistics Section */}
          <div className="flex flex-col gap-[16px]">
            <h3 className="t-title-3">
              {t('short_links_statistics', 'Short Links Statistics')}
            </h3>
            {statisticsData?.clicks?.length === 0 ? (
              <div className="text-inkSecondary">
                {t('no_short_link_results', 'No short link results')}
              </div>
            ) : (
              <div className="grid grid-cols-3">
                <div className="bg-forth p-[4px] rounded-tl-control">
                  {t('short_link', 'Short Link')}
                </div>
                <div className="bg-forth p-[4px]">
                  {t('original_link', 'Original Link')}
                </div>
                <div className="bg-forth p-[4px] rounded-tr-control">
                  {t('clicks', 'Clicks')}
                </div>
                {statisticsData?.clicks?.map((p: any) => (
                  <Fragment key={p.short}>
                    <div className="p-[4px] py-[8px] bg-hairline">
                      {p.short}
                    </div>
                    <div className="p-[4px] py-[8px] bg-hairline">
                      {p.original}
                    </div>
                    <div className="p-[4px] py-[8px] bg-hairline">
                      {p.clicks}
                    </div>
                  </Fragment>
                ))}
              </div>
            )}
          </div>

          {/* No analytics available message */}
          {(!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) &&
            (!statisticsData?.clicks || statisticsData.clicks.length === 0) && (
              <div className="text-center text-inkSecondary py-[20px]">
                {t('no_statistics_available', 'No statistics available for this post')}
              </div>
            )}
        </div>
      )}
    </div>
  );
};
