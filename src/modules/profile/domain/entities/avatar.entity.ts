export class Avatar {
  public id: string;
  public auditoryId: string;
  public imageData: string; // base64 encoded image
  public mimeType: string;
  public fileSize: number; // in bytes
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    auditoryId: string,
    imageData: string,
    mimeType: string,
    fileSize: number
  ) {
    this.id = this.generateId();
    this.auditoryId = auditoryId;
    this.imageData = imageData;
    this.mimeType = mimeType;
    this.fileSize = fileSize;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public updateImage(imageData: string, mimeType: string, fileSize: number): void {
    this.imageData = imageData;
    this.mimeType = mimeType;
    this.fileSize = fileSize;
    this.updatedAt = new Date();
  }

  public getBase64Data(): string {
    return `data:${this.mimeType};base64,${this.imageData}`;
  }

  private generateId(): string {
    return `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
