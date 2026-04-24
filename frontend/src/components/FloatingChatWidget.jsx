import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Zap } from 'lucide-react';
import { chatPrivacyAdvice } from '../services/api';

const QUICK_QUESTIONS = [
  "What is my biggest risk?",
  "How do I fix this quickly?",
  "Show step-by-step actions",
  "Is my identity at risk?",
];

// Maps a quick-question string to a backend intent token.
function getIntent(question) {
  switch (question) {
    case "What is my biggest risk?":   return 'RISK_SUMMARY';
    case "How do I fix this quickly?": return 'QUICK_FIX';
    case "Show step-by-step actions":  return 'STEP_BY_STEP';
    case "Is my identity at risk?":    return 'IDENTITY_RISK';
    default:                           return 'GENERAL';
  }
}

const DONE_LABEL = "✅ Done";
const CLOSING_MESSAGE =
  "Alright, you're all set! Reach out anytime if you need more privacy help.";

function createMessage(role, content) {
  return { role, content, id: `${role}-${Date.now()}-${Math.random()}` };
}

// ---------------------------------------------------------------------------
// QuickQuestions – reusable chip strip shown after every AI response
// ---------------------------------------------------------------------------
function QuickQuestions({ onQuestionClick, onDone, disabled }) {
  return (
    <div className="floating-ai-followups">
      <div className="quick-questions">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            className="quick-btn"
            disabled={disabled}
            onClick={() => onQuestionClick(q)}
          >
            {q}
          </button>
        ))}
        <button
          type="button"
          className="done-btn"
          disabled={disabled}
          onClick={onDone}
        >
          {DONE_LABEL}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------
export default function FloatingChatWidget({ currentScanId, riskScore }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(true);

  const scrollRef = useRef(null);
  const responseCacheRef = useRef(new Map());
  const inFlightRef = useRef(false);

  // Auto-scroll on every meaningful state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  function appendMessage(newMessage) {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.content === newMessage.content && last?.role === newMessage.role) {
        return prev;
      }
      return [...prev, newMessage];
    });
  }

  async function handleQuestion(rawText) {
    const question = typeof rawText === 'string' ? rawText.trim() : '';
    if (!question || loading || inFlightRef.current || !isSessionActive) return;

    const intent = getIntent(question);

    setError('');
    appendMessage(createMessage('user', question));

    // NOTE: intentional — cached answers are NOT keyed by intent so that
    // repeat free-text questions still benefit from the cache, while
    // quick-question slots always carry the correct intent to the backend.
    const cacheKey = `${intent}::${question.toLowerCase()}`;
    const cachedAnswer = responseCacheRef.current.get(cacheKey);
    if (cachedAnswer) {
      appendMessage(createMessage('ai', cachedAnswer));
      setInput('');
      return;
    }

    inFlightRef.current = true;
    setLoading(true);

    try {
      const res = await chatPrivacyAdvice(question, currentScanId, riskScore, intent);
      const answer = res.answer || 'I could not generate a response right now.';
      responseCacheRef.current.set(cacheKey, answer);
      appendMessage(createMessage('ai', answer));
    } catch (err) {
      setError(err.message || 'Failed to reach the assistant.');
      appendMessage(
        createMessage('ai', 'I had trouble answering that. Please try again in a moment.')
      );
    } finally {
      inFlightRef.current = false;
      setLoading(false);
      setInput('');
    }
  }

  function handleDone() {
    setIsSessionActive(false);
    appendMessage(createMessage('ai', CLOSING_MESSAGE));
    setInput('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleQuestion(input);
  }

  // Determine whether quick questions should float after the latest AI message.
  // They appear AFTER the last message list item, so we only inject them once
  // at the very bottom (not per-message), which avoids duplicate chip rows.
  const lastMessage = messages[messages.length - 1];
  const showQuickQuestions =
    isSessionActive && !loading && lastMessage?.role === 'ai';

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
            {/* ── Initial state: no messages yet ── */}
            {messages.length === 0 && (
              <div className="floating-ai-empty">
                <p className="floating-ai-empty-label">Quick questions</p>
                <div className="quick-questions">
                  {QUICK_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="quick-btn"
                      disabled={loading}
                      onClick={() => handleQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="done-btn"
                    disabled={loading}
                    onClick={handleDone}
                  >
                    {DONE_LABEL}
                  </button>
                </div>
              </div>
            )}

            {/* ── Message history ── */}
            {messages.map((message) => (
              <div key={message.id} className="floating-ai-message-group">
                <div
                  className={`floating-ai-message-row ${
                    message.role === 'user' ? 'is-user' : 'is-ai'
                  }`}
                >
                  <div
                    className={`floating-ai-message ${
                      message.role === 'user' ? 'is-user' : 'is-ai'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {/* ── Thinking indicator ── */}
            {loading && (
              <div className="floating-ai-message-row is-ai">
                <div className="floating-ai-message is-ai is-loading">AI is thinking...</div>
              </div>
            )}

            {/* ── Persistent quick questions after every AI response ── */}
            {showQuickQuestions && (
              <QuickQuestions
                onQuestionClick={handleQuestion}
                onDone={handleDone}
                disabled={loading}
              />
            )}
          </div>

          {error && <p className="floating-ai-error">{error}</p>}

          <form className="floating-ai-input-row" onSubmit={handleSubmit}>
            <input
              className="floating-ai-input"
              type="text"
              placeholder={
                isSessionActive
                  ? 'Ask your privacy question...'
                  : 'Session ended – reopen to start again'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || !isSessionActive}
            />
            <button
              type="submit"
              className="floating-ai-send"
              disabled={loading || !input.trim() || !isSessionActive}
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
