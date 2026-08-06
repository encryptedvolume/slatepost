import { EmailInterface } from '@gitroom/nestjs-libraries/emails/email.interface';

/**
 * Railway blocks outbound SMTP on both 587 and 465, so nodemailer cannot
 * deliver from this host at all - connections just time out. That is the same
 * constraint the prepress bot hit, and it is why an HTTPS-to-SMTP relay exists
 * in the first place. This provider posts to that relay and lets it do the
 * SMTP leg from somewhere that is allowed to.
 *
 * Without this there is no working provider here: 'resend' needs an account
 * nobody has, 'nodemailer' cannot reach a mail server, and the fallback is
 * EmptyProvider, which silently discards every message - which is how password
 * reset came to report success while sending nothing.
 */
export class MailBridgeProvider implements EmailInterface {
  name = 'mailbridge';
  validateEnvKeys = ['EMAIL_RELAY_URL', 'EMAIL_RELAY_AUTH'];

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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        to,
        subject,
        body: html,
        from_name: emailFromName,
      }),
    });

    const text = await response.text();

    // The relay answers 200 on success and a 4xx/5xx with a reason otherwise.
    // Throwing here is deliberate: sendEmailSync retries, and a caller that
    // needs to know whether the mail actually left can then find out.
    if (!response.ok) {
      throw new Error(
        `mail relay responded ${response.status}: ${text.slice(0, 300)}`
      );
    }

    return text;
  }
}
