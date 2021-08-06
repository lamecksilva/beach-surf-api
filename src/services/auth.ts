import bcrypt from 'bcrypt';

// Classes são tanto tipos, quanto valor
export default class AuthService {
  // Static não precisa instanciar
  public static async hashPassword(password: string, salt = 10): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
