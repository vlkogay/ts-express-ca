import IEmailService from '../../../application/services/email/emailService';
import * as nodemailer from 'nodemailer';
import ILogger from '../../../logger/logger';
import { EmailConfig } from '../../../config/config';

export default class NodeMailerService implements IEmailService {
  constructor(private config: EmailConfig, private logger: ILogger) {}
  createTransporter(): nodemailer.Transporter {
    this.logger.info('Creating nodemailer transporter...');
    return nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.user,
        pass: this.config.pass,
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const transporter = this.createTransporter();
    await transporter.sendMail({
      from: this.config.from,
      to,
      subject,
      text: body,
    });
  }
}
