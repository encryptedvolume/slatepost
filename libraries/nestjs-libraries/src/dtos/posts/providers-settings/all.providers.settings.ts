import { TikTokDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/tiktok.dto';
import { IsIn } from 'class-validator';

export type ProviderExtension<T extends string, M> = { __type: T } & M;
export type AllProvidersSettings = ProviderExtension<'tiktok', TikTokDto>;

export const allProviders = (setEmpty?: any) => {
  return [{ value: TikTokDto, name: 'tiktok' }].filter((f) => f.value);
};

export class EmptySettings {
  @IsIn(allProviders(EmptySettings).map((p) => p.name), {
    message: `"__type" must be ${allProviders(EmptySettings)
      .map((p) => p.name)
      .join(', ')}`,
  })
  __type: string;
}
