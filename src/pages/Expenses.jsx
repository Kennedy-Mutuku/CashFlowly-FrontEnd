import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    const categories = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Other'];

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        const { data } = await api.get('/expenses');
        setExpenses(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', { amount, category, date, description });
            setAmount('');
            setDescription('');
            fetchExpenses();
        } catch (err) {
            alert('Failed to add expense');
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Expense Management</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="card glass">
                    <h3 style={{ marginBottom: '1rem' }}>Record Expense</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Amount</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Description (Optional)</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--danger)' }}>
                            <Plus size={18} /> Add Expense
                        </button>
                    </form>
                </div>

                <div className="card glass">
                    <h3 style={{ marginBottom: '1rem' }}>Expense History</h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem 0' }}>Date</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((item) => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 0' }}>{new Date(item.date).toLocaleDateString()}</td>
                                        <td><span style={{ padding: '0.2rem 0.6rem', background: 'var(--border)', borderRadius: '4px', fontSize: '0.8rem' }}>{item.category}</span></td>
                                        <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>-${item.amount}</td>
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

export default Expenses;
