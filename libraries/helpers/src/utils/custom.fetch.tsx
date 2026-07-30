'use client';

import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
import { customFetch, Params } from './custom.fetch.func';
import { useVariables } from '@gitroom/react/helpers/variable.context';

const FetchProvider = createContext(
  customFetch(
    // @ts-ignore
    {
      baseUrl: '',
      beforeRequest: () => {},
      afterRequest: () => {
        return true;
      },
    } as Params
  )
);

export const FetchWrapperComponent: FC<Params & { children: ReactNode }> = (
  props
) => {
  const { children, ...params } = props;
  const { isSecured } = useVariables();
  // @ts-ignore
  const fetchData = useRef(
    customFetch(params, undefined, undefined, isSecured)
  );
  return (
    // @ts-ignore
    <FetchProvider.Provider value={fetchData.current}>
      {children}
    </FetchProvider.Provider>
  );
};

export const useFetch = () => {
  return useContext(FetchProvider);
};

/**
 * Read a JSON body, or fail loudly if the request failed.
 *
 * `useFetch` resolves with the `Response` whatever the status, so a 500 whose
 * body happens to be JSON (`{"statusCode":500,...}` — which is exactly what
 * NestJS sends) used to sail straight into SWR as *data*. The screen then read
 * the field it wanted, found nothing, and drew its empty state: "Your queue is
 * empty", "You don't have any media yet", "No channels yet". Telling someone
 * their scheduled posts do not exist because the backend hiccuped is the one
 * thing an empty state must never do.
 *
 * Every SWR fetcher behind a list, a calendar or a panel reads its response
 * through here, so a failure lands in SWR's `error` and the surface can say
 * "we could not load this" and offer a retry instead.
 *
 * The thrown message is for the console and Sentry only — no surface renders
 * it. `ErrorState` has no prop that would accept it.
 */
export const jsonOrThrow = async <T = any,>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText || ''} ${
        response.url || ''
      }`.trim()
    );
  }

  return response.json();
};
