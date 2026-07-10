import { createFileRoute } from "@tanstack/react-router";
import { company } from "@/lib/company";
import { legalHead } from "@/lib/legal-head";

export const Route = createFileRoute("/legal/consent")({
  head: () =>
    legalHead(
      "/legal/consent",
      "Согласие на обработку персональных данных — SADOVA",
      "Форма согласия на обработку персональных данных пользователей сайта SADOVA согласно ст. 9 152-ФЗ.",
    ),
  component: ConsentPage,
});

function ConsentPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight">
        Согласие на обработку персональных данных
      </h1>
      <p className="mt-2 text-[13px] text-muted-foreground">
        Редакция от {new Date().toLocaleDateString("ru-RU")} · ст. 9 152-ФЗ
      </p>

      <div className="mt-8 space-y-5 text-[14px] leading-relaxed">
        <p>
          Регистрируясь или оформляя заказ на сайте SADOVA, я, субъект персональных данных,
          в соответствии с Федеральным законом № 152-ФЗ «О персональных данных»
          от 27.07.2006, свободно, своей волей и в своём интересе даю согласие
          на обработку персональных данных.
        </p>

        <section>
          <h2 className="text-lg font-semibold">1. Оператор</h2>
          <p className="mt-2">
            {company.legalName}, ИНН {company.inn}, ОГРНИП {company.ogrnip},
            адрес: {company.address}.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Перечень данных</h2>
          <p className="mt-2">
            ФИО, дата рождения (при указании), адрес электронной почты, номер телефона,
            адрес доставки/пункта выдачи, данные о заказах и платежах, IP-адрес, cookies,
            user-agent, идентификаторы устройства.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Цели</h2>
          <p className="mt-2">
            Заключение и исполнение договора купли-продажи, доставка, приём платежей,
            оформление возвратов, обработка обращений, программа лояльности,
            направление сервисных сообщений, а при отдельно выраженном согласии — рекламных.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Перечень действий</h2>
          <p className="mt-2">
            Сбор, запись, систематизация, накопление, хранение, уточнение, извлечение,
            использование, передача (в объёме, необходимом контрагентам — перевозчикам,
            платёжным сервисам, операторам ОФД, сервисам рассылок), обезличивание,
            блокирование, удаление, уничтожение — смешанным способом.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Срок действия и отзыв</h2>
          <p className="mt-2">
            Согласие действует до достижения целей обработки либо до его отзыва.
            Отзыв направляется письменно на{" "}
            <a href={`mailto:${company.supportEmail}`} className="underline">
              {company.supportEmail}
            </a>{" "}
            либо на почтовый адрес Оператора. Обработка прекращается в течение 30 дней
            с момента получения отзыва, за исключением случаев, когда её продолжение
            требуется по закону (ст. 6 ч. 1 п. 2–11 152-ФЗ).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Трансграничная передача</h2>
          <p className="mt-2">
            Трансграничная передача персональных данных не осуществляется. Хранение
            производится на серверах, расположенных на территории РФ (ч. 5 ст. 18 152-ФЗ).
          </p>
        </section>
      </div>
    </article>
  );
}