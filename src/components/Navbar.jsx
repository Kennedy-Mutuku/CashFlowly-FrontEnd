import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, TrendingUp, TrendingDown, Target, LogOut, Wallet, Menu, X, Users, User, Bot } from 'lucide-react';
import ProfileDrawer from './ProfileDrawer';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { label: 'Cash In', path: '/income', icon: <TrendingUp size={18} /> },
        { label: 'Cash Out', path: '/expenses', icon: <TrendingDown size={18} /> },
        { label: 'Budget', path: '/budget', icon: <Wallet size={18} /> },
        { label: 'Savings', path: '/savings', icon: <Target size={18} /> },
        { label: 'Debts', path: '/debts', icon: <Users size={18} /> },
        { label: 'AI Advisor', path: '/ai-advisor', icon: <Bot size={18} /> },
    ];

    return (
        <nav style={{
            marginBottom: '2rem',
            padding: '1.25rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '800', fontSize: '1.4rem', color: '#0f172a', letterSpacing: '-0.025em' }}>
                        <Wallet color="#2563eb" size={24} strokeWidth={2.5} />
                        CASHFLOWLY
                    </div>
                    <span style={{ fontSize: '0.55rem', fontWeight: '900', color: '#64748b', letterSpacing: '0.15em', marginTop: '-0.2rem', marginLeft: '2.4rem' }}>
                        THE 50, 30, 20 RULE
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="nav-links" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const activeColor = item.label === 'Cash Out' ? '#ef4444' : '#2563eb';
                        return (
                            <Link key={item.path} to={item.path} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.72rem',
                                fontWeight: isActive ? '900' : '600',
                                color: isActive ? activeColor : '#475569',
                                textTransform: 'uppercase',
                                padding: '0.4rem 0',
                                borderBottom: isActive ? `2px solid ${activeColor}` : '2px solid transparent',
                                transition: 'color 0.2s ease'
                            }}>
                                {React.cloneElement(item.icon, { size: 14, color: isActive ? activeColor : 'currentColor' })} {item.label}
                            </Link>
                        );
                    })}
                    <span style={{ color: '#e2e8f0' }}>|</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                            onClick={() => setIsProfileOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '750', fontSize: '0.72rem', color: '#0f172a', textDecoration: 'none', cursor: 'pointer' }}
                        >
                            <div style={{ padding: '0.4rem', background: '#f1f5f9', color: '#475569', borderRadius: '0' }}>
                                <User size={16} />
                            </div>
                            {user?.name?.toUpperCase()}
                        </div>
                        <button onClick={handleLogout} className="btn" style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            padding: '0.4rem',
                            borderRadius: '0',
                            border: '1px solid #fee2e2'
                        }}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ display: 'none', background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer' }}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="mobile-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    background: '#fff',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const activeColor = item.label === 'Cash Out' ? '#ef4444' : '#2563eb';
                        const activeBg = item.label === 'Cash Out' ? '#fef2f2' : '#eff6ff';
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    background: isActive ? activeBg : '#f8fafc',
                                    color: isActive ? activeColor : '#0f172a',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    textTransform: 'uppercase',
                                    borderLeft: isActive ? `4px solid ${activeColor}` : '4px solid transparent'
                                }}
                            >
                                {React.cloneElement(item.icon, { color: isActive ? activeColor : 'currentColor' })} {item.label}
                            </Link>
                        );
                    })}
                    <div
                        onClick={() => {
                            setIsOpen(false);
                            setIsProfileOpen(true);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem',
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            borderLeft: '4px solid #2563eb',
                            cursor: 'pointer'
                        }}
                    >
                        <User size={18} /> MY PROFILE
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{user?.name?.toUpperCase()}</span>
                        <button onClick={handleLogout} className="btn" style={{ background: '#fef2f2', color: '#dc2626', fontSize: '0.8rem', fontWeight: '700' }}>
                            LOGOUT
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .nav-links { display: none !important; }
                    .mobile-toggle { display: block !important; }
                }
            `}</style>
            <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </nav>
    );
};

export default Navbar;
