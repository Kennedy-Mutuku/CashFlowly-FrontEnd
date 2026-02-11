import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Save, AlertCircle, Calendar, Plus, CheckCircle, Trash2 } from 'lucide-react';

const Budget = () => {
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [currentBudget, setCurrentBudget] = useState(null);
    const [spent, setSpent] = useState(0);
    const [goalBudgets, setGoalBudgets] = useState([]);
    const [goalName, setGoalName] = useState('');
    const [goalAmount, setGoalAmount] = useState('');
    const [goalDate, setGoalDate] = useState('');

    // Bills state
    const [bills, setBills] = useState([]);
    const [billName, setBillName] = useState('');
    const [billAmount, setBillAmount] = useState('');
    const [billDate, setBillDate] = useState('');

    useEffect(() => {
        fetchBudgetData();
        fetchBills();
    }, [month]);

    const fetchBudgetData = async () => {
        try {
            const { data: budgetData } = await api.get(`/budget?month=${month}`);
            setCurrentBudget(budgetData);
            setAmount(budgetData?.amount || '');

            const { data: reportData } = await api.get(`/reports/monthly?month=${month}`);
            setSpent(reportData.totalExpenses);

            const { data: allBudgets } = await api.get('/budget');
            setGoalBudgets(allBudgets.filter(b => b.category !== 'Monthly'));
        } catch (err) {
            console.error('Failed to fetch budget data');
        }
    };

    const fetchBills = async () => {
        try {
            const { data } = await api.get('/bills');
            setBills(data);
        } catch (err) {
            console.error('Failed to fetch bills');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budget', { month, amount, category: 'Monthly' });
            fetchBudgetData();
            alert('Monthly budget updated');
        } catch (err) {
            alert('Failed to update budget');
        }
    };

    const handleGoalSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budget', { amount: goalAmount, endDate: goalDate, category: goalName });
            setGoalName('');
            setGoalAmount('');
            setGoalDate('');
            fetchBudgetData();
            alert('Goal budget set!');
        } catch (err) {
            alert('Failed to set goal budget');
        }
    };

    const handleBillSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bills', { name: billName, amount: billAmount, dueDate: billDate });
            setBillName('');
            setBillAmount('');
            setBillDate('');
            fetchBills();
            alert('Bill reminder set!');
        } catch (err) {
            alert('Failed to set bill');
        }
    };

    const handleBillStatus = async (id, status) => {
        try {
            await api.put(`/bills/${id}`, { status });
            fetchBills();
        } catch (err) {
            alert('Failed to update bill');
        }
    };

    const deleteBill = async (id) => {
        if (window.confirm('Delete this reminder?')) {
            await api.delete(`/bills/${id}`);
            fetchBills();
        }
    };

    const percentage = currentBudget ? (spent / currentBudget.amount) * 100 : 0;

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Monthly Budget</h2>
            <div className="grid-responsive">
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>SET MONTHLY BUDGET</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Month</label>
                            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Budget Amount (Ksh)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '0.8rem', marginTop: '0.5rem' }}>
                            <Save size={18} /> SAVE BUDGET
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>BUDGET UTILIZATION</h3>
                    {!currentBudget ? (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', background: '#f8fafc', border: '1px dashed #e2e8f0' }}>
                            No budget plan found for this month.
                        </div>
                    ) : (
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>
                                    <span>SPENDING PROGRESS</span>
                                    <span>{percentage.toFixed(1)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', background: percentage > 100 ? '#ef4444' : '#2563eb', transition: 'width 0.3s ease' }}></div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Allowed</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Ksh {currentBudget.amount.toLocaleString()}</div>
                                </div>
                                <div style={{ padding: '1rem', background: spent > currentBudget.amount ? '#fef2f2' : '#f8fafc', border: `1px solid ${spent > currentBudget.amount ? '#fee2e2' : '#e2e8f0'}` }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: spent > currentBudget.amount ? '#ef4444' : '#64748b', textTransform: 'uppercase' }}>Spent</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: spent > currentBudget.amount ? '#ef4444' : '#0f172a' }}>Ksh {spent.toLocaleString()}</div>
                                </div>
                            </div>

                            {spent > currentBudget.amount && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fee2e2', display: 'flex', gap: '0.5rem', color: '#b91c1c', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <AlertCircle size={16} />
                                    <span>Warning: Budget limit exceeded!</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid-responsive" style={{ marginTop: '3rem' }}>
                {/* Personal Goal Budgets removed or simplified as requested by "professional" focus? User didn't ask to remove, so I'll keep but style properly */}
                <div>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>FINANCIAL GOALS</h3>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '800', color: '#64748b' }}>SET NEW GOAL</h4>
                        <form onSubmit={handleGoalSubmit}>
                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Goal Item</label>
                                <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)} required placeholder="e.g. New Laptop" />
                            </div>
                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Estimated Cost</label>
                                <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} required placeholder="0.00" />
                            </div>
                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target Date</label>
                                <input type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#0f172a', color: '#fff' }}>
                                <Save size={18} /> PLAN GOAL
                            </button>
                        </form>
                    </div>
                    {goalBudgets.map(gb => (
                        <div key={gb._id} className="card" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '0.85rem' }}>{gb.category}</span>
                            <span style={{ fontWeight: '700', color: '#2563eb' }}>Ksh {gb.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                {/* Bill Reminders */}
                <div>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>RECURRING BILLS</h3>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '800', color: '#64748b' }}>NEW REMINDER</h4>
                        <form onSubmit={handleBillSubmit}>
                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Bill Name</label>
                                <input type="text" value={billName} onChange={(e) => setBillName(e.target.value)} required placeholder="e.g. WiFi Bill" />
                            </div>
                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount (Ksh)</label>
                                <input type="number" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} required placeholder="0.00" />
                            </div>
                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Due Date</label>
                                <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#0f172a', color: '#fff' }}>
                                <Plus size={18} /> SET REMINDER
                            </button>
                        </form>
                    </div>
                    {bills.map(bill => {
                        const isOverdue = new Date(bill.dueDate) < new Date() && bill.status === 'Unpaid';
                        return (
                            <div key={bill._id} className="card" style={{
                                marginBottom: '0.75rem',
                                borderLeft: `4px solid ${bill.status === 'Paid' ? '#16a34a' : (isOverdue ? '#dc2626' : '#d97706')}`,
                                background: isOverdue ? '#fff1f2' : '#fff'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
                                            {bill.name}
                                            {isOverdue && <span style={{ fontSize: '0.65rem', background: '#dc2626', color: '#fff', padding: '2px 6px', fontWeight: '800' }}>OVERDUE</span>}
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0.2rem 0' }}>Ksh {bill.amount.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>DUE: {new Date(bill.dueDate).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        {bill.status === 'Unpaid' ? (
                                            <button onClick={() => handleBillStatus(bill._id, 'Paid')} className="btn" style={{ padding: '0.4rem', background: '#0f172a', color: '#fff' }} title="Mark as Paid">
                                                <CheckCircle size={16} />
                                            </button>
                                        ) : (
                                            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 8px', fontSize: '0.7rem', fontWeight: '800' }}>PAID</div>
                                        )}
                                        <button onClick={() => deleteBill(bill._id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Budget;
