import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Zap } from 'lucide-react';
import { chatPrivacyAdvice } from '../services/api';

const DEFAULT_QUESTIONS = [
  'What is my biggest risk?',
  'How do I fix this quickly?',
  'Show step-by-step actions',
  'Is my identity at risk?',
];

const DEFAULT_FOLLOW_UPS = ['Secure accounts', 'Remove data', 'Show steps', 'Done'];

export default function FloatingChatWidget({ currentScanId, riskScore }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  const lastAiMessageIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'ai') return i;
    }
    return -1;
  })();

  function normalizeFollowUps(nextFollowUps) {
    if (!Array.isArray(nextFollowUps) || nextFollowUps.length === 0) {
      return DEFAULT_FOLLOW_UPS;
    }

    const unique = [];
    const seen = new Set();

    for (const item of nextFollowUps) {
      if (typeof item !== 'string') continue;
      const value = item.trim();
      if (!value) continue;
      const key = value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(value);
    }

    const withoutDone = unique.filter((item) => item.toLowerCase() !== 'done').slice(0, 4);
    return [...withoutDone, 'Done'];
  }

  async function sendMessage(rawText) {
    const question = typeof rawText === 'string' ? rawText.trim() : '';
    if (!question || loading) return;

    if (question.toLowerCase() === 'done') {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: question },
        { role: 'ai', text: "You're all set. Stay safe. You can reopen me anytime." },
      ]);
      setIsConversationActive(false);
      setFollowUps([]);
      setInput('');
      return;
    }

    setError('');
    setIsConversationActive(true);
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text: question }]);

    try {
      const res = await chatPrivacyAdvice(question, currentScanId, riskScore);
      const safeFollowUps = normalizeFollowUps(res.followUps);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: res.answer || 'I could not generate a response right now.' },
      ]);
      setFollowUps(safeFollowUps);
    } catch (err) {
      setError(err.message || 'Failed to reach the assistant.');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'I had trouble answering that. Please try again in a moment.' },
      ]);
      setFollowUps(DEFAULT_FOLLOW_UPS);
    } finally {
      setLoading(false);
      setInput('');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      <button
        type="button"
        className="floating-ai-button"
        aria-label={isOpen ? 'Close privacy assistant' : 'Open privacy assistant'}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="floating-ai-button-inner">
          <Zap size={18} />
          <MessageCircle size={16} />
        </span>
      </button>

      {isOpen && (
        <section className="floating-ai-panel" aria-label="Privacy Assistant Chat">
          <header className="floating-ai-header">
            <div>
              <h3 className="floating-ai-title">Privacy Assistant</h3>
              <p className="floating-ai-subtitle">Live advice for your exposure profile</p>
            </div>
            <button
              type="button"
              className="floating-ai-close"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </button>
          </header>

          <div className="floating-ai-messages" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="floating-ai-empty">
                <p className="floating-ai-empty-label">Quick questions</p>
                <div className="floating-ai-chip-row">
                  {DEFAULT_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="floating-ai-chip"
                      disabled={loading}
                      onClick={() => sendMessage(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className="floating-ai-message-group">
                <div className={`floating-ai-message-row ${message.role === 'user' ? 'is-user' : 'is-ai'}`}>
                  <div className={`floating-ai-message ${message.role === 'user' ? 'is-user' : 'is-ai'}`}>
                    {message.text}
                  </div>
                </div>

                {message.role === 'ai' &&
                  isConversationActive &&
                  followUps.length > 0 &&
                  index === lastAiMessageIndex && (
                    <div className="floating-ai-followups">
                      <div className="floating-ai-chip-row">
                        {followUps.map((followUp) => (
                          <button
                            key={followUp}
                            type="button"
                            className="floating-ai-chip"
                            disabled={loading}
                            onClick={() => sendMessage(followUp)}
                          >
                            {followUp}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}

            {loading && (
              <div className="floating-ai-message-row is-ai">
                <div className="floating-ai-message is-ai is-loading">AI is thinking...</div>
              </div>
            )}
          </div>

          {error && <p className="floating-ai-error">{error}</p>}

          <form className="floating-ai-input-row" onSubmit={handleSubmit}>
            <input
              className="floating-ai-input"
              type="text"
              placeholder="Ask your privacy question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="floating-ai-send"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
