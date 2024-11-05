export default interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}
