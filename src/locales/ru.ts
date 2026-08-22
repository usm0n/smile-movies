import type { Dictionary } from "./en";

/**
 * Russian strings.
 *
 * Typed as `Dictionary`, so this file cannot drift from `en.ts`: adding a key
 * there without adding it here fails the build.
 *
 * Counted nouns carry all three Russian forms — `one` for 1, 21, 31…, `few`
 * for 2–4, `many` for 0, 5–20 and the teens. Getting this wrong is the most
 * visible way a translated interface reads as machine-made.
 */
const ru: Dictionary = {
  "common.cancel": "Отмена",
  "common.save": "Сохранить",
  "common.saving": "Сохранение…",
  "common.back": "Назад",
  "common.remove": "Удалить",
  "common.delete": "Удалить",
  "common.close": "Закрыть",
  "common.confirm": "Подтвердить",
  "common.retry": "Повторить",
  "common.loading": "Загрузка…",
  "common.search": "Поиск",
  "common.goHome": "На главную",
  "common.browseTitles": "К каталогу",
  "common.email": "Эл. почта",
  "common.password": "Пароль",
  "common.emailPlaceholder": "you@example.com",
  "common.optional": "Необязательно",
  "common.enabled": "Включено",
  "common.disabled": "Выключено",

  "nav.home": "Главная",
  "nav.movies": "Фильмы",
  "nav.series": "Сериалы",
  "nav.search": "Поиск",
  "nav.library": "Моя библиотека",
  "nav.settings": "Настройки",
  "nav.signIn": "Войти",
  "nav.signOut": "Выйти",
  "nav.profile": "Профиль",
  "nav.discover": "Обзор",
  "nav.smileAI": "SmileAI",
  "nav.notifications": "Уведомления",
  "nav.watchlist": "Смотреть позже",
  "nav.myLists": "Мои подборки",
  "nav.downloads": "Загрузки",
  "nav.getApp": "Скачать приложение",
  "nav.sectionLibrary": "Библиотека",
  "nav.sectionApp": "Приложение",

  "account.switch": "Сменить аккаунт",
  "account.verify": "Подтвердить аккаунт",
  "account.publicProfile": "Публичный профиль",
  "account.admin": "Админ-панель",

  "settings.title": "Настройки",
  "settings.language.title": "Язык",
  "settings.language.description":
    "Задаёт язык интерфейса, а также язык названий и описаний.",
  "settings.language.label": "Язык интерфейса",
  "settings.language.contentNote":
    "Если перевода нет, названия и описания показываются на языке оригинала.",

  "library.itemCount": {
    one: "{count} фильм",
    few: "{count} фильма",
    many: "{count} фильмов",
    other: "{count} фильма",
  },
  "player.audioTrackCount": {
    one: "{count} звуковая дорожка",
    few: "{count} звуковые дорожки",
    many: "{count} звуковых дорожек",
    other: "{count} звуковой дорожки",
  },
  "search.resultCount": {
    one: "{count} результат",
    few: "{count} результата",
    many: "{count} результатов",
    other: "{count} результата",
  },
};

export default ru;
