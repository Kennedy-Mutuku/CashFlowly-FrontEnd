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
            setRecords(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
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
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }
                .savings-table tr:hover {
                    background-color: #f8fafc;
                }
                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.04em', color: '#0f172a', marginBottom: '0.25rem' }}>
                        Savings Ledger
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                        Track and manage your Ziidi savings growth.
                    </p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
                    <Smartphone size={16} color="#64748b" />
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>AUTO-SYNC ACTIVE</span>
                </div>
            </div>

            {/* Premium Balance Card */}
            <div style={{
                background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
                borderRadius: '32px',
                padding: '3rem',
                color: '#fff',
                marginBottom: '2.5rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
            }}>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                    <Wallet size={350} color="#fff" />
                </div>
                <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(37, 99, 235, 0.1)', filter: 'blur(80px)', borderRadius: '50%' }}></div>

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', opacity: 0.8 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            Current Ziidi Balance
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '500', opacity: 0.6 }}>Ksh</span>
                        <span style={{ fontSize: '4.5rem', fontWeight: '900', letterSpacing: '-0.05em', lineHeight: 1 }}>
                            {currentBalance.toLocaleString()}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Deposits</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '10px' }}>
                                    <TrendingUp size={18} color="#4ade80" />
                                </div>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4ade80' }}>+ Ksh {totalDeposits.toLocaleString()}</span>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Withdrawals</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(251, 191, 36, 0.15)', borderRadius: '10px' }}>
                                    <TrendingDown size={18} color="#fbbf24" />
                                </div>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fbbf24' }}>- Ksh {totalWithdrawals.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-responsive" style={{ gap: '2rem' }}>
                {/* Informational Section */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2rem', alignSelf: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.6rem', background: '#eff6ff', borderRadius: '12px' }}>
                            <Info size={20} color="#2563eb" />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Smart Recording</h3>
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                        Your Ziidi ledger is powered by intelligent transaction detection. Every M-PESA sync on the dashboard automatically updates these records.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flexShrink: 0, marginTop: '0.2rem' }}>
                                <TrendingUp size={16} color="#16a34a" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.2rem' }}>Deposits</h4>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Increases your Ziidi assets while deducting from your main wallet.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flexShrink: 0, marginTop: '0.2rem' }}>
                                <TrendingDown size={16} color="#ea580c" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.2rem' }}>Withdrawals</h4>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Reverts Ziidi assets back to your main wallet balance.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Transaction Hub</h3>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '8px', letterSpacing: '0.05em' }}>
                            ACTIVITY LOG
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }} className="savings-table">
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem 2rem', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 2rem', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 2rem', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volume</th>
                                    <th style={{ textAlign: 'right', padding: '1rem 2rem', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => (
                                    <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>
                                                {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                                                {new Date(record.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <div className="badge" style={{
                                                background: record.type === 'deposit' ? '#f0fdf4' : '#fff7ed',
                                                color: record.type === 'deposit' ? '#16a34a' : '#ea580c'
                                            }}>
                                                {record.type === 'deposit' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {record.type.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <div style={{ fontSize: '1rem', fontWeight: '800', color: record.type === 'deposit' ? '#16a34a' : '#ea580c' }}>
                                                {record.type === 'deposit' ? '+' : '-'} {record.amount.toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem' }}>{record.transactionId || 'Manual Sync'}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDelete(record._id)}
                                                style={{ background: '#fef2f2', border: 'none', color: '#ef4444', padding: '0.6rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center' }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <Wallet size={48} color="#e2e8f0" style={{ margin: '0 auto' }} />
                                            </div>
                                            <p style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Registry is empty.</p>
                                            <p style={{ fontSize: '0.85rem' }}>Paste your first Ziidi transaction on the dashboard to begin tracking your savings.</p>
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
