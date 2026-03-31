import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { Save, AlertCircle, Calendar, Plus, CheckCircle, Trash2, Tag, Target } from 'lucide-react';

const CATEGORIES = [
    'Housing & Utilities',
    'Food & Household',
    'Transportation',
    'Health & Personal Care',
    'Financial Obligations',
    'Lifestyle & Entertainment',
    'Assets',
    'Miscellaneous',
];

const Budget = () => {
    const location = useLocation();
    // New Budget State
    const [bgCategory, setBgCategory] = useState('');
    const [bgAmount, setBgAmount] = useState('');
    const [bgStartDate, setBgStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().slice(0, 10);
    });
    const [bgEndDate, setBgEndDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
        return d.toISOString().slice(0, 10);
    });

    const [activeBudgets, setActiveBudgets] = useState([]);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // Reference month for fetching
    const [expensesByCategory, setExpensesByCategory] = useState({});

    // Auto-scroll to target budget
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const targetId = queryParams.get('id');
        if (targetId && activeBudgets.length > 0) {
            setTimeout(() => {
                const element = document.getElementById(`budget-${targetId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.style.outline = '2px solid #0f172a';
                    element.style.outlineOffset = '4px';
                    setTimeout(() => {
                        element.style.outline = 'none';
                    }, 3000);
                }
            }, 600);
        }
    }, [location.search, activeBudgets.length]);

    // Keep goal & bills state for the bottom section
    const [goalBudgets, setGoalBudgets] = useState([]);
    const [goalName, setGoalName] = useState('');
    const [goalAmount, setGoalAmount] = useState('');
    const [goalDate, setGoalDate] = useState('');

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
            // Fetch report to get spent amounts per category
            const { data: reportData } = await api.get(`/reports/monthly?month=${month}`);
            setExpensesByCategory(reportData.expenseByCategory || {});

            // The report now also returns active budgets, or we can fetch them directly
            if (reportData.activeBudgets) {
                // Filter out the "Personal Goals" that were usually saved as custom categories, keeping only standard ones
                setActiveBudgets(reportData.activeBudgets.filter(b => CATEGORIES.includes(b.category) || b.category === 'Monthly'));
            } else {
                const { data: budgetData } = await api.get(`/budget?month=${month}`);
                setActiveBudgets(budgetData.filter(b => CATEGORIES.includes(b.category) || b.category === 'Monthly'));
            }

            const { data: allBudgets } = await api.get('/budget');
            // Filter out old "Monthly" and the standard categories to get the custom goals
            setGoalBudgets(allBudgets.filter(b => b.category !== 'Monthly' && !CATEGORIES.includes(b.category)));
        } catch (err) {
            console.error('Failed to fetch budget data', err);
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

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budget', {
                category: bgCategory,
                amount: bgAmount,
                startDate: bgStartDate,
                endDate: bgEndDate,
                month: month // Passing current viewing month as reference
            });
            fetchBudgetData();
            setBgCategory('');
            setBgAmount('');
            alert('Category budget set successfully!');
        } catch (err) {
            alert('Failed to set budget. Make sure all fields are filled.');
        }
    };

    const handleGoalSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budget', {
                amount: goalAmount,
                startDate: new Date().toISOString().slice(0, 10), // start today
                endDate: goalDate,
                category: goalName // Custom category counts as goal
            });
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

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fillBar { from { width: 0; } to { width: var(--target-width); } }
            `}</style>

            <div className="dashboard-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#0f172a', margin: 0 }}>Budgets & Goals</h2>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '10px', color: '#64748b' }} />
                    <input
                        type="month"
                        style={{ padding: '0.55rem 0.55rem 0.55rem 2.22rem', background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '800', fontSize: '0.8rem', borderRadius: '6px' }}
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        title="Viewing month for expenses"
                    />
                </div>
            </div>

            <div className="grid-responsive">
                <div className="card" style={{ alignSelf: 'start' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Target size={20} color="#2563eb" /> SET CATEGORY BUDGET
                    </h3>
                    <form onSubmit={handleBudgetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</label>
                            <select value={bgCategory} onChange={(e) => setBgCategory(e.target.value)} required style={{ padding: '0.6rem' }}>
                                <option value="" disabled>Select a category</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Limit Amount (Ksh)</label>
                            <input type="number" value={bgAmount} onChange={(e) => setBgAmount(e.target.value)} required placeholder="0.00" style={{ padding: '0.6rem' }} />
                        </div>
                        <div className="grid-responsive" style={{ display: 'grid', gap: '1rem' }}>
                            <div className="input-group" style={{ margin: 0 }}>
                                <label style={{ color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Start Date</label>
                                <input type="date" value={bgStartDate} onChange={(e) => setBgStartDate(e.target.value)} required style={{ padding: '0.6rem' }} />
                            </div>
                            <div className="input-group" style={{ margin: 0 }}>
                                <label style={{ color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>End Date</label>
                                <input type="date" value={bgEndDate} onChange={(e) => setBgEndDate(e.target.value)} required style={{ padding: '0.6rem' }} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#0f172a', color: '#fff', padding: '0.8rem', marginTop: '0.5rem', fontWeight: '800' }}>
                            <Save size={18} /> SAVE BUDGET
                        </button>
                    </form>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '800', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Tag size={20} color="#16a34a" /> ACTIVE BUDGETS
                    </h3>

                    {activeBudgets.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 2rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                            <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>No budgets set for this timeframe.</p>
                            <small>Create one on the left to start tracking!</small>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', maxHeight: '450px', paddingRight: '0.5rem' }}>
                            {activeBudgets.map(budget => {
                                // Default "Monthly" budget gets mapped to total expenses, otherwise specific category
                                const spent = budget.category === 'Monthly'
                                    ? Object.values(expensesByCategory).reduce((a, b) => a + b, 0)
                                    : (expensesByCategory[budget.category] || 0);

                                const limit = budget.amount;
                                const percentage = Math.min((spent / limit) * 100, 100);
                                const isWarning = percentage >= 85 && percentage < 100;
                                const isDanger = percentage >= 100;

                                let barColor = '#2563eb';
                                if (isWarning) barColor = '#f59e0b';
                                if (isDanger) barColor = '#ef4444';

                                return (
                                    <div key={budget._id} id={`budget-${budget._id}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', transition: 'all 0.3s ease' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', textTransform: 'uppercase' }}>{budget.category}</div>
                                                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', marginTop: '0.2rem' }}>
                                                    {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: isDanger ? '#ef4444' : '#0f172a' }}>
                                                    {percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                                            <div style={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                background: barColor,
                                                transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                '--target-width': `${percentage}%`,
                                                animation: 'fillBar 1s ease-out forwards'
                                            }} />
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                                            <span style={{ color: '#64748b' }}>Spent: Ksh {spent.toLocaleString()}</span>
                                            <span style={{ color: '#0f172a' }}>Limit: Ksh {limit.toLocaleString()}</span>
                                        </div>

                                        {isDanger && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontSize: '0.7rem', fontWeight: '800' }}>
                                                <AlertCircle size={14} /> EXCEEDED BUDGET LIMIT
                                            </div>
                                        )}
                                        {isWarning && !isDanger && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d97706', fontSize: '0.7rem', fontWeight: '800' }}>
                                                <AlertCircle size={14} /> APPROACHING BUDGET LIMIT
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
