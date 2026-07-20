import matter from "gray-matter";
import { deleteFile, getFile, listDir, putFile } from "./github";

const POSTS_DIR = "content/blog";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  author: string;
};

export type Post = PostMeta & { content: string; sha: string };

export type PostInput = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  author: string;
  content: string;
};

function parseFrontmatter(
  slug: string,
  raw: string
): { meta: PostMeta; content: string } {
  const parsed = matter(raw);
  const data = parsed.data as Partial<PostMeta>;
  return {
    meta: {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      excerpt: data.excerpt ?? "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: data.author ?? "",
    },
    content: parsed.content,
  };
}

function serializePost(input: PostInput): string {
  return matter.stringify(input.content, {
    title: input.title,
    date: input.date,
    slug: input.slug,
    excerpt: input.excerpt,
    tags: input.tags,
    author: input.author,
  });
}

function postPath(slug: string): string {
  return `${POSTS_DIR}/${slug}.md`;
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const entries = await listDir(POSTS_DIR);
  const mdFiles = entries.filter(
    (e) => e.type === "file" && e.name.endsWith(".md")
  );

  const posts = await Promise.all(
    mdFiles.map(async (entry) => {
      const file = await getFile(entry.path);
      if (!file) return null;
      const slug = entry.name.replace(/\.md$/, "");
      return parseFrontmatter(slug, file.content).meta;
    })
  );

  return posts
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const file = await getFile(postPath(slug));
  if (!file) return null;
  const { meta, content } = parseFrontmatter(slug, file.content);
  return { ...meta, content, sha: file.sha };
}

export async function createPost(input: PostInput): Promise<void> {
  const path = postPath(input.slug);
  const existing = await getFile(path, { revalidate: 0 });
  if (existing) {
    throw new Error(`이미 존재하는 slug입니다: "${input.slug}"`);
  }
  await putFile(path, serializePost(input), `blog: publish "${input.title}"`);
}

export async function updatePost(
  slug: string,
  input: PostInput
): Promise<void> {
  const path = postPath(slug);
  const existing = await getFile(path, { revalidate: 0 });
  if (!existing) {
    throw new Error(`존재하지 않는 글입니다: "${slug}"`);
  }

  if (input.slug !== slug) {
    const newPath = postPath(input.slug);
    const conflict = await getFile(newPath, { revalidate: 0 });
    if (conflict) {
      throw new Error(`이미 존재하는 slug입니다: "${input.slug}"`);
    }
    await putFile(
      newPath,
      serializePost(input),
      `blog: update "${input.title}" (rename slug from ${slug})`
    );
    await deleteFile(
      path,
      existing.sha,
      `blog: remove old slug "${slug}" after rename`
    );
    return;
  }

  await putFile(
    path,
    serializePost(input),
    `blog: update "${input.title}"`,
    existing.sha
  );
}

export async function deletePost(slug: string): Promise<void> {
  const path = postPath(slug);
  const existing = await getFile(path, { revalidate: 0 });
  if (!existing) return;
  await deleteFile(path, existing.sha, `blog: delete "${slug}"`);
}
