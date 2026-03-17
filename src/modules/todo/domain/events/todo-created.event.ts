// ДОМЕННОЕ СОБЫТИЕ - что-то важное произошло в домене
export class TodoCreatedEvent {
  constructor(
    public readonly todoId: string,
    public readonly title: string,
    public readonly createdAt: Date,
  ) {}
}
