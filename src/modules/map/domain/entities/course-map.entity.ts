import { MapElement } from "./map-element.entity";

export class CourseMap {
  public id: string;
  public courseId: string;
  public width: number;
  public height: number;
  public backgroundColor: string;
  public backgroundImage?: string; // Base64 encoded
  public backgroundRepeat: string;
  public backgroundSize: string;
  public createdAt: Date;
  public updatedAt: Date;
  public elements: MapElement[] = [];

  constructor(
    courseId: string,
    width: number = 800,
    height: number = 600,
    backgroundColor: string = '#ffffff',
    backgroundRepeat: string = 'no-repeat',
    backgroundSize: string = 'cover',
    backgroundImage?: string
  ) {
    this.id = this.generateId();
    this.courseId = courseId;
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
    this.backgroundImage = backgroundImage;
    this.backgroundRepeat = backgroundRepeat;
    this.backgroundSize = backgroundSize;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public update(data: Partial<CourseMap>): void {
    if (data.width !== undefined) this.width = data.width;
    if (data.height !== undefined) this.height = data.height;
    if (data.backgroundColor !== undefined) this.backgroundColor = data.backgroundColor;
    if (data.backgroundImage !== undefined) this.backgroundImage = data.backgroundImage;
    if (data.backgroundRepeat !== undefined) this.backgroundRepeat = data.backgroundRepeat;
    if (data.backgroundSize !== undefined) this.backgroundSize = data.backgroundSize;
    
    this.updatedAt = new Date();
  }

  public addElement(element: MapElement): void {
    this.elements.push(element);
    this.updatedAt = new Date();
  }

  public removeElement(elementId: string): void {
    this.elements = this.elements.filter(e => e.id !== elementId);
    this.updatedAt = new Date();
  }

  public getElement(elementId: string): MapElement | undefined {
    return this.elements.find(e => e.id === elementId);
  }

  public updateElement(elementId: string, updates: Partial<MapElement>): boolean {
    const element = this.getElement(elementId);
    if (!element) return false;
    
    element.update(updates);
    this.updatedAt = new Date();
    return true;
  }

  private generateId(): string {
    return `course_map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
