import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Политика конфиденциальности — SADOVA" },
      {
        name: "description",
        content:
          "Политика обработки персональных данных SADOVA согласно 152-ФЗ.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Политика конфиденциальности</h1>
      <p className="mt-2 text-[13px] text-muted-foreground">Согласно 152-ФЗ</p>
      <div className="mt-8 space-y-5 text-[14px] leading-relaxed">
        <p>
          ООО «Садова» (далее — Оператор) обрабатывает персональные данные пользователей на
          основании Федерального закона № 152-ФЗ «О персональных данных» от 27.07.2006.
        </p>
        <h2 className="mt-6 text-lg font-semibold">Какие данные мы собираем</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>ФИО, email, телефон;</li>
          <li>адрес доставки;</li>
          <li>данные о заказах и платежах;</li>
          <li>технические данные (IP, cookies, user-agent).</li>
        </ul>
        <h2 className="mt-6 text-lg font-semibold">Цели обработки</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>исполнение договора купли-продажи;</li>
          <li>доставка и информирование о статусе заказа;</li>
          <li>ответы на обращения в поддержку.</li>
        </ul>
        <h2 className="mt-6 text-lg font-semibold">Хранение и защита</h2>
        <p>
          Данные хранятся на защищённых серверах на территории РФ. Доступ ограничен, применяются
          технические и организационные меры защиты.
        </p>
        <h2 className="mt-6 text-lg font-semibold">Права субъекта</h2>
        <p>
          Пользователь вправе запросить доступ к своим данным, их изменение или удаление,
          написав на privacy@sadova.example.
        </p>
      </div>
    </article>
  );
}