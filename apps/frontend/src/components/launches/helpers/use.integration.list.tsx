'use client';

import { jsonOrThrow, useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useCallback } from 'react';
import useSWR from 'swr';

export const useIntegrationList = () => {
  const fetch = useFetch();

  // `fallbackData: []` below means a failed load is indistinguishable from "no
  // channels" unless the failure throws, and "no channels" is a screen that
  // tells the user to connect TikTok — advice that is wrong and alarming when
  // their channel is connected and the server merely did not answer.
  const load = useCallback(async (path: string) => {
    const { integrations } = await jsonOrThrow<{ integrations: any }>(
      await fetch(path)
    );
    return integrations;
  }, []);

  return useSWR('/integrations/list', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    fallbackData: [],
  });
};