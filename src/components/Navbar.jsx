import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LayoutDashboard, Receipt, TrendingUp, TrendingDown, Target, LogOut, Wallet, Menu, X, Users, User, Bot, Bell, Smartphone } from 'lucide-react';
import ProfileDrawer from './ProfileDrawer';
import NotificationCenter from './NotificationCenter';
import logo from '../assets/logo.png'; // Import the new logo

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mpesaPendingCount, setMpesaPendingCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.get('/notifications');
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch unread count');
        }
    };

    React.useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            const handleUpdate = () => fetchUnreadCount();
            window.addEventListener('notifications-updated', handleUpdate);

            // Poll M-Pesa pending count
            const fetchMpesaCount = async () => {
                try {
                    const { data } = await api.get('/mpesa/count');
                    setMpesaPendingCount(data.count || 0);
                } catch (_) {}
            };
            fetchMpesaCount();
            const mpesaInterval = setInterval(fetchMpesaCount, 30000);
            window.addEventListener('mpesa-updated', fetchMpesaCount);

            return () => {
                clearInterval(interval);
                clearInterval(mpesaInterval);
                window.removeEventListener('notifications-updated', handleUpdate);
                window.removeEventListener('mpesa-updated', fetchMpesaCount);
            };
        }
    }, [user]);

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
        { label: 'Notifications', path: '/notifications', icon: <Bell size={18} /> },
        { label: 'AI Advisor', path: '/ai-advisor', icon: <Bot size={18} /> },
        { label: 'M-Pesa Inbox', path: '/mpesa-review', icon: <Smartphone size={18} />, badge: mpesaPendingCount },
    ];

    return (
        <nav className="main-navbar" style={{
            marginBottom: '1rem',
            padding: '0.85rem 0', // Increased vertical padding
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
            <div className="container nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1440px' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '0.8rem', flexShrink: 0 }}>
                    <img
                        src={logo}
                        alt="CashFlowly Logo"
                        className="navbar-logo"
                        style={{ width: '38px', height: '38px' }} // Slightly larger logo
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontWeight: '900', fontSize: '1.25rem', color: '#1e293b', letterSpacing: '-0.03em', lineHeight: '1', display: 'flex', alignItems: 'center' }}>
                            CASHFLOWLY
                        </div>
                        <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.2em', lineHeight: '1' }}>
                            THE 50, 30, 20 RULE
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="nav-links" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'nowrap' }}>
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
                                transition: 'color 0.2s ease',
                                position: 'relative',
                                whiteSpace: 'nowrap'
                            }}>
                                {React.cloneElement(item.icon, { size: 14, color: isActive ? activeColor : 'currentColor' })}
                                {item.label}
                                {item.label === 'Notifications' && unreadCount > 0 && (
                                    <span style={{
                                        marginLeft: '0.4rem',
                                        background: '#ef4444',
                                        color: '#fff',
                                        fontSize: '0.55rem',
                                        fontWeight: '900',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                                        verticalAlign: 'middle'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                                {item.badge > 0 && item.label !== 'Notifications' && (
                                    <span style={{
                                        marginLeft: '0.4rem',
                                        background: '#059669',
                                        color: '#fff',
                                        fontSize: '0.55rem',
                                        fontWeight: '900',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(5,150,105,0.3)',
                                        verticalAlign: 'middle',
                                        animation: 'pulse 2s infinite'
                                    }}>
                                        {item.badge}
                                    </span>
                                )}
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

                {/* Mobile Toggle & Notifications */}
                <div className="mobile-only-flex" style={{ display: 'none', alignItems: 'center', gap: '1.25rem', paddingRight: '0.25rem' }}>
                    <Link to="/notifications" style={{ position: 'relative', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem' }}>
                        <Bell size={24} color="#0f172a" />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-6px',
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: '0.6rem',
                                fontWeight: '900',
                                minWidth: '18px',
                                height: '18px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 4px',
                                border: '2px solid #fff',
                                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                            }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>
                    <button
                        className="mobile-toggle"
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                    >
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Popover Menu - ONLY rendered when open */}
            {isOpen && (
                <>
                    <div 
                        className="sidebar-overlay open" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="mobile-sidebar open">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
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
                                            gap: '0.6rem',
                                            padding: '0.65rem 0.75rem',
                                            borderRadius: '0',
                                            background: isActive ? activeBg : 'transparent',
                                            color: isActive ? activeColor : '#475569',
                                            fontWeight: isActive ? '800' : '600',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.15s ease',
                                            borderLeft: isActive ? `3px solid ${activeColor}` : '3px solid transparent'
                                        }}
                                    >
                                        {React.cloneElement(item.icon, { size: 16, color: isActive ? activeColor : 'currentColor' })} 
                                        {item.label}
                                        {item.label === 'Notifications' && unreadCount > 0 && (
                                            <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '10px' }}>
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                            
                            <div style={{ padding: '0.4rem 0.75rem' }}>
                                <div style={{ height: '1px', background: '#f1f5f9', width: '100%' }} />
                            </div>

                            <div
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsProfileOpen(true);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.65rem 0.75rem',
                                    borderRadius: '6px',
                                    color: '#0f172a',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <User size={18} /> MY PROFILE
                            </div>
                            <button 
                                onClick={handleLogout} 
                                className="btn" 
                                style={{ 
                                    width: '100%', 
                                    background: '#fef2f2', 
                                    color: '#dc2626', 
                                    borderRadius: '0',
                                    padding: '0.75rem',
                                    fontSize: '0.85rem',
                                    justifyContent: 'center',
                                    marginTop: 'auto',
                                    gap: '0.5rem',
                                    border: 'none',
                                    borderTop: '1px solid #fee2e2'
                                }}
                            >
                                <LogOut size={16} /> LOGOUT
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .main-navbar { padding: 1.15rem 0 !important; }
                    .nav-links { display: none !important; }
                    .mobile-toggle { display: block !important; }
                    .mobile-only-flex { display: flex !important; align-items: center; gap: 1.5rem !important; }
                }
            `}</style>
            <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </nav>
    );
};

export default Navbar;
