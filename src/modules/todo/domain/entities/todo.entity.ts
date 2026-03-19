 
export class Todo {
  public id: string;  
  public title: string;  
  public description: string;  
  public isCompleted: boolean; 
  public createdAt: Date;  
  public updatedAt: Date; 

 
  constructor(title: string, description: string = '', id?: string) {
    if (!title || title.trim().length === 0) {
      throw new Error('Todo title cannot be empty');
    }
    if (title.length > 100) {
      throw new Error('Todo title cannot exceed 100 characters');
    }

    this.id = id || this.generateId();
    this.title = title.trim();
    this.description = description.trim();
    this.isCompleted = false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
 
  public complete(): void {
    if (this.isCompleted) {
      throw new Error('Todo is already completed');
    }
    this.isCompleted = true;
    this.updatedAt = new Date();
  }

  public uncomplete(): void {
    if (!this.isCompleted) {
      throw new Error('Todo is not completed');
    }
    this.isCompleted = false;
    this.updatedAt = new Date();
  }

  public updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Todo title cannot be empty');
    }
    this.title = title.trim();
    this.updatedAt = new Date();
  }
 
  private generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
