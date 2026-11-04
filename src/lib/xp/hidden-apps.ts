// Приложения, временно скрытые и с рабочего стола, и из меню «Пуск».
// Окна остаются в коде: чтобы вернуть приложение, уберите его id из списка.
export const hiddenApps: readonly string[] = ["my-computer", "media-player", "help"];

// Журнал скрыт только с рабочего стола, в «Пуске» он остаётся.
export const hiddenDesktopOnly: readonly string[] = ["stories"];
