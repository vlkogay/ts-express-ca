import { V4 } from 'paseto';
import IAuthTokenService from '../../../application/services/auth/authTokenService';
import { PasetoConfig } from '../../../config/config';

export default class PasetoAuthTokenService implements IAuthTokenService {
  private secretKey: string;
  private publicKey: string;

  constructor(private config: PasetoConfig) {
    this.secretKey = config.secretKey;
    this.publicKey = config.publicKey;
  }

  /**
   * generateKeys - Generate public and secret keys if not provided
   * -------------------------------------------------------------------
   * @returns
   */
  public async generateKeys() {
    if (this.secretKey && this.publicKey) return;
    const key = await V4.generateKey('public', { format: 'paserk' });

    this.secretKey = key.secretKey;
    this.publicKey = key.publicKey;

    console.log(`public=${this.publicKey}, secret=${this.secretKey}`);
  }
  /**
   * sign - Sign a payload
   * -------------------------------------------------------------------
   * @param payload  - Payload to sign
   * @returns
   */
  public async sign(payload: TokenPayload): Promise<Token> {
    payload.exp = new Date(Date.now() + this.config.expiresInMs).toISOString();
    return await V4.sign(payload, this.secretKey);
  }

  public async verify(token: Token): Promise<TokenPayload> {
    try {
      const payload: TokenPayload = await V4.verify(token, this.publicKey);
      if (!payload.exp || new Date(payload.exp).getTime() < Date.now())
        throw new Error('Token expired');

      return payload;
    } catch (e) {
      throw e;
    }
  }
}
