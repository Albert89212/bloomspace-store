import { createFileRoute } from "@tanstack/react-router";
import { company } from "@/lib/company";

export const Route = createFileRoute("/legal/offer")({
  head: () => ({
    meta: [
      { title: "Публичная оферта — SADOVA" },
      {
        name: "description",
        content: "Публичная оферта ИП Тогашева А. Д. на продажу товаров через интернет-магазин SADOVA.",
      },
    ],
  }),
  component: OfferPage,
});

function OfferPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Публичная оферта</h1>
      <p className="mt-2 text-[13px] text-muted-foreground">Редакция от 01.01.2026</p>
      <div className="prose prose-neutral mt-8 max-w-none space-y-5 text-[14px] leading-relaxed">
        <p>
          Настоящая оферта является официальным предложением{" "}
          <b>{company.legalName}</b> (далее — Продавец), ИНН {company.inn},
          ОГРНИП {company.ogrnip}, зарегистрированного по адресу: {company.address},
          заключить договор купли-продажи товаров, представленных на сайте {company.siteUrl},
          на изложенных ниже условиях (ст. 435, 437 ГК РФ).
        </p>

        <h2 className="mt-6 text-lg font-semibold">1. Предмет договора</h2>
        <p>
          Продавец обязуется передать в собственность Покупателя товар, а Покупатель — оплатить
          и принять товар в порядке, установленном настоящей офертой.
        </p>

        <h2 className="mt-6 text-lg font-semibold">2. Порядок акцепта</h2>
        <p>
          Акцептом оферты является оформление заказа Покупателем на сайте и его оплата (п. 3 ст. 438 ГК РФ).
          С момента акцепта договор считается заключённым в письменной форме.
        </p>

        <h2 className="mt-6 text-lg font-semibold">3. Цена и порядок оплаты</h2>
        <p>
          Цены указаны в рублях РФ. Продавец применяет упрощённую систему налогообложения,
          НДС не облагается. Оплата производится через СБП, банковской картой,
          через ЮKassa, CloudPayments или Tinkoff Kassa.
        </p>

        <h2 className="mt-6 text-lg font-semibold">4. Доставка</h2>
        <p>
          Доставка осуществляется службами СДЭК, Boxberry, Ozon ПВЗ, Почтой России
          или курьером по выбору Покупателя. Сроки зависят от региона и указаны
          при оформлении заказа.
        </p>

        <h2 className="mt-6 text-lg font-semibold">5. Возврат и обмен</h2>
        <p>
          Возврат товара надлежащего качества возможен в течение 7 дней с момента получения
          в соответствии со ст. 26.1 Закона РФ «О защите прав потребителей»
          от 07.02.1992 № 2300-1. Возврат товара ненадлежащего качества — согласно ст. 18–24
          того же закона.
        </p>

        <h2 className="mt-6 text-lg font-semibold">6. Ответственность сторон</h2>
        <p>
          Стороны несут ответственность в соответствии с законодательством РФ. Споры решаются
          путём переговоров, а при недостижении согласия — в судебном порядке по месту нахождения
          Продавца.
        </p>

        <h2 className="mt-6 text-lg font-semibold">7. Реквизиты Продавца</h2>
        <div className="rounded-2xl bg-surface p-5 font-mono text-[12.5px] leading-relaxed">
          <div>{company.legalName}</div>
          <div>ИНН: {company.inn}</div>
          <div>ОГРНИП: {company.ogrnip}</div>
          <div>Адрес: {company.address}</div>
          <div>Р/с: {company.account}</div>
          <div>Банк: {company.bank}</div>
          <div>БИК: {company.bik}</div>
          <div>К/с: {company.corrAccount}</div>
          <div>ИНН банка: {company.bankInn} · КПП банка: {company.bankKpp}</div>
          <div>Email: {company.supportEmail}</div>
        </div>
      </div>
    </article>
  );
}