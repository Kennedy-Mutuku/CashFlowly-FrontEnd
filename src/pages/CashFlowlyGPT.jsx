import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, Bot, User, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CashFlowlyGPT = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your CashFlowly AI Advisor. I've analyzed your current spending, income, and goals. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e, forcedText = null) => {
        if (e) e.preventDefault();
        const messageText = forcedText || input;
        if (!messageText.trim() || loading) return;

        const newMessages = [...messages, { role: 'user', text: messageText }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // Convert messages to Gemini history format
            const history = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.text }]
            }));

            const { data } = await api.post('/ai/chat', {
                message: messageText,
                history: history
            });

            setMessages([...newMessages, { role: 'assistant', text: data.text }]);
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = err.response?.data?.message || "I'm having trouble connecting to the AI Advisor. Please check your internet or try again shortly.";
            setMessages([...newMessages, { role: 'assistant', text: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedQuestions = [
        "Can I afford a 50k Ksh laptop?",
        "How can I save 10k more this month?",
        "Analyze my spending hierarchy",
        "Am I on track for my savings goals?"
    ];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#fff', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ background: '#0f172a', padding: '0.5rem', borderRadius: '8px' }}>
                        <Bot size={20} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>CASHFLOWLY AI</h2>
                        <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: '800', letterSpacing: '0.05em' }}>PREMIUM ADVISOR ACTIVE</span>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([{ role: 'assistant', text: "Chat history cleared. How else can I assist you?" }])}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700' }}
                >
                    <Trash2 size={14} /> CLEAR CHAT
                </button>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        <div style={{
                            padding: '1rem 1.25rem',
                            borderRadius: m.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                            background: m.role === 'user' ? '#0f172a' : '#f1f5f9',
                            color: m.role === 'user' ? '#fff' : '#0f172a',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            lineHeight: '1.6',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}>
                            {m.text}
                        </div>
                        <span style={{ fontSize: '0.65rem', marginTop: '0.4rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
                            {m.role === 'assistant' ? 'AI Advisor' : 'You'}
                        </span>
                    </div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem', padding: '1rem' }}>
                        <div className="dot" style={{ width: '8px', height: '8px', background: '#0f172a', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate' }}></div>
                        <div className="dot" style={{ width: '8px', height: '8px', background: '#0f172a', borderRadius: '50%', animation: 'bounce 0.6s infinite 0.2s alternate' }}></div>
                        <div className="dot" style={{ width: '8px', height: '8px', background: '#0f172a', borderRadius: '50%', animation: 'bounce 0.6s infinite 0.4s alternate' }}></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 3 && !loading && (
                <div style={{ padding: '0 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {suggestedQuestions.map(q => (
                        <button
                            key={q}
                            onClick={(e) => handleSend(e, q)}
                            style={{ padding: '0.5rem 0.8rem', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', borderRadius: '20px', cursor: 'pointer' }}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '1.5rem', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
                <input
                    type="text"
                    placeholder="Ask anything about your finances..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        background: '#f8fafc',
                        outline: 'none'
                    }}
                />
                <button type="submit" disabled={loading} style={{
                    padding: '0 1.5rem',
                    background: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '900',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: loading ? 0.7 : 1
                }}>
                    <Send size={18} /> SEND
                </button>
            </form>

            <style>{`
                @keyframes bounce { to { opacity: 0.3; transform: translateY(-5px); } }
                .dot { width: 8px; height: 8px; background: #0f172a; borderRadius: 50%; }
            `}</style>
        </div>
    );
};

export default CashFlowlyGPT;
