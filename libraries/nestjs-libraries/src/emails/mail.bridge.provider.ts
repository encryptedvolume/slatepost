import { EmailInterface } from '@gitroom/nestjs-libraries/emails/email.interface';

/**
 * Railway blocks outbound SMTP on both 587 and 465, so nodemailer cannot
 * deliver from this host at all - connections just time out. That is the same
 * constraint the prepress bot hit, and it is why an HTTPS-to-SMTP relay
 * already exists. This provider posts to that relay and lets it do the SMTP
 * leg from somewhere that is allowed to.
 *
 * Without it there is no working provider here: 'resend' needs an account
 * nobody has, 'nodemailer' cannot reach a mail server, and the fallback is
 * EmptyProvider, which silently discards every message - which is how password
 * reset came to report success while sending nothing.
 */
export class MailBridgeProvider implements EmailInterface {
  name = 'mailbridge';
  validateEnvKeys = ['EMAIL_RELAY_URL', 'EMAIL_RELAY_AUTH'];

  /**
   * The relay takes a plain-text `body`, uses it verbatim as the text part,
   * and builds its own HTML alternative by escaping <, > and &. Handing it
   * markup therefore delivers markup: the reset link would arrive as the
   * literal characters `<a href="...">here</a>` rather than something
   * clickable. Extending the relay to accept HTML is not an option from here -
   * it is a Vercel project on the other account, which is currently locked out
   * of deploys - so the markup is flattened before it goes over the wire.
   *
   * Links become "text: url" so the address survives in the open, where mail
   * clients will linkify it. That is the part that has to work; the styling
   * around it is not worth the delivery risk.
   */
  private toPlainText(html: string) {
    return (
      html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|h[1-6]|tr|li)>/gi, '\n')
        // Keep both halves of a link: the words carry the meaning, the href is
        // the only part the recipient can actually act on.
        .replace(
          /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
          (_m, href, text) => {
            const label = text.replace(/<[^>]+>/g, '').trim();
            return label && label !== href ? `${label}: ${href}` : href;
          }
        )
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim()
    );
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    emailFromName: string,
    // The relay authenticates as its own mailbox and sets the From itself, so
    // the address is not ours to choose; only the display name travels.
    _emailFromAddress: string,
    _replyTo?: string
  ) {
    const url = process.env.EMAIL_RELAY_URL;
    const auth = process.env.EMAIL_RELAY_AUTH;

    if (!url || !auth) {
      throw new Error(
        'EMAIL_RELAY_URL / EMAIL_RELAY_AUTH are not set, cannot send mail'
      );
    }

    const body = this.toPlainText(html);
    if (!body) {
      throw new Error('Refusing to send an empty message body');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        to,
        subject,
        body,
        from_name: emailFromName,
      }),
    });

    const text = await response.text();

    // The relay answers 200 on success and 4xx/5xx with a reason otherwise.
    // Throwing is deliberate: sendEmailSync retries, and a caller that needs
    // to know whether the mail actually left can then find out.
    if (!response.ok) {
      throw new Error(
        `mail relay responded ${response.status}: ${text.slice(0, 300)}`
      );
    }

    return text;
  }
}
