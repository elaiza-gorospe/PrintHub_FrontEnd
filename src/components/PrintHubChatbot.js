import React, { useState, useRef, useEffect } from "react";
import "./PrintHubChatbot.css";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Add to your .env file:  REACT_APP_GEMINI_API_KEY=your_key_here
// Get a FREE key at:      https://aistudio.google.com/app/apikey


const SYSTEM_PROMPT = `You are PrintHub Assistant 🤖, a friendly and knowledgeable AI chatbot for PrintHub — a professional printing service. Help customers with:

- Pricing and quotes (business cards, flyers, posters, tarpaulins, mugs, shirts, notebooks, etc.)
- Delivery times and shipping options
- Turnaround time for orders
- Design services and file requirements (PDF, PNG, JPG, AI, PSD)
- Payment methods (GCash, PayMaya, Bank Transfer)
- Returns and refunds policy
- Bulk order discounts
- Order status and tracking

Be concise, warm, and helpful. Use bullet points when listing multiple items. If you don't know exact pricing, tell the customer to contact PrintHub directly for a custom quote. Keep responses short and scannable. Use emojis sparingly for warmth.`;

const SUGGESTED = [
  "💳 Business card pricing",
  "🚚 Delivery times",
  "📦 Bulk order discounts",
  "🎨 File requirements",
  "🔄 Returns policy",
];

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^[-•] (.+)/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\n{2,}/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export default function PrintHubChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    setInput("");
    setShowSuggested(false);

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const contents = newMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: contents }),
      });

      const data = await res.json();
      const reply = data.reply || "Sorry, I could not get a response.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Something went wrong. Please try again or contact us directly." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`phc-fab ${isOpen ? "phc-fab--open" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Toggle PrintHub chat"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
        {!isOpen && <span className="phc-ping" />}
      </button>

      {/* Chat Window */}
      <div className={`phc-window ${isOpen ? "phc-window--open" : ""}`}>

        {/* Header */}
        <div className="phc-header">
          <div className="phc-header-info">
            <div className="phc-avatar">🤖</div>
            <div>
              <div className="phc-name">PrintHub Assistant</div>
              <div className="phc-powered">Powered by Gemini AI – Ask me anything about printing!</div>
            </div>
          </div>
          <button className="phc-close-btn" onClick={() => setIsOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="phc-body">
          {/* Welcome message */}
          <div className="phc-welcome">
            <p>👋 Hi! I'm your <strong>PrintHub AI assistant</strong> powered by <strong>Google Gemini AI</strong>. I can help with:</p>
            <ul>
              <li>💳 Pricing and quotes (business cards, flyers, posters, etc.)</li>
              <li>🚚 Delivery times and shipping options</li>
              <li>⏱️ Turnaround time for orders</li>
              <li>🎨 Design services and file requirements</li>
              <li>📄 File formats (PDF, PNG, JPG, AI, PSD)</li>
              <li>💳 Payment methods (GCash, PayMaya, Bank Transfer)</li>
              <li>🔄 Returns and refunds policy</li>
              <li>📦 Bulk order discounts</li>
              <li>📦 Order status and tracking</li>
            </ul>
            {showSuggested && <p className="phc-try-label">💡 <em>Try asking me:</em></p>}
          </div>

          {/* Suggested chips */}
          {showSuggested && (
            <div className="phc-chips">
              {SUGGESTED.map((s) => (
                <button key={s} className="phc-chip" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i} className={`phc-row phc-row--${m.role}`}>
              {m.role === "assistant" && <span className="phc-bot-icon">🤖</span>}
              <div
                className={`phc-bubble phc-bubble--${m.role}`}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(m.content) }}
              />
            </div>
          ))}

          {/* Typing dots */}
          {isLoading && (
            <div className="phc-row phc-row--assistant">
              <span className="phc-bot-icon">🤖</span>
              <div className="phc-bubble phc-bubble--assistant phc-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="phc-footer">
          <input
            ref={inputRef}
            className="phc-input"
            placeholder="Ask me about printing services, pricing, delivery, etc..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={isLoading}
          />
          <button
            className="phc-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
