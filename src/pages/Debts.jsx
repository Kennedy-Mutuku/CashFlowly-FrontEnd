import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { Users, Plus, CheckCircle, Trash2, Calendar, ArrowRight, User, Tag, Clock, History, ChevronDown, ChevronUp } from 'lucide-react';

const Debts = () => {
    const location = useLocation();
    const [debts, setDebts] = useState([]);
    const [person, setPerson] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('Owed to Me');
    const [dateBorrowed, setDateBorrowed] = useState(new Date().toISOString().slice(0, 10));
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [expandedDebt, setExpandedDebt] = useState(null);
    const [debtHistory, setDebtHistory] = useState({});
    const [settledCelebration, setSettledCelebration] = useState(null); // id of debt

    // Per-debt payment form state
    const [payAmounts, setPayAmounts] = useState({});
    const [payDates, setPayDates] = useState({});

    // Auto-expand from URL for Direct Resolution
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const targetId = queryParams.get('id');
        if (targetId && debts.length > 0) {
            setExpandedDebt(targetId);
            fetchHistory(targetId);
            // Initialize pay date if not set
            if (!payDates[targetId]) {
                setPayDates(prev => ({ ...prev, [targetId]: new Date().toISOString().slice(0, 10) }));
            }
            // Smooth scroll to the target card
            setTimeout(() => {
                const element = document.getElementById(`debt-${targetId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 600);
        }
    }, [location.search, debts.length]);

    useEffect(() => {
        if (settledCelebration) {
            const timer = setTimeout(() => setSettledCelebration(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [settledCelebration]);

    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        try {
            const { data } = await api.get('/debts');
            setDebts(data);
        } catch (err) {
            console.error('Failed to fetch debts');
        }
    };

    const fetchHistory = async (id) => {
        try {
            const { data } = await api.get(`/debts/${id}/history`);
            setDebtHistory(prev => ({ ...prev, [id]: data }));
        } catch (err) {
            console.error('Failed to fetch history');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/debts', {
                person,
                amount,
                type,
                dateBorrowed,
                dueDate,
                description
            });
            setPerson('');
            setAmount('');
            setDateBorrowed(new Date().toISOString().slice(0, 10));
            setDueDate('');
            setDescription('');
            fetchDebts();
            alert('Debt record saved successfully!');
        } catch (err) {
            alert('Failed to add debt record');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.delete(`/debts/${id}`);
                fetchDebts();
            } catch (err) {
                alert('Failed to delete');
            }
        }
    };

    const handlePayment = async (id) => {
        const amountPaid = payAmounts[id];
        const paymentDate = payDates[id] || new Date().toISOString().slice(0, 10);

        if (!amountPaid || amountPaid <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const { data } = await api.post(`/debts/${id}/payment`, {
                amountPaid,
                paymentDate
            });

            if (data.status === 'Settled') {
                setSettledCelebration(id);
            }

            // Clear form state for this debt
            setPayAmounts(prev => ({ ...prev, [id]: '' }));

            // Refresh history
            fetchHistory(id);
            fetchDebts();
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (err) {
            alert('Failed to add payment');
        }
    };

    const toggleExpand = (id) => {
        if (expandedDebt === id) {
            setExpandedDebt(null);
        } else {
            setExpandedDebt(id);
            // Initialize pay date for this debt if not set
            if (!payDates[id]) {
                setPayDates(prev => ({ ...prev, [id]: new Date().toISOString().slice(0, 10) }));
            }
            fetchHistory(id);
        }
    };

    const totals = debts.reduce((acc, debt) => {
        if (debt.type === 'Owed to Me') {
            acc.receivable += debt.remainingAmount;
        } else {
            acc.payable += debt.remainingAmount;
        }
        return acc;
    }, { receivable: 0, payable: 0 });

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .debt-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1) !important; }
                .compact-grid { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; }
                .summary-card { padding: 1rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; flex: 1; border: 1px solid #f1f5f9; }
                @media (max-width: 900px) { .compact-grid { grid-template-columns: 1fr; } }
            `}</style>

            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontWeight: '900', fontSize: '1.5rem', letterSpacing: '-0.03em', color: '#0f172a', margin: 0 }}>FINANCIAL OBLIGATIONS</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Comprehensive tracking of net debt positions and settlement journeys.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flex: '1', minWidth: '300px' }}>
                    <div className="summary-card" style={{ background: '#f0fdf4' }}>
                        <div style={{ background: '#16a34a', color: '#fff', padding: '8px', borderRadius: '8px' }}><ArrowRight size={16} /></div>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#166534', textTransform: 'uppercase' }}>To Receive</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#166534' }}>Ksh {totals.receivable.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="summary-card" style={{ background: '#fef2f2' }}>
                        <div style={{ background: '#ef4444', color: '#fff', padding: '8px', borderRadius: '8px' }}><ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /></div>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>To Pay</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#991b1b' }}>Ksh {totals.payable.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="compact-grid">
                <div className="card" style={{ alignSelf: 'start', position: 'sticky', top: '100px', padding: '1.25rem' }}>
                    <h3 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: '900', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#0f172a' }}>
                        <Plus size={18} color="#2563eb" /> NEW RECORD
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ color: '#475569', fontWeight: '800', fontSize: '0.65rem', textTransform: 'uppercase' }}>Person / Entity *</label>
                            <div style={{ position: 'relative' }}>
                                <User size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="text" value={person} onChange={(e) => setPerson(e.target.value)} required placeholder="Who is involved?" style={{ paddingLeft: '2.1rem', fontSize: '0.8rem' }} />
                            </div>
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ color: '#475569', fontWeight: '800', fontSize: '0.65rem', textTransform: 'uppercase' }}>Amount (Ksh) *</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" style={{ fontWeight: '800', fontSize: '1rem' }} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ color: '#475569', fontWeight: '800', fontSize: '0.65rem', textTransform: 'uppercase' }}>Type *</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} required style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                                <option value="Owed to Me">Asset (Receivable)</option>
                                <option value="I Owe">Liability (Payable)</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="input-group" style={{ margin: 0 }}>
                                <label style={{ color: '#475569', fontWeight: '800', fontSize: '0.65rem', textTransform: 'uppercase' }}>Borrowed *</label>
                                <input type="date" value={dateBorrowed} onChange={(e) => setDateBorrowed(e.target.value)} required style={{ fontSize: '0.75rem' }} />
                            </div>
                            <div className="input-group" style={{ margin: 0 }}>
                                <label style={{ color: '#475569', fontWeight: '800', fontSize: '0.65rem', textTransform: 'uppercase' }}>Due *</label>
                                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required style={{ fontSize: '0.75rem' }} />
                            </div>
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ color: '#475569', fontWeight: '800', fontSize: '0.65rem', textTransform: 'uppercase' }}>Purpose *</label>
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Reason for debt" style={{ fontSize: '0.8rem' }} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '0.65rem', marginTop: '0.5rem', fontWeight: '900', fontSize: '0.8rem' }}>
                            SAVE RECORD
                        </button>
                    </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {debts.map((debt) => {
                        const progress = ((debt.originalAmount - debt.remainingAmount) / debt.originalAmount) * 100;
                        const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date() && debt.status !== 'Settled';
                        const isExpanded = expandedDebt === debt._id;

                        return (
                            <div key={debt._id} id={`debt-${debt._id}`} className="card debt-card" style={{
                                position: 'relative',
                                padding: '1rem',
                                borderLeft: `4px solid ${debt.type === 'Owed to Me' ? '#16a34a' : '#ef4444'}`,
                                border: isExpanded ? '2px solid #0f172a' : '1px solid #f1f5f9',
                                background: settledCelebration === debt._id ? '#f0fdf4' : '#fff',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                boxShadow: isExpanded ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
                                transform: settledCelebration === debt._id ? 'scale(1.02)' : 'none',
                                zIndex: settledCelebration === debt._id ? 10 : 1
                            }}>
                                {settledCelebration === debt._id && (
                                    <div style={{ position: 'absolute', inset: 0, borderRadius: '8px', border: '2px solid #22c55e', animation: 'shimmer 1.5s infinite', pointerEvents: 'none' }}></div>
                                )}
                                <style>{`
                                    @keyframes shimmer { 0% { opacity: 0.2; } 50% { opacity: 0.8; } 100% { opacity: 0.2; } }
                                `}</style>

                                {isOverdue && (
                                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: '#fff', fontSize: '0.5rem', fontWeight: '900', padding: '1px 5px', borderRadius: '2px' }}>
                                        OVERDUE
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.1rem' }}>
                                            <span style={{ fontSize: '0.55rem', fontWeight: '900', color: debt.type === 'Owed to Me' ? '#16a34a' : '#ef4444', background: debt.type === 'Owed to Me' ? '#f0fdf4' : '#fef2f2', padding: '1px 4px', borderRadius: '2px' }}>
                                                {debt.type === 'Owed to Me' ? 'RECEIVABLE' : 'PAYABLE'}
                                            </span>
                                            <span style={{ fontSize: '0.55rem', fontWeight: '800', color: '#94a3b8' }}>ID: {debt._id.substring(debt._id.length - 6)}</span>
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900', color: '#0f172a' }}>{debt.person}</h4>
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>{debt.description}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a' }}>Ksh {debt.remainingAmount.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#94a3b8' }}>REMAINING OF Ksh {debt.originalAmount.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: '#22c55e', transition: 'width 0.8s ease' }}></div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#64748b', fontSize: '0.6rem', fontWeight: '700' }}>
                                            <Calendar size={10} /> {new Date(debt.dateBorrowed || debt.createdAt).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: isOverdue ? '#ef4444' : '#64748b', fontSize: '0.6rem', fontWeight: '800' }}>
                                            <Clock size={10} /> DUE: {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                                        <button
                                            onClick={() => toggleExpand(debt._id)}
                                            style={{ background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px' }}
                                        >
                                            <History size={10} /> HISTORY {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                        </button>
                                        <button onClick={() => handleDelete(debt._id)} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.65rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase' }}>Settlement Journey</h5>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {debtHistory[debt._id]?.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    {/* Ledger Headers */}
                                                    <div style={{ display: 'flex', padding: '0 0.5rem', marginBottom: '2px' }}>
                                                        <span style={{ flex: 1.5, fontSize: '0.55rem', fontWeight: '900', color: '#94a3b8' }}>TIME RECORDED</span>
                                                        <span style={{ flex: 1, fontSize: '0.55rem', fontWeight: '900', color: '#94a3b8', textAlign: 'center' }}>PAID</span>
                                                        <span style={{ flex: 1, fontSize: '0.55rem', fontWeight: '900', color: '#94a3b8', textAlign: 'right' }}>BALANCE</span>
                                                    </div>

                                                    {debtHistory[debt._id].map((payment, pIdx) => (
                                                        <div key={pIdx} style={{ display: 'flex', alignItems: 'center', padding: '0.4rem 0.5rem', background: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0', gap: '0.5rem' }}>
                                                            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#1e293b' }}>
                                                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                                                </span>
                                                                <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: '700' }}>
                                                                    {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                                <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#16a34a' }}>+ Ksh {payment.amountPaid.toLocaleString()}</span>
                                                            </div>
                                                            <div style={{ flex: 1, textAlign: 'right' }}>
                                                                <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#0f172a' }}>Ksh {(payment.balanceAfter ?? 0).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ margin: 0, fontSize: '0.65rem', color: '#94a3b8' }}>No payments yet.</p>
                                            )}

                                            {debt.status === 'Open' && (
                                                <div style={{ marginTop: '0.6rem', padding: '0.75rem', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                        <div style={{ position: 'relative' }}>
                                                            <Tag size={10} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                            <input
                                                                type="number"
                                                                placeholder="Amount..."
                                                                value={payAmounts[debt._id] || ''}
                                                                onChange={(e) => setPayAmounts(prev => ({ ...prev, [debt._id]: e.target.value }))}
                                                                style={{ width: '100%', padding: '0.4rem 0.4rem 0.4rem 1.7rem', fontSize: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                                            />
                                                        </div>
                                                        <input
                                                            type="date"
                                                            value={payDates[debt._id] || ''}
                                                            onChange={(e) => setPayDates(prev => ({ ...prev, [debt._id]: e.target.value }))}
                                                            style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handlePayment(debt._id)}
                                                        className="btn btn-primary"
                                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.7rem', fontWeight: '900', background: '#0f172a', borderRadius: '4px', letterSpacing: '0.05em' }}
                                                    >
                                                        RECORD SETTLEMENT
                                                    </button>
                                                </div>
                                            )}
                                            {debt.status === 'Settled' && (
                                                <div style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: '800', textAlign: 'center', padding: '0.2rem', background: '#f0fdf4', borderRadius: '2px' }}>
                                                    SETTLED SUCCESSFULLY
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {debts.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#94a3b8', background: '#f8fafc', borderStyle: 'dashed', borderRadius: '12px' }}>
                            <Clock size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                            <p style={{ margin: 0, fontWeight: '800', fontSize: '0.8rem' }}>No active or past debts found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Debts;
