import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Banknote, TrendingDown, TrendingUp, Wallet, Lightbulb, Star, MessageSquare, ShieldCheck, Download } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [goals, setGoals] = useState([]);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [mpesaText, setMpesaText] = useState('');
    const [parsedData, setParsedData] = useState(null);

    useEffect(() => {
        fetchReport();
        fetchGoals();
    }, [month]);

    const handleParse = () => {
        // Regex for M-PESA payment (Sent)
        const sentMatch = mpesaText.match(/([0-9A-Z]+) Confirmed\. Ksh([0-9,.]+)... to (.*) on/i);
        // Regex for M-PESA payment (Received)
        const receivedMatch = mpesaText.match(/([0-9A-Z]+) Confirmed\. You have received Ksh([0-9,.]+)... from (.*) on/i);

        if (sentMatch) {
            setParsedData({
                type: 'Cash Out',
                amount: sentMatch[2].replace(/,/g, ''),
                title: sentMatch[3],
                date: new Date().toISOString().slice(0, 10)
            });
        } else if (receivedMatch) {
            setParsedData({
                type: 'Cash In',
                amount: receivedMatch[2].replace(/,/g, ''),
                title: receivedMatch[3],
                date: new Date().toISOString().slice(0, 10)
            });
        } else {
            alert('Could not recognize M-PESA format. Please paste a standard SMS.');
        }
    };

    const confirmQuickAdd = async () => {
        const endpoint = parsedData.type === 'Cash In' ? '/income' : '/expenses';
        try {
            await api.post(endpoint, {
                title: parsedData.title,
                amount: parsedData.amount,
                category: 'General',
                paymentMethod: 'M-PESA'
            });
            setMpesaText('');
            setParsedData(null);
            fetchReport();
            alert('Transaction added successfully!');
        } catch (err) {
            alert('Failed to add transaction');
        }
    };

    const fetchReport = async () => {
        try {
            const { data } = await api.get(`/reports/monthly?month=${month}`);
            setReport(data);
        } catch (err) {
            console.error('Failed to fetch report');
        }
    };

    const fetchGoals = async () => {
        try {
            const { data } = await api.get('/savings');
            setGoals(data);
        } catch (err) {
            console.error('Failed to fetch goals');
        }
    };

    if (!report) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Analytics...</div>;

    const pieData = {
        labels: Object.keys(report.expenseByCategory),
        datasets: [
            {
                data: Object.values(report.expenseByCategory),
                backgroundColor: [
                    '#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6'
                ],
                borderWidth: 0,
            },
        ],
    };

    const handleExport = () => {
        const headers = 'Type,Title,Amount,Date\n';
        const rows = [...(report.monthlyIncome || []), ...(report.monthlyExpenses || [])]
            .map(t => `${t.type || (t.amount > 0 ? 'Cash In' : 'Cash Out')},${t.title || 'N/A'},${t.amount},${new Date(t.date).toLocaleDateString()}`)
            .join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CashFlowly_Report_${month}.csv`;
        a.click();
    };

    const barData = {
        labels: ['Cash In', 'Cash Out'],
        datasets: [
            {
                label: 'Monthly Comparison',
                data: [report.totalIncome, report.totalExpenses],
                backgroundColor: ['#22c55e', '#ef4444'],
                borderRadius: 8,
            },
        ],
    };

    const recommendations = {
        savings: (report.totalIncome * 0.2).toFixed(0),
        wants: (report.totalIncome * 0.3).toFixed(0),
        needs: (report.totalIncome * 0.5).toFixed(0),
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ textTransform: 'uppercase', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Financial Analytics</h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleExport} className="btn" style={{ background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '700' }}>
                        <Download size={16} /> EXPORT CSV
                    </button>
                    <input
                        type="month"
                        style={{ padding: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '600' }}
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    />
                </div>
            </div>

            <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: '#eff6ff', color: '#2563eb' }}>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Cash In</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Ksh {report.totalIncome.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#ef4444' }}>
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Cash Out</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Ksh {report.totalExpenses.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: `4px solid ${report.balance >= 0 ? '#16a34a' : '#dc2626'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: report.balance >= 0 ? '#f0fdf4' : '#fef2f2', color: report.balance >= 0 ? '#16a34a' : '#dc2626' }}>
                            <Banknote size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Balance</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: report.balance >= 0 ? '#16a34a' : '#dc2626' }}>
                                Ksh {report.balance.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: '#f8fafc', color: '#64748b' }}>
                            <Wallet size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Log Count</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{report.incomeCount + report.expenseCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Category Breakdown</h3>
                    {Object.keys(report.expenseByCategory).length > 0 ? (
                        <div style={{ maxWidth: '240px', margin: '0 auto' }}>
                            <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10, weight: '700' }, color: '#475569' } } } }} />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', border: '1px dashed #e2e8f0' }}>No recurring data found</div>
                    )}
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Income vs Expenses</h3>
                    <Bar data={barData} options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10, weight: '600' } } },
                            x: { ticks: { color: '#64748b', font: { size: 10, weight: '600' } } }
                        }
                    }} />
                </div>
            </div>

            <div className="grid-responsive" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ border: '1px solid #16a34a', background: '#f0fdf4' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem', fontWeight: '800', color: '#166534' }}>
                        <MessageSquare size={18} /> M-PESA QUICK IMPORT
                    </h3>
                    <textarea
                        rows="3"
                        style={{ width: '100%', background: '#fff', color: '#0f172a', padding: '0.8rem', border: '1px solid #bbf7d0', fontSize: '0.85rem' }}
                        placeholder="Paste SMS here... e.g. RJL123 Confirmed. Ksh500.00 paid to..."
                        value={mpesaText}
                        onChange={(e) => setMpesaText(e.target.value)}
                    ></textarea>
                    {!parsedData ? (
                        <button onClick={handleParse} className="btn" style={{ width: '100%', marginTop: '0.75rem', background: '#16a34a', color: '#fff', fontWeight: '700' }}>
                            PARSE TRANSACTION
                        </button>
                    ) : (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>DETECTED {parsedData.type.toUpperCase()}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#16a34a', marginBottom: '0.75rem' }}>Ksh {parseFloat(parsedData.amount).toLocaleString()}</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={confirmQuickAdd} className="btn" style={{ flex: 1, background: '#16a34a', color: '#fff', fontSize: '0.8rem' }}>CONFIRM</button>
                                <button onClick={() => setParsedData(null)} className="btn" style={{ flex: 1, background: '#fee2e2', color: '#dc2626', fontSize: '0.8rem' }}>CANCEL</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="card" style={{ border: '1px solid #2563eb', background: '#eff6ff' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem', fontWeight: '800', color: '#1e40af' }}>
                        <ShieldCheck size={18} /> SAFETY NET CALC
                    </h3>
                    {report.totalExpenses > 0 ? (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e40af' }}>Ksh {(report.totalExpenses * 6).toLocaleString()}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>RECOMMENDED (6X EXPENSES)</div>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#dbeafe', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min((report.balance / (report.totalExpenses * 6)) * 100, 100)}%`, height: '100%', background: '#2563eb' }}></div>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '600' }}>
                                STATUS: {((report.balance / (report.totalExpenses * 6)) * 100).toFixed(1)}% SECURED
                            </p>
                        </>
                    ) : (
                        <p style={{ padding: '1.5rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Add expenses to calculate your safety net.</p>
                    )}
                </div>
            </div>

            <div className="card" style={{ border: '2px solid #0f172a', position: 'relative' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800' }}>
                    <Lightbulb color="#eab308" size={20} /> SMART CASH ADVISOR (50/30/20)
                </h3>

                {report.totalIncome > 0 ? (
                    <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div style={{ padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Investment / Savings (20%)</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#16a34a' }}>Ksh {parseFloat(recommendations.savings).toLocaleString()}</div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '500' }}>
                                {goals.length > 0
                                    ? `Direct this to "${goals[0].name.toUpperCase()}".`
                                    : "Move this to your Savings Goals immediately."}
                            </p>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Daily Comfort (30%)</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2563eb' }}>Ksh {parseFloat(recommendations.wants).toLocaleString()}</div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '500' }}>For entertainment and flexible social items.</p>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Fixed Essentails (50%)</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#d97706' }}>Ksh {parseFloat(recommendations.needs).toLocaleString()}</div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '500' }}>For rent, utilities, and major recurring bills.</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', border: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
                        Log your first <b>Income</b> to unlock personalized AI budgeting!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
