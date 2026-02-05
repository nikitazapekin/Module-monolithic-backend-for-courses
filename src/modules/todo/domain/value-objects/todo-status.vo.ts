// VALUE OBJECT - неизменяемый объект с валидацией
export class TodoStatus {
  private readonly value: 'pending' | 'in_progress' | 'completed';
  
  constructor(status: string) {
    const validStatuses = ['pending', 'in_progress', 'completed'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    this.value = status as any;
  }
  
  public getValue(): string {
    return this.value;
  }
  
  public isCompleted(): boolean {
    return this.value === 'completed';
  }
  
  public equals(other: TodoStatus): boolean {
    return this.value === other.value;
  }
}
