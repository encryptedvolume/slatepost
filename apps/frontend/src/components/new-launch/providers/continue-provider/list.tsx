'use client';

import { FC } from 'react';
import { ContinueProviderProps } from '@gitroom/frontend/components/new-launch/providers/continue-provider/with-continue-provider';

/*
 * The second step some providers need after OAuth returns — picking a page, a
 * board, a channel. It is keyed by provider identifier, and both call sites
 * (`continue.integration.tsx`, `layout/continue.provider.tsx`) already fall
 * back to a null component when a key is absent.
 *
 * The map is empty: the only shipping channel completes its connection in a
 * single OAuth round trip and has no second step. The mechanism is kept rather
 * than deleted because it is provider-generic — a provider that needs a
 * follow-up screen registers here without either call site changing.
 */
export const continueProviderList: Record<string, FC<ContinueProviderProps>> =
  {};
