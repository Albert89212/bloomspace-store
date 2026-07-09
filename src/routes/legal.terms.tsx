import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Пользовательское соглашение — SADOVA" },
      { name: "description", content: "Правила использования сайта SADOVA." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Пользовательское соглашение</h1>
      <div className="mt-8 space-y-5 text-[14px] leading-relaxed">
        <p>
          Настоящее Соглашение регулирует отношения между ООО «Садова» и пользователями сайта
          sadova.example. Используя сайт, вы подтверждаете согласие с условиями.
        </p>
        <h2 className="mt-6 text-lg font-semibold">Регистрация</h2>
        <p>
          При регистрации пользователь предоставляет достоверные данные и обязуется поддерживать
          их в актуальном состоянии.
        </p>
        <h2 className="mt-6 text-lg font-semibold">Интеллектуальная собственность</h2>
        <p>
          Все материалы сайта — тексты, изображения, дизайн — принадлежат Оператору и защищены
          законодательством РФ об авторском праве.
        </p>
        <h2 className="mt-6 text-lg font-semibold">Изменения</h2>
        <p>
          Оператор вправе изменять Соглашение в одностороннем порядке с публикацией новой
          редакции на сайте.
        </p>
      </div>
    </article>
  );
}