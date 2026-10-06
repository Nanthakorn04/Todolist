export function getTodoAssigneeNames(todo, users) {
  const userNames = new Map(users.map((user) => [user.id, user.name]));
  const names = [
    ...(todo.assignees || []),
    ...(todo.assigneeIds || []).map((id) => userNames.get(id) || id),
  ];

  return [...new Set(names)];
}
