import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Wallet, TrendingUp, TrendingDown, Trash2, Calendar, Smartphone, Info } from 'lucide-react';

const Savings = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/savings');
            setRecords(data);
        } catch (err) {
            console.error('Failed to fetch savings records', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this savings record? This will only remove it from the ledger.')) {
            try {
                await api.delete(`/savings/${id}`);
                fetchRecords();
            } catch (err) {
                alert('Failed to delete record');
            }
        }
    };

    // Calculate Balance
    const totalDeposits = records
        .filter(r => r.type === 'deposit')
        .reduce((sum, r) => sum + r.amount, 0);

    const totalWithdrawals = records
        .filter(r => r.type === 'withdrawal')
        .reduce((sum, r) => sum + r.amount, 0);

    const currentBalance = totalDeposits - totalWithdrawals;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ marginBottom: '2rem', fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#0f172a' }}>ZIIDI SAVINGS LEDGER</h2>

            {/* Balance Overview Card */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#fff',
                padding: '2.5rem',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1 }}>
                    <Wallet size={200} color="#fff" />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        CURRENT ZIIDI BALANCE
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
                        Ksh {currentBalance.toLocaleString()}
                    </div>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Deposits</div>
                            <div style={{ color: '#22c55e', fontWeight: '800', fontSize: '1.1rem' }}>+ Ksh {totalDeposits.toLocaleString()}</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Withdrawals</div>
                            <div style={{ color: '#fbbf24', fontWeight: '800', fontSize: '1.1rem' }}>- Ksh {totalWithdrawals.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-responsive">
                {/* Information Card */}
                <div className="card" style={{ alignSelf: 'start' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={18} color="#2563eb" /> SMART RECORDING
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', marginBottom: '1rem' }}>
                        Ziidi savings are automatically recorded when you sync M-PESA messages on the Dashboard.
                    </p>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        <li style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <TrendingUp size={14} color="#16a34a" /> <strong>Deposits</strong> reduce your wallet balance and increase Ziidi savings.
                        </li>
                        <li style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.5rem' }}>
                            <TrendingDown size={14} color="#fbbf24" /> <strong>Withdrawals</strong> increase your wallet balance and reduce Ziidi savings.
                        </li>
                    </ul>
                </div>

                {/* History Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0f172a' }}>TRANSACTION HISTORY</h3>
                        <Smartphone size={16} color="#94a3b8" />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.65rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.65rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Type</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.65rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Amount</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.65rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => (
                                    <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                                                {new Date(record.date).toLocaleDateString('en-GB')}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                {record.transactionId || 'Manual Entry'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '20px',
                                                background: record.type === 'deposit' ? '#f0fdf4' : '#fff7ed',
                                                color: record.type === 'deposit' ? '#16a34a' : '#ea580c'
                                            }}>
                                                {record.type === 'deposit' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {record.type.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '900',
                                                color: record.type === 'deposit' ? '#16a34a' : '#ea580c'
                                            }}>
                                                {record.type === 'deposit' ? '+' : '-'} Ksh {record.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDelete(record._id)}
                                                style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                                                onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                            No savings activity found. Paste your first Ziidi message on the Dashboard!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Savings;
