import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

const Income = () => {
    const [incomes, setIncomes] = useState([]);
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [source, setSource] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        const { data } = await api.get('/income');
        setIncomes(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/income', { amount, source, date, description, title });
            setAmount('');
            setTitle('');
            setSource('');
            setDescription('');
            fetchIncomes();
        } catch (err) {
            alert('Failed to add income');
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Cash In Management</h2>
            <div className="grid-responsive">
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>ADD NEW INCOME</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount (Ksh)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
                        </div>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Title / Item Name</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Monthly Salary" />
                        </div>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Source</label>
                            <input type="text" value={source} onChange={(e) => setSource(e.target.value)} required placeholder="e.g. Salary, Freelance" />
                        </div>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Description (Optional)</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add some notes..."></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '0.8rem', marginTop: '0.5rem' }}>
                            <Plus size={18} /> SAVE INCOME
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>INCOME HISTORY</h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 0', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Item Name</th>
                                    <th style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Source</th>
                                    <th style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
                                    <th style={{ textAlign: 'right', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.map((item) => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 0', fontSize: '0.85rem' }}>{new Date(item.date).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: '700', fontSize: '0.85rem' }}>{item.title}</td>
                                        <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.source}</td>
                                        <td style={{ color: '#16a34a', fontWeight: '800', fontSize: '0.85rem' }}>+Ksh {item.amount.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Income;
