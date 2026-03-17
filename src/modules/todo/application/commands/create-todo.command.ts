// КОМАНДА - инструкция "что сделать" (изменить состояние)
export class CreateTodoCommand {
  constructor(
    public readonly title: string,
    public readonly description?: string,
  ) {}
}
