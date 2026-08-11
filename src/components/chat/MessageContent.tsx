/** 메시지 본문에서 @이름이 채널 멤버 이름과 일치하면 강조해서 보여준다. */
export function MessageContent({
  content,
  memberNames,
}: {
  content: string;
  memberNames: Record<string, string>;
}) {
  const knownNames = new Set(Object.values(memberNames));
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const mentionPattern = /@([^\s@]{1,32})/g;
  while ((match = mentionPattern.exec(content)) !== null) {
    const name = match[1];
    if (!knownNames.has(name)) continue;

    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <span
        key={match.index}
        className="rounded bg-mint/20 px-1 py-0.5 font-medium text-mint-strong"
      >
        @{name}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts.length > 0 ? parts : content}</>;
}
