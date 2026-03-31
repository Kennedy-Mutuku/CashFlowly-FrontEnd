import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Smartphone, CheckCircle, XCircle, Clock, Zap, RefreshCw,
    ShoppingCart, Car, Home, Utensils, Heart, Wifi, GraduationCap,
    Briefcase, TrendingUp, DollarSign, ChevronDown, AlertTriangle
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

const TransactionCard = ({ tx, onApprove, onSkip }) => {
    const isIncome = tx.type === 'income' || tx.type === 'savings-withdrawal';
    const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const [selected, setSelected] = useState('');
    const [saving, setSaving] = useState(false);
    const [showCats, setShowCats] = useState(false);

    const handleApprove = async () => {
        if (!selected) { setShowCats(true); return; }
        setSaving(true);
        await onApprove(tx._id, selected, tx.type);
        setSaving(false);
    };

    return (
        <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: `1px solid ${isIncome ? '#d1fae5' : '#fee2e2'}`,
            padding: '1.25rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            animation: 'slideIn 0.3s ease-out',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: isIncome ? '#d1fae5' : '#fee2e2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>{isIncome ? '📥' : '📤'}</span>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{tx.title}</p>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
                            {new Date(tx.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {tx.transactionId && ` • ${tx.transactionId}`}
                        </p>
                    </div>
                </div>
                <div style={{
                    fontSize: '1rem', fontWeight: '900',
                    color: isIncome ? '#059669' : '#dc2626',
                    whiteSpace: 'nowrap'
                }}>
                    {isIncome ? '+' : '-'} Ksh {tx.amount.toLocaleString()}
                </div>
            </div>

            {/* SMS Preview */}
            <div style={{
                background: '#f8fafc', borderRadius: '8px', padding: '0.5rem 0.75rem',
                marginBottom: '0.75rem', fontSize: '0.68rem', color: '#64748b',
                fontFamily: 'monospace', lineHeight: '1.5',
                borderLeft: '3px solid #e2e8f0', maxHeight: '56px', overflow: 'hidden'
            }}>
                {tx.rawSms}
            </div>

            {/* Category Selector */}
            <div style={{ marginBottom: '0.75rem' }}>
                <button
                    onClick={() => setShowCats(v => !v)}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.6rem 0.9rem', background: selected ? '#0f172a' : '#f1f5f9',
                        color: selected ? '#fff' : '#475569', border: `1.5px solid ${!selected && showCats ? '#0f172a' : 'transparent'}`,
                        borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {selected ? `✓ ${selected}` : '⊕ Select Category'}
                    <ChevronDown size={14} style={{ transform: showCats ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </button>

                {showCats && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem',
                        marginTop: '0.5rem', padding: '0.5rem',
                        background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0'
                    }}>
                        {categories.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.label}
                                    onClick={() => { setSelected(cat.label); setShowCats(false); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        padding: '0.45rem 0.65rem', background: selected === cat.label ? cat.color : '#fff',
                                        color: selected === cat.label ? '#fff' : '#334155',
                                        border: `1px solid ${selected === cat.label ? cat.color : '#e2e8f0'}`,
                                        borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <Icon size={11} color={selected === cat.label ? '#fff' : cat.color} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={handleApprove}
                    disabled={saving}
                    style={{
                        flex: 1, padding: '0.65rem', background: selected ? 'linear-gradient(135deg, #059669, #047857)' : '#0f172a',
                        color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800',
                        fontSize: '0.75rem', cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        transition: 'all 0.2s', opacity: saving ? 0.7 : 1, letterSpacing: '0.04em'
                    }}
                >
                    {saving ? <RefreshCw size={13} /> : <CheckCircle size={13} />}
                    {saving ? 'SAVING...' : (selected ? 'SAVE' : 'SELECT CATEGORY FIRST')}
                </button>
                <button
                    onClick={() => onSkip(tx._id)}
                    style={{
                        padding: '0.65rem 1rem', background: '#f1f5f9', color: '#64748b',
                        border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '800',
                        fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                    }}
                >
                    <XCircle size={13} /> SKIP
                </button>
            </div>
        </div>
    );
};

const MpesaReview = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successCount, setSuccessCount] = useState(0);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/mpesa/pending');
            setPending(data);
        } catch (err) {
            console.error('Failed to load pending transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPending(); }, []);

    const handleApprove = async (id, category, type) => {
        try {
            await api.post(`/mpesa/approve/${id}`, { category, type });
            setPending(p => p.filter(t => t._id !== id));
            setSuccessCount(c => c + 1);
        } catch (err) {
            console.error('Approve failed:', err);
        }
    };

    const handleSkip = async (id) => {
        try {
            await api.put(`/mpesa/skip/${id}`);
            setPending(p => p.filter(t => t._id !== id));
        } catch (err) {
            console.error('Skip failed:', err);
        }
    };

    return (
        <div style={{ maxWidth: '540px', margin: '0 auto', padding: '1.5rem 1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Smartphone size={20} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#0f172a' }}>M-PESA INBOX</h1>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: '#64748b', fontWeight: '700' }}>Review & categorise detected transactions</p>
                    </div>
                    <button onClick={fetchPending} style={{ marginLeft: 'auto', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: '700' }}>
                        <RefreshCw size={12} /> REFRESH
                    </button>
                </div>

                {/* Stats Bar */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <div style={{ flex: 1, background: '#fef9c3', border: '1px solid #fde047', borderRadius: '8px', padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#854d0e' }}>{pending.length}</p>
                        <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: '800', color: '#92400e', textTransform: 'uppercase' }}>Pending</p>
                    </div>
                    <div style={{ flex: 1, background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#065f46' }}>{successCount}</p>
                        <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: '800', color: '#065f46', textTransform: 'uppercase' }}>Saved Today</p>
                    </div>
                </div>
            </div>

            {/* Setup Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.25rem',
                color: '#fff',
            }}>
                <p style={{ margin: '0 0 0.35rem', fontWeight: '900', fontSize: '0.82rem', letterSpacing: '0.04em' }}>📱 SMS FORWARDER SETUP</p>
                <p style={{ margin: '0 0 0.6rem', fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.5' }}>
                    Install <strong style={{ color: '#fff' }}>HTTP SMS</strong> or <strong style={{ color: '#fff' }}>SMS Gate</strong> app on Android.<br />
                    Set webhook URL to:
                </p>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.68rem', fontFamily: 'monospace', color: '#7dd3fc', wordBreak: 'break-all' }}>
                    POST → http://&lt;your-ip&gt;:5000/api/mpesa/sms
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.65rem', color: '#64748b' }}>
                    Add your JWT token in the request body as <code style={{ color: '#f59e0b' }}>token</code> field.
                </p>
            </div>

            {/* Transaction List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                    <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
                    <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>Loading pending transactions...</p>
                </div>
            ) : pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                    <p style={{ fontWeight: '900', color: '#0f172a', margin: '0 0 0.4rem', fontSize: '0.95rem' }}>All Clear!</p>
                    <p style={{ color: '#64748b', fontSize: '0.78rem', margin: 0, lineHeight: '1.6' }}>
                        No pending M-Pesa transactions.<br />
                        When a new SMS arrives via the forwarder app,<br />it will appear here for categorisation.
                    </p>
                    {successCount > 0 && (
                        <div style={{ marginTop: '1rem', background: '#d1fae5', borderRadius: '10px', padding: '0.5rem 1rem', display: 'inline-block' }}>
                            <p style={{ margin: 0, color: '#065f46', fontWeight: '800', fontSize: '0.78rem' }}>✅ {successCount} transaction{successCount !== 1 ? 's' : ''} saved this session</p>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pending.map(tx => (
                        <TransactionCard
                            key={tx._id}
                            tx={tx}
                            onApprove={handleApprove}
                            onSkip={handleSkip}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MpesaReview;
