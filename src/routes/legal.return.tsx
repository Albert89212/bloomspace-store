import { createFileRoute } from "@tanstack/react-router";
import { company } from "@/lib/company";
import { legalHead } from "@/lib/legal-head";

export const Route = createFileRoute("/legal/return")({
  head: () =>
    legalHead(
      "/legal/return",
      "Возврат и обмен товара — SADOVA",
      "Правила возврата и обмена садовой мебели по Закону РФ «О защите прав потребителей» и Постановлению № 2463.",
    ),
  component: ReturnPage,
});

function ReturnPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Возврат и обмен</h1>
      <p className="mt-2 text-[13px] text-muted-foreground">
        Редакция от {new Date().toLocaleDateString("ru-RU")} · Составлено в соответствии
        с Законом РФ № 2300-1 «О защите прав потребителей» и Постановлением
        Правительства РФ № 2463 от 31.12.2020
      </p>

      <div className="mt-8 space-y-6 text-[14px] leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">1. Право на отказ (дистанционная торговля)</h2>
          <p className="mt-2">
            Покупатель вправе отказаться от товара в любое время до его передачи и в течение
            7 дней после получения без объяснения причин (п. 4 ст. 26.1 ЗоЗПП).
            Если в момент доставки не был предоставлен документ о порядке и сроках возврата
            в письменной форме — срок увеличивается до 3 месяцев.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Условия возврата качественного товара</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>сохранён товарный вид, потребительские свойства, упаковка;</li>
            <li>сохранены пломбы, ярлыки, комплектация;</li>
            <li>имеется документ, подтверждающий покупку (чек, договор, выписка).</li>
          </ul>
          <p className="mt-2">
            Не подлежат возврату товары, изготовленные по индивидуальному заказу
            (п. 4 ст. 26.1 ЗоЗПП) — например, мебель нестандартных размеров или с
            индивидуальной обивкой.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Возврат товара ненадлежащего качества</h2>
          <p className="mt-2">
            При обнаружении недостатков покупатель вправе (ст. 18 ЗоЗПП):
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>потребовать замены на товар той же марки;</li>
            <li>потребовать замены на аналогичный товар с перерасчётом цены;</li>
            <li>потребовать соразмерного уменьшения цены;</li>
            <li>потребовать безвозмездного устранения недостатков;</li>
            <li>отказаться от договора и потребовать возврата денег.</li>
          </ul>
          <p className="mt-2">
            Требование о возврате рассматривается в течение 10 календарных дней (ст. 22 ЗоЗПП).
            При необходимости экспертизы — до 20 дней. Транспортные расходы по возврату
            крупногабаритного товара несёт продавец (п. 7 ст. 18 ЗоЗПП).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Порядок оформления</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-6">
            <li>
              направьте заявление на{" "}
              <a href={`mailto:${company.supportEmail}`} className="underline">
                {company.supportEmail}
              </a>{" "}
              с указанием номера заказа, причины возврата и способа возврата средств;
            </li>
            <li>приложите фото товара и упаковки, копию документа о покупке;</li>
            <li>получите инструкции по отправке и адрес приёмки;</li>
            <li>отправьте товар выбранной транспортной компанией;</li>
            <li>получите деньги на исходный способ оплаты в течение 10 дней (ст. 22 ЗоЗПП).</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Способ возврата средств</h2>
          <p className="mt-2">
            Средства возвращаются тем же способом, которым была произведена оплата
            (п. 4 ст. 26.1 ЗоЗПП). Возврат на банковскую карту — до 30 рабочих дней в
            зависимости от банка-эмитента. Возврат по СБП и СберPay — в течение 1–3 дней.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Гарантия</h2>
          <p className="mt-2">
            На всю продукцию распространяется гарантия производителя (обычно 12–24 месяца),
            указанная в паспорте изделия. Гарантия не покрывает повреждения от неправильной
            эксплуатации, механических воздействий, стихийных бедствий и естественного износа.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Контакты для претензий</h2>
          <p className="mt-2">
            {company.legalName}, ИНН {company.inn}, адрес: {company.address}.
            Email: <a href={`mailto:${company.supportEmail}`} className="underline">{company.supportEmail}</a>.
          </p>
        </section>
      </div>
    </article>
  );
}