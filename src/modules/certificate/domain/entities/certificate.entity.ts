export class Certificate {
  public id: string;
  public clientId: string;
  public date: Date;
  public url: string; // BASE64 encoded image (without prefix)
  public digital: string; // URL for PSD version

  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    clientId: string,
    date: Date,
    url: string,
    digital: string,
  ) {
    this.id = this.generateId();
    this.clientId = clientId;
    this.date = date;
    this.url = url;
    this.digital = digital;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public updateCertificate(url: string, digital: string): void {
    this.url = url;
    this.digital = digital;
    this.updatedAt = new Date();
  }

  public getBase64Data(): string {
    return `data:image/png;base64,${this.url}`;
  }

  private generateId(): string {
    return `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}