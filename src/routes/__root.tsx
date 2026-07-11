import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { SupportChatWidget } from "../components/SupportChatWidget";
import { OwnerEditToggle } from "../components/Editable";
import { MobileCartBar } from "../components/MobileCartBar";
import { initTheme } from "../lib/theme-store";
import { useProducts } from "../lib/products-store";
import { useNews } from "../lib/news-store";
import { useCms } from "../lib/cms-store";
import { useAuth } from "../lib/auth-store";
import { useOrders } from "../lib/orders-store";
import { useReviews } from "../lib/reviews-store";
import { useSupportChat } from "../lib/support-chat-store";
import { useStaffChat } from "../lib/staff-chat-store";
import { usePromocodes } from "../lib/promocodes-store";
import { useTickets } from "../lib/tickets-store";
import { useLifePosts } from "../lib/life-posts-store";
import { useBackInStock } from "../lib/back-in-stock-store";
import { useAdmin } from "../lib/admin-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SADOVA — премиальная садовая мебель" },
      { name: "description", content: "Минималистичная садовая мебель ручной сборки. Доставка по всей России." },
      { name: "author", content: "SADOVA" },
      { property: "og:title", content: "SADOVA — премиальная садовая мебель" },
      { property: "og:description", content: "Минималистичная садовая мебель ручной сборки. Доставка по всей России." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    initTheme();
    void Promise.allSettled([
      useCms.getState().hydrate(),
      useAuth.getState().hydrate(),
      useProducts.getState().hydrate(),
      useNews.getState().hydrate(),
      useOrders.getState().hydrate(),
      useReviews.getState().hydrate(),
      useSupportChat.getState().hydrate(),
      useStaffChat.getState().hydrate(),
      usePromocodes.getState().hydrate(),
      useTickets.getState().hydrate(),
      useLifePosts.getState().hydrate(),
      useBackInStock.getState().hydrate(),
      useAdmin.getState().hydrate(),
    ]);
    const iv = setInterval(() => {
      // refresh shared collections every 30s so multiple users see updates
      void (async () => {
        try {
          const { fetchCollection } = await import("../lib/shared-collection.functions");
          const [p, n, cms] = await Promise.all([
            fetchCollection({ data: { name: "products" } }),
            fetchCollection({ data: { name: "news" } }),
            fetchCollection({ data: { name: "cms" } }),
          ]);
          if (Array.isArray(p)) useProducts.setState({ items: p as any });
          if (Array.isArray(n)) useNews.setState({ items: n as any });
          if (Array.isArray(cms)) {
            const values = (cms as Array<{ key?: string; value?: string }>).reduce<Record<string, string>>((acc, item) => {
              if (item.key && typeof item.value === "string") acc[item.key] = item.value;
              return acc;
            }, {});
            useCms.setState({ values });
          }
        } catch {
          /* ignore */
        }
      })();
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
        <SupportChatWidget />
        <MobileCartBar />
        <OwnerEditToggle />
      </div>
    </QueryClientProvider>
  );
}
