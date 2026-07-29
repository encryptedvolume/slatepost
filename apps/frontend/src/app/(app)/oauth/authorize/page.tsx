'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Logo } from '@gitroom/frontend/components/new-layout/logo';
import { Button } from '@gitroom/react/form/button';

export default function OAuthAuthorizePage() {
  const searchParams = useSearchParams();
  const fetch = useFetch();
  const [appInfo, setAppInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const clientId = searchParams.get('client_id');
  const responseType = searchParams.get('response_type');
  const state = searchParams.get('state');

  useEffect(() => {
    if (!clientId || !responseType) {
      setError('Missing required parameters (client_id, response_type)');
      setLoading(false);
      return;
    }
    if (responseType !== 'code') {
      setError('Only response_type=code is supported');
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: responseType,
      ...(state ? { state } : {}),
    });

    fetch(`/oauth/authorize?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.statusCode && data.statusCode >= 400) {
          setError(data.message || 'Invalid OAuth request');
        } else {
          setAppInfo(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to validate OAuth request');
        setLoading(false);
      });
  }, [clientId, responseType, state]);

  const handleAction = useCallback(
    async (action: 'approve' | 'deny') => {
      setSubmitting(true);
      try {
        const result = await (
          await fetch('/oauth/authorize', {
            method: 'POST',
            body: JSON.stringify({
              client_id: clientId,
              state,
              action,
            }),
          })
        ).json();

        if (result.redirect) {
          window.location.href = result.redirect;
        }
      } catch {
        setError('Failed to process authorization');
        setSubmitting(false);
      }
    },
    [clientId, state]
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas text-ink">
        <div className="text-center">
          <div className="flex justify-center mb-[24px]">
            <Logo />
          </div>
          <div className="t-body text-inkSecondary">Please wait...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas text-ink">
        <div className="text-center">
          <div className="flex justify-center mb-[24px]">
            <Logo />
          </div>
          <div className="t-title-2 mb-[12px]">Authorization Error</div>
          <div className="t-body text-inkSecondary max-w-[34rem]">{error}</div>
        </div>
      </div>
    );
  }

  if (!appInfo) {
    return null;
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-canvas text-ink">
      <div className="w-full max-w-[480px] mx-auto px-[24px]">
        <div className="flex justify-center mb-[32px]">
          <Logo />
        </div>

        <div className="bg-surface border border-line rounded-card p-[24px] flex flex-col gap-[24px]">
          <div className="flex flex-col items-center gap-[16px]">
            {appInfo.app.picture?.path ? (
              <img
                src={appInfo.app.picture.path}
                alt={appInfo.app.name}
                className="w-[64px] h-[64px] rounded-pill object-cover"
              />
            ) : (
              <div className="w-[64px] h-[64px] rounded-pill bg-surfaceActive flex items-center justify-center t-title-2 text-inkSecondary">
                {appInfo.app.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <h2 className="t-title-2 text-center">
              {appInfo.app.name}
            </h2>
            {appInfo.app.description && (
              <div className="t-secondary text-inkSecondary text-center">
                {appInfo.app.description}
              </div>
            )}
          </div>

          <div className="border-t border-line pt-[16px]">
            <div className="t-secondary text-inkSecondary mb-[12px]">
              This application is requesting access to your Slate account. It
              will be able to:
            </div>
            <ul className="t-body list-disc list-inside space-y-[4px]">
              <li>Access your integrations and channels</li>
              <li>Create and schedule posts on your behalf</li>
              <li>Read your post analytics</li>
            </ul>
          </div>

          <div className="flex gap-[12px]">
            <Button
              onClick={() => handleAction('approve')}
              disabled={submitting}
              className="flex-1"
            >
              Authorize
            </Button>
            <Button
              secondary={true}
              onClick={() => handleAction('deny')}
              disabled={submitting}
              className="flex-1"
            >
              Deny
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
