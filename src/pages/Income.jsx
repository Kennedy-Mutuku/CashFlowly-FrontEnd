import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Smartphone } from 'lucide-react';
import { parseMpesaMessage } from '../utils/mpesaParser';

const Income = () => {
    const [incomes, setIncomes] = useState([]);
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [source, setSource] = useState('');
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' })); // en-CA gives YYYY-MM-DD
    const [description, setDescription] = useState('');
    const [mpesaText, setMpesaText] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [transactionId, setTransactionId] = useState('');
    const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        const { data } = await api.get('/income');
        setIncomes(data);
    };

    const handleMpesaPaste = (e) => {
        const text = e.target.value;
        setMpesaText(text);
        const parsed = parseMpesaMessage(text);
        if (parsed) {
            setAmount(parsed.amount);
            setSource(parsed.partner);
            setTitle(parsed.title);
            setDate(parsed.date);
            setTime(parsed.time);
            setPaymentMethod('M-PESA');
            setTransactionId(parsed.transactionId);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/income', {
                amount,
                source,
                date: time ? `${date}T${time}` : date,
                description,
                title,
                paymentMethod,
                transactionId
            });
            setAmount('');
            setTitle('');
            setSource('');
            setDescription('');
            setPaymentMethod('Cash');
            setTransactionId('');
            setTime('');
            fetchIncomes();
            alert('Income saved successfully!');
        } catch (err) {
            console.error(err);
            if (err.response?.data?.message?.includes('duplicate key') || err.response?.status === 400) {
                alert('This transaction has already been recorded.');
            } else {
                alert('Failed to add income');
            }
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Cash In Management</h2>
            <div className="grid-responsive">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ border: '2px dashed #e2e8f0', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Smartphone size={18} style={{ color: '#2563eb' }} />
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: '#0f172a' }}>M-PESA SMART PASTE</h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '600' }}>Paste your M-PESA message here to auto-fill the form below.</p>
                        <textarea
                            value={mpesaText}
                            onChange={handleMpesaPaste}
                            placeholder="e.g. QX72... Confirmed. You have received Ksh 1,000.00 from..."
                            style={{ height: '80px', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}
                        ></textarea>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>ADD NEW INCOME</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Amount (Ksh)</label>
                                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
                            </div>
                            <div className="input-group">
                                <label>Title / Item Name</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Monthly Salary" />
                            </div>
                            <div className="input-group">
                                <label>Source</label>
                                <input type="text" value={source} onChange={(e) => setSource(e.target.value)} required placeholder="e.g. Salary, Freelance" />
                            </div>
                            <div className="input-group">
                                <label>Date & Time</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ flex: 2 }} />
                                    <input type="text" placeholder="HH:mm" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: 1 }} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Description (Optional)</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add some notes..."></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '0.9rem', marginTop: '0.5rem', fontWeight: '800' }}>
                                <Plus size={18} /> SAVE INCOME
                            </button>
                        </form>
                    </div>
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
                                        <td style={{ padding: '1rem 0', fontSize: '0.85rem' }}>
                                            {new Date(item.date).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi', dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
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
