// ЗАПРОС - инструкция "что прочитать" (не изменяет состояние)
export class GetTodoByIdQuery {
  constructor(public readonly todoId: string) {}
}
