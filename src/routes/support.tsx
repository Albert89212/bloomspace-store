import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Поддержка — SADOVA" },
      { name: "description", content: "Свяжитесь со службой поддержки SADOVA." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Поддержка</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
        Мы отвечаем ежедневно с 9:00 до 21:00 (МСК).
      </p>
      <dl className="mt-8 space-y-4 text-[15px]">
        <div>
          <dt className="text-[12px] uppercase tracking-widest text-muted-foreground">Email</dt>
          <dd className="mt-1">support@sadova.example</dd>
        </div>
        <div>
          <dt className="text-[12px] uppercase tracking-widest text-muted-foreground">Телефон</dt>
          <dd className="mt-1">8 800 000 00 00</dd>
        </div>
      </dl>
    </div>
  );
}