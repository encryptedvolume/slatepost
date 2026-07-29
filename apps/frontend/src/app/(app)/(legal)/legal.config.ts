/*
 * The facts the legal documents cannot invent.
 *
 * A privacy policy and a set of terms are binding statements about a real
 * operator: who the controller is, where it is registered, which law governs,
 * how long an erasure takes. None of that can be hard-coded here and none of
 * it can be approximated, so every one of those facts is supplied by the
 * deployment.
 *
 * There is no default value and no placeholder rendering. If a variable is
 * unset this module throws, and because /terms and /privacy are prerendered
 * that throw fails `next build` with the exact list of what is missing. The
 * consequence is the intended one: a build in which the documents are still
 * blank cannot ship. Nothing renders "[PLACEHOLDER: …]" to a reader ever
 * again.
 *
 * Reads are written out as literal `process.env.X` member expressions on
 * purpose — that is the only form Next.js statically inlines.
 */

const raw = {
  /** Registered name of the controller / contracting entity. */
  entityName: process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME,
  /** Single-line registered postal address. */
  postalAddress: process.env.NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS,
  /** Mailbox for data subject requests and privacy complaints. */
  privacyEmail: process.env.NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL,
  /** General contact mailbox. */
  contactEmail: process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL,
  /** AGPL-3.0 s.13: where the Corresponding Source of this revision lives. */
  sourceRepoUrl: process.env.NEXT_PUBLIC_LEGAL_SOURCE_REPO_URL,
  /** e.g. "30 days" — the committed window for completing an erasure. */
  erasureWindow: process.env.NEXT_PUBLIC_LEGAL_ERASURE_WINDOW,
  /** e.g. "35 days" — how long backups hold a copy after deletion. */
  backupRetentionPeriod: process.env.NEXT_PUBLIC_LEGAL_BACKUP_RETENTION,
  /** Where the service is hosted, for the transfers section. */
  hostingRegion: process.env.NEXT_PUBLIC_LEGAL_HOSTING_REGION,
  /** Named infrastructure / application hosting provider. */
  hostingProvider: process.env.NEXT_PUBLIC_LEGAL_HOSTING_PROVIDER,
  /** Named object storage provider for uploaded media. */
  objectStorageProvider: process.env.NEXT_PUBLIC_LEGAL_OBJECT_STORAGE_PROVIDER,
  /** Named transactional email provider. */
  emailProvider: process.env.NEXT_PUBLIC_LEGAL_EMAIL_PROVIDER,
  /** e.g. "13 months" — how long performance snapshots are kept. */
  analyticsRetentionPeriod: process.env.NEXT_PUBLIC_LEGAL_ANALYTICS_RETENTION,
  /** e.g. "90 days" — how long server and application logs are kept. */
  logRetentionPeriod: process.env.NEXT_PUBLIC_LEGAL_LOG_RETENTION,
  /** Prose list of analytics / monitoring providers actually enabled. */
  analyticsProviders: process.env.NEXT_PUBLIC_LEGAL_ANALYTICS_PROVIDERS,
  /** Named payment processor. */
  paymentProcessor: process.env.NEXT_PUBLIC_LEGAL_PAYMENT_PROCESSOR,
  /** Liability cap as written in the terms. */
  liabilityCap: process.env.NEXT_PUBLIC_LEGAL_LIABILITY_CAP,
  /** Governing law and forum, used twice in one sentence. */
  governingLaw: process.env.NEXT_PUBLIC_LEGAL_GOVERNING_LAW,
};

const variableFor: Record<keyof typeof raw, string> = {
  entityName: 'NEXT_PUBLIC_LEGAL_ENTITY_NAME',
  postalAddress: 'NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS',
  privacyEmail: 'NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL',
  contactEmail: 'NEXT_PUBLIC_LEGAL_CONTACT_EMAIL',
  sourceRepoUrl: 'NEXT_PUBLIC_LEGAL_SOURCE_REPO_URL',
  erasureWindow: 'NEXT_PUBLIC_LEGAL_ERASURE_WINDOW',
  backupRetentionPeriod: 'NEXT_PUBLIC_LEGAL_BACKUP_RETENTION',
  hostingRegion: 'NEXT_PUBLIC_LEGAL_HOSTING_REGION',
  hostingProvider: 'NEXT_PUBLIC_LEGAL_HOSTING_PROVIDER',
  objectStorageProvider: 'NEXT_PUBLIC_LEGAL_OBJECT_STORAGE_PROVIDER',
  emailProvider: 'NEXT_PUBLIC_LEGAL_EMAIL_PROVIDER',
  analyticsRetentionPeriod: 'NEXT_PUBLIC_LEGAL_ANALYTICS_RETENTION',
  logRetentionPeriod: 'NEXT_PUBLIC_LEGAL_LOG_RETENTION',
  analyticsProviders: 'NEXT_PUBLIC_LEGAL_ANALYTICS_PROVIDERS',
  paymentProcessor: 'NEXT_PUBLIC_LEGAL_PAYMENT_PROCESSOR',
  liabilityCap: 'NEXT_PUBLIC_LEGAL_LIABILITY_CAP',
  governingLaw: 'NEXT_PUBLIC_LEGAL_GOVERNING_LAW',
};

const missing = (Object.keys(variableFor) as Array<keyof typeof raw>).filter(
  (key) => !raw[key]?.trim()
);

if (missing.length) {
  throw new Error(
    [
      'The public legal documents cannot be rendered with unfilled facts.',
      '',
      `Set the following ${missing.length} environment variable${
        missing.length === 1 ? '' : 's'
      } and rebuild:`,
      ...missing.map((key) => `  ${variableFor[key]}`),
      '',
      'See .env.example for what each one means. These values are published',
      'verbatim in the Terms of Service and Privacy Policy, so they must be',
      'the real registered details of the operator of this deployment.',
    ].join('\n')
  );
}

export const legal = raw as { [K in keyof typeof raw]: string };
