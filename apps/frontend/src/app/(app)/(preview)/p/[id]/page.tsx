import { internalFetch } from '@gitroom/helpers/utils/internal.fetch';
import { sanitizePostContent } from '@gitroom/helpers/utils/sanitize.post.content';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import Link from 'next/link';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { VideoOrImage } from '@gitroom/react/helpers/video.or.image';
import { CopyClient } from '@gitroom/frontend/components/preview/copy.client';
import { getT } from '@gitroom/react/translation/get.translation.service.backend';
import { RenderPreviewDateClient } from '@gitroom/frontend/components/preview/render.preview.date.client';
import { CreationMethodBadge } from '@gitroom/frontend/components/launches/creation.method.badge';
import { Logo } from '@gitroom/frontend/components/new-layout/logo';
import { StateNotice } from '@gitroom/frontend/components/ui/state.notice';
import { PlatformGlyph } from '@gitroom/frontend/components/ui/platform.glyph';

dayjs.extend(utc);
export const metadata: Metadata = {
  title: 'Slate Preview',
  description: '',
};
export default async function Auth(
  props: {
    params: Promise<{
      id: string;
    }>;
    searchParams?: Promise<{
      share?: string;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const {
    id
  } = params;

  const t = await getT();

  // Two different failures used to land on the same "Post not found": a post
  // that is genuinely gone, and a backend that did not answer. Telling a
  // visitor their link is dead when the server merely hiccuped is the worse of
  // the two mistakes, so they are separated here.
  let post: any[] | null = null;
  let unreachable = false;
  try {
    const response = await internalFetch(`/public/posts/${id}`);
    // A 500 with a JSON body parses perfectly well, and the parsed envelope has
    // no `length` — which is why the status is what decides here, not the shape
    // of what came back.
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    post = await response.json();
  } catch {
    unreachable = true;
  }

  if (unreachable) {
    return (
      <div className="fixed start-0 top-0 w-full h-full flex justify-center items-center p-[24px]">
        <StateNotice
          tone="failure"
          title={t('preview_unreachable_title', 'We could not load this post')}
          body={t(
            'preview_unreachable_body',
            'The link looks fine — the server just did not answer. Try again in a moment.'
          )}
          action={
            <Link
              href={`/p/${id}`}
              className="t-control text-ink underline underline-offset-2"
            >
              {t('try_again', 'Try again')}
            </Link>
          }
        />
      </div>
    );
  }

  if (!post?.length) {
    return (
      <div className="fixed start-0 top-0 w-full h-full flex justify-center items-center p-[24px]">
        <StateNotice
          title={t('post_not_found', 'This post is not available')}
          body={t(
            'post_not_found_body',
            'It may have been deleted, or the link may belong to a different Slate install.'
          )}
          action={
            <Link
              href="/"
              className="t-control text-ink underline underline-offset-2"
            >
              {t('go_to_slate', 'Go to Slate')}
            </Link>
          }
        />
      </div>
    );
  }
  return (
    <div>
      <div className="mx-auto w-full max-w-[1280px] px-[24px] py-[16px] text-ink">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[16px]">
            <div className="flex items-center gap-[8px]">
              <div className="min-w-[55px]">
                <Link href="/" className="flex items-center">
                  <Logo />
                </Link>
              </div>
            </div>
          </div>
          <div className="t-secondary text-inkTertiary flex items-center gap-[24px]">
            {!!searchParams?.share && (
              <div>
                <CopyClient />
              </div>
            )}
            <div className="flex-1">
              {t('publication_date', 'Publication Date:')}{' '}
              <RenderPreviewDateClient date={post[0].publishDate} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row mobile:flex-col text-ink w-full max-w-[1280px] px-[24px] mx-auto">
        <div className="flex-1">
          <div className="gap-[24px] flex flex-col">
            {post.map((p: any, index: number) => (
              <div
                key={String(p.id)}
                className="relative p-[16px] bg-surface border border-line rounded-card"
              >
                <div className="flex gap-[12px]">
                  <div>
                    <div className="flex shrink-0 relative">
                      <div className="w-[50px] h-[50px] z-[20]">
                        <img
                          className="w-full h-full relative z-[20] bg-surfaceActive aspect-square rounded-pill border-line"
                          alt={post[0].integration.name}
                          src={post[0].integration.picture}
                        />
                      </div>
                      <div className="absolute -end-[4px] -bottom-[4px] w-[24px] h-[24px] z-[20] flex items-center justify-center bg-surfaceActive rounded-pill text-ink">
                        <PlatformGlyph
                          identifier={post[0].integration.providerIdentifier}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-[4px] min-w-0">
                    <div className="flex items-center gap-[8px]">
                      <h2 className="t-body-emphasis">
                        {post[0].integration.name}
                      </h2>
                      <span className="t-secondary text-inkTertiary">
                        @{post[0].integration.profile}
                      </span>
                      {index === 0 && (
                        <CreationMethodBadge
                          creationMethod={p.creationMethod}
                          size="md"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-[16px]">
                      <div
                        className="t-body whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: sanitizePostContent(p.content),
                        }}
                      />
                      <div className="flex w-full gap-[8px]">
                        {JSON.parse(p?.image || '[]').map((p: any) => (
                          <div
                            key={p.name}
                            className="flex-1 rounded-thumb max-h-[500px] overflow-hidden"
                          >
                            <VideoOrImage
                              isContain={true}
                              src={p.path}
                              autoplay={true}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
