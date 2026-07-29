import { videoWrapper } from '@gitroom/frontend/components/videos/video.wrapper';
import { FC, useCallback, useRef, useState, useEffect } from 'react';
import { useVideoFunction } from '@gitroom/frontend/components/videos/video.render.component';
import useSWR from 'swr';
import { useFormContext } from 'react-hook-form';
import { Button } from '@gitroom/react/form/button';
import clsx from 'clsx';
import { useVideo } from '@gitroom/frontend/components/videos/video.context.wrapper';

export interface Voices {
  voices: Voice[];
}

export interface Voice {
  id: string;
  name: string;
  preview_url: string;
}

const VoiceSelector: FC = () => {
  const { register, watch, setValue } = useFormContext();
  const videoFunction = useVideoFunction();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { value } = useVideo();

  register('prompt', {
    value,
  });

  const loadVideos = useCallback(() => {
    return videoFunction('loadVoices', {});
  }, []);

  const selectedVoice = watch('voice');
  const { isLoading, data } = useSWR<Voices>('load-voices', loadVideos);

  // Auto-select first voice when data loads
  useEffect(() => {
    if (data?.voices?.length && !selectedVoice) {
      setValue('voice', data.voices[0].id);
    }
  }, [data, selectedVoice, setValue]);

  const playVoice = useCallback(
    async (voiceId: string, previewUrl: string) => {
      try {
        setLoadingVoice(voiceId);

        // Stop current audio if playing
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        // If clicking the same voice that's playing, stop it
        if (currentlyPlaying === voiceId) {
          setCurrentlyPlaying(null);
          setLoadingVoice(null);
          return;
        }

        // Create new audio element
        const audio = new Audio(previewUrl);
        audioRef.current = audio;

        audio.addEventListener('loadeddata', () => {
          setLoadingVoice(null);
          setCurrentlyPlaying(voiceId);
        });

        audio.addEventListener('ended', () => {
          setCurrentlyPlaying(null);
          audioRef.current = null;
        });

        audio.addEventListener('error', () => {
          setLoadingVoice(null);
          setCurrentlyPlaying(null);
          audioRef.current = null;
        });

        await audio.play();
      } catch (error) {
        console.error('Error playing voice:', error);
        setLoadingVoice(null);
        setCurrentlyPlaying(null);
      }
    },
    [currentlyPlaying]
  );

  const selectVoice = useCallback(
    (voiceId: string) => {
      setValue('voice', voiceId);
    },
    [setValue]
  );

  if (isLoading || !data?.voices?.length) {
    return (
      <div className="flex items-center justify-center py-[16px]">
        <div className="t-secondary text-inkTertiary">Loading voices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-[12px]">
      <div className="t-secondary-emphasis text-textColor mb-[16px]">
        Select a Voice
      </div>
      <div className="space-y-[8px]">
        {data.voices.map((voice) => (
          <div
            key={voice.id}
            className={clsx(
              'flex items-center justify-between p-[12px] rounded-control border transition-colors cursor-pointer',
              selectedVoice === voice.id
                ? 'border-lineStrong bg-surfaceActive'
                : 'border-line bg-surface hover:bg-surfaceHover'
            )}
            onClick={() => selectVoice(voice.id)}
          >
            <div className="flex items-center space-x-[12px]">
              <input
                {...register('voice')}
                type="radio"
                value={voice.id}
                className="w-[16px] h-[16px] text-primary border-line focus:ring-primary"
                checked={selectedVoice === voice.id}
                onChange={() => selectVoice(voice.id)}
              />
              <div>
                <div className="t-secondary-emphasis text-textColor">
                  {voice.name}
                </div>
              </div>
            </div>

            <Button
              type="button"
              className={clsx(
                'px-[12px] py-[4px] t-caption',
                loadingVoice === voice.id && 'opacity-50 cursor-not-allowed',
                currentlyPlaying === voice.id && 'bg-criticalTint text-critical hover:bg-criticalTint'
              )}
              onClick={(e) => {
                e.stopPropagation();
                playVoice(voice.id, voice.preview_url);
              }}
              disabled={loadingVoice === voice.id}
            >
              {loadingVoice === voice.id
                ? '...'
                : currentlyPlaying === voice.id
                ? '⏹ Stop'
                : '▶ Play'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ImageSlidesComponent = () => {
  return <VoiceSelector />;
};

videoWrapper('image-text-slides', ImageSlidesComponent);
