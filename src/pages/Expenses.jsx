import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, TrendingDown } from 'lucide-react';

const CATEGORY_COLORS = {
    'Housing & Utilities': { bg: '#fef9c3', color: '#854d0e' },
    'Food & Household': { bg: '#dcfce7', color: '#166534' },
    'Transportation': { bg: '#dbeafe', color: '#1e40af' },
    'Health & Personal Care': { bg: '#fce7f3', color: '#9d174d' },
    'Financial Obligations': { bg: '#fee2e2', color: '#991b1b' },
    'Lifestyle & Entertainment': { bg: '#ede9fe', color: '#5b21b6' },
    'Assets': { bg: '#d1fae5', color: '#065f46' },
    'Miscellaneous': { bg: '#f1f5f9', color: '#475569' },
};

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/expenses');
            const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setExpenses(sorted);
        } catch (err) {
            console.error('Failed to fetch expenses', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this expense record?')) {
            try {
                await api.delete(`/expenses/${id}`);
                fetchExpenses();
            } catch (err) {
                alert('Failed to delete expense record.');
            }
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div>
            <div className="dashboard-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#0f172a', marginBottom: '0.25rem' }}>
                        CASH OUT RECORDS
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                        All expense entries — recorded manually or via M-PESA sync on the Dashboard.
                    </p>
                </div>
                <div className="total-box" style={{ textAlign: 'right', padding: '1.25rem 1.5rem', background: '#fef2f2', border: '1px solid #fecaca', minWidth: 'max-content' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Spent</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>Ksh {totalExpenses.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>{expenses.length} record{expenses.length !== 1 ? 's' : ''}</div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Loading records...</div>
                    </div>
                ) : expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
                        <TrendingDown size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>No expense records yet.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            Use <strong>Record Cash Out</strong> on the Dashboard to add your first entry.
                        </p>
                    </div>
                ) : (
                    <div className="record-list">
                        <div className="record-header expense-grid">
                            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Date</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Item</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Category</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Method</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Notes</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', textAlign: 'right' }}>Amount</div>
                            <div></div>
                        </div>

                        {expenses.map((item, idx) => {
                            const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Miscellaneous;
                            return (
                                <div key={item._id} className="record-row expense-grid" style={{ background: idx === 0 ? '#fffafa' : '#fff' }}>
                                    <div className="record-cell">
                                        <span className="record-cell-mobile-label">Date</span>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                                {new Date(item.date).toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi', day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '500' }} className="hide-on-mobile">
                                                {new Date(item.date).toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="record-cell">
                                        <span className="record-cell-mobile-label">Item</span>
                                        <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>
                                            {item.title || '—'}
                                        </span>
                                    </div>
                                    <div className="record-cell">
                                        <span className="record-cell-mobile-label">Category</span>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            background: catStyle.bg,
                                            color: catStyle.color,
                                            border: `1px solid ${catStyle.bg}`,
                                            borderRadius: '6px',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {(item.category || 'Miscellaneous').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="record-cell">
                                        <span className="record-cell-mobile-label">Method</span>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            background: item.paymentMethod === 'M-PESA' ? '#eff6ff' : '#f8fafc',
                                            color: item.paymentMethod === 'M-PESA' ? '#2563eb' : '#64748b',
                                            border: `1px solid ${item.paymentMethod === 'M-PESA' ? '#bfdbfe' : '#e2e8f0'}`,
                                            borderRadius: '6px'
                                        }}>
                                            {item.paymentMethod || 'Cash'}
                                        </span>
                                    </div>
                                    <div className="record-cell">
                                        <span className="record-cell-mobile-label">Notes</span>
                                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                            {item.description || <span style={{ color: '#cbd5e1' }}>—</span>}
                                        </span>
                                    </div>
                                    <div className="record-cell record-cell-right">
                                        <span className="record-cell-mobile-label">Amount</span>
                                        <span style={{ color: '#dc2626', fontWeight: '900', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                            -Ksh {item.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="record-cell record-cell-right">
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            title="Delete"
                                            style={{ background: 'transparent', color: '#cbd5e1', border: 'none', cursor: 'pointer', padding: '4px', transition: 'color 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Expenses;
