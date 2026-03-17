export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
}

export class Auditory {
  public id: string;
  public email: string;
  public password: string;
  public role: UserRole;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;
  public lastLoginAt: Date | null;

  constructor(
    email: string,
    password: string,
    role: UserRole = UserRole.CLIENT,
  ) {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    this.id = this.generateId();
    this.email = email.toLowerCase().trim();
    this.password = password; // В реальности должен быть хеш
    this.role = role;
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.lastLoginAt = null;
  }

  public updatePassword(newPassword: string): void {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    this.password = newPassword;
    this.updatedAt = new Date();
  }

  public markAsLoggedIn(): void {
    this.lastLoginAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public changeRole(newRole: UserRole): void {
    this.role = newRole;
    this.updatedAt = new Date();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateId(): string {
    return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
