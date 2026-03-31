import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Share2, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Download, Upload, CreditCard, LayoutDashboard, ChevronLeft, ChevronRight, Smartphone, Save, PlusCircle, MinusCircle, X, Calendar, FileText, Loader, Lightbulb, Target, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { parseMpesaMessage } from '../utils/mpesaParser';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const TYPE_LABELS = {
    income: { label: '✓ INCOME DETECTED', color: '#16a34a', bg: '#bbf7d0' },
    expense: { label: '✗ EXPENSE DETECTED', color: '#dc2626', bg: '#fee2e2' },
    savings: { label: '🏦 SAVINGS DEPOSIT', color: '#2563eb', bg: '#dbeafe' },
    'savings-withdrawal': { label: '💸 SAVINGS WITHDRAWAL', color: '#d97706', bg: '#ffedd5' },
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [loading, setLoading] = useState(true);
    const [mpesaText, setMpesaText] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [aiAdvice, setAiAdvice] = useState([]);
    const [loadingAdvice, setLoadingAdvice] = useState(false);
    const [savingsPop, setSavingsPop] = useState(null); // { amount, savings }
    const [exportingPdf, setExportingPdf] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [activeAlerts, setActiveAlerts] = useState([]);

    // Inline Cash-In form state
    const [showCashInForm, setShowCashInForm] = useState(false);
    const [ciAmount, setCiAmount] = useState('');
    const [ciSource, setCiSource] = useState('');
    const [ciDate, setCiDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' }));
    const [ciDesc, setCiDesc] = useState('');
    const [ciSaving, setCiSaving] = useState(false);

    // Inline Cash-Out form state
    const [showCashOutForm, setShowCashOutForm] = useState(false);
    const [coAmount, setCoAmount] = useState('');
    const [coTitle, setCoTitle] = useState('');
    const [coCategory, setCoCategory] = useState('');
    const [coDate, setCoDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' }));
    const [coDesc, setCoDesc] = useState('');
    const [coSaving, setCoSaving] = useState(false);

    // Success toast overlay — pauseable on press
    const [toast, setToast] = useState(null); // { amount, label, type, detail }
    const [toastPaused, setToastPaused] = useState(false);
    const toastTimerRef = React.useRef(null);
    const toastStartRef = React.useRef(null);
    const toastRemainingRef = React.useRef(2800);

    const TOAST_CONFIG = {
        income: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Income Recorded', verb: 'logged to your Cash In records' },
        expense: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Expense Recorded', verb: 'saved to your Cash Out records' },
        savings: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Savings Updated', verb: 'added to your Ziidi savings' },
        'savings-withdrawal': { color: '#d97706', bg: '#fff7ed', border: '#fed7aa', label: 'Withdrawal Recorded', verb: 'withdrawn from Ziidi' },
    };

    const showToast = (amount, detail, type = 'income') => {
        setToast({ amount, detail, type });
        setToastPaused(false);
        toastRemainingRef.current = 2800;
        toastStartRef.current = Date.now();
        toastTimerRef.current = setTimeout(() => {
            setToast(null);
            // Trigger savings pop after toast disappears
            if (type === 'income') {
                setTimeout(() => {
                    setSavingsPop({
                        amount: parseFloat(amount),
                        savings: Math.floor(parseFloat(amount) * 0.20)
                    });
                }, 400); // slight beat transition
            }
        }, 2800);
    };

    const handleToastPressStart = () => {
        if (!toast) return;
        // Pause: clear timer, record elapsed
        clearTimeout(toastTimerRef.current);
        const elapsed = Date.now() - toastStartRef.current;
        toastRemainingRef.current = Math.max(0, toastRemainingRef.current - elapsed);
        setToastPaused(true);
    };

    const handleToastPressEnd = () => {
        if (!toast) return;
        // Resume: restart timer with remaining time
        setToastPaused(false);
        toastStartRef.current = Date.now();
        toastTimerRef.current = setTimeout(() => setToast(null), toastRemainingRef.current);
    };

    const fetchReport = async () => {
        try {
            const { data } = await api.get(`/reports/monthly?month=${month}`);
            setReport(data);
        } catch (err) {
            console.error('Failed to fetch report', err);
        }
    };

    const fetchAiAdvice = async () => {
        try {
            setLoadingAdvice(true);
            const { data } = await api.get('/ai/advice');
            setAiAdvice(data);
        } catch (err) {
            console.error('Failed to fetch AI advice');
            setAiAdvice([
                "Track your spending daily to stay on top of your finances.",
                "Consider setting aside 10% of your income for savings.",
                "Review your subscription list for any unused services."
            ]);
        } finally {
            setLoadingAdvice(false);
        }
    };

    const fetchAlerts = async () => {
        try {
            const { data } = await api.get('/notifications');
            // Show only important alerts on dashboard to avoid clatter
            const unread = data.filter(n => !n.isRead);
            const important = unread.filter(n => {
                const isCriticalBudget = n.type === 'budget' && (n.message.includes('100%') || n.message.includes('90%') || n.message.includes('exceeded'));
                const isUrgentDebt = n.type === 'debt' && (n.title.toLowerCase().includes('deadline') || n.message.toLowerCase().includes('due in 1 days') || n.message.toLowerCase().includes('due in 0 days'));
                return isCriticalBudget || isUrgentDebt;
            });
            setActiveAlerts(important.slice(0, 3));
        } catch (err) {
            console.error('Failed to fetch alerts');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            // Optimistic update
            setActiveAlerts([]);
            await api.put('/notifications/mark-all-read');
            fetchReport();
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (err) {
            console.error('Failed to mark all as read');
            fetchAlerts();
        }
    };

    const handleMarkAsRead = async (id) => {
        // Optimistic update: Remove from UI immediately
        setActiveAlerts(prev => prev.filter(a => a._id !== id));

        try {
            await api.put(`/notifications/${id}`);
            // Re-fetch in background to ensure sync and potentially fill the 3-item limit
            const { data } = await api.get('/notifications');
            setActiveAlerts(data.filter(n => !n.isRead).slice(0, 3));
            fetchReport();
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (err) {
            console.error('Failed to mark as read');
            fetchAlerts(); // Rollback on error
        }
    };

    const handleResolve = async (alert) => {
        // Mark as read in UI first for instant feedback
        handleMarkAsRead(alert._id);
        navigate(alert.link);
    };

    useEffect(() => {
        fetchReport();
        fetchAiAdvice();
        fetchAlerts();
    }, [month]);


    const handleMpesaPaste = (e) => {
        const text = e.target.value;
        setMpesaText(text);
        const parsed = parseMpesaMessage(text);
        if (parsed) {
            // Force categories to be selected manually for expenses
            if (parsed.type === 'expense') {
                parsed.category = '';
            }
            setParsedData(parsed);
        } else {
            setParsedData(null);
        }
    };

    const confirmQuickAdd = async () => {
        if (!parsedData) return;
        setSyncing(true);

        try {
            const timestamp = parsedData.time ? `${parsedData.date}T${parsedData.time}` : parsedData.date;

            if (parsedData.type === 'savings') {
                // DEPOSIT: Record Savings + record Expense (Assets)
                await api.post('/savings', {
                    amount: parsedData.amount,
                    type: 'deposit',
                    date: timestamp,
                    title: `Sent to Ziidi`,
                    transactionId: parsedData.transactionId,
                    partner: 'Ziidi'
                });

                await api.post('/expenses', {
                    title: `Sent to Ziidi (Savings)`,
                    amount: parsedData.amount,
                    date: timestamp,
                    category: 'Assets',
                    paymentMethod: 'M-PESA',
                    transactionId: parsedData.transactionId,
                    description: `Automated dual-recording for Ziidi deposit.`
                });

                showToast(parsedData.amount, 'Ziidi Savings', 'savings');
            } else if (parsedData.type === 'savings-withdrawal') {
                // WITHDRAWAL: Record Savings withdrawal + record Income
                await api.post('/savings', {
                    amount: parsedData.amount,
                    type: 'withdrawal',
                    date: timestamp,
                    title: `Withdrawn from Ziidi`,
                    transactionId: parsedData.transactionId,
                    partner: 'Ziidi'
                });

                await api.post('/income', {
                    title: `Ziidi Withdrawal`,
                    source: 'Ziidi',
                    amount: parsedData.amount,
                    date: timestamp,
                    paymentMethod: 'M-PESA',
                    transactionId: parsedData.transactionId,
                    description: `Automated dual-recording for Ziidi withdrawal.`
                });

                showToast(parsedData.amount, 'Main Wallet', 'savings-withdrawal');
            } else {
                // Route to standard Income or Expense
                const payload = {
                    title: parsedData.title,
                    amount: parsedData.amount,
                    date: timestamp,
                    description: parsedData.description || '',
                    paymentMethod: 'M-PESA',
                    transactionId: parsedData.transactionId,
                };

                if (parsedData.type === 'income') {
                    payload.source = parsedData.partner;
                } else {
                    if (!parsedData.category) {
                        alert('Please select a category for this expense.');
                        setSyncing(false);
                        return;
                    }
                    payload.category = parsedData.category;
                }

                const endpoint = parsedData.type === 'income' ? '/income' : '/expenses';
                await api.post(endpoint, payload);
                showToast(
                    parsedData.amount,
                    parsedData.type === 'income' ? parsedData.partner : parsedData.title,
                    parsedData.type
                );
            }

            fetchReport();
            setMpesaText('');
            setParsedData(null);
        } catch (err) {
            console.error(err);
            if (
                err.response?.data?.message?.includes('duplicate key') ||
                err.response?.data?.message?.includes('E11000') ||
                err.response?.status === 400
            ) {
                alert('⚠️ This transaction has already been recorded in your history.');
            } else {
                alert('❌ Failed to sync transaction. Please check all fields.');
            }
        } finally {
            setSyncing(false);
        }
    };

    const handleCashInSubmit = async (e) => {
        e.preventDefault();
        setCiSaving(true);
        try {
            // If date is today, append current time for accuracy
            let finalDate = ciDate;
            const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
            if (ciDate === today) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS
                finalDate = `${ciDate}T${timeString}`;
            }

            await api.post('/income', {
                amount: ciAmount,
                source: ciSource,
                title: ciSource, // use source as title for simplicity
                date: finalDate,
                description: ciDesc,
                paymentMethod: 'Cash',
            });
            const savedAmount = ciAmount;
            const savedSource = ciSource;
            setCiAmount('');
            setCiSource('');
            setCiDate(today);
            setCiDesc('');
            setShowCashInForm(false);
            fetchReport();
            showToast(savedAmount, savedSource);
        } catch (err) {
            console.error(err);
            alert('Failed to save income. Please check your entries and try again.');
        } finally {
            setCiSaving(false);
        }
    };

    const handleCashOutSubmit = async (e) => {
        e.preventDefault();
        setCoSaving(true);
        try {
            // If date is today, append current time for accuracy
            let finalDate = coDate;
            const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
            if (coDate === today) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS
                finalDate = `${coDate}T${timeString}`;
            }

            await api.post('/expenses', {
                amount: coAmount,
                title: coTitle,
                category: coCategory,
                date: finalDate,
                description: coDesc,
                paymentMethod: 'Cash',
            });
            const savedAmount = coAmount;
            const savedTitle = coTitle;
            setCoAmount('');
            setCoTitle('');
            setCoCategory('');
            setCoDate(new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' }));
            setCoDesc('');
            setShowCashOutForm(false);
            fetchReport();
            showToast(savedAmount, savedTitle, 'expense');
        } catch (err) {
            console.error(err);
            alert('Failed to save expense. Please check your entries and try again.');
            setCoSaving(false);
        }
    };

    const handleExportPDF = async () => {
        setExportingPdf(true);
        try {
            console.log('Starting PDF export...');
            // Dynamically import the PDF generator to avoid load-time issues with jspdf
            const module = await import('../utils/pdfExport');
            const generatePDF = module.generatePDF;

            if (!generatePDF) throw new Error('PDF generator module not found');

            const [incomeRes, expenseRes] = await Promise.all([
                api.get('/income'),
                api.get('/expenses')
            ]);

            const selectedDate = new Date(month);
            const y = selectedDate.getFullYear();
            const m = selectedDate.getMonth();

            const income = incomeRes.data
                .filter(i => {
                    const d = new Date(i.date);
                    return d.getFullYear() === y && d.getMonth() === m;
                })
                .map(i => ({ ...i, type: 'income' }));

            const expenses = expenseRes.data
                .filter(e => {
                    const d = new Date(e.date);
                    return d.getFullYear() === y && d.getMonth() === m;
                })
                .map(e => ({ ...e, type: 'expense' }));

            const allTransactions = [...income, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

            const chartContainer = document.getElementById('dashboard-charts-container');

            await generatePDF(report, allTransactions, chartContainer, month);
            console.log('PDF export completed');

        } catch (error) {
            console.error("Export failed:", error);
            alert("Export Failed: " + (error.message || error.toString()));
        } finally {
            setExportingPdf(false);
        }
    };


    if (!report) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0f172a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ fontWeight: '700', color: '#64748b', fontSize: '0.85rem' }}>INITIALIZING FINANCIAL ANALYTICS...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    // Helper to shorten labels for X-axis (Abbreviations for Legend)
    const shortLabels = {
        'Housing & Utilities': 'HOU',
        'Food & Household': 'FOD',
        'Transportation': 'TRN',
        'Health & Personal Care': 'HLT',
        'Financial Obligations': 'FIN',
        'Lifestyle & Entertainment': 'LIF',
        'Assets': 'AST',
        'Miscellaneous': 'MSC'
    };

    const CHART_COLORS = ['#0f172a', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#94a3b8', '#8b5cf6', '#ec4899'];

    const expenseData = {
        labels: Object.keys(report.allTimeExpenseByCategory || {}).map(k => shortLabels[k] || k.substring(0, 3).toUpperCase()),
        datasets: [{
            label: 'Amount (Ksh)',
            data: Object.values(report.allTimeExpenseByCategory || {}),
            backgroundColor: CHART_COLORS,
            borderRadius: 6,
            barThickness: 30,
            maxBarThickness: 35
        }]
    };

    const barData = {
        labels: ['CASH IN', 'CASH OUT'],
        datasets: [{
            data: [report.allTimeTotalIncome || 0, report.allTimeTotalExpenses || 0],
            backgroundColor: ['#16a34a', '#dc2626'],
            borderRadius: 6,
            barThickness: 30,
            maxBarThickness: 35
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

    const recommendations = aiAdvice.length > 0 ? aiAdvice.map((tip, idx) => {
        const icons = [
            <Lightbulb size={24} color="#eab308" />,
            <Wallet size={24} color="#2563eb" />,
            <TrendingUp size={24} color="#16a34a" />,
            <Target size={24} color="#8b5cf6" />
        ];
        return {
            title: `INSIGHT #${idx + 1}`,
            desc: tip,
            icon: icons[idx % icons.length]
        };
    }) : [
        {
            title: "50/30/20 BUDGET RULE",
            desc: `Based on your Ksh ${report.totalIncome.toLocaleString()} income: Ksh ${(report.totalIncome * 0.5).toLocaleString()} for Needs, Ksh ${(report.totalIncome * 0.3).toLocaleString()} for Wants, and Ksh ${(report.totalIncome * 0.2).toLocaleString()} for Savings.`,
            icon: <Lightbulb size={24} color="#eab308" />
        }
    ];

    const typeInfo = parsedData ? TYPE_LABELS[parsedData.type] : null;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .ticker-item { display: inline-block; padding: 0 4rem; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                .ticker-item span { color: #94a3b8; margin-right: 0.5rem; }
                @keyframes toastIn { from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
                @keyframes drainBar { from { width: 100%; } to { width: 0%; } }
                @keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }
            `}</style>

            {toast && (() => {
                const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.income;
                return (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        background: 'rgba(15, 23, 42, 0.55)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <div
                            onMouseDown={handleToastPressStart}
                            onMouseUp={handleToastPressEnd}
                            onMouseLeave={handleToastPressEnd}
                            onTouchStart={handleToastPressStart}
                            onTouchEnd={handleToastPressEnd}
                            style={{
                                position: 'absolute', top: '50%', left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: '#fff',
                                borderTop: `5px solid ${cfg.color}`,
                                padding: '2.5rem 3rem',
                                minWidth: '340px',
                                maxWidth: '480px',
                                textAlign: 'center',
                                boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                                animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                                cursor: 'default',
                                userSelect: 'none'
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: cfg.bg, border: `2px solid ${cfg.border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.25rem'
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>

                            {/* Label */}
                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: cfg.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                {cfg.label}
                            </div>

                            {/* Amount */}
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
                                Ksh {parseFloat(toast.amount).toLocaleString()}
                            </div>

                            {/* Message */}
                            <p style={{ fontSize: '0.88rem', color: '#475569', fontWeight: '500', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                Thank you for keeping your finances in order.<br />
                                <strong style={{ color: '#0f172a' }}>{toast.detail}</strong> has been {cfg.verb}.
                            </p>

                            {/* Auto-dismiss progress bar */}
                            <div style={{ width: '100%', height: '3px', background: '#f1f5f9', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    background: cfg.color,
                                    animation: 'drainBar 2.8s linear forwards',
                                    animationPlayState: toastPaused ? 'paused' : 'running'
                                }} />
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Step 2: Subtle Savings Insight Card */}
            {savingsPop && (
                <div style={{
                    position: 'fixed', bottom: '2rem', left: '50%',
                    transform: 'translateX(-50%)', zIndex: 10000,
                    width: '90%', maxWidth: '380px',
                    animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                    pointerEvents: 'auto'
                }}>
                    <div style={{
                        background: '#fff',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
                        border: '1px solid #e2e8f0',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        position: 'relative',
                        borderLeft: '4px solid #eab308'
                    }}>
                        <button
                            onClick={() => setSavingsPop(null)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ background: '#0f172a', padding: '0.35rem', borderRadius: '6px' }}>
                                <Target size={14} color="#eab308" />
                            </div>
                            <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#64748b', letterSpacing: '0.08em' }}>VIRTUAL ADVISOR INSIGHT</span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '600', lineHeight: '1.5', margin: 0, paddingRight: '1rem' }}>
                            Wow, congratulations! Now send <strong style={{ color: '#0f172a' }}>Ksh {savingsPop.savings.toLocaleString()}</strong> to M-PESA <strong>Ziidi</strong> and paste the message here.
                        </p>

                        <div
                            onClick={() => setSavingsPop(null)}
                            style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                            DISMISS & CONTINUE
                        </div>
                    </div>
                </div>
            )}


            {/* Live Financial Ticker */}
            <div className="financial-ticker" style={{
                overflow: 'hidden',
                background: '#0f172a',
                color: '#fff',
                padding: '0.75rem 0',
                whiteSpace: 'nowrap',
                margin: '2px -1rem 1rem -1rem', // Added 2px top margin for perfect alignment with sidebar
                borderBottom: '2px solid #1e293b'
            }}>
                <div style={{ display: 'inline-block', whiteSpace: 'nowrap', paddingRight: '100%', animation: 'ticker 30s linear infinite' }}>
                    {[1, 2].map(i => (
                        <React.Fragment key={i}>
                            <div className="ticker-item"><span>NET BALANCE:</span> Ksh {report.balance.toLocaleString()}</div>
                            <div className="ticker-item"><span>TOTAL IN:</span> <span style={{ color: '#22c55e' }}>Ksh {report.totalIncome.toLocaleString()}</span></div>
                            <div className="ticker-item"><span>TOTAL OUT:</span> <span style={{ color: '#ef4444' }}>Ksh {report.totalExpenses.toLocaleString()}</span></div>
                            <div className="ticker-item"><span>ZIIDI BAL:</span> <span style={{ color: '#fbbf24' }}>Ksh {report.totalSavings?.toLocaleString() || 0}</span></div>
                            <div className="ticker-item"><span>MONTH:</span> {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}</div>
                            <div className="ticker-item"><span>CASHFLOWLY:</span> YOUR AI-POWERED FINANCIAL CO-PILOT.</div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="dashboard-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ minWidth: '200px' }}>
                    <h2 style={{ fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#0f172a' }}>DASHBOARD OVERVIEW</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Your financial command center at a glance.</p>
                </div>
                <div className="dashboard-header-btns" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button onClick={handleExportPDF} disabled={exportingPdf} className="btn" style={{ background: '#0f172a', border: '1px solid #0f172a', color: '#fff', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: exportingPdf ? 0.7 : 1 }}>
                        {exportingPdf ? <Loader size={16} className="spin" /> : <FileText size={16} />} EXPORT PDF
                    </button>
                    <button onClick={handleExport} className="btn" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={16} /> CSV
                    </button>
                    <div className="date-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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

            {/* Critical Alerts Banner */}
            {activeAlerts.length > 0 && (
                <div style={{
                    marginBottom: '1.25rem',
                    background: '#fff',
                    border: '1px solid #fee2e2',
                    borderLeft: '4px solid #ef4444',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    animation: 'pulse 2s infinite'
                }}>
                    <style>{`
                        @keyframes pulse {
                            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                        }
                    `}</style>
                    <div className="alert-header" style={{ padding: '0.6rem 1rem', background: '#fef2f2', borderBottom: '1px solid #fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                                <AlertCircle size={14} /> ALERTS ({activeAlerts.length})
                            </h3>
                            <button
                                onClick={handleMarkAllAsRead}
                                style={{ background: '#991b1b', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.55rem', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}
                            >
                                Mark All as Read
                            </button>
                        </div>
                        <Link to="/notifications" style={{ fontSize: '0.65rem', fontWeight: '800', color: '#ef4444', textDecoration: 'none' }}>VIEW HUB</Link>
                    </div>
                    {activeAlerts.map((alert, idx) => (
                        <div key={alert._id} className="alert-banner-content" style={{
                            padding: '0.65rem 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: idx === activeAlerts.length - 1 ? 'none' : '1px solid #f1f5f9',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            <style>{`
                                @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                            `}</style>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1 }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    flexShrink: 0,
                                    background: alert.type === 'budget' ? '#ef4444' : '#eab308'
                                }}></div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.4' }}>{alert.message}</div>
                            </div>
                        <div className="alert-btn-group" style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                    onClick={() => handleMarkAsRead(alert._id)}
                                    className="btn"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800' }}
                                >
                                    MARK AS READ
                                </button>
                                {alert.link && (
                                    <button
                                        onClick={() => handleResolve(alert)}
                                        className="btn btn-primary"
                                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.65rem', background: '#0f172a', fontWeight: '800' }}
                                    >
                                        RESOLVE
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Action Hub */}
            <div className="grid-responsive" style={{ marginBottom: '2rem' }}>
                {/* M-PESA Smart Sync — Central Hub */}
                <div className="card" style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Smartphone size={18} color="#2563eb" /> SMART M-PESA SYNC
                        </h3>
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: '#e0e7ff', color: '#4338ca', fontWeight: '800' }}>AUTO-CLASSIFY</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.75rem' }}>
                        Paste any M-PESA message — the system automatically detects if it's <strong>income</strong>, <strong>spending</strong>, or <strong>savings</strong>.
                    </p>
                    <textarea
                        placeholder="PASTE ANY M-PESA SMS HERE..."
                        value={mpesaText}
                        onChange={handleMpesaPaste}
                        style={{ height: '70px', background: '#fff', fontSize: '0.85rem', padding: '0.8rem', border: '1px solid #e2e8f0', resize: 'none' }}
                    />

                    {parsedData && typeInfo && (
                        <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#fff', border: `1px solid ${typeInfo.bg}`, borderRadius: '4px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                            <div style={{ marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: typeInfo.color }}>
                                    {typeInfo.label}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700' }}>SYNC PREVIEW</span>
                            </div>

                            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800', display: 'block', marginBottom: '0.25rem' }}>PARTNER / SOURCE</span>
                                <p style={{ color: '#0f172a', fontWeight: '900', fontSize: '0.8rem', margin: 0 }}>
                                    {parsedData.type === 'savings' || parsedData.type === 'savings-withdrawal'
                                        ? 'SAVINGS Ledger (Automatic)'
                                        : (parsedData.partner || 'Unknown Source/Recipient')}
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800' }}>SYNC TYPE</span>
                                <span style={{
                                    color: parsedData.type === 'income' ? '#22c55e' : (parsedData.type === 'savings' ? '#2563eb' : (parsedData.type === 'savings-withdrawal' ? '#d97706' : '#ef4444')),
                                    fontWeight: '900', fontSize: '0.7rem'
                                }}>
                                    {parsedData.type === 'savings' ? 'SAVINGS DEPOSIT + CASH OUT' : (parsedData.type === 'savings-withdrawal' ? 'SAVINGS WITHDRAWAL + CASH IN' : parsedData.type.toUpperCase())}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Amount (Ksh)</label>
                                    <input
                                        type="number"
                                        value={parsedData.amount}
                                        onChange={(e) => setParsedData({ ...parsedData, amount: e.target.value })}
                                        style={{ padding: '0.4rem', fontSize: '0.85rem', fontWeight: '800' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Date &amp; Time</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="date"
                                            value={parsedData.date}
                                            onChange={(e) => setParsedData({ ...parsedData, date: e.target.value })}
                                            style={{ padding: '0.4rem', fontSize: '0.85rem', flex: 1.5 }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="HH:mm"
                                            value={parsedData.time || ''}
                                            onChange={(e) => setParsedData({ ...parsedData, time: e.target.value })}
                                            style={{ padding: '0.4rem', fontSize: '0.85rem', flex: 1 }}
                                        />
                                    </div>
                                </div>
                            </div>


                            {/* Income: show source/partner */}
                            {parsedData.type === 'income' && (
                                <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Source / Sender</label>
                                    <input
                                        type="text"
                                        value={parsedData.partner}
                                        onChange={(e) => setParsedData({ ...parsedData, partner: e.target.value })}
                                        style={{ padding: '0.4rem', fontSize: '0.8rem', fontWeight: '700' }}
                                    />
                                </div>
                            )}

                            {/* Expense: show recipient + category */}
                            {parsedData.type === 'expense' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Recipient / Item</label>
                                        <input
                                            type="text"
                                            value={parsedData.title}
                                            onChange={(e) => setParsedData({ ...parsedData, title: e.target.value })}
                                            style={{ padding: '0.4rem', fontSize: '0.8rem', fontWeight: '700' }}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Category</label>
                                        <select
                                            value={parsedData.category || ''}
                                            onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                                            style={{ padding: '0.4rem', fontSize: '0.8rem', border: parsedData.category ? '1px solid #e2e8f0' : '2px solid #ef4444' }}
                                            required
                                        >
                                            <option value="" disabled>Select a category</option>
                                            {[
                                                'Housing & Utilities',
                                                'Food & Household',
                                                'Transportation',
                                                'Health & Personal Care',
                                                'Financial Obligations',
                                                'Lifestyle & Entertainment',
                                                'Assets',
                                                'Miscellaneous',
                                            ].map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={confirmQuickAdd}
                                    disabled={syncing}
                                    style={{ flex: 2, padding: '0.6rem', background: typeInfo.color, color: '#fff', border: 'none', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', opacity: syncing ? 0.7 : 1 }}
                                >
                                    {syncing ? 'SYNCING...' : 'CONFIRM & SYNC'}
                                </button>
                                <button
                                    onClick={() => { setParsedData(null); setMpesaText(''); }}
                                    style={{ flex: 1, padding: '0.6rem', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* RECORD CASH IN button + inline form */}
                    <div>
                        <div
                            className="card"
                            onClick={() => { setShowCashInForm(v => !v); }}
                            style={{ background: '#0f172a', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem' }}
                        >
                            <PlusCircle size={28} color="#22c55e" />
                            <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.05em' }}>RECORD CASH IN</span>
                        </div>

                        {showCashInForm && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', marginTop: '0.5rem', animation: 'fadeIn 0.2s ease' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#16a34a', textTransform: 'uppercase' }}>New Income Entry</span>
                                    <button onClick={() => setShowCashInForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
                                </div>
                                <form onSubmit={handleCashInSubmit}>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Amount (Ksh)</label>
                                        <input type="number" value={ciAmount} onChange={e => setCiAmount(e.target.value)} required placeholder="0.00" style={{ padding: '0.45rem', fontSize: '0.9rem', fontWeight: '800' }} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Source of Income</label>
                                        <input type="text" value={ciSource} onChange={e => setCiSource(e.target.value)} required placeholder="e.g. Salary, Freelance, Business" style={{ padding: '0.45rem', fontSize: '0.85rem' }} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Date</label>
                                        <input type="date" value={ciDate} onChange={e => setCiDate(e.target.value)} required style={{ padding: '0.45rem', fontSize: '0.85rem' }} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Description (Optional)</label>
                                        <input type="text" value={ciDesc} onChange={e => setCiDesc(e.target.value)} placeholder="Add a note..." style={{ padding: '0.45rem', fontSize: '0.85rem' }} />
                                    </div>
                                    <button type="submit" disabled={ciSaving} style={{ width: '100%', padding: '0.6rem', background: '#16a34a', color: '#fff', border: 'none', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', opacity: ciSaving ? 0.7 : 1 }}>
                                        <Save size={14} /> {ciSaving ? 'SAVING...' : 'SAVE INCOME'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    <div>
                        <div
                            className="card"
                            onClick={() => { setShowCashOutForm(v => !v); if (showCashInForm) setShowCashInForm(false); }}
                            style={{ background: '#0f172a', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem' }}
                        >
                            <MinusCircle size={28} color="#ef4444" />
                            <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.05em' }}>RECORD CASH OUT</span>
                        </div>

                        {showCashOutForm && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1.25rem', marginTop: '0.5rem', animation: 'fadeIn 0.2s ease' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#dc2626', textTransform: 'uppercase' }}>New Expense Entry</span>
                                    <button onClick={() => setShowCashOutForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
                                </div>
                                <form onSubmit={handleCashOutSubmit}>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Category</label>
                                        <select value={coCategory} onChange={e => setCoCategory(e.target.value)} required style={{ padding: '0.45rem', fontSize: '0.85rem' }}>
                                            <option value="" disabled>Select a category</option>
                                            {[
                                                'Housing & Utilities',
                                                'Food & Household',
                                                'Transportation',
                                                'Health & Personal Care',
                                                'Financial Obligations',
                                                'Lifestyle & Entertainment',
                                                'Assets',
                                                'Miscellaneous',
                                            ].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Item / Description</label>
                                        <input type="text" value={coTitle} onChange={e => setCoTitle(e.target.value)} required placeholder="e.g. Groceries, Uber, Rent" style={{ padding: '0.45rem', fontSize: '0.85rem' }} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Amount (Ksh)</label>
                                        <input type="number" value={coAmount} onChange={e => setCoAmount(e.target.value)} required placeholder="0.00" style={{ padding: '0.45rem', fontSize: '0.9rem', fontWeight: '800' }} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Date</label>
                                        <input type="date" value={coDate} onChange={e => setCoDate(e.target.value)} required style={{ padding: '0.45rem', fontSize: '0.85rem' }} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Notes (Optional)</label>
                                        <input type="text" value={coDesc} onChange={e => setCoDesc(e.target.value)} placeholder="Add a note..." style={{ padding: '0.45rem', fontSize: '0.85rem' }} />
                                    </div>
                                    <button type="submit" disabled={coSaving} style={{ width: '100%', padding: '0.6rem', background: '#dc2626', color: '#fff', border: 'none', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', opacity: coSaving ? 0.7 : 1 }}>
                                        <Save size={14} /> {coSaving ? 'SAVING...' : 'SAVE EXPENSE'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mid Section: AI Insights & Budget Tracking */}
            <div className="grid-responsive" style={{ marginBottom: '2rem' }}>

                {/* Active Category Budgets Tracker */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
                            <Target size={18} color="#dc2626" /> Budget Watchlist
                        </h3>
                    </div>

                    {(!report.activeBudgets || report.activeBudgets.length === 0) ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#94a3b8', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: '700', margin: 0 }}>NO ACTIVE BUDGETS SET</p>
                            <span style={{ fontSize: '0.7rem' }}>Head to the Budgets tab to set spending limits.</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '250px', paddingRight: '0.5rem' }}>
                            {report.activeBudgets.map(budget => {
                                const spent = budget.category === 'Monthly'
                                    ? Object.values(report.expenseByCategory).reduce((a, b) => a + b, 0)
                                    : (report.expenseByCategory[budget.category] || 0);

                                const limit = budget.amount;
                                const percentage = Math.min((spent / limit) * 100, 100);
                                const isWarning = percentage >= 85 && percentage < 100;
                                const isDanger = percentage >= 100;

                                let barColor = '#16a34a'; // Green by default on dash
                                if (isWarning) barColor = '#f59e0b';
                                if (isDanger) barColor = '#ef4444';

                                return (
                                    <div key={budget._id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                {budget.category}
                                                {isDanger && <AlertCircle size={12} color="#dc2626" />}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '900', color: isDanger ? '#dc2626' : '#64748b' }}>
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                                            <div style={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                background: barColor,
                                                borderRadius: '3px',
                                                transition: 'width 1s ease-out'
                                            }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8' }}>
                                            <span>Spent: {spent.toLocaleString()}</span>
                                            <span>Remaining: {Math.max(limit - spent, 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Smart Financial Statistics Hub */}
                <div className="card" style={{ background: '#f8fafc', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <LayoutDashboard size={18} color="#0f172a" /> SMART FINANCIAL STATISTICS
                        </h3>
                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>ALL-TIME DATA</div>
                    </div>

                    <div className="dashboard-stats" style={{ display: 'grid', gap: '1rem', flex: 1 }}>
                        <div style={{ background: '#fff', padding: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.25rem', height: '100%', boxSizing: 'border-box' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Received</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#16a34a' }}>Ksh {report.allTimeTotalIncome?.toLocaleString() || 0}</span>
                        </div>
                        <div style={{ background: '#fff', padding: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.25rem', height: '100%', boxSizing: 'border-box' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Spent</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#dc2626' }}>Ksh {report.allTimeTotalExpenses?.toLocaleString() || 0}</span>
                        </div>
                        <div style={{ background: '#fff', padding: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.25rem', height: '100%', boxSizing: 'border-box' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Debts to Pay</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ef4444' }}>Ksh {report.allTimeDebts?.toPay?.toLocaleString() || 0}</span>
                        </div>
                        <div style={{ background: '#fff', padding: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.25rem', height: '100%', boxSizing: 'border-box' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>To be Paid</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#2563eb' }}>Ksh {report.allTimeDebts?.toReceive?.toLocaleString() || 0}</span>
                        </div>
                        <div style={{ background: '#0f172a', padding: '0.85rem 1.25rem', gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '4px' }}>
                            <div>
                                <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Available Savings</span>
                                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>Ksh {report.totalSavings?.toLocaleString() || 0}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Active Budget Cap</span>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#38bdf8' }}>Ksh {report.activeBudgets?.reduce((acc, b) => acc + b.amount, 0).toLocaleString() || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Analytics */}
            <div id="dashboard-charts-container" className="dashboard-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start', padding: '10px 0' }}>
                <div className="card" style={{ height: '100%' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>All-Time Inflow vs Outflow</h3>
                    <div style={{ height: '300px' }}>
                        <Bar data={barData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { grid: { borderDash: [5, 5], color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10, weight: '700' } }, beginAtZero: true },
                                x: { grid: { display: false }, ticks: { color: '#0f172a', font: { size: 11, weight: '800' } } }
                            }
                        }} />
                    </div>
                </div>
                <div className="card" style={{ height: '100%' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>All-Time Expense Breakdown</h3>
                    {Object.keys(report.allTimeExpenseByCategory || {}).length > 0 ? (
                        <>
                            <div style={{ height: '300px', marginBottom: '1rem' }}>
                                <Bar
                                    data={expenseData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                callbacks: {
                                                    title: (items) => {
                                                        const key = Object.keys(shortLabels).find(k => shortLabels[k] === items[0].label);
                                                        return key || items[0].label;
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                grid: { color: '#f1f5f9', borderDash: [4, 4] },
                                                ticks: { color: '#94a3b8', font: { size: 9, weight: '600' } },
                                                beginAtZero: true
                                            },
                                            x: {
                                                grid: { display: false },
                                                ticks: { color: '#0f172a', font: { size: 10, weight: '900' }, maxRotation: 0, minRotation: 0 }
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem 1rem', padding: '0 0.5rem' }}>
                                {Object.keys(report.allTimeExpenseByCategory || {}).map((category, i) => (
                                    <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                                        <span style={{ fontWeight: '900', color: '#0f172a', minWidth: '24px' }}>{shortLabels[category] || category.substring(0, 3).toUpperCase()}</span>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>{category}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', fontSize: '0.85rem', border: '1px dashed #e2e8f0' }}>NO EXPENSES DATA FOUND</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
