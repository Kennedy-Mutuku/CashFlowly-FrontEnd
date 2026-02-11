import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, CheckCircle, Trash2, AlertCircle } from 'lucide-react';

const Debts = () => {
    const [debts, setDebts] = useState([]);
    const [person, setPerson] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('Owed to Me');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/debts', { person, amount, type, dueDate, description });
            setPerson('');
            setAmount('');
            setDueDate('');
            setDescription('');
            fetchDebts();
        } catch (err) {
            alert('Failed to add debt');
        }
    };

    const handleStatus = async (id, status) => {
        try {
            await api.put(`/debts/${id}`, { status });
            fetchDebts();
        } catch (err) {
            alert('Failed to update status');
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

    const handlePayment = async (id, amountPaid) => {
        if (!amountPaid || amountPaid <= 0) return;
        try {
            await api.post(`/debts/${id}/payment`, { amountPaid });
            fetchDebts();
        } catch (err) {
            alert('Failed to add payment');
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Debt & Loan Manager</h2>
            <div className="grid-responsive">
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>ADD RECORD</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Person / Entity</label>
                            <input type="text" value={person} onChange={(e) => setPerson(e.target.value)} required placeholder="e.g. John Doe" />
                        </div>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount (Ksh)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
                        </div>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Debt Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="Owed to Me">Owed to Me (Asset)</option>
                                <option value="I Owe">I Owe (Liability)</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Due Date</label>
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Description</label>
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note" />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '0.8rem', marginTop: '0.5rem' }}>
                            <Plus size={18} /> SAVE RECORD
                        </button>
                    </form>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', alignContent: 'start' }}>
                    {debts.map((debt) => {
                        const progress = ((debt.originalAmount - debt.remainingAmount) / debt.originalAmount) * 100;
                        return (
                            <div key={debt._id} className="card" style={{
                                borderLeft: `4px solid ${debt.type === 'Owed to Me' ? 'var(--success)' : 'var(--danger)'}`,
                                opacity: debt.status === 'Settled' ? 0.7 : 1,
                                background: '#fff'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <Users size={14} color="#64748b" />
                                            <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: '800' }}>{debt.person}</h4>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 6px',
                                                background: debt.type === 'Owed to Me' ? '#f0fdf4' : '#fef2f2',
                                                color: debt.type === 'Owed to Me' ? '#16a34a' : '#dc2626',
                                                fontWeight: '700'
                                            }}>{debt.type === 'Owed to Me' ? 'RECEIVABLE' : 'PAYABLE'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Ksh {debt.remainingAmount.toLocaleString()}</div>
                                            {debt.remainingAmount !== debt.originalAmount && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>Ksh {debt.originalAmount.toLocaleString()}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button onClick={() => handleDelete(debt._id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {debt.status !== 'Settled' && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>
                                            <span>REPAYMENT PROGRESS</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', overflow: 'hidden' }}>
                                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--success)', transition: 'width 0.3s' }}></div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {debt.dueDate ? `DUE: ${new Date(debt.dueDate).toLocaleDateString()}` : 'NO DUE DATE'}
                                    </div>

                                    {debt.status === 'Open' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                style={{ width: '80px', padding: '0.3rem', fontSize: '0.8rem' }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handlePayment(debt._id, parseFloat(e.target.value));
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Press Enter to pay</span>
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--success)', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={14} /> SETTLED
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {debts.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: '#f8fafc', borderStyle: 'dashed' }}>
                            <AlertCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p>No active debts or loans found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Debts;
