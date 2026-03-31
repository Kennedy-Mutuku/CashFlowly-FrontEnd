import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseMpesaMessage } from '../utils/mpesaParser';
import api from '../services/api';
import {
    CheckCircle, XCircle, Smartphone, ArrowLeft, RefreshCw,
    ShoppingCart, Car, Home, Utensils, Heart, Wifi,
    GraduationCap, Briefcase, TrendingUp, DollarSign, Zap
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
    { label: 'Food & Drinks', icon: Utensils, color: '#f59e0b' },
    { label: 'Transport', icon: Car, color: '#3b82f6' },
    { label: 'Shopping', icon: ShoppingCart, color: '#8b5cf6' },
    { label: 'Bills & Utilities', icon: Wifi, color: '#ef4444' },
    { label: 'Rent & Housing', icon: Home, color: '#10b981' },
    { label: 'Health', icon: Heart, color: '#ec4899' },
    { label: 'Education', icon: GraduationCap, color: '#f97316' },
    { label: 'Business', icon: Briefcase, color: '#6366f1' },
    { label: 'Entertainment', icon: Zap, color: '#eab308' },
    { label: 'Other', icon: DollarSign, color: '#94a3b8' },
];

const INCOME_CATEGORIES = [
    { label: 'Salary', icon: Briefcase, color: '#10b981' },
    { label: 'Business', icon: TrendingUp, color: '#3b82f6' },
    { label: 'Freelance', icon: Zap, color: '#8b5cf6' },
    { label: 'Transfer', icon: DollarSign, color: '#f59e0b' },
    { label: 'Other Income', icon: DollarSign, color: '#94a3b8' },
];

