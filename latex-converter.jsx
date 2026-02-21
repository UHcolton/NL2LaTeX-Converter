import { useState, useEffect, useRef } from "react";

const KATEX_URL = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
const KATEX_CSS = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
const AUTO_RENDER_URL = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js";

function useKaTeX() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.katex) { setLoaded(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = KATEX_CSS;
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = KATEX_URL;
    script.onload = () => {
      const ar = document.createElement("script");
      ar.src = AUTO_RENDER_URL;
      ar.onload = () => setLoaded(true);
      document.head.appendChild(ar);
    };
    document.head.appendChild(script);
  }, []);
  return loaded;
}

function RenderedLatex({ latex }) {
  const ref = useRef(null);
  const katexLoaded = useKaTeX();

  useEffect(() => {
    if (!katexLoaded || !ref.current || !latex) return;
    try {
      // Try block math first, then inline
      const wrapped = `\\[${latex}\\]`;
      window.katex.render(latex, ref.current, {
        throwOnError: false,
        displayMode: true,
        output: "html",
      });
    } catch {
      ref.current.textContent = "Render error";
    }
  }, [latex, katexLoaded]);

  if (!latex) return null;
  return <div ref={ref} className="katex-output" />;
}

const EXAMPLES = [
  "The quadratic formula",
  "Euler's identity",
  "The Gaussian integral",
  "Maxwell's equations in differential form",
  "The Fourier transform",
  "Bayes' theorem",
];

export default function App() {
  const [input, setInput] = useState("");
  const [latex, setLatex] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const katexLoaded = useKaTeX();

  async function generate(text) {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setLatex("");
    setExplanation("");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a LaTeX expert. When given a natural language description of a mathematical expression, formula, or equation, respond with ONLY a JSON object in this exact format:
{"latex": "<the LaTeX code, suitable for display math mode, no surrounding delimiters>", "explanation": "<one sentence explaining what this is>"}
Do not include any other text. The latex field should contain only the raw LaTeX expression without $, $$, \\[, or \\] delimiters.`,
          messages: [{ role: "user", content: text }],
        }),
      });

      const data = await res.json();
      const content = data.content?.[0]?.text || "";
      const clean = content.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setLatex(parsed.latex || "");
      setExplanation(parsed.explanation || "");
    } catch (e) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    generate(input);
  }

  function handleCopy() {
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Georgia', serif",
      color: "#e8e0d0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 24px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 11,
          letterSpacing: "0.3em",
          color: "#6b9080",
          marginBottom: 12,
          textTransform: "uppercase",
        }}>Natural Language →</div>
        <h1 style={{
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          fontWeight: 400,
          margin: 0,
          color: "#f0e8d8",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}>
          L<span style={{ color: "#c9a96e" }}>a</span>TeX
        </h1>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 11,
          letterSpacing: "0.3em",
          color: "#6b9080",
          marginTop: 12,
          textTransform: "uppercase",
        }}>→ Beautiful Mathematics</div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 640 }}>
        <div style={{
          border: "1px solid #2a2a3a",
          borderRadius: 4,
          background: "#0f0f18",
          overflow: "hidden",
          boxShadow: "0 0 40px rgba(201,169,110,0.05)",
          transition: "box-shadow 0.3s",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(input); } }}
            placeholder="Describe any mathematical expression…"
            rows={3}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e8e0d0",
              fontFamily: "'Georgia', serif",
              fontSize: 16,
              padding: "20px 20px 8px",
              resize: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px 14px",
          }}>
            <span style={{ fontSize: 11, color: "#3a3a4a", fontFamily: "monospace" }}>
              Enter ↵ to generate
            </span>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: loading ? "#1a1a28" : "#c9a96e",
                color: loading ? "#4a4a5a" : "#0a0a0f",
                border: "none",
                borderRadius: 3,
                padding: "8px 20px",
                fontFamily: "'Courier New', monospace",
                fontSize: 12,
                letterSpacing: "0.1em",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontWeight: 700,
                transition: "all 0.2s",
              }}
            >
              {loading ? "generating…" : "GENERATE"}
            </button>
          </div>
        </div>
      </form>

      {/* Examples */}
      <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 640 }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => { setInput(ex); generate(ex); }}
            style={{
              background: "transparent",
              border: "1px solid #2a2a3a",
              borderRadius: 20,
              padding: "5px 14px",
              color: "#7a7a8a",
              fontFamily: "'Georgia', serif",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "#c9a96e"; e.target.style.color = "#c9a96e"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#2a2a3a"; e.target.style.color = "#7a7a8a"; }}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: "#e07070", marginTop: 24, fontFamily: "monospace", fontSize: 13 }}>{error}</div>
      )}

      {/* Result */}
      {(latex || loading) && (
        <div style={{
          width: "100%",
          maxWidth: 640,
          marginTop: 40,
          animation: "fadeIn 0.4s ease",
        }}>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
            .katex-output { font-size: 1.6em; color: #f0e8d8; }
            .katex-output .katex-display { margin: 0; }
          `}</style>

          {/* Rendered output */}
          <div style={{
            background: "#0f0f18",
            border: "1px solid #2a2a3a",
            borderRadius: 4,
            padding: "40px 32px",
            textAlign: "center",
            minHeight: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {loading ? (
              <div style={{ color: "#3a3a4a", fontFamily: "monospace", fontSize: 13, letterSpacing: "0.1em" }}>
                rendering…
              </div>
            ) : katexLoaded ? (
              <RenderedLatex latex={latex} />
            ) : (
              <div style={{ color: "#3a3a4a" }}>Loading renderer…</div>
            )}
          </div>

          {/* Explanation */}
          {explanation && !loading && (
            <div style={{
              marginTop: 12,
              fontStyle: "italic",
              color: "#7a7a8a",
              fontSize: 13,
              textAlign: "center",
            }}>
              {explanation}
            </div>
          )}

          {/* LaTeX source */}
          {latex && !loading && (
            <div style={{ marginTop: 20 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "#4a4a5a",
                  textTransform: "uppercase",
                }}>LaTeX Source</span>
                <button
                  onClick={handleCopy}
                  style={{
                    background: "transparent",
                    border: "1px solid #2a2a3a",
                    borderRadius: 3,
                    padding: "4px 12px",
                    color: copied ? "#6b9080" : "#5a5a6a",
                    fontFamily: "monospace",
                    fontSize: 11,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    letterSpacing: "0.1em",
                  }}
                >
                  {copied ? "COPIED ✓" : "COPY"}
                </button>
              </div>
              <pre style={{
                background: "#0f0f18",
                border: "1px solid #1a1a28",
                borderRadius: 4,
                padding: "16px 20px",
                fontFamily: "'Courier New', monospace",
                fontSize: 13,
                color: "#c9a96e",
                overflow: "auto",
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}>
                {latex}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
