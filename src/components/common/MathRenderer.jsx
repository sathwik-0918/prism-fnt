// components/common/MathRenderer.jsx
// Reusable math + markdown renderer
// Used in Chat, Quiz, ConceptOfDay, Study Planner — EVERYWHERE
// Ensures consistent beautiful formula display across all features

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function MathRenderer({ content, className = "" }) {
  if (!content) return null;

  return (
    <div className={`math-renderer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // style code blocks nicely
          code({ node, inline, className, children, ...props }) {
            return inline ? (
              <code
                style={{
                  background: "#f0f0f0",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "0.9em"
                }}
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre
                style={{
                  background: "#1e1e1e",
                  color: "#fff",
                  padding: "1rem",
                  borderRadius: "8px",
                  overflowX: "auto"
                }}
              >
                <code {...props}>{children}</code>
              </pre>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MathRenderer;