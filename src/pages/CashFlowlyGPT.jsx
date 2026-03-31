import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, Bot, User, Trash2, ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Simple markdown renderer for AI responses
const renderMarkdown = (text) => {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*)/gm, '<h4 style="font-size:0.85rem;font-weight:800;color:#0f172a;margin:0.75rem 0 0.25rem">$1</h4>')
        .replace(/^## (.*)/gm, '<h4 style="font-size:0.9rem;font-weight:900;color:#0f172a;margin:0.75rem 0 0.25rem">$1</h4>')
        .replace(/^- (.*)/gm, '<li style="padding:0.2rem 0;color:#334155">$1</li>')
        .replace(/(<li.*<\/li>)/gs, '<ul style="padding-left:1.25rem;margin:0.5rem 0">$1</ul>')
        .replace(/\n\n/g, '</p><p style="margin:0.6rem 0 0">')
        .replace(/\n/g, '<br/>');
};

const MessageBubble = ({ message, idx }) => {
    const isUser = message.role === 'user';
    return (
        <div
            key={idx}
            style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: isUser ? '75%' : '88%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                animation: 'slideIn 0.3s ease-out',
            }}
        >
            {!isUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <div style={{ width: '22px', height: '22px', background: 'linear-gradient(135deg, #0f172a, #1e40af)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Bot size={12} color="#fff" />
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase' }}>CashFlowly AI</span>
                </div>
            )}
            <div style={{
                padding: isUser ? '0.75rem 1rem' : '1rem 1.25rem',
                borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                background: isUser ? 'linear-gradient(135deg, #0f172a, #1e293b)' : '#fff',
                color: isUser ? '#fff' : '#1e293b',
                fontSize: '0.88rem',
                fontWeight: isUser ? '600' : '500',
                lineHeight: '1.65',
                boxShadow: isUser ? '0 4px 12px rgba(15,23,42,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
                border: isUser ? 'none' : '1px solid #f1f5f9',
                wordBreak: 'break-word',
            }}>
                {isUser ? (
                    message.text
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
                )}
            </div>
            {isUser && (
                <span style={{ fontSize: '0.6rem', marginTop: '0.35rem', color: '#94a3b8', fontWeight: '700' }}>YOU</span>
            )}
        </div>
    );
};

const TypingIndicator = () => (
    <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '4px 18px 18px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ width: '22px', height: '22px', background: 'linear-gradient(135deg, #0f172a, #1e40af)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bot size={12} color="#fff" />
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[0, 0.15, 0.3].map((delay, i) => (
                <div key={i} style={{ width: '7px', height: '7px', background: '#94a3b8', borderRadius: '50%', animation: `bounce 0.8s ${delay}s infinite alternate` }} />
            ))}
        </div>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>Analyzing your finances...</span>
    </div>
);

const CashFlowlyGPT = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! 👋 I'm your **CashFlowly AI Advisor**. I have full access to your income, spending, savings goals, debts, and bills for this month.\n\nAsk me anything — I'll give you specific, data-backed advice." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages, loading]);

    const handleSend = async (e, forcedText = null) => {
        if (e) e.preventDefault();
        const messageText = (forcedText || input).trim();
        if (!messageText || loading) return;

        const userMessage = { role: 'user', text: messageText };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);
        setError(null);

        // Build history in Gemini format (exclude the very last user message — it's the current one)
        const history = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        try {
            const { data } = await api.post('/ai/chat', {
                message: messageText,
                history: history
            });

            if (!data?.text) throw new Error("Empty response from AI.");
            setMessages([...updatedMessages, { role: 'assistant', text: data.text }]);
        } catch (err) {
            console.error('Chat error:', err);
            const status = err.response?.status;
            let errorText;

            if (status === 429) {
                errorText = "⏳ The AI is a bit busy right now. Please wait a moment and try again.";
            } else if (status === 400) {
                errorText = "🤔 I couldn't process that message. Could you try rephrasing it?";
            } else {
                errorText = "⚠️ I ran into a hiccup. Please try again — I'm on standby!";
            }

            setMessages([...updatedMessages, { role: 'assistant', text: errorText }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleClear = () => {
        setMessages([{ role: 'assistant', text: "History cleared! I still have your full financial data loaded. What would you like to know?" }]);
        setError(null);
    };

    const suggestedQuestions = [
        "Can I afford a 50k Ksh laptop?",
        "How can I save 10k more this month?",
        "Analyze my spending this month",
        "Am I on track for my savings goals?",
        "Which bills should I pay first?",
        "Give me a budget plan",
    ];

    return (
        <div style={{ maxWidth: '820px', margin: '0 auto', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', background: '#f8fafc', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bounce { to { transform: translateY(-4px); opacity: 0.4; } }
                .suggestion-btn:hover { background: #0f172a !important; color: #fff !important; border-color: #0f172a !important; transform: translateY(-1px); }
                .send-btn:hover:not(:disabled) { background: #1e40af !important; transform: scale(1.03); }
                .chat-input:focus { border-color: #0f172a !important; box-shadow: 0 0 0 3px rgba(15,23,42,0.1) !important; }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={() => navigate(-1)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', padding: '0.4rem 0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={16} />
                    </button>
                    <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #0f172a, #1e40af)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={18} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a', margin: 0, lineHeight: '1.2' }}>CASHFLOWLY AI</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'none' }}></div>
                            <span style={{ fontSize: '0.6rem', color: '#22c55e', fontWeight: '800', letterSpacing: '0.06em' }}>LIVE — YOUR DATA LOADED</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleClear}
                    style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.65rem', fontWeight: '800', padding: '0.4rem 0.75rem', borderRadius: '8px', letterSpacing: '0.04em' }}
                >
                    <Trash2 size={12} /> CLEAR
                </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc' }}>
                {messages.map((m, i) => (
                    <MessageBubble key={i} message={m} idx={i} />
                ))}
                {loading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 3 && !loading && (
                <div style={{ padding: '0 1.5rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {suggestedQuestions.map(q => (
                        <button
                            key={q}
                            onClick={(e) => handleSend(e, q)}
                            className="suggestion-btn"
                            style={{ padding: '0.45rem 0.9rem', background: '#fff', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.73rem', fontWeight: '700', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.01em' }}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <form
                onSubmit={handleSend}
                style={{ padding: '1rem 1.5rem', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', alignItems: 'center' }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className="chat-input"
                    placeholder="Ask anything about your finances..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    style={{
                        flex: 1,
                        padding: '0.85rem 1.25rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        background: '#f8fafc',
                        outline: 'none',
                        transition: 'all 0.2s',
                        color: '#0f172a',
                    }}
                />
                <button
                    type="submit"
                    className="send-btn"
                    disabled={loading || !input.trim()}
                    style={{
                        padding: '0.85rem 1.25rem',
                        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '900',
                        fontSize: '0.75rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        opacity: loading || !input.trim() ? 0.65 : 1,
                        transition: 'all 0.2s',
                        letterSpacing: '0.04em',
                    }}
                >
                    {loading ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                    {loading ? 'ANALYZING' : 'SEND'}
                </button>
            </form>
        </div>
    );
};

export default CashFlowlyGPT;
