import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

const components: Components = {
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element -- 외부 호스트 이미지를 자유롭게 붙여넣는 글이라 next/image 대상이 아님
    <img
      src={props.src}
      alt={props.alt ?? ""}
      title={props.title}
      loading="lazy"
      decoding="async"
    />
  ),
  // 글 제목이 페이지의 유일한 h1이 되도록, 본문 제목은 한 단계씩 내려서 렌더링한다.
  // 시각 크기는 globals.css의 .prose-h1~4 클래스가 담당해서 기존 디자인은 그대로 유지된다.
  h1: ({ children }) => <h2 className="prose-h1">{children}</h2>,
  h2: ({ children }) => <h3 className="prose-h2">{children}</h3>,
  h3: ({ children }) => <h4 className="prose-h3">{children}</h4>,
  h4: ({ children }) => <h5 className="prose-h4">{children}</h5>,
  h5: ({ children }) => <h6 className="prose-h4">{children}</h6>,
  h6: ({ children }) => <h6 className="prose-h4">{children}</h6>,
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-delibot">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