const MpesaShare = () => {
    const [parsed, setParsed] = useState(null);
    const [rawSms, setRawSms] = useState('');
    const [category, setCategory] = useState('');
    const [txType, setTxType] = useState('expense');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [manualSms, setManualSms] = useState('');
    const [showManual, setShowManual] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Read shared text from URL query params (Web Share Target)
        const params = new URLSearchParams(window.location.search);
        const sharedText = params.get('text') || params.get('title') || '';

        if (sharedText) {
            processMessage(sharedText);
        } else {
            setShowManual(true);
        }
    }, []);

    const processMessage = (text) => {
        setRawSms(text);
        const result = parseMpesaMessage(text);
        if (result && result.amount) {
            setParsed(result);
            setTxType(result.type === 'income' || result.type === 'savings-withdrawal' ? 'income' : 'expense');
            setError('');
        } else {
            setError('This message could not be parsed as an M-Pesa transaction. Please paste a valid M-Pesa SMS.');
            setParsed(null);
        }
    };

    const handleSave = async () => {
        if (!category) return;
        setSaving(true);
        try {
            if (txType === 'income') {
                await api.post('/income', {
                    amount: parseFloat(parsed.amount),
                    title: parsed.title,
                    source: parsed.partner || 'M-PESA',
                    date: parsed.date,
                    paymentMethod: 'M-PESA',
                    transactionId: parsed.transactionId || undefined,
                    description: `Imported via Share. Category: ${category}`,
                });
            } else {
                await api.post('/expenses', {
                    amount: parseFloat(parsed.amount),
                    title: parsed.title,
                    category: category,
                    date: parsed.date,
                    paymentMethod: 'M-PESA',
                    transactionId: parsed.transactionId || undefined,
                    description: 'Imported via M-Pesa Share',
                });
            }
            setSaved(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            if (msg?.toLowerCase().includes('duplicate') || msg?.toLowerCase().includes('transaction')) {
                setSaved(true); // already exists, treat as success
                setTimeout(() => navigate('/'), 2000);
            } else {
                setError(`Save failed: ${msg}`);
            }
        } finally {
            setSaving(false);
        }
    };

    const isIncome = txType === 'income';
    const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    // Success State
    if (saved) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4', padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 32px rgba(5,150,105,0.3)' }}>
                    <CheckCircle size={36} color="#fff" />
                </div>
                <h2 style={{ fontWeight: '900', color: '#065f46', fontSize: '1.2rem', margin: '0 0 0.4rem' }}>Saved Successfully!</h2>
                <p style={{ color: '#6ee7b7', fontWeight: '700', fontSize: '0.82rem', margin: 0 }}>
                    {isIncome ? 'Added to your Income' : `Added to ${category}`} — Redirecting to Dashboard...
                </p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1rem', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={16} />
                </button>
                <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={18} color="#fff" />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#0f172a' }}>M-PESA IMPORT</h1>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Categorise & save your transaction</p>
                </div>
            </div>

            {/* Manual paste toggle */}
            {!parsed && !showManual && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <p style={{ color: '#64748b', fontSize: '0.82rem' }}>No SMS detected. Paste it manually below.</p>
                </div>
            )}

            {/* Parsed Transaction Card */}
            {parsed && (
                <div style={{ background: '#fff', borderRadius: '16px', border: `2px solid ${isIncome ? '#d1fae5' : '#fee2e2'}`, padding: '1.25rem', marginBottom: '1.25rem', animation: 'slideIn 0.3s ease-out', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    {/* Type toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {['expense', 'income'].map(t => (
                            <button key={t} onClick={() => { setTxType(t); setCategory(''); }}
                                style={{ flex: 1, padding: '0.45rem', background: txType === t ? (t === 'income' ? '#059669' : '#dc2626') : '#f1f5f9', color: txType === t ? '#fff' : '#64748b', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s', letterSpacing: '0.04em' }}
                            >
                                {t === 'income' ? '📥 Income' : '📤 Expense'}
                            </button>
                        ))}
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: 'center', marginBottom: '0.75rem', padding: '1rem', background: isIncome ? '#f0fdf4' : '#fef2f2', borderRadius: '12px' }}>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '2rem', fontWeight: '900', color: isIncome ? '#059669' : '#dc2626', letterSpacing: '-0.02em' }}>
                            {isIncome ? '+' : '-'} Ksh {parseFloat(parsed.amount).toLocaleString()}
                        </p>
                        <p style={{ margin: 0, fontWeight: '800', fontSize: '0.78rem', color: '#475569' }}>{parsed.title}</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.65rem', color: '#94a3b8' }}>
                            {new Date(parsed.date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            {parsed.transactionId && ` • Ref: ${parsed.transactionId}`}
                        </p>
                    </div>

                    {/* SMS Preview */}
                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.65rem', fontFamily: 'monospace', color: '#64748b', lineHeight: '1.5', borderLeft: '3px solid #e2e8f0', marginBottom: '0.75rem', maxHeight: '60px', overflow: 'hidden' }}>
                        {rawSms}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#dc2626', fontWeight: '700' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Manual SMS paste */}
            {(showManual || !parsed) && (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.25rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontWeight: '800', fontSize: '0.8rem', color: '#0f172a' }}>📋 Paste M-Pesa SMS</p>
                    <textarea
                        value={manualSms}
                        onChange={e => setManualSms(e.target.value)}
                        placeholder="Paste your M-Pesa message here e.g. QAB123XYZ Confirmed. Ksh1,500 sent to JOHN DOE on 1/4/26..."
                        style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.78rem', fontFamily: 'system-ui', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#334155', lineHeight: '1.6' }}
                    />
                    <button
                        onClick={() => processMessage(manualSms)}
                        disabled={!manualSms.trim()}
                        style={{ marginTop: '0.6rem', width: '100%', padding: '0.7rem', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '0.78rem', cursor: 'pointer', letterSpacing: '0.04em', opacity: !manualSms.trim() ? 0.5 : 1 }}
                    >
                        PARSE MESSAGE
                    </button>
                </div>
            )}

            {/* Category Picker */}
            {parsed && (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.25rem', animation: 'slideIn 0.4s ease-out' }}>
                    <p style={{ margin: '0 0 0.75rem', fontWeight: '900', fontSize: '0.82rem', color: '#0f172a' }}>
                        📂 Select Category <span style={{ color: '#ef4444' }}>*</span>
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
                        {categories.map(cat => {
                            const Icon = cat.icon;
                            const isSelected = category === cat.label;
                            return (
                                <button
                                    key={cat.label}
                                    onClick={() => setCategory(cat.label)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                                        padding: '0.6rem 0.75rem',
                                        background: isSelected ? cat.color : '#f8fafc',
                                        color: isSelected ? '#fff' : '#334155',
                                        border: `1.5px solid ${isSelected ? cat.color : '#e2e8f0'}`,
                                        borderRadius: '10px', cursor: 'pointer',
                                        fontSize: '0.73rem', fontWeight: '700',
                                        transition: 'all 0.15s', textAlign: 'left',
                                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                        boxShadow: isSelected ? `0 4px 12px ${cat.color}40` : 'none',
                                    }}
                                >
                                    <Icon size={13} color={isSelected ? '#fff' : cat.color} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Save Button */}
            {parsed && (
                <button
                    onClick={handleSave}
                    disabled={!category || saving}
                    style={{
                        width: '100%', padding: '1rem',
                        background: category ? 'linear-gradient(135deg, #059669, #047857)' : '#e2e8f0',
                        color: category ? '#fff' : '#94a3b8',
                        border: 'none', borderRadius: '14px',
                        fontWeight: '900', fontSize: '0.88rem',
                        cursor: !category || saving ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        transition: 'all 0.2s', letterSpacing: '0.05em',
                        boxShadow: category ? '0 4px 16px rgba(5,150,105,0.35)' : 'none',
                        transform: category ? 'translateY(0)' : 'none'
                    }}
                >
                    {saving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}
                    {saving ? 'SAVING...' : category ? `SAVE AS ${category.toUpperCase()}` : 'SELECT A CATEGORY FIRST'}
                </button>
            )}
        </div>
    );
};

export default MpesaShare;
