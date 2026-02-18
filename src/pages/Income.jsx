import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, TrendingUp } from 'lucide-react';

const Income = () => {
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/income');
            // Sort latest recording activity first
            const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setIncomes(sorted);
        } catch (err) {
            console.error('Failed to fetch incomes', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this income record?')) {
            try {
                await api.delete(`/income/${id}`);
                fetchIncomes();
            } catch (err) {
                alert('Failed to delete income record.');
            }
        }
    };

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#0f172a', marginBottom: '0.25rem' }}>
                        CASH IN RECORDS
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                        All income entries — recorded manually or via M-PESA sync on the Dashboard.
                    </p>
                </div>
                <div style={{ textAlign: 'right', padding: '1rem 1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Recorded</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>Ksh {totalIncome.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>{incomes.length} record{incomes.length !== 1 ? 's' : ''}</div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Loading records...</div>
                    </div>
                ) : incomes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
                        <TrendingUp size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>No income records yet.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            Use <strong>Record Cash In</strong> on the Dashboard to add your first entry.
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'left', fontWeight: '800' }}>Date</th>
                                <th style={{ padding: '0.9rem 0.5rem', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'left', fontWeight: '800' }}>Source</th>
                                <th style={{ padding: '0.9rem 0.5rem', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'left', fontWeight: '800' }}>Method</th>
                                <th style={{ padding: '0.9rem 0.5rem', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'left', fontWeight: '800' }}>Description</th>
                                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'right', fontWeight: '800' }}>Amount</th>
                                <th style={{ padding: '0.9rem 1rem', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'right', fontWeight: '800' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {incomes.map((item, idx) => (
                                <tr
                                    key={item._id}
                                    style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        background: idx === 0 ? '#fafffe' : '#fff',
                                        transition: 'background 0.15s'
                                    }}
                                >
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                        {new Date(item.date).toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi', day: '2-digit', month: 'short', year: 'numeric' })}
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '500' }}>
                                            {new Date(item.date).toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>
                                        {item.source || item.title || '—'}
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            background: item.paymentMethod === 'M-PESA' ? '#eff6ff' : '#f8fafc',
                                            color: item.paymentMethod === 'M-PESA' ? '#2563eb' : '#64748b',
                                            border: `1px solid ${item.paymentMethod === 'M-PESA' ? '#bfdbfe' : '#e2e8f0'}`
                                        }}>
                                            {item.paymentMethod || 'Cash'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.82rem', color: '#64748b', maxWidth: '200px' }}>
                                        {item.description || <span style={{ color: '#cbd5e1' }}>—</span>}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', color: '#16a34a', fontWeight: '900', fontSize: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        +Ksh {item.amount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem 1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            title="Delete"
                                            style={{ background: 'transparent', color: '#cbd5e1', border: 'none', cursor: 'pointer', padding: '4px', transition: 'color 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Income;
