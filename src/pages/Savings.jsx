import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Target, Plus, CheckCircle, Smartphone } from 'lucide-react';
import { parseMpesaMessage } from '../utils/mpesaParser';
import { useMpesaListener } from '../hooks/useMpesaListener';

const Savings = () => {
    const [goals, setGoals] = useState([]);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [mpesaText, setMpesaText] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [selectedGoalId, setSelectedGoalId] = useState('');

    useEffect(() => {
        fetchGoals();
    }, []);

    // Listen for background M-PESA messages
    useMpesaListener((parsed) => {
        if (parsed && parsed.type === 'savings') {
            setParsedData(parsed);
            setMpesaText("Zidi message detected automatically!");
            if (goals.length > 0) setSelectedGoalId(goals[0]._id);

            alert(`New Zidi Savings detected: Ksh ${parsed.amount}. Please select a goal and confirm.`);
        }
    });

    const fetchGoals = async () => {
        try {
            const { data } = await api.get('/savings');
            setGoals(data);
            if (data.length > 0 && !selectedGoalId) {
                setSelectedGoalId(data[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch goals', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/savings', { name, targetAmount, currentAmount: currentAmount || 0, targetDate });
            setName('');
            setTargetAmount('');
            setCurrentAmount('');
            setTargetDate('');
            fetchGoals();
        } catch (err) {
            alert('Failed to add goal');
        }
    };

    const handleUpdate = async (id, newAmount, transactionId = null) => {
        try {
            await api.put(`/savings/${id}`, { currentAmount: newAmount, transactionId });
            fetchGoals();
            setParsedData(null);
            setMpesaText('');
        } catch (err) {
            if (err.response?.data?.message) {
                alert(err.response.data.message);
            } else {
                alert('Failed to update progress');
            }
        }
    };

    const handleMpesaPaste = (e) => {
        const text = e.target.value;
        setMpesaText(text);
        const parsed = parseMpesaMessage(text);
        if (parsed && parsed.type === 'savings') {
            setParsedData(parsed);
            if (goals.length > 0) setSelectedGoalId(goals[0]._id);
        } else if (text.length > 50) {
            alert("This message doesn't seem to be a Zidi savings transfer.");
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem', fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#0f172a' }}>SAVINGS GOALS</h2>
            <div className="grid-responsive">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* M-PESA Sync Card */}
                    <div className="card" style={{ background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Smartphone size={18} color="#2563eb" />
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>Zidi Savings Sync</h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '600' }}>Paste your Zidi confirmation message below to record your saving.</p>
                        <textarea
                            value={mpesaText}
                            onChange={handleMpesaPaste}
                            placeholder="Paste M-PESA message here..."
                            style={{ height: '80px', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}
                        ></textarea>

                        {parsedData && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#64748b', fontWeight: '600' }}>DETECTED AMOUNT:</span>
                                    <span style={{ fontWeight: '900', color: '#16a34a' }}>Ksh {parseFloat(parsedData.amount).toLocaleString()}</span>
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.65rem', fontWeight: '800' }}>CONTRIBUTE TO GOAL:</label>
                                    <select
                                        value={selectedGoalId}
                                        onChange={(e) => setSelectedGoalId(e.target.value)}
                                        style={{ padding: '0.4rem', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}
                                    >
                                        {goals.map(goal => (
                                            <option key={goal._id} value={goal._id}>{goal.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => {
                                        const goal = goals.find(g => g._id === selectedGoalId);
                                        if (goal) {
                                            handleUpdate(selectedGoalId, goal.currentAmount + parseFloat(parsedData.amount), parsedData.transactionId);
                                        } else {
                                            alert("Please create a goal first!");
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '0.05em' }}
                                >
                                    CONFIRM CONTRIBUTION
                                </button>
                            </div>
                        )}
                    </div>

                    {/* New Goal Card */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>CREATE NEW GOAL</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Goal Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. New Laptop" />
                            </div>
                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target Amount (Ksh)</label>
                                <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required placeholder="0.00" />
                            </div>
                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Initial Savings (Optional)</label>
                                <input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="Amount you already have" />
                            </div>
                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target Date (Deadline)</label>
                                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#16a34a', color: '#fff', padding: '0.9rem', marginTop: '0.5rem', fontWeight: '800' }}>
                                <Plus size={18} /> CREATE GOAL
                            </button>
                        </form>
                    </div>
                </div>

                {/* Goals List */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', alignContent: 'start' }}>
                    {goals.map((goal) => {
                        const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                            <div key={goal._id} className="card" style={{ borderLeft: `4px solid ${percentage >= 100 ? '#16a34a' : '#2563eb'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: '800' }}>
                                        <Target size={16} color="#2563eb" /> {goal.name}
                                    </h4>
                                    {percentage >= 100 && <CheckCircle size={18} color="#16a34a" />}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                                    <span>PROGRESS: Ksh {goal.currentAmount.toLocaleString()} / Ksh {goal.targetAmount.toLocaleString()}</span>
                                    {goal.targetAmount > goal.currentAmount && (
                                        <span style={{ color: '#2563eb' }}>Ksh {(goal.targetAmount - goal.currentAmount).toLocaleString()} LEFT</span>
                                    )}
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', overflow: 'hidden', marginBottom: '1rem' }}>
                                    <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', background: '#16a34a', transition: 'width 0.3s' }}></div>
                                </div>
                                {goal.targetDate && (
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                                        <span>TARGET BY: {new Date(goal.targetDate).toLocaleDateString()}</span>
                                        {new Date(goal.targetDate) > new Date() ? (
                                            <span style={{ color: '#d97706' }}>
                                                {Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24))} DAYS REMAINING
                                            </span>
                                        ) : (
                                            percentage < 100 && <span style={{ color: '#dc2626' }}>DEADLINE EXCEEDED</span>
                                        )}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.4rem', width: '100px', fontSize: '0.8rem' }}
                                        placeholder="Add Ksh..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleUpdate(goal._id, goal.currentAmount + parseFloat(e.target.value));
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>Press Enter to contribute</span>
                                </div>
                            </div>
                        );
                    })}
                    {goals.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#f8fafc', borderStyle: 'dashed' }}>
                            Start saving for your dreams! Create your first goal.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Savings;
