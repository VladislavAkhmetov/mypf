// Приложения, временно скрытые и с рабочего стола, и из меню «Пуск».
// Окна остаются в коде: чтобы вернуть приложение, уберите его id из списка.
export const hiddenApps: readonly string[] = ["my-computer", "media-player", "help", "baltika"];

// Журнал скрыт только с рабочего стола, в «Пуске» он остаётся.
export const hiddenDesktopOnly: readonly string[] = ["stories"];

// Виджет журнала временно скрыт. Для возвращения установите true.
export const showJournalWidget = false;

// Скрепка и её подсказки временно скрыты. Для возвращения установите true.
export const showClippy = false;
