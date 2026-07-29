import { Metadata } from 'next';
import {
  A,
  Bullet,
  Bullets,
  Code,
  DataTable,
  Lead,
  LegalShell,
  LegalTocEntry,
  Note,
  P,
  Section,
} from '../legal.shell';
import { legal } from '../legal.config';

export const metadata: Metadata = {
  title: 'Privacy Policy | Slate',
  description:
    'How Slate collects, uses, stores and deletes personal data, including the data accessed through TikTok Login Kit and the TikTok Content Posting API.',
};

const toc: LegalTocEntry[] = [
  { id: 'who-we-are', label: '1. Who we are' },
  { id: 'what-we-collect', label: '2. What we collect' },
  { id: 'tiktok-access', label: '3. TikTok: what we access' },
  { id: 'tiktok-store', label: '4. TikTok: what we store' },
  { id: 'tiktok-send', label: '5. TikTok: what we send' },
  { id: 'tiktok-revoke', label: '6. TikTok: revoke and delete' },
  { id: 'other-platforms', label: '7. Other platforms' },
  { id: 'cookies', label: '8. Cookies' },
  { id: 'legal-bases', label: '9. Legal bases' },
  { id: 'sharing', label: '10. Who we share with' },
  { id: 'transfers', label: '11. International transfers' },
  { id: 'retention', label: '12. How long we keep data' },
  { id: 'security', label: '13. Security' },
  { id: 'rights', label: '14. Your rights' },
  { id: 'children', label: '15. Children' },
  { id: 'open-source', label: '16. Open source' },
  { id: 'changes', label: '17. Changes' },
  { id: 'contact', label: '18. Contact' },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      current="privacy"
      title="Privacy Policy"
      lede="Slate schedules posts to social media accounts you connect. That means we hold access tokens for those accounts and the content you ask us to publish. This policy sets out exactly what we hold, why, for how long, and how you get rid of it."
      updated="2026-07-28"
      updatedLabel="28 July 2026"
      toc={toc}
    >
      <Section id="who-we-are" title="1. Who we are">
        <P>
          Slate is operated by {legal.entityName} of {legal.postalAddress}. For
          the purposes of the UK and EU General Data Protection Regulation, we
          are the controller of the personal data described in this policy. You
          can reach us about anything in this policy at{' '}
          <A href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</A>.
        </P>
        <P>
          This policy covers the hosted service at slatepost.lol. It does not
          cover the social media platforms you connect &mdash; once your content
          is published to TikTok, or any other platform, that platform&rsquo;s
          own privacy policy governs what happens to it there.
        </P>
      </Section>

      <Section id="what-we-collect" title="2. What we collect">
        <DataTable
          caption="Categories of personal data Slate collects"
          head={['Category', 'What it includes', 'Where it comes from']}
          rows={[
            [
              'Account data',
              'Your email address, name, password hash, organisation name, team membership and role, language and timezone preference.',
              'You, when you register and configure your account.',
            ],
            [
              'Connected channel data',
              'For each social account you connect: the platform’s identifier for that account, the display name and username, the profile picture, and the OAuth access and refresh tokens issued to us.',
              'The platform, through its OAuth flow, after you authorise us.',
            ],
            [
              'Content data',
              'Post text, titles, hashtags, per-platform publishing settings, scheduled times, and the images, video and other media you upload to the library.',
              'You, when you compose and schedule posts.',
            ],
            [
              'Publishing results',
              'Whether a post succeeded or failed, the error a platform returned, and the identifiers a platform assigned to the published post.',
              'The platform, when we publish on your instruction.',
            ],
            [
              'Performance data',
              'Aggregate counts for connected accounts and for posts Slate published — for example follower counts, views, likes, comments and shares — stored as dated snapshots.',
              'The platform’s analytics endpoints.',
            ],
            [
              'Billing data',
              'Plan, subscription status, invoices and the last four digits and brand of your payment card. We never receive your full card number.',
              'Our payment processor.',
            ],
            [
              'Technical data',
              'IP address, browser and device information, and server and application logs including timestamps and error traces.',
              'Automatically, when you use the service.',
            ],
          ]}
        />
        <P>
          We do not knowingly collect special category data, and you should not
          put it into Slate beyond what is inherent in the posts you choose to
          publish.
        </P>
      </Section>

      <Section id="tiktok-access" title="3. TikTok: what we access and why">
        <P>
          When you connect a TikTok account, you are taken to TikTok to sign in
          and approve a specific set of permissions (&ldquo;scopes&rdquo;). We
          never see your TikTok password. TikTok returns an access token and a
          refresh token to us, and those tokens are the only way we can act on
          your account.
        </P>
        <P>
          Slate requests the following scopes. TikTok lists them on the consent
          screen before you approve, and you can decline.
        </P>
        <DataTable
          caption="TikTok scopes requested by Slate"
          head={['Scope', 'What it grants', 'Where Slate uses it']}
          rows={[
            [
              <Code key="basic">user.info.basic</Code>,
              'Your TikTok open ID, avatar, display name and username.',
              'Identifying which TikTok account a post will go to, and rendering the channel in the composer, calendar and settings.',
            ],
            [
              <Code key="profile">user.info.profile</Code>,
              'Your profile link, deep link, bio description and verified status.',
              'Showing the connected account’s profile details on the channel settings screen.',
            ],
            [
              <Code key="stats">user.info.stats</Code>,
              'Your follower count, following count, total likes and video count.',
              'The account-level figures on the Analytics screen.',
            ],
            [
              <Code key="list">video.list</Code>,
              'A list of your public videos on TikTok.',
              'Matching a post Slate published back to the video on your profile so its metrics can be shown against the post.',
            ],
            [
              <Code key="upload">video.upload</Code>,
              'Permission to send content to your TikTok inbox as a draft.',
              'The “Send to inbox” posting method, where you finish and publish inside the TikTok app.',
            ],
            [
              <Code key="publish">video.publish</Code>,
              'Permission to publish content directly to your profile.',
              'The “Direct post” posting method, where Slate publishes at your scheduled time.',
            ],
          ]}
        />
        <Note title="What we never do with TikTok data">
          <Bullets>
            <Bullet>
              We do not sell it, rent it, or share it with advertisers or data
              brokers.
            </Bullet>
            <Bullet>
              We do not use it to train machine learning models, our own or
              anyone else&rsquo;s.
            </Bullet>
            <Bullet>
              We do not read your direct messages. No scope we request grants
              that, and TikTok does not offer one.
            </Bullet>
            <Bullet>
              We do not post to your account except at a time and with content
              you set up in Slate.
            </Bullet>
            <Bullet>
              We do not use your TikTok data for any purpose other than
              operating the features described in the table above.
            </Bullet>
          </Bullets>
        </Note>
      </Section>

      <Section
        id="tiktok-store"
        title="4. TikTok: what we store, where and for how long"
      >
        <DataTable
          caption="TikTok data stored by Slate"
          head={['Data', 'Stored in', 'Retention']}
          rows={[
            [
              'TikTok user identifier (open ID)',
              'Our application database, as the channel’s internal identifier.',
              'Until you remove the channel.',
            ],
            [
              'Display name and username',
              'Our application database.',
              'Until you remove the channel.',
            ],
            [
              'Profile picture',
              'The URL is stored in our database; a copy of the image is stored in our object storage so the avatar renders reliably.',
              'Until you remove the channel.',
            ],
            [
              'Access token',
              'Our application database, on the channel record.',
              'Overwritten each time it is refreshed. TikTok access tokens are short-lived and Slate treats them as valid for about 24 hours.',
            ],
            [
              'Refresh token',
              'Our application database, on the channel record.',
              'Until you disconnect the channel in Slate or revoke Slate in TikTok.',
            ],
            [
              'Post content and settings',
              'Our application database; media in our object storage.',
              'Until you delete the post, or until your account is deleted.',
            ],
            [
              'Publish identifier and resulting video identifier',
              'Our application database, on the post record.',
              'With the post record.',
            ],
            [
              'Post metrics (views, likes, comments, shares)',
              'Our application database, as dated snapshots against the post.',
              legal.analyticsRetentionPeriod,
            ],
            [
              'Account metrics (followers, following, likes, videos)',
              'Our application database, as dated snapshots.',
              legal.analyticsRetentionPeriod,
            ],
          ]}
        />
        <P>
          Tokens are held so that Slate can publish at the time you scheduled,
          which may be hours or weeks after you closed the browser. They are
          restricted to our application servers and background workers, and are
          never sent to your browser, never written into logs, and never shared
          with third parties.
        </P>
      </Section>

      <Section
        id="tiktok-send"
        title="5. TikTok: what we send when you publish"
      >
        <P>
          At the moment a scheduled TikTok post runs, Slate sends TikTok the
          media and the settings you chose in the composer, and nothing else.
          Specifically:
        </P>
        <DataTable
          caption="Data Slate sends to TikTok when publishing"
          head={['Field', 'Values', 'When it applies']}
          rows={[
            [
              'Media',
              'The video file, or up to 35 images for a photo carousel, together with the cover image you selected.',
              'Always.',
            ],
            [
              'Caption or title',
              'The text you wrote. TikTok caps titles at 90 characters.',
              'Always.',
            ],
            [
              'Audience',
              <span key="pl">
                <Code>PUBLIC_TO_EVERYONE</Code>,{' '}
                <Code>MUTUAL_FOLLOW_FRIENDS</Code>,{' '}
                <Code>FOLLOWER_OF_CREATOR</Code> or <Code>SELF_ONLY</Code>.
              </span>,
              'Direct post only.',
            ],
            [
              'Allow comments, Duet, Stitch',
              'On or off, as you set them. Duet and Stitch exist for video only; TikTok has no equivalent for photo posts.',
              'Direct post only.',
            ],
            ['Auto-add music', 'Yes or no.', 'Photo posts, direct post only.'],
            [
              'AI-generated label',
              'On or off, as you set it.',
              'Video posts, direct post only.',
            ],
            [
              'Commercial content disclosure',
              'Whether the post promotes your own brand, is branded content on behalf of a third party, or both.',
              'Direct post only.',
            ],
            [
              'Posting method',
              <span key="pm">
                <Code>DIRECT_POST</Code> or <Code>UPLOAD</Code>.
              </span>,
              'Always.',
            ],
          ]}
        />
        <P>
          We do not add watermarks, our own branding, or any tracking to your
          content. We do not attach your Slate account details, your email
          address, or data from any other connected channel.
        </P>
      </Section>

      <Section
        id="tiktok-revoke"
        title="6. TikTok: how to revoke access and delete your data"
      >
        <P>
          <Lead>
            There are two independent switches, and we recommend using both.
          </Lead>
        </P>
        <Note title="1. Disconnect the channel in Slate">
          <P>
            Open Settings, find the TikTok channel, and choose Disconnect or
            Delete. Slate immediately stops publishing to that account, stops
            refreshing its tokens, and stops collecting metrics for it. Any
            posts still scheduled to that channel will not be sent.
          </P>
          <P>
            To be precise about what this does to the stored record: removing a
            channel marks it as deleted and takes it out of the product. The
            underlying row, including the tokens, remains in our database in
            that deleted state until it is purged, which happens within{' '}
            {legal.erasureWindow}. That is why the second step matters.
          </P>
        </Note>
        <Note title="2. Revoke Slate inside TikTok">
          <P>
            In the TikTok app, go to Profile, then the menu, then Settings and
            privacy, then Security &amp; permissions, then Manage app
            permissions. Select Slate and remove it. TikTok invalidates our
            tokens straight away, so they cannot be used again even before our
            copies are purged. This is the authoritative revocation and it is
            entirely under your control.
          </P>
        </Note>
        <P>
          To have everything erased rather than simply disconnected &mdash; the
          channel record, the posts sent to it, the media, and the stored
          metrics &mdash; email{' '}
          <A href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</A> from
          your account address and ask for erasure. We will complete it within{' '}
          {legal.erasureWindow} and confirm when it is done. Deleting your whole
          Slate account erases all connected channels with it.
        </P>
        <P>
          Content that has already been published to TikTok stays on TikTok.
          Deleting it in Slate does not delete it from your TikTok profile; you
          need to delete the post in TikTok as well.
        </P>
      </Section>

      <Section id="other-platforms" title="7. Other connected platforms">
        <P>
          Slate connects to social networks other than TikTok. The pattern is
          the same for all of them: you authorise us through the
          platform&rsquo;s OAuth flow, we store the account identifier, display
          name, avatar and tokens, we send the content and settings you chose,
          and we read back the metrics the platform exposes for posts we
          published. You can disconnect any channel in Settings and revoke our
          access from inside that platform.
        </P>
        <P>
          We only ever request the permissions a platform requires for
          scheduling, publishing and reading back post performance.
        </P>
      </Section>

      <Section id="cookies" title="8. Cookies and similar technologies">
        <P>
          Slate sets a small number of strictly necessary cookies. Without them
          you cannot stay signed in.
        </P>
        <DataTable
          caption="Cookies set by Slate"
          head={['Cookie', 'Purpose', 'Type']}
          rows={[
            [
              <Code key="auth">auth</Code>,
              'Keeps you signed in. Contains your session token.',
              'Strictly necessary',
            ],
            [
              <Code key="showorg">showorg</Code>,
              'Remembers which organisation you are currently working in.',
              'Strictly necessary',
            ],
            [
              <Code key="impersonate">impersonate</Code>,
              'Set only during an authorised support session where a member of our team is acting on your account with permission.',
              'Strictly necessary',
            ],
            [
              <Code key="i18next">i18next</Code>,
              'Remembers your interface language.',
              'Preference',
            ],
          ]}
        />
        <P>
          Depending on how this deployment is configured, Slate may also load
          site analytics, product analytics and error monitoring. The providers
          in use on slatepost.lol are {legal.analyticsProviders}. These help us
          understand aggregate usage and diagnose faults. They are never used to
          build advertising profiles, and they never receive your access tokens
          or the content of your posts. Where consent is required for
          non-essential analytics, we ask for it before loading them and you can
          withdraw it at any time.
        </P>
      </Section>

      <Section id="legal-bases" title="9. Legal bases for processing">
        <DataTable
          caption="Legal bases relied on under the UK and EU GDPR"
          head={['Purpose', 'Legal basis']}
          rows={[
            [
              'Providing the service: your account, the composer, scheduling, and publishing to your connected channels.',
              'Performance of our contract with you.',
            ],
            [
              'Storing and refreshing OAuth tokens so scheduled posts can be published later.',
              'Performance of our contract with you.',
            ],
            [
              'Reading back post and account metrics to show you performance.',
              'Performance of our contract with you.',
            ],
            [
              'Security, abuse prevention, service logs and fault diagnosis.',
              'Our legitimate interest in keeping the service safe and working.',
            ],
            [
              'Product analytics and service emails about changes to Slate.',
              'Our legitimate interest in improving and supporting the service, or your consent where required.',
            ],
            [
              'Non-essential cookies and marketing email.',
              'Your consent, which you can withdraw at any time.',
            ],
            [
              'Billing records and tax and accounting obligations.',
              'Compliance with a legal obligation.',
            ],
          ]}
        />
      </Section>

      <Section id="sharing" title="10. Who we share data with">
        <P>
          We do not sell personal data, and we do not share it for cross-context
          behavioural advertising. We disclose it only to the following
          categories of recipient, each under a written contract that limits
          them to processing it on our instructions.
        </P>
        <DataTable
          caption="Categories of recipient"
          head={['Recipient', 'What they receive', 'Why']}
          rows={[
            [
              'Social platforms you connect, including TikTok',
              'The post content and settings you scheduled to that platform.',
              'To publish on your instruction.',
            ],
            [
              legal.hostingProvider,
              'All service data, as the infrastructure it runs on.',
              'Application hosting, database and background job processing.',
            ],
            [
              legal.objectStorageProvider,
              'Uploaded media and cached channel avatars.',
              'Storing and serving media files.',
            ],
            [
              legal.emailProvider,
              'Your email address and the contents of service emails.',
              'Sending account activation, password reset and notification email.',
            ],
            [
              legal.paymentProcessor,
              'Your billing details and payment method. We never receive your full card number.',
              'Taking payment for paid plans.',
            ],
            [
              legal.analyticsProviders,
              'Usage events and error reports. Never tokens or post content.',
              'Understanding aggregate usage and diagnosing faults.',
            ],
            [
              'OpenAI',
              'Only the text you submit to an AI feature, at the moment you use it.',
              'Powering the optional AI writing assistance in the composer. If you do not use those features, nothing is sent.',
            ],
          ]}
        />
        <P>
          We may also disclose data where we are legally required to, to
          establish or defend legal claims, or as part of a merger or
          acquisition &mdash; in which case we will tell you before your data
          becomes subject to a different privacy policy.
        </P>
      </Section>

      <Section id="transfers" title="11. International transfers">
        <P>
          Slate is hosted in {legal.hostingRegion}. Some of the providers listed
          above process data outside that region. Where personal data leaves the
          UK or the European Economic Area, we rely on an adequacy decision
          where one exists, and otherwise on the UK International Data Transfer
          Addendum or the European Commission&rsquo;s Standard Contractual
          Clauses, together with additional safeguards where they are needed.
        </P>
        <P>
          Publishing to a social platform necessarily transfers your content to
          that platform&rsquo;s own infrastructure, wherever that is. TikTok
          documents its own transfers in its privacy policy.
        </P>
      </Section>

      <Section id="retention" title="12. How long we keep data">
        <DataTable
          caption="Retention periods"
          head={['Data', 'Retention']}
          rows={[
            [
              'Account and organisation records',
              <span key="acct">
                For as long as your account is open, then erased within{' '}
                {legal.erasureWindow}.
              </span>,
            ],
            [
              'Connected channel records and OAuth tokens',
              'Until you disconnect the channel or close your account, then purged within the erasure window below.',
            ],
            [
              'Posts, drafts and publishing history',
              'Until you delete them, or until your account is closed.',
            ],
            [
              'Uploaded media',
              'Until you delete it from the media library, or until your account is closed.',
            ],
            ['Performance snapshots', legal.analyticsRetentionPeriod],
            ['Server and application logs', legal.logRetentionPeriod],
            [
              'Billing records and invoices',
              'As long as tax and accounting law requires, typically six to seven years, even after your account closes.',
            ],
            [
              'Backups',
              <span key="bk">
                Backups roll off on a fixed cycle of{' '}
                {legal.backupRetentionPeriod}. Deleted data can persist in a
                backup until that cycle completes, after which it is gone.
              </span>,
            ],
          ]}
        />
        <P>
          Once an account is closed we erase or irreversibly anonymise its data
          within {legal.erasureWindow}, except where we must keep something to
          meet a legal obligation or to defend a legal claim.
        </P>
      </Section>

      <Section id="security" title="13. Security">
        <Bullets>
          <Bullet>
            All traffic to slatepost.lol and to our API is encrypted in transit
            with TLS. Data is encrypted at rest by our hosting and storage
            providers.
          </Bullet>
          <Bullet>
            Passwords are stored as salted one-way hashes. We never store them
            in a recoverable form and we never see your password for any
            connected platform.
          </Bullet>
          <Bullet>
            OAuth tokens are held on the server side only. They are never sent
            to your browser and are excluded from application logs.
          </Bullet>
          <Bullet>
            Access to production systems is limited to the people who need it,
            is individually authenticated, and is logged.
          </Bullet>
          <Bullet>
            We keep our dependencies patched and monitor for known
            vulnerabilities.
          </Bullet>
        </Bullets>
        <P>
          No service can promise perfect security. If a breach affects your
          personal data and is likely to result in a risk to your rights, we
          will notify the relevant supervisory authority within 72 hours and
          tell you without undue delay where the law requires it.
        </P>
      </Section>

      <Section id="rights" title="14. Your rights">
        <P>
          Depending on where you live, you have some or all of the following
          rights over your personal data:
        </P>
        <Bullets>
          <Bullet>
            <Lead>Access.</Lead> Get a copy of the personal data we hold about
            you.
          </Bullet>
          <Bullet>
            <Lead>Rectification.</Lead> Have inaccurate data corrected.
          </Bullet>
          <Bullet>
            <Lead>Erasure.</Lead> Have your data deleted, subject to the
            retention obligations above.
          </Bullet>
          <Bullet>
            <Lead>Restriction and objection.</Lead> Ask us to pause processing,
            or object to processing we base on legitimate interests.
          </Bullet>
          <Bullet>
            <Lead>Portability.</Lead> Receive the data you gave us in a
            structured, machine-readable format, or have it sent to another
            provider.
          </Bullet>
          <Bullet>
            <Lead>Withdraw consent.</Lead> Where we rely on consent, withdraw it
            at any time. This does not affect processing that already happened.
          </Bullet>
          <Bullet>
            <Lead>Complain.</Lead> Lodge a complaint with your local data
            protection supervisory authority.
          </Bullet>
        </Bullets>
        <P>
          If you are a California resident: we do not sell or share personal
          information as those terms are defined by the CCPA, and we will not
          discriminate against you for exercising your rights.
        </P>
        <P>
          To exercise any of these, email{' '}
          <A href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</A>. We
          respond within one month, and will tell you if we need longer because
          a request is complex. We may ask you to confirm your identity first.
        </P>
      </Section>

      <Section id="children" title="15. Children">
        <P>
          Slate is not intended for children. You must be at least 16, or the
          minimum age of digital consent in your country if that is higher, to
          hold an account. We do not knowingly collect data from anyone below
          that age; if you believe we have, tell us at{' '}
          <A href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</A> and
          we will delete it.
        </P>
      </Section>

      <Section id="open-source" title="16. Open source">
        <P>
          Slate is free software licensed under the{' '}
          <A href="https://www.gnu.org/licenses/agpl-3.0.en.html">
            GNU Affero General Public License v3.0
          </A>
          , and is a modified version of Postiz (upstream release{' '}
          <Code>v1.47.0</Code>), Copyright &copy; 2025 Nevo David. The complete
          Corresponding Source for the version running on this site is published
          at <A href={legal.sourceRepoUrl}>{legal.sourceRepoUrl}</A>, free of
          charge and without needing an account.
        </P>
        <P>
          This matters for privacy in a practical way: the code that handles
          your tokens and your content is published, so the claims made in this
          policy can be checked rather than taken on trust. Slate is not
          affiliated with, endorsed by, or sponsored by Postiz or Nevo David.
        </P>
      </Section>

      <Section id="changes" title="17. Changes to this policy">
        <P>
          We update this policy when the service changes or when a platform we
          integrate with changes what it requires. The &ldquo;Last
          updated&rdquo; date at the top always reflects the current version. If
          a change materially affects how we handle your personal data, we will
          tell you by email or in the product before it takes effect.
        </P>
      </Section>

      <Section id="contact" title="18. Contact">
        <P>
          Privacy questions, data subject requests and complaints go to{' '}
          <A href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</A>.
          Everything else goes to{' '}
          <A href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</A>.
        </P>
        <P>
          {legal.entityName}
          <br />
          {legal.postalAddress}
        </P>
        <P>
          You can also read our <A href="/terms">Terms of Service</A>.
        </P>
      </Section>
    </LegalShell>
  );
}
