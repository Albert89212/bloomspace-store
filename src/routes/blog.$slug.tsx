import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { blogPosts } from "@/lib/blog";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Статья не найдена" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — Блог SADOVA` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:image", content: loaderData.cover },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Статья не найдена</h1>
      <Link to="/blog" className="mt-6 inline-flex text-[13px] underline">
        Все статьи
      </Link>
    </div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> В блог
      </Link>
      <div className="mt-6 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {post.category} · {post.readingTime} · {new Date(post.publishedAt).toLocaleDateString("ru-RU")}
      </div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">{post.title}</h1>
      <img
        src={post.cover}
        alt={post.title}
        className="mt-8 aspect-[16/9] w-full rounded-3xl object-cover"
      />
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-foreground/90">
        {post.body.map((paragraph: string, i: number) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: post.cover,
            datePublished: post.publishedAt,
            author: { "@type": "Organization", name: "SADOVA" },
          }),
        }}
      />
    </article>
  );
}