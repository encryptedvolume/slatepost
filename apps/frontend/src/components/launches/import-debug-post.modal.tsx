'use client';

import { FC, useCallback, useMemo, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { Button } from '@gitroom/react/form/button';
import { useIntegrationList } from '@gitroom/frontend/components/launches/helpers/use.integration.list';
import { useSWRConfig } from 'swr';
import clsx from 'clsx';

interface DebugPostData {
  type: string;
  date: string;
  shortLink: boolean;
  tags: Array<{ value: string; label: string }>;
  posts: Array<{
    integration: { id: string };
    group: string;
    settings: { __type: string; [key: string]: any };
    value: Array<{
      content: string;
      image: Array<{ id: string; path: string; alt?: string; thumbnail?: string }>;
      delay: number;
    }>;
  }>;
  _debug: {
    providerIdentifier: string;
    providerName: string;
    state: string;
    error: string | null;
    errors: Array<{
      message: string;
      platform: string;
      body: string;
      createdAt: string;
    }>;
    originalGroup: string;
    originalPublishDate: string;
    exportedAt: string;
  };
}

export const ImportDebugPostModal: FC<{ close: () => void }> = ({ close }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const t = useT();
  const [jsonInput, setJsonInput] = useState('');
  const [parsed, setParsed] = useState<DebugPostData | null>(null);
  const [parseError, setParseError] = useState('');
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('');
  const [importing, setImporting] = useState(false);
  const { data: integrations } = useIntegrationList();
  const { mutate } = useSWRConfig();

  const handleJsonChange = useCallback((value: string) => {
    setJsonInput(value);
    setParseError('');
    setParsed(null);
    setSelectedIntegrationId('');

    if (!value.trim()) return;

    try {
      const data = JSON.parse(value);
      if (!data.posts || !data._debug?.providerIdentifier) {
        setParseError('Invalid debug JSON format. Missing posts or _debug data.');
        return;
      }
      setParsed(data);
    } catch {
      setParseError('Invalid JSON');
    }
  }, []);

  const matchingIntegrations = useMemo((): any[] => {
    if (!parsed || !integrations?.length) return [];
    return integrations.filter(
      (i: any) => i.identifier === parsed._debug.providerIdentifier
    );
  }, [parsed, integrations]);

  const handleImport = useCallback(async () => {
    if (!parsed || !selectedIntegrationId) return;

    setImporting(true);
    try {
      const { _debug, ...payload } = parsed;
      const importPayload = {
        ...payload,
        type: 'draft',
        date: new Date().toISOString(),
        tags: [] as { value: string; label: string }[],
        posts: payload.posts.map((post) => ({
          ...post,
          integration: { id: selectedIntegrationId },
        })),
      };

      await fetch('/posts', {
        method: 'POST',
        body: JSON.stringify(importPayload),
      });

      await mutate(
        (key: string) =>
          typeof key === 'string' &&
          (key.startsWith('/posts-') || key.startsWith('/posts-list-')),
        undefined,
        { revalidate: true }
      );

      toaster.show(
        t('debug_post_imported', 'Post imported as draft successfully'),
        'success'
      );
      close();
    } catch {
      toaster.show(
        t('debug_post_import_failed', 'Failed to import post'),
        'warning'
      );
    } finally {
      setImporting(false);
    }
  }, [parsed, selectedIntegrationId, fetch, toaster, t, close, mutate]);

  return (
    <div className="flex flex-col gap-[16px] min-w-[500px]">
      <textarea
        className="w-full h-[200px] p-[12px] rounded-control bg-input border border-tableBorder text-textColor font-mono t-secondary resize-y"
        placeholder={t(
          'paste_debug_json',
          'Paste the debug JSON copied from a failed post...'
        )}
        value={jsonInput}
        onChange={(e) => handleJsonChange(e.target.value)}
      />

      {parseError && (
        <div className="text-critical t-secondary">{parseError}</div>
      )}

      {parsed && (
        <div className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[8px] p-[12px] rounded-control bg-input border border-tableBorder">
            <div className="t-secondary-strong text-textColor">
              {t('debug_info', 'Debug Info')}
            </div>
            <div className="t-caption text-inkSecondary flex flex-col gap-[4px] min-w-0 break-all">
              <div>
                <span className="t-caption-strong">
                  {t('provider', 'Provider')}:
                </span>{' '}
                {parsed._debug.providerIdentifier} ({parsed._debug.providerName})
              </div>
              <div>
                <span className="t-caption-strong">
                  {t('state', 'State')}:
                </span>{' '}
                <span className={parsed._debug.state === 'ERROR' ? 'text-critical' : ''}>
                  {parsed._debug.state}
                </span>
              </div>
              {parsed._debug.error && (
                <div>
                  <span className="t-caption-strong">
                    {t('error', 'Error')}:
                  </span>{' '}
                  <span className="text-critical">{parsed._debug.error}</span>
                </div>
              )}
              {parsed._debug.errors?.length > 0 && (
                <div className="mt-[4px]">
                  <span className="t-caption-strong">
                    {t('error_details', 'Error Details')}:
                  </span>
                  <div className="mt-[4px] max-h-[96px] overflow-y-auto bg-newBgColor p-[8px] rounded-thumb t-numeric break-all whitespace-pre-wrap">
                    {parsed._debug.errors.map((err, i) => (
                      <div key={i} className="mb-[4px]">
                        [{err.platform}] {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="t-caption-strong">
                  {t('original_date', 'Original Date')}:
                </span>{' '}
                {new Date(parsed._debug.originalPublishDate).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <div className="t-secondary-strong text-textColor">
              {t('select_local_integration', 'Select Local Integration')}
              <span className="t-caption text-inkSecondary ml-[8px]">
                ({parsed._debug.providerIdentifier})
              </span>
            </div>

            {matchingIntegrations.length === 0 ? (
              <div className="t-secondary text-critical">
                {t(
                  'no_matching_integrations',
                  `No ${parsed._debug.providerIdentifier} integrations found. Add one first.`
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {matchingIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className={clsx(
                      'flex items-center gap-[8px] p-[8px] rounded-control border cursor-pointer transition-all',
                      selectedIntegrationId === integration.id
                        ? 'border-lineStrong bg-surfaceActive'
                        : 'border-line hover:border-lineStrong'
                    )}
                    onClick={() => setSelectedIntegrationId(integration.id)}
                  >
                    <img
                      src={integration.picture || '/no-picture.jpg'}
                      className="w-[24px] h-[24px] rounded-thumb"
                      alt={integration.name}
                    />
                    <div className="t-secondary text-textColor">
                      {integration.name}
                    </div>
                    <img
                      src={`/icons/platforms/${integration.identifier}.png`}
                      className="w-[14px] h-[14px] rounded-thumb ml-auto"
                      alt={integration.identifier}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleImport}
            loading={importing}
            disabled={!selectedIntegrationId}
            className="rounded-thumb"
          >
            {t('import_as_draft', 'Import as Draft')}
          </Button>
        </div>
      )}
    </div>
  );
};
