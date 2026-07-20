const GITHUB_API = "https://api.github.com";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function repoBase() {
  return {
    owner: env("GITHUB_OWNER"),
    repo: env("GITHUB_REPO"),
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${env("GITHUB_TOKEN")}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export type GitHubFile = { content: string; sha: string };
export type GitHubDirEntry = { name: string; path: string; type: string };

type ContentsItem = {
  name: string;
  path: string;
  type: string;
  sha: string;
  content?: string;
};

async function githubFetch(
  path: string,
  init: RequestInit & { next?: { revalidate?: number | false } } = {}
): Promise<Response> {
  const { owner, repo, branch } = repoBase();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  return fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
  });
}

export async function getFile(
  path: string,
  opts?: { revalidate?: number | false }
): Promise<GitHubFile | null> {
  const res = await githubFetch(path, {
    next: { revalidate: opts?.revalidate ?? 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub getFile(${path}) failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as ContentsItem;
  const content = Buffer.from(data.content ?? "", "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function listDir(
  dirPath: string,
  opts?: { revalidate?: number | false }
): Promise<GitHubDirEntry[]> {
  const res = await githubFetch(dirPath, {
    next: { revalidate: opts?.revalidate ?? 60 },
  });
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`GitHub listDir(${dirPath}) failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as ContentsItem[] | ContentsItem;
  if (!Array.isArray(data)) return [];
  return data.map((entry) => ({ name: entry.name, path: entry.path, type: entry.type }));
}

export async function putFile(
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const res = await githubFetch(path, {
    method: "PUT",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch: repoBase().branch,
      sha,
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub putFile(${path}) failed: ${res.status} ${await res.text()}`);
  }
}

export async function deleteFile(
  path: string,
  sha: string,
  message: string
): Promise<void> {
  const res = await githubFetch(path, {
    method: "DELETE",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha, branch: repoBase().branch }),
  });
  if (!res.ok) {
    throw new Error(`GitHub deleteFile(${path}) failed: ${res.status} ${await res.text()}`);
  }
}
