import {
  IsDefined,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Provider } from '@prisma/client';

export class CreateOrgUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @IsDefined()
  @ValidateIf((o) => !o.providerToken)
  password: string;

  @IsString()
  @IsDefined()
  provider: Provider;

  @IsString()
  @IsDefined()
  @ValidateIf((o) => !o.password)
  providerToken: string;

  @IsEmail()
  @IsDefined()
  @ValidateIf((o) => !o.providerToken)
  email: string;

  /**
   * Slate is one self-hosted user, and the organisation is an implementation
   * detail they never see: the org switcher is gone from the shell and no
   * screen prints this name. Requiring it blocked account creation until the
   * user invented a company, so it is optional and the auth service falls back
   * to the email local-part.
   */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  company?: string;
}
