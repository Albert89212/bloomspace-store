import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="text-[15px] font-semibold tracking-tight">SADOVA</div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              Премиальная садовая мебель. Разработано в Москве, произведено в России.
            </p>
          </div>
          <FooterCol
            title="Магазин"
            links={[
              { to: "/catalog", label: "Каталог" },
              { to: "/cart", label: "Корзина" },
              { to: "/auth", label: "Аккаунт" },
            ]}
          />
          <FooterCol
            title="Информация"
            links={[
              { to: "/delivery", label: "Доставка и оплата" },
              { to: "/support", label: "Поддержка" },
              { to: "/about", label: "О бренде" },
            ]}
          />
          <FooterCol
            title="Юридическое"
            links={[
              { to: "/legal/offer", label: "Публичная оферта" },
              { to: "/legal/privacy", label: "Политика конфиденциальности" },
              { to: "/legal/terms", label: "Пользовательское соглашение" },
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-hairline pt-6 text-[12px] text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} SADOVA. Все права защищены.</div>
          <div>ИП / ООО «Садова». ИНН 0000000000</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-[13px] font-medium">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}