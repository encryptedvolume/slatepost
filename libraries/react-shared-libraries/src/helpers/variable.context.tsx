'use client';

import { createContext, FC, ReactNode, useContext, useEffect } from 'react';
interface VariableContextInterface {
  billingEnabled: boolean;
  isGeneral: boolean;
  genericOauth: boolean;
  oauthLogoUrl: string;
  oauthDisplayName: string;
  mcpUrl?: string;
  cloudflareUrl: string;
  mainUrl: string;
  frontEndUrl: string;
  plontoKey: string;
  storageProvider: 'local' | 'cloudflare';
  backendUrl: string;
  environment: string;
  uploadDirectory: string;
  telegramBotName: string;
  neynarClientId: string;
  isSecured: boolean;
  disableImageCompression: boolean;
  disableXAnalytics: boolean;
  language: string;
  transloadit: string[];
  sentryDsn: string;
  extensionId: string;
}
const VariableContext = createContext({
  billingEnabled: false,
  isGeneral: true,
  genericOauth: false,
  oauthLogoUrl: '',
  oauthDisplayName: '',
  mcpUrl: '',
  cloudflareUrl: '',
  mainUrl: '',
  frontEndUrl: '',
  storageProvider: 'local',
  plontoKey: '',
  backendUrl: '',
  uploadDirectory: '',
  isSecured: false,
  telegramBotName: '',
  neynarClientId: '',
  disableImageCompression: false,
  disableXAnalytics: false,
  language: '',
  transloadit: [],
  sentryDsn: '',
  extensionId: '',
} as VariableContextInterface);
export const VariableContextComponent: FC<
  VariableContextInterface & {
    children: ReactNode;
  }
> = (props) => {
  const { children, ...otherProps } = props;
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.vars = otherProps;
    }
  }, []);
  return (
    <VariableContext.Provider value={otherProps}>
      {children}
    </VariableContext.Provider>
  );
};
export const useVariables = () => {
  return useContext(VariableContext);
};
export const loadVars = () => {
  // @ts-ignore
  return window.vars as VariableContextInterface;
};
