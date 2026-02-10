import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Target, Plus, CheckCircle } from 'lucide-react';

const Savings = () => {
    const [goals, setGoals] = useState([]);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        const { data } = await api.get('/savings');
        setGoals(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/savings', { name, targetAmount, currentAmount: currentAmount || 0 });
            setName('');
            setTargetAmount('');
            setCurrentAmount('');
            fetchGoals();
        } catch (err) {
            alert('Failed to add goal');
        }
    };

    const handleUpdate = async (id, newAmount) => {
        try {
            await api.put(`/savings/${id}`, { currentAmount: newAmount });
            fetchGoals();
        } catch (err) {
            alert('Failed to update progress');
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Savings Goals</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="card glass">
                    <h3 style={{ marginBottom: '1rem' }}>New Goal</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Goal Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. New Laptop" />
                        </div>
                        <div className="input-group">
                            <label>Target Amount</label>
                            <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Initial Savings</label>
                            <input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--success)' }}>
                            <Plus size={18} /> Create Goal
                        </button>
                    </form>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignContent: 'start' }}>
                    {goals.map((goal) => {
                        const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                        return (
                            <div key={goal._id} className="card glass">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Target size={18} color="var(--primary)" /> {goal.name}
                                    </h4>
                                    {percentage >= 100 && <CheckCircle size={18} color="var(--success)" />}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    Progress: ${goal.currentAmount} / ${goal.targetAmount}
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                                    <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', background: 'var(--success)', transition: 'width 0.3s' }}></div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.25rem', width: '80px', color: 'white' }}
                                        placeholder="Add..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleUpdate(goal._id, goal.currentAmount + parseFloat(e.target.value));
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Press Enter to add</span>
                                </div>
                            </div>
                        );
                    })}
                    {goals.length === 0 && (
                        <div className="card glass" style={{ gridColumn: 'span 2', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Start saving for your dreams! Create your first goal.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Savings;
