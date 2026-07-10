import { createFileRoute } from "@tanstack/react-router";
import { company } from "@/lib/company";

export const Route = createFileRoute("/legal/cookies")({
  head: () => ({
    meta: [
      { title: "Политика использования cookies — SADOVA" },
      {
        name: "description",
        content: "Как SADOVA использует cookies и другие технологии отслеживания.",
      },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Политика cookies</h1>
      <p className="mt-2 text-[13px] text-muted-foreground">
        Редакция от {new Date().toLocaleDateString("ru-RU")}
      </p>

      <div className="mt-8 space-y-6 text-[14px] leading-relaxed">
        <p>
          Настоящая Политика описывает, как {company.legalName} использует файлы cookies
          и аналогичные технологии (localStorage, IndexedDB, пиксели) на сайте SADOVA.
          Использование сайта означает согласие с условиями Политики.
        </p>

        <section>
          <h2 className="text-lg font-semibold">1. Что такое cookies</h2>
          <p className="mt-2">
            Cookies — небольшие текстовые файлы, которые сохраняются в браузере при посещении
            сайта и позволяют распознавать пользователя при последующих визитах.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Категории cookies</h2>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li>
              <b>Строго необходимые</b> — авторизация, корзина, CSRF-защита, выбор темы.
              Отключение сделает сайт неработоспособным.
            </li>
            <li>
              <b>Функциональные</b> — избранное, недавно просмотренные товары, региональные
              настройки. Хранятся в localStorage до очистки браузера.
            </li>
            <li>
              <b>Аналитические</b> — Яндекс.Метрика для анонимной статистики посещаемости.
            </li>
            <li>
              <b>Рекламные</b> — устанавливаются только при отдельном согласии в баннере.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Сроки хранения</h2>
          <p className="mt-2">
            Сессионные cookies удаляются при закрытии браузера. Постоянные — хранятся до
            12 месяцев или до очистки вручную.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Управление</h2>
          <p className="mt-2">
            Пользователь может удалить cookies и запретить их сохранение в настройках браузера
            (Chrome, Safari, Firefox, Yandex). При отключении строго необходимых cookies часть
            функций сайта перестанет работать (вход, оформление заказа).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Передача третьим лицам</h2>
          <p className="mt-2">
            Данные cookies могут обрабатываться сервисами Яндекс.Метрика согласно их
            собственной политике конфиденциальности. Иным третьим лицам данные не передаются.
          </p>
        </section>
      </div>
    </article>
  );
}