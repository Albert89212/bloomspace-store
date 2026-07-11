export function friendlyDbError(error: unknown, fallback = "Не удалось сохранить в БД") {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("ECONNREFUSED") || message.includes("connect")) {
    return "База данных недоступна: проверьте DATABASE_URL и что MySQL запущен на сервере";
  }
  if (message.includes("Access denied")) {
    return "MySQL отклонил доступ: проверьте логин и пароль в DATABASE_URL";
  }
  if (message.includes("Unknown database")) {
    return "База MySQL не найдена: создайте базу и укажите её имя в DATABASE_URL";
  }
  return message || fallback;
}