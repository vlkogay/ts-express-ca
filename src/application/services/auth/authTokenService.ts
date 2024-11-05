export default interface IAuthTokenService {
  verify(token: string, publicKey?: string): Promise<TokenPayload>;
  sign(payload: TokenPayload): Promise<Token>;
}
