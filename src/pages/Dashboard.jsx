import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        fetchReport();
    }, [month]);

    const fetchReport = async () => {
        try {
            const { data } = await api.get(`/reports/monthly?month=${month}`);
            setReport(data);
        } catch (err) {
            console.error('Failed to fetch report');
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

    const barData = {
        labels: ['Income', 'Expenses'],
        datasets: [
            {
                label: 'Monthly Comparison',
                data: [report.totalIncome, report.totalExpenses],
                backgroundColor: ['#22c55e', '#ef4444'],
                borderRadius: 8,
            },
        ],
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Financial Overview</h2>
                <input
                    type="month"
                    className="glass"
                    style={{ padding: '0.5rem', color: 'white' }}
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                            <TrendingUp color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Income</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${report.totalIncome}</div>
                        </div>
                    </div>
                </div>
                <div className="card glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                            <TrendingDown color="var(--danger)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Expenses</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${report.totalExpenses}</div>
                        </div>
                    </div>
                </div>
                <div className="card glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px' }}>
                            <DollarSign color="var(--success)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Net Balance</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: report.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                ${report.balance}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                            <Wallet color="var(--warning)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Transactions</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{report.incomeCount + report.expenseCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card glass">
                    <h3 style={{ marginBottom: '1.5rem' }}>Expense Breakdown</h3>
                    {Object.keys(report.expenseByCategory).length > 0 ? (
                        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                            <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#f8fafc' } } } }} />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No expense data for this month</div>
                    )}
                </div>
                <div className="card glass">
                    <h3 style={{ marginBottom: '1.5rem' }}>Income vs Expenses</h3>
                    <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#f8fafc' } }, x: { ticks: { color: '#f8fafc' } } } }} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
