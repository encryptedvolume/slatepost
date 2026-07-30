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
  title: 'Terms of Service | Slate',
  description:
    'The terms that govern your use of Slate, the social media scheduling service at slatepost.lol.',
};

const toc: LegalTocEntry[] = [
  { id: 'about', label: '1. About these terms' },
  { id: 'service', label: '2. What Slate does' },
  { id: 'account', label: '3. Your account' },
  { id: 'channels', label: '4. Connected channels' },
  { id: 'tiktok', label: '5. Posting to TikTok' },
  { id: 'content', label: '6. Your content' },
  { id: 'acceptable-use', label: '7. Acceptable use' },
  { id: 'availability', label: '8. Scheduling and availability' },
  { id: 'termination', label: '9. Suspension and termination' },
  { id: 'open-source', label: '10. Open source rights' },
  { id: 'liability', label: '11. Disclaimers and liability' },
  { id: 'changes', label: '12. Changes to these terms' },
  { id: 'law', label: '13. Governing law' },
  { id: 'contact', label: '14. Contact' },
];

export default function TermsPage() {
  return (
    <LegalShell
      current="terms"
      title="Terms of Service"
      lede="These terms are the agreement between you and us about your use of Slate. They cover the hosted service at slatepost.lol — not the open source software Slate is built from, which you are separately free to use under its own licence."
      updated="2026-07-28"
      updatedLabel="28 July 2026"
      toc={toc}
    >
      <Section id="about" title="1. About these terms">
        <P>
          Slate is a social media scheduling service operated by{' '}
          {legal.entityName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;), registered at{' '}
          {legal.postalAddress}. These Terms of Service (&ldquo;Terms&rdquo;)
          govern your access to and use of the Slate website, application and
          API at slatepost.lol.
        </P>
        <P>
          By creating an account, connecting a social media channel, or
          otherwise using Slate, you agree to these Terms. If you are agreeing
          on behalf of a company or other organisation, you confirm you have
          authority to bind it, and &ldquo;you&rdquo; means that organisation.
        </P>
        <P>
          Our <A href="/privacy">Privacy Policy</A> explains how we handle
          personal data and forms part of these Terms.
        </P>
      </Section>

      <Section id="service" title="2. What Slate does">
        <P>
          Slate lets you write a post once, schedule it, and have it published
          to the social media accounts you have connected. The core of the
          service is:
        </P>
        <Bullets>
          <Bullet>
            A calendar and composer for drafting posts and choosing when they go
            out.
          </Bullet>
          <Bullet>
            A media library for the images and video you attach to those posts.
          </Bullet>
          <Bullet>
            A scheduler that, at the time you chose, sends your post to each
            connected platform through that platform&rsquo;s official API.
          </Bullet>
          <Bullet>
            Reporting that reads back publicly available metrics for the posts
            Slate published, where the platform makes them available.
          </Bullet>
        </Bullets>
        <P>
          Slate acts on your instructions. We do not write, edit, approve or
          moderate the content you schedule, and we do not post to your accounts
          except as you have directed.
        </P>
      </Section>

      <Section id="account" title="3. Your account">
        <P>
          You must be at least 16 years old, or the minimum age at which you can
          consent to online services in your country if that is higher, to use
          Slate. You must give accurate registration details and keep them
          current.
        </P>
        <P>
          You are responsible for everything that happens under your account.
          Keep your password and any API keys confidential, and tell us promptly
          at{' '}
          <A href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</A> if
          you believe your account has been accessed without your permission.
        </P>
      </Section>

      <Section id="channels" title="4. Connected channels">
        <P>
          To publish anything, you connect one or more social media accounts
          (&ldquo;channels&rdquo;) to Slate. Connecting a channel authorises us,
          through that platform&rsquo;s official OAuth flow, to act on your
          behalf within the permissions you granted.
        </P>
        <P>
          Each platform has its own terms, and they continue to apply to you.
          Using Slate does not change your relationship with any platform, and
          it does not exempt you from their rules on content, advertising
          disclosure, automation, or rate limits. You are responsible for making
          sure the posts you schedule comply with the rules of every platform
          you send them to.
        </P>
        <P>
          You can disconnect a channel at any time from the Slate settings
          screen, and you can independently revoke Slate&rsquo;s access from
          inside the platform itself. Doing either will stop Slate publishing to
          that channel, including any posts already scheduled.
        </P>
        <P>
          We are not affiliated with, endorsed by, or sponsored by any of the
          platforms Slate connects to. Their names and marks belong to them.
        </P>
      </Section>

      <Section id="tiktok" title="5. Posting to TikTok">
        <P>
          TikTok imposes specific obligations on both of us, so this section
          sets them out separately.
        </P>
        <P>
          When you connect a TikTok account, you authorise Slate through TikTok
          Login Kit and you use the TikTok Content Posting API through us. In
          doing so:
        </P>
        <Bullets>
          <Bullet>
            You agree to be bound by TikTok&rsquo;s own terms, including the{' '}
            <A href="https://www.tiktok.com/legal/page/row/terms-of-service/en">
              TikTok Terms of Service
            </A>{' '}
            and{' '}
            <A href="https://www.tiktok.com/community-guidelines">
              Community Guidelines
            </A>
            .
          </Bullet>
          <Bullet>
            You confirm you own or have the rights to the video, images, audio
            and text you publish through Slate, and that publishing them does
            not infringe anyone else&rsquo;s rights.
          </Bullet>
          <Bullet>
            You agree to TikTok&rsquo;s{' '}
            <A href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en">
              Music Usage Confirmation
            </A>{' '}
            when you post, and additionally to TikTok&rsquo;s{' '}
            <A href="https://www.tiktok.com/legal/page/global/bc-policy/en">
              Branded Content Policy
            </A>{' '}
            when you have disclosed the post as branded content. Slate shows you
            the applicable statement in the composer before you publish.
          </Bullet>
          <Bullet>
            You are responsible for correctly disclosing commercial content. If
            a post promotes yourself, a brand, a product or a service, you must
            switch on the commercial content disclosure in the composer and
            select whether it promotes your own brand, a third party, or both.
          </Bullet>
        </Bullets>

        <P>
          Slate offers two ways to send content to TikTok, and they behave
          differently:
        </P>
        <DataTable
          caption="TikTok posting methods offered by Slate"
          head={['Method', 'What happens', 'Which settings apply']}
          rows={[
            [
              'Direct post',
              'Slate publishes the post to your TikTok profile at the scheduled time.',
              'Your caption or title, audience, comment, duet and stitch settings, AI-generated label and commercial disclosure are all sent to TikTok.',
            ],
            [
              'Send to inbox',
              'Slate sends the media to your TikTok app inbox as a draft. Nothing is published until you finish and post it inside TikTok, within 24 hours, or TikTok discards it.',
              'TikTok accepts only the title or caption in this mode and silently discards every other setting. Slate hides those controls so it is clear they do not apply.',
            ],
          ]}
        />

        <Note title="Content posted through an unaudited API client is private">
          <P>
            TikTok restricts every post made by an API client that has not yet
            completed its Content Posting API audit to private (self-only)
            visibility, whatever audience you selected. If our client is in that
            state, we will say so in the composer. Do not rely on Slate for
            public TikTok distribution until we have confirmed the audit is
            complete.
          </P>
        </Note>

        <P>
          TikTok also applies its own limits, including a maximum caption
          length, a maximum video duration for your account, a cap on pending
          inbox uploads, and per-account rate limits. Where TikTok rejects a
          post for one of these reasons, Slate reports the error to you but
          cannot override it.
        </P>
      </Section>

      <Section id="content" title="6. Your content">
        <P>
          You keep all rights in the text, images, video and other material you
          upload to or create in Slate (&ldquo;your content&rdquo;). We claim no
          ownership of it.
        </P>
        <P>
          You grant us a worldwide, non-exclusive, royalty-free licence to host,
          store, reproduce, reformat and transmit your content, strictly to the
          extent needed to run the service for you: to show it back to you and
          your team, to store it in our media library, to convert or compress it
          where a platform requires a particular format, and to deliver it to
          the platforms you have chosen. This licence exists only for the
          purpose of operating Slate and ends when you delete the content or
          close your account, subject to the retention periods described in the{' '}
          <A href="/privacy">Privacy Policy</A>.
        </P>
        <P>
          You are responsible for having the rights to everything you publish
          through Slate, including any music, footage, images, trademarks and
          likenesses it contains.
        </P>
      </Section>

      <Section id="acceptable-use" title="7. Acceptable use">
        <P>You agree not to use Slate to:</P>
        <Bullets>
          <Bullet>
            Publish content that is unlawful, that infringes someone
            else&rsquo;s intellectual property or privacy, or that breaches the
            rules of the platform it is sent to.
          </Bullet>
          <Bullet>
            Operate spam, engagement farming, coordinated inauthentic behaviour,
            or bulk automated posting designed to evade a platform&rsquo;s
            limits.
          </Bullet>
          <Bullet>
            Post on behalf of accounts you do not own or are not authorised to
            manage.
          </Bullet>
          <Bullet>
            Circumvent, disable or interfere with the security, rate limiting or
            access controls of Slate or of any connected platform.
          </Bullet>
          <Bullet>
            Resell, sublicense or provide the hosted service to third parties as
            your own, other than by managing their channels with their
            permission.
          </Bullet>
        </Bullets>
        <P>
          Nothing in this section restricts what you may do with the Slate
          source code itself. See <A href="#open-source">Open source rights</A>{' '}
          below.
        </P>
      </Section>

      <Section id="availability" title="8. Scheduling and availability">
        <P>
          Slate schedules on a best-effort basis. A scheduled post is a request
          to publish at a time, not a guarantee that publication will succeed at
          that exact moment. Publication can be delayed or fail for reasons
          outside our control, including platform outages, API changes, expired
          or revoked authorisations, rate limits, content rejections, and spam
          or integrity checks applied by the platform.
        </P>
        <P>
          Where a post fails, Slate surfaces the platform&rsquo;s error and,
          where it is safe to do so, retries. We do not promise any particular
          uptime, delivery rate or reach unless we have separately agreed a
          service level with you in writing.
        </P>
        <P>
          Social platforms change and withdraw their APIs, and they may suspend
          or restrict our access without notice. If a platform becomes
          unavailable through Slate, we will tell you, but we are not liable for
          that platform&rsquo;s decision.
        </P>
      </Section>

      <Section id="termination" title="9. Suspension and termination">
        <P>
          You may stop using Slate and delete your account at any time. Contact{' '}
          <A href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</A> if
          you want your account and its data erased rather than simply left
          inactive.
        </P>
        <P>
          We may suspend or terminate your access if you materially breach these
          Terms, if your use puts the service or another user at risk, if a
          platform requires it, or if we are required to by law. Where it is
          reasonable and lawful to do so, we will warn you first and give you a
          chance to put things right.
        </P>
        <P>
          We may also discontinue the hosted service. If we do, we will give you
          at least 30 days&rsquo; notice, let you export your scheduled and
          published posts and your media, and refund any prepaid fees covering
          the period after shutdown.
        </P>
      </Section>

      <Section id="open-source" title="10. Open source rights">
        <P>
          <Lead>
            These Terms govern the hosted service. They do not govern the
            software.
          </Lead>{' '}
          Slate is built on Postiz and, like Postiz, the entire codebase
          including our modifications is licensed to you under the{' '}
          <A href="https://www.gnu.org/licenses/agpl-3.0.en.html">
            GNU Affero General Public License, version 3
          </A>{' '}
          (&ldquo;AGPL-3.0&rdquo;).
        </P>
        <P>
          Nothing in these Terms limits, waives or adds conditions to any right
          you have under the AGPL-3.0. In particular, you are free to obtain,
          run, study, modify and redistribute the Slate source code under that
          licence, and no clause here should be read as prohibiting you from
          doing so. Where these Terms and the AGPL-3.0 conflict as to the
          software, the AGPL-3.0 wins.
        </P>
        <P>
          The complete Corresponding Source for the version of Slate running on
          this site is published at{' '}
          <A href={legal.sourceRepoUrl}>{legal.sourceRepoUrl}</A>, free of
          charge and without needing an account. That repository also identifies
          the exact revision deployed here.
        </P>
        <P>
          Slate is a modified version of Postiz (upstream release{' '}
          <Code>v1.47.0</Code>), Copyright &copy; 2025 Nevo David. Our fork was
          created on 28 July 2026 and has been modified continuously since; the
          changes are recorded in the repository&rsquo;s commit history and
          include rebranding and the removal of upstream trademarks. Slate is
          not affiliated with, endorsed by, or sponsored by Postiz or Nevo
          David.
        </P>
        <P>
          The AGPL-3.0 covers the software only. It does not license the Slate
          name, logo or other branding, and it does not cover your content or
          any other customer data held in the hosted service.
        </P>
      </Section>

      <Section id="liability" title="11. Disclaimers and liability">
        <P>
          Except as expressly stated in these Terms, and to the fullest extent
          permitted by law, the hosted service is provided &ldquo;as is&rdquo;
          and &ldquo;as available&rdquo;, without warranties of any kind,
          whether express or implied, including implied warranties of
          merchantability, fitness for a particular purpose and
          non-infringement. As the AGPL-3.0 itself states, the software comes
          with absolutely no warranty.
        </P>
        <P>
          To the fullest extent permitted by law, we are not liable for lost
          profits, lost revenue, lost or delayed posts, loss of reach or
          followers, loss of goodwill, or any indirect, incidental, special or
          consequential loss. Our total aggregate liability arising out of or
          relating to Slate in any 12-month period is limited to the greater of
          the fees you paid us for the service in that period and{' '}
          {legal.liabilityCap}.
        </P>
        <P>
          Nothing in these Terms excludes or limits liability that cannot
          lawfully be excluded or limited, including liability for death or
          personal injury caused by negligence, or for fraud.
        </P>
        <P>
          You agree to indemnify us against claims, losses and reasonable costs
          arising from your content, from your use of Slate in breach of these
          Terms, or from your breach of a connected platform&rsquo;s terms.
        </P>
      </Section>

      <Section id="changes" title="12. Changes to these terms">
        <P>
          We may update these Terms as the service changes or as the platforms
          we integrate with change their requirements. If a change is material,
          we will give you reasonable notice before it takes effect &mdash; by
          email or in the product &mdash; and we will update the &ldquo;Last
          updated&rdquo; date at the top of this page. Continuing to use Slate
          after a change takes effect means you accept the updated Terms. If you
          do not accept them, stop using the service and cancel your plan.
        </P>
      </Section>

      <Section id="law" title="13. Governing law">
        <P>
          These Terms and any dispute arising out of them are governed by the
          laws of {legal.governingLaw}, and the courts of {legal.governingLaw}{' '}
          have exclusive jurisdiction. If you are a consumer, this does not
          deprive you of the protection of the mandatory laws of the country
          where you live, or of your right to bring proceedings there.
        </P>
        <P>
          If any provision of these Terms is found unenforceable, the rest
          continues to apply. Our not enforcing a right is not a waiver of it.
          These Terms, together with the Privacy Policy and any plan you
          subscribe to, are the whole agreement between us about the hosted
          service.
        </P>
      </Section>

      <Section id="contact" title="14. Contact">
        <P>
          Questions about these Terms, or about Slate generally, go to{' '}
          <A href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</A>.
        </P>
        <P>
          {legal.entityName}
          <br />
          {legal.postalAddress}
        </P>
      </Section>
    </LegalShell>
  );
}
