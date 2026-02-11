import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Smartphone } from 'lucide-react';
import { parseMpesaMessage } from '../utils/mpesaParser';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Food');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [mpesaText, setMpesaText] = useState('');

    const categories = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Other'];

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        const { data } = await api.get('/expenses');
        setExpenses(data);
    };

    const handleMpesaPaste = (e) => {
        const text = e.target.value;
        setMpesaText(text);
        const parsed = parseMpesaMessage(text);
        if (parsed) {
            setAmount(parsed.amount);
            setTitle(parsed.title);
            setDate(parsed.date);
            // Default category for M-PESA payments if not specified
            if (parsed.type === 'expense') {
                setCategory('Other');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', { amount, category, date, description, title });
            setAmount('');
            setTitle('');
            setDescription('');
            fetchExpenses();
        } catch (err) {
            alert('Failed to add expense');
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Cash Out Management</h2>
            <div className="grid-responsive">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ border: '2px dashed #fee2e2', background: '#fffafb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Smartphone size={18} style={{ color: '#dc2626' }} />
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: '#0f172a' }}>M-PESA SMART PASTE</h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '600' }}>Paste your M-PESA message here to auto-fill the form below.</p>
                        <textarea
                            value={mpesaText}
                            onChange={handleMpesaPaste}
                            placeholder="e.g. QX72... Confirmed. Ksh 500.00 paid to..."
                            style={{ height: '80px', fontSize: '0.8rem', border: '1px solid #fee2e2' }}
                        ></textarea>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>RECORD EXPENSE</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Amount (Ksh)</label>
                                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
                            </div>
                            <div className="input-group">
                                <label>Item Name</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Pizza, Movie Ticket" />
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
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add some notes..."></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#dc2626', color: '#fff', padding: '0.9rem', marginTop: '0.5rem', fontWeight: '800' }}>
                                <Plus size={18} /> SAVE EXPENSE
                            </button>
                        </form>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>EXPENSE HISTORY</h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 0', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Item Name</th>
                                    <th style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Category</th>
                                    <th style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
                                    <th style={{ textAlign: 'right', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((item) => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 0', fontSize: '0.85rem' }}>{new Date(item.date).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: '700', fontSize: '0.85rem' }}>{item.title}</td>
                                        <td style={{ fontSize: '0.85rem' }}><span style={{ padding: '0.2rem 0.6rem', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>{item.category.toUpperCase()}</span></td>
                                        <td style={{ color: '#dc2626', fontWeight: '800', fontSize: '0.85rem' }}>-Ksh {item.amount.toLocaleString()}</td>
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

export default Expenses;
