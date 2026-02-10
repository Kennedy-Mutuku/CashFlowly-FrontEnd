import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Save, AlertCircle } from 'lucide-react';

const Budget = () => {
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [currentBudget, setCurrentBudget] = useState(null);
    const [spent, setSpent] = useState(0);

    useEffect(() => {
        fetchBudgetData();
    }, [month]);

    const fetchBudgetData = async () => {
        try {
            const { data: budgetData } = await api.get(`/budget?month=${month}`);
            setCurrentBudget(budgetData);
            setAmount(budgetData?.amount || '');

            const { data: reportData } = await api.get(`/reports/monthly?month=${month}`);
            setSpent(reportData.totalExpenses);
        } catch (err) {
            console.error('Failed to fetch budget data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budget', { month, amount });
            fetchBudgetData();
            alert('Budget updated successfully');
        } catch (err) {
            alert('Failed to update budget');
        }
    };

    const percentage = currentBudget ? (spent / currentBudget.amount) * 100 : 0;

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Monthly Budget</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card glass">
                    <h3 style={{ marginBottom: '1rem' }}>Set Budget</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Month</label>
                            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Budget Amount</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            <Save size={18} /> Save Budget
                        </button>
                    </form>
                </div>

                <div className="card glass">
                    <h3 style={{ marginBottom: '1rem' }}>Budget Status</h3>
                    {!currentBudget ? (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                            No budget set for this month.
                        </div>
                    ) : (
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Spending Progress</span>
                                    <span>{percentage.toFixed(1)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '12px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', background: percentage > 100 ? 'var(--danger)' : 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="card" style={{ background: 'var(--bg)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Budget</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${currentBudget.amount}</div>
                                </div>
                                <div className="card" style={{ background: 'var(--bg)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Spent</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: spent > currentBudget.amount ? 'var(--danger)' : 'var(--text)' }}>${spent}</div>
                                </div>
                            </div>

                            {spent > currentBudget.amount && (
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', display: 'flex', gap: '0.5rem', color: 'var(--danger)' }}>
                                    <AlertCircle size={20} />
                                    <span>Warning: You have exceeded your budget!</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Budget;
