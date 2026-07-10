import { Link } from "@tanstack/react-router";
import { Youtube, Instagram, MessageCircle } from "lucide-react";
import { company } from "@/lib/company";

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
            <div className="mt-5 flex items-center gap-2">
              <SocialLink href="https://vk.com/sadova" label="ВКонтакте">
                <span className="text-[11px] font-bold">VK</span>
              </SocialLink>
              <SocialLink href="https://youtube.com/@sadova" label="YouTube">
                <Youtube className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="https://instagram.com/sadova" label="Instagram">
                <Instagram className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="/support" label="Написать в поддержку">
                <MessageCircle className="h-4 w-4" />
              </SocialLink>
            </div>
          </div>
          <FooterCol
            title="Магазин"
            links={[
              { to: "/catalog", label: "Каталог" },
              { to: "/life", label: "Жизнь магазина" },
              { to: "/cart", label: "Корзина" },
              { to: "/auth", label: "Аккаунт" },
            ]}
          />
          <FooterCol
            title="Информация"
            links={[
              { to: "/delivery", label: "Доставка и оплата" },
              { to: "/legal/rules", label: "Правила магазина" },
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
        <div className="mt-12 space-y-4 border-t border-hairline pt-6 text-[12px] text-muted-foreground">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-medium text-foreground">{company.legalName}</div>
              <div className="mt-1">ИНН {company.inn} · ОГРНИП {company.ogrnip}</div>
            </div>
            <a href={`mailto:${company.supportEmail}`} className="underline">
              {company.supportEmail}
            </a>
          </div>
          <div className="text-[11px]">
            Полные банковские реквизиты — в{" "}
            <Link to="/legal/offer" className="underline">публичной оферте</Link>.
          </div>
          <div className="flex items-center gap-2 border-t border-hairline pt-4">
            <span className="inline-flex h-3 w-4 overflow-hidden rounded-[2px] border border-hairline">
              <span className="flex h-full w-full flex-col">
                <span className="h-1/3 bg-white" />
                <span className="h-1/3 bg-[#0039A6]" />
                <span className="h-1/3 bg-[#D52B1E]" />
              </span>
            </span>
            © {new Date().getFullYear()} SADOVA · {company.shortName}. Сделано в России.
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
    >
      {children}
    </a>
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