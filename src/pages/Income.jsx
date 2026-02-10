import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

const Income = () => {
    const [incomes, setIncomes] = useState([]);
    const [amount, setAmount] = useState('');
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
            await api.post('/income', { amount, source, date, description });
            setAmount('');
            setSource('');
            setDescription('');
            fetchIncomes();
        } catch (err) {
            alert('Failed to add income');
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Income Management</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="card glass">
                    <h3 style={{ marginBottom: '1rem' }}>Add New Income</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Amount</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Source</label>
                            <input type="text" value={source} onChange={(e) => setSource(e.target.value)} required placeholder="e.g. Salary, Freelance" />
                        </div>
                        <div className="input-group">
                            <label>Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Description (Optional)</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            <Plus size={18} /> Add Income
                        </button>
                    </form>
                </div>

                <div className="card glass">
                    <h3 style={{ marginBottom: '1rem' }}>Income History</h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem 0' }}>Date</th>
                                    <th>Source</th>
                                    <th>Amount</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.map((item) => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 0' }}>{new Date(item.date).toLocaleDateString()}</td>
                                        <td>{item.source}</td>
                                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>+${item.amount}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none' }}>
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
