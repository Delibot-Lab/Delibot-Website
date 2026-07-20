import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PostMeta } from "@/lib/posts";

export function PostCard({
  post,
  delay = 0,
}: {
  post: PostMeta;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <Link href={`/blog/${post.slug}`}>
        <Card className="h-full transition-transform hover:-translate-y-1">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
          <h2 className="mt-4 text-lg font-bold text-navy">{post.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <span>{post.author}</span>
            <span>{post.date}</span>
          </div>
        </Card>
      </Link>
    </Reveal>
  );
}
