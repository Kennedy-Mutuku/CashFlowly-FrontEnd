import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, TrendingUp, Target, LogOut, Wallet } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass" style={{ marginBottom: '2rem', padding: '1rem 0' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
                    <Wallet color="var(--primary)" />
                    CashFlowly
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><LayoutDashboard size={18} /> Dashboard</Link>
                    <Link to="/income" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TrendingUp size={18} /> Income</Link>
                    <Link to="/expenses" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Receipt size={18} /> Expenses</Link>
                    <Link to="/budget" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Wallet size={18} /> Budget</Link>
                    <Link to="/savings" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Target size={18} /> Savings</Link>
                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                    <span style={{ fontWeight: '500' }}>{user?.name}</span>
                    <button onClick={handleLogout} className="btn" style={{ background: 'transparent', color: 'var(--danger)', padding: '0.25rem' }}>
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
