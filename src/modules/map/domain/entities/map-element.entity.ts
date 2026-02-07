import { MapElementType, PositioningType } from './map-element-types.enum';

export class MapElement {
  public id: string;
  public type: MapElementType;
  public courseMapId: string;
  public title?: string;
  public text?: string;
  public color?: string;
  public imageUrl?: string;
  public emoji?: string;
  public fontSize?: number;
  public fontFamily?: string;
  public fontWeight?: string;
  public fontStyle?: string;
  public positionX: number;
  public positionY: number;
  public positioning: PositioningType;
  public offsetX: number;
  public offsetY: number;
  public width?: number;
  public height?: number;
  public rotation: number;
  public isActive?: boolean;
  public stars?: number;
  public breakpoints?: Record<string, {
    hidden?: boolean;
    positioning?: PositioningType;
    offsetX?: number;
    offsetY?: number;
  }>;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    type: MapElementType,
    courseMapId: string,
    positionX: number,
    positionY: number,
    positioning: PositioningType,
    offsetX: number,
    offsetY: number,
    rotation: number = 0,
    title?: string,
    text?: string,
    color?: string,
    imageUrl?: string,
    emoji?: string,
    fontSize?: number,
    fontFamily?: string,
    fontWeight?: string,
    fontStyle?: string,
    width?: number,
    height?: number,
    isActive?: boolean,
    stars?: number,
    breakpoints?: Record<string, any>
  ) {
    this.id = this.generateId();
    this.type = type;
    this.courseMapId = courseMapId;
    this.title = title;
    this.text = text;
    this.color = color;
    this.imageUrl = imageUrl;
    this.emoji = emoji;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.fontWeight = fontWeight;
    this.fontStyle = fontStyle;
    this.positionX = positionX;
    this.positionY = positionY;
    this.positioning = positioning;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.isActive = isActive;
    this.stars = stars;
    this.breakpoints = breakpoints;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public update(data: Partial<MapElement>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.text !== undefined) this.text = data.text;
    if (data.color !== undefined) this.color = data.color;
    if (data.imageUrl !== undefined) this.imageUrl = data.imageUrl;
    if (data.emoji !== undefined) this.emoji = data.emoji;
    if (data.fontSize !== undefined) this.fontSize = data.fontSize;
    if (data.fontFamily !== undefined) this.fontFamily = data.fontFamily;
    if (data.fontWeight !== undefined) this.fontWeight = data.fontWeight;
    if (data.fontStyle !== undefined) this.fontStyle = data.fontStyle;
    if (data.positionX !== undefined) this.positionX = data.positionX;
    if (data.positionY !== undefined) this.positionY = data.positionY;
    if (data.positioning !== undefined) this.positioning = data.positioning;
    if (data.offsetX !== undefined) this.offsetX = data.offsetX;
    if (data.offsetY !== undefined) this.offsetY = data.offsetY;
    if (data.width !== undefined) this.width = data.width;
    if (data.height !== undefined) this.height = data.height;
    if (data.rotation !== undefined) this.rotation = data.rotation;
    if (data.isActive !== undefined) this.isActive = data.isActive;
    if (data.stars !== undefined) this.stars = data.stars;
    if (data.breakpoints !== undefined) this.breakpoints = data.breakpoints;
    
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `map_element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
