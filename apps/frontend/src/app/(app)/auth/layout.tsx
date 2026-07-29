export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));

/**
 * Auth shell.
 *
 * Two columns split by a single 1px hairline — no cards, no boxes, no
 * illustration. The right column is the whole brand statement: one display
 * line and one secondary line, and nothing else. Whitespace does the work.
 */
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="bg-canvas text-ink flex flex-1 min-h-screen w-screen">
      <ReturnUrlComponent />
      <div className="flex flex-col flex-1 lg:flex-none lg:w-[560px] px-[24px] py-[48px] lg:px-[64px]">
        <LogoTextComponent />
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-[34rem] mx-auto flex">{children}</div>
        </div>
        <div className="t-secondary text-inkTertiary">slatepost.lol</div>
      </div>

      <div className="hidden lg:flex flex-1 border-s border-hairline">
        <div className="flex flex-col justify-center px-[64px] max-w-[34rem]">
          <h2 className="t-display text-ink">One channel. Every post on time.</h2>
          <p className="t-body text-inkSecondary mt-[24px]">
            Schedule to TikTok, watch the queue, and know exactly what goes out
            next. Nothing else on the screen competes for your attention.
          </p>
        </div>
      </div>
    </div>
  );
}
