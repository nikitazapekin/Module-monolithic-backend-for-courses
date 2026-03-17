export class Client {
  public id: string;
  public auditoryId: string;
  public firstName: string;
  public lastName: string;
  public middleName?: string;
  public phone: string;
  public country: string;
  public description?: string;
  public registeredAt: Date;
  public updatedAt: Date;

  constructor(
    auditoryId: string,
    firstName: string,
    lastName: string,
    phone: string,
    country: string,
    middleName?: string,
    description?: string,
  ) {
    this.id = this.generateId();
    this.auditoryId = auditoryId;
    this.firstName = firstName.trim();
    this.lastName = lastName.trim();
    this.middleName = middleName?.trim();
    this.phone = this.normalizePhone(phone);
    this.country = country.trim();
    this.description = description?.trim();
    this.registeredAt = new Date();
    this.updatedAt = new Date();
  }

  public updateProfile(data: Partial<Client>): void {
    if (data.firstName) this.firstName = data.firstName.trim();
    if (data.lastName) this.lastName = data.lastName.trim();
    if (data.middleName !== undefined)
      this.middleName = data.middleName?.trim();
    if (data.phone) this.phone = this.normalizePhone(data.phone);
    if (data.country) this.country = data.country.trim();
    if (data.description !== undefined)
      this.description = data.description?.trim();

    this.updatedAt = new Date();
  }

  public getFullName(): string {
    return `${this.lastName} ${this.firstName} ${this.middleName || ''}`.trim();
  }

  private normalizePhone(phone: string): string {
    // Убираем все нецифровые символы кроме +
    return phone.replace(/[^\d+]/g, '');
  }

  private generateId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
