export class Certificate {
  public id: string;
  public clientId: string;
  public courseId: string;
  public date: Date;
  public url: string;
  public digital: string;
  public isViewed: boolean;
  public firstName: string;
  public lastName: string;
  public middleName: string;
  public courseName: string;

  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    clientId: string,
    courseId: string,
    date: Date,
    url: string,
    digital: string,
  ) {
    this.id = this.generateId();
    this.clientId = clientId;
    this.courseId = courseId;
    this.date = date;
    this.url = url;
    this.digital = digital;
    this.isViewed = false;
    this.firstName = '';
    this.lastName = '';
    this.middleName = '';
    this.courseName = '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public updateCertificate(url: string, digital: string): void {
    this.url = url;
    this.digital = digital;
    this.updatedAt = new Date();
  }

  public markAsViewed(): void {
    this.isViewed = true;
    this.updatedAt = new Date();
  }

  public getBase64Data(): string {
    return `data:image/png;base64,${this.url}`;
  }

  private generateId(): string {
    return `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}