import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookieUrlFromDomain } from '@gitroom/helpers/subdomain/subdomain.management';
import { internalFetch } from '@gitroom/helpers/utils/internal.fetch';
import acceptLanguage from 'accept-language';
import {
  cookieName,
  headerName,
  languages,
} from '@gitroom/react/translation/i18n.config';
acceptLanguage.languages(languages);

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const nextUrl = request.nextUrl;
  // Cookie or header only. Upstream also accepted `?loggedAuth=<token>`, which
  // put a live credential in the URL bar, browser history, referrers and logs
  // so the browser extension could hand one over. There is no extension here.
  const authCookie = request.cookies.get('auth') || request.headers.get('auth');
  const lng = request.cookies.has(cookieName)
    ? acceptLanguage.get(request.cookies.get(cookieName).value)
    : acceptLanguage.get(
        request.headers.get('Accept-Language') ||
          request.headers.get('accept-language')
      );

  const requestHeaders = new Headers(request.headers);
  if (lng) {
    requestHeaders.set(headerName, lng);
  }

  const topResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (lng) {
    topResponse.headers.set(cookieName, lng);
  }

  if (
    nextUrl.pathname.startsWith('/uploads/') ||
    nextUrl.pathname.startsWith('/p/') ||
    nextUrl.pathname.startsWith('/icons/')
  ) {
    return topResponse;
  }

  if (
    nextUrl.pathname.startsWith('/integrations/social/') &&
    nextUrl.href.indexOf('state=login') === -1
  ) {
    return topResponse;
  }

  // If the URL is logout, delete the cookie and redirect to login
  if (nextUrl.href.indexOf('/auth/logout') > -1) {
    // /auth is the register screen. Someone who just signed out already has an
    // account, so send them to the sign-in form - landing a returning user on
    // "Create Account" reads as though the logout lost their account. The way
    // back out is covered: the wordmark links to /auth and the form carries a
    // "Sign Up" link.
    const response = NextResponse.redirect(new URL('/auth/login', nextUrl.href));
    const expire = {
      path: '/',
      ...(!process.env.NOT_SECURED
        ? {
            secure: true,
            httpOnly: true,
            sameSite: false as const,
          }
        : {}),
      maxAge: -1,
    };
    // Cleared twice - with Domain and host-only. The setter puts `domain`
    // inside the NOT_SECURED conditional, so a session opened while that flag
    // was set has no Domain attribute, and a Set-Cookie carrying Domain cannot
    // delete a host-only cookie. Without the second call the cookie survived
    // logout and the calendar kept rendering the signed-out user's channels.
    response.cookies.set('auth', '', {
      ...expire,
      domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
    });
    response.cookies.set('auth', '', expire);
    return response;
  }

  // The register form lives on /auth itself; there is no /auth/register route,
  // so this guard never fired. Operators who want the door hard-closed set
  // DISABLE_REGISTRATION and get sent to the login form instead.
  if (
    nextUrl.pathname === '/auth' &&
    process.env.DISABLE_REGISTRATION === 'true'
  ) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl.href));
  }

  const org = nextUrl.searchParams.get('org');
  const url = new URL(nextUrl).search;
  // Terms and Privacy are the URLs given to TikTok app review and are linked
  // from the register form, so they have to be readable without an account.
  const isLegalPage = ['/terms', '/privacy'].some((p) =>
    nextUrl.pathname.startsWith(p)
  );
  if (!nextUrl.pathname.startsWith('/auth') && !isLegalPage && !authCookie) {
    // Upstream inspected the requested path and pre-selected an OAuth provider
    // on the sign-in screen, so a signed-out visit to /settings arrived as
    // /auth?provider=GITHUB. This build authenticates with email or Google, so
    // that pre-selection only ever showed a flow the visitor had not asked for.
    // Send them to a clean /auth and let them choose.
    return NextResponse.redirect(new URL(`/auth${url}`, nextUrl.href));
  }

  // If the url is /auth and the cookie exists, redirect to /
  if (nextUrl.pathname.startsWith('/auth') && authCookie) {
    return NextResponse.redirect(new URL(`/${url}`, nextUrl.href));
  }
  if (nextUrl.pathname.startsWith('/auth') && !authCookie) {
    if (org) {
      const redirect = NextResponse.redirect(new URL(`/`, nextUrl.href));
      redirect.cookies.set('org', org, {
        ...(!process.env.NOT_SECURED
          ? {
              path: '/',
              secure: true,
              httpOnly: true,
              sameSite: false,
              domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
            }
          : {}),
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });
      return redirect;
    }
    return topResponse;
  }
  try {
    if (org) {
      const { id } = await (
        await internalFetch('/user/join-org', {
          body: JSON.stringify({
            org,
          }),
          method: 'POST',
        })
      ).json();
      const redirect = NextResponse.redirect(
        new URL(`/?added=true`, nextUrl.href)
      );
      if (id) {
        redirect.cookies.set('showorg', id, {
          ...(!process.env.NOT_SECURED
            ? {
                path: '/',
                secure: true,
                httpOnly: true,
                sameSite: false,
                domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
              }
            : {}),
          expires: new Date(Date.now() + 15 * 60 * 1000),
        });
      }
      return redirect;
    }
    if (nextUrl.pathname === '/') {
      // The queue is the home screen. There is no other one to branch to.
      return NextResponse.redirect(new URL('/launches', nextUrl.href));
    }

    return topResponse;
  } catch (err) {
    console.log('err', err);
    return NextResponse.redirect(new URL('/auth/logout', nextUrl.href));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
};
