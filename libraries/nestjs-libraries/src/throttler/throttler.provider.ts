import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

// Routes that must be rate limited even though nobody is signed in yet.
// Password reset sends mail on every request and takes an arbitrary address,
// so without a limit it is both a mail cannon and a way to burn relay quota.
const UNAUTHENTICATED_LIMITED = ['/auth/forgot'];

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  public override async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const { url, method } = context.switchToHttp().getRequest<Request>();

    if (method === 'POST' && url.includes('/public/v1/posts')) {
      return super.canActivate(context);
    }

    // Matched on the path only: /auth/forgot-return carries a token that is
    // already single-use and expiring, and rate limiting it would let someone
    // else's attempts lock a legitimate user out of finishing their reset.
    if (
      method === 'POST' &&
      UNAUTHENTICATED_LIMITED.some((path) => url.split('?')[0].endsWith(path))
    ) {
      return super.canActivate(context);
    }

    return true;
  }

  protected override async getTracker(
    req: Record<string, any>
  ): Promise<string> {
    // Signed-out requests have no org to key on - reading req.org.id there is
    // what would have thrown, and is the reason these routes were skipped
    // rather than counted. Fall back to the caller's address.
    if (!req.org?.id) {
      const forwarded = (req.headers?.['x-forwarded-for'] as string) || '';
      const ip = forwarded.split(',')[0].trim() || req.ip || 'unknown';
      return `anon_${ip}`;
    }

    return (
      req.org.id + '_' + (req.url.indexOf('/posts') > -1 ? 'posts' : 'other')
    );
  }
}
