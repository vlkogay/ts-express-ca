export default interface ResetPasswordDto {
  email: string;
  password: string;
  token?: string;
}
