import { useRef, useState, useEffect } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
  citations?: { snippet: string; score: number }[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("hr_chat_history");
    return saved ? JSON.parse(saved) : [
      { sender: "bot", text: "Hi! I’m your HR Assistant. Ask me about policies, benefits, or leave." }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("hr_chat_history", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const BASE_URL = "http://localhost:8000";
      const res = await fetch(`${BASE_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.text })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((msgs) => [
          ...msgs,
          {
            sender: "bot",
            text: data.answer || "Sorry, I couldn’t find an answer.",
            citations: data.results
          }
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          { sender: "bot", text: "Sorry, something went wrong." }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([
      { sender: "bot", text: "Hi! I’m your HR Assistant. Ask me about policies, benefits, or leave." }
    ]);
    localStorage.removeItem("hr_chat_history");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-teal-50 flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-teal-600 text-white py-4 shadow">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4">
          <h1 className="text-xl font-bold tracking-tight">HR Assistant Chat</h1>
          <button onClick={clearHistory} className="text-xs px-3 py-1 bg-white/10 rounded hover:bg-white/20">Clear</button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-2">
        <div className="w-full max-w-2xl flex flex-col gap-2 mt-8 mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-lg px-4 py-3 max-w-[80%] shadow-md ${
                msg.sender === "user"
                  ? "self-end bg-teal-100 text-teal-900"
                  : "self-start bg-white text-gray-800 border"
              }`}
            >
              <div className="mb-1 whitespace-pre-line">{msg.text}</div>
              {msg.sender === "bot" && msg.citations && msg.citations.length > 0 && (
                <details className="mt-2 text-xs text-gray-600 cursor-pointer">
                  <summary className="font-semibold text-teal-700">Show Policy Citations</summary>
                  <ul className="mt-1 space-y-1">
                    {msg.citations.map((c, i) => (
                      <li key={i} className="bg-teal-50 rounded p-2 mb-1 border border-teal-100">
                        <span className="block font-mono text-gray-700">{c.snippet}</span>
                        <span className="block text-right text-[10px] text-gray-400">Score: {c.score.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
          {loading && (
            <div className="rounded-lg px-4 py-3 max-w-[80%] shadow-md self-start bg-white text-gray-800 border animate-pulse">
              <div className="mb-1 whitespace-pre-line">Thinking…</div>
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>
        <form
          onSubmit={sendMessage}
          className="w-full max-w-2xl flex gap-2 mb-8 sticky bottom-0 bg-white/80 py-2 px-2 rounded-xl shadow-lg"
        >
          <input
            className="flex-1 border border-teal-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200"
            type="text"
            placeholder="Ask a question about HR policies…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 text-white px-5 py-2 rounded font-semibold hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "…" : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
}
