import { CookieProvider } from './cookie-provider.interface';

export const providers: CookieProvider[] = [];

const providerMap = new Map<string, CookieProvider>(
  providers.map((p) => [p.identifier, p])
);

export function getAllProviders(): CookieProvider[] {
  return providers;
}

export function getProvider(identifier: string): CookieProvider | undefined {
  return providerMap.get(identifier);
}
