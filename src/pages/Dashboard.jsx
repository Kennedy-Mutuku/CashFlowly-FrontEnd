import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Banknote, TrendingDown, TrendingUp, Wallet, Lightbulb,
    Smartphone, ChevronLeft, ChevronRight, PlusCircle,
    MinusCircle, LayoutDashboard, Download, Calendar
} from 'lucide-react';
import { parseMpesaMessage } from '../utils/mpesaParser';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [goals, setGoals] = useState([]);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [mpesaText, setMpesaText] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        fetchReport();
        fetchGoals();
    }, [month]);

    const handleMpesaPaste = (e) => {
        const text = e.target.value;
        setMpesaText(text);
        const parsed = parseMpesaMessage(text);
        if (parsed) {
            setParsedData(parsed);
        }
    };

    const confirmQuickAdd = async () => {
        const endpoint = parsedData.type === 'income' ? '/income' : '/expenses';
        try {
            await api.post(endpoint, {
                title: parsedData.title,
                amount: parsedData.amount,
                date: parsedData.date,
                category: 'Other'
            });
            setMpesaText('');
            setParsedData(null);
            fetchReport();
            alert('Transaction synchronized successfully!');
        } catch (err) {
            alert('Failed to sync transaction');
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

    if (!report) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0f172a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ fontWeight: '700', color: '#64748b', fontSize: '0.85rem' }}>INITIALIZING FINANCIAL ANALYTICS...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const pieData = {
        labels: Object.keys(report.expenseByCategory),
        datasets: [{
            data: Object.values(report.expenseByCategory),
            backgroundColor: ['#0f172a', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#94a3b8'],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const barData = {
        labels: ['CASH IN', 'CASH OUT'],
        datasets: [{
            data: [report.totalIncome, report.totalExpenses],
            backgroundColor: ['#16a34a', '#dc2626'],
            borderRadius: 0,
            barThickness: 40
        }]
    };

    const handleExport = () => {
        const headers = 'Type,Title,Amount,Date\n';
        const rows = [...(report.monthlyIncome || []), ...(report.monthlyExpenses || [])]
            .map(t => `${t.type || (t.amount > 0 ? 'Cash In' : 'Cash Out')},${t.title || 'N/A'},${Math.abs(t.amount)},${new Date(t.date).toLocaleDateString()}`)
            .join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CashFlowly_Summary_${month}.csv`;
        a.click();
    };

    const recommendations = [
        {
            title: "50/30/20 BUDGET RULE",
            desc: `Based on your Ksh ${report.totalIncome.toLocaleString()} income: Ksh ${(report.totalIncome * 0.5).toLocaleString()} for Needs, Ksh ${(report.totalIncome * 0.3).toLocaleString()} for Wants, and Ksh ${(report.totalIncome * 0.2).toLocaleString()} for Savings.`,
            icon: <Lightbulb size={24} color="#eab308" />
        },
        {
            title: "EMERGENCY FUND STATUS",
            desc: report.totalExpenses > 0
                ? `Your current safety net covers ${((report.balance / (report.totalExpenses || 1))).toFixed(1)} months. Aim for 6 months (Ksh ${(report.totalExpenses * 6).toLocaleString()}).`
                : "Record your expenses to calculate your safety net recommendation.",
            icon: <Wallet size={24} color="#2563eb" />
        },
        {
            title: "SAVINGS GOAL TRACKER",
            desc: goals.length > 0
                ? `You have ${goals.length} active goals. Highest priority: "${goals[0].name.toUpperCase()}" with Ksh ${goals[0].currentAmount.toLocaleString()} saved.`
                : "You haven't set any savings goals yet. Start small to build a massive future!",
            icon: <TrendingUp size={24} color="#16a34a" />
        }
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .ticker-item { display: inline-block; padding: 0 4rem; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                .ticker-item span { color: #94a3b8; margin-right: 0.5rem; }
            `}</style>

            {/* Live Financial Ticker */}
            <div style={{
                overflow: 'hidden',
                background: '#0f172a',
                color: '#fff',
                padding: '0.75rem 0',
                whiteSpace: 'nowrap',
                margin: '-2rem -2rem 2rem -2rem',
                borderBottom: '2px solid #1e293b'
            }}>
                <div style={{ display: 'inline-block', whiteSpace: 'nowrap', paddingRight: '100%', animation: 'ticker 30s linear infinite' }}>
                    {[1, 2].map(i => (
                        <React.Fragment key={i}>
                            <div className="ticker-item"><span>NET BALANCE:</span> Ksh {report.balance.toLocaleString()}</div>
                            <div className="ticker-item"><span>TOTAL IN:</span> <span style={{ color: '#22c55e' }}>Ksh {report.totalIncome.toLocaleString()}</span></div>
                            <div className="ticker-item"><span>TOTAL OUT:</span> <span style={{ color: '#ef4444' }}>Ksh {report.totalExpenses.toLocaleString()}</span></div>
                            <div className="ticker-item"><span>MONTH:</span> {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}</div>
                            <div className="ticker-item"><span>CASHFLOWLY:</span> PREMIUM ANALYTICS ACTIVE</div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#0f172a' }}>DASHBOARD OVERVIEW</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Your financial command center at a glance.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleExport} className="btn" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '700', fontSize: '0.75rem' }}>
                        <Download size={16} /> EXPORT CSV
                    </button>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Calendar size={16} style={{ position: 'absolute', left: '10px', color: '#64748b' }} />
                        <input
                            type="month"
                            style={{ padding: '0.55rem 0.55rem 0.55rem 2.2rem', background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '800', fontSize: '0.8rem' }}
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Action Hub */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Smartphone size={18} color="#2563eb" /> SMART M-PESA SYNC
                        </h3>
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: '#e0e7ff', color: '#4338ca', fontWeight: '800' }}>AUTOMATED ENTRY</span>
                    </div>
                    <textarea
                        placeholder="PASTE M-PESA SMS HERE TO AUTO-SYNC..."
                        value={mpesaText}
                        onChange={handleMpesaPaste}
                        style={{ height: '70px', background: '#fff', fontSize: '0.85rem', padding: '0.8rem', border: '1px solid #e2e8f0' }}
                    />
                    {parsedData && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', border: `1px solid ${parsedData.type === 'income' ? '#bbf7d0' : '#fee2e2'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8' }}>{parsedData.type.toUpperCase()} DETECTED</span>
                                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: parsedData.type === 'income' ? '#16a34a' : '#dc2626' }}>Ksh {parseFloat(parsedData.amount).toLocaleString()}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>{parsedData.title}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={confirmQuickAdd} style={{ padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', border: 'none', fontWeight: '800', fontSize: '0.7rem' }}>SYNC NOW</button>
                                <button onClick={() => setParsedData(null)} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: '800', fontSize: '0.7rem' }}>IGNORE</button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="card" onClick={() => window.location.href = '/income'} style={{ background: '#0f172a', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <PlusCircle size={28} color="#22c55e" />
                        <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.05em' }}>RECORD CASH IN</span>
                    </div>
                    <div className="card" onClick={() => window.location.href = '/expenses'} style={{ background: '#0f172a', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <MinusCircle size={28} color="#ef4444" />
                        <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.05em' }}>RECORD CASH OUT</span>
                    </div>
                </div>
            </div>

            {/* Insights Carousel */}
            <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LayoutDashboard size={18} color="#0f172a" /> SMART FINANCIAL INSIGHTS
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setActiveSlide(prev => (prev === 0 ? recommendations.length - 1 : prev - 1))} style={{ padding: '0.4rem', background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => setActiveSlide(prev => (prev === recommendations.length - 1 ? 0 : prev + 1))} style={{ padding: '0.4rem', background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ transition: 'all 0.5s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0' }}>
                            {recommendations[activeSlide].icon}
                        </div>
                        <div>
                            <h4 style={{ fontWeight: '900', fontSize: '1rem', color: '#0f172a', marginBottom: '0.5rem' }}>{recommendations[activeSlide].title}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500', lineHeight: '1.6' }}>{recommendations[activeSlide].desc}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem' }}>
                    {recommendations.map((_, i) => (
                        <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeSlide === i ? '#0f172a' : '#cbd5e1', transition: 'all 0.3s' }} />
                    ))}
                </div>
            </div>

            {/* Bottom Analytics */}
            <div className="dashboard-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Expense Breakdown</h3>
                    {Object.keys(report.expenseByCategory).length > 0 ? (
                        <div style={{ maxWidth: '260px', margin: '0 auto' }}>
                            <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: '700' }, color: '#444', padding: 15 } } } }} />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', fontSize: '0.85rem', border: '1px dashed #e2e8f0' }}>NO EXPENSES DATA FOUND</div>
                    )}
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Inflow vs Outflow</h3>
                    <Bar data={barData} options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { borderDash: [5, 5], color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10, weight: '700' } } },
                            x: { grid: { display: false }, ticks: { color: '#0f172a', font: { size: 11, weight: '800' } } }
                        }
                    }} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
