import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, ExternalLink, AlertTriangle, ShieldCheck, Landmark } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // Poll every 5 minutes for new alerts
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleUpdate = () => fetchNotifications();
        window.addEventListener('notifications-updated', handleUpdate);
        return () => window.removeEventListener('notifications-updated', handleUpdate);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const handleAction = (n) => {
        markAsRead(n._id);
        if (n.link) {
            navigate(n.link);
            setIsOpen(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'budget': return <AlertTriangle size={16} color="#ef4444" />;
            case 'debt': return <Landmark size={16} color="#eab308" />;
            case 'saving': return <ShieldCheck size={16} color="#22c55e" />;
            default: return <Bell size={16} color="#2563eb" />;
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isOpen ? '#2563eb' : '#64748b',
                    transition: 'color 0.2s ease'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: '900',
                        borderRadius: '10px',
                        minWidth: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        padding: '0 2px'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: '0',
                    width: '320px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    zIndex: 2000,
                    overflow: 'hidden',
                    animation: 'slideUp 0.2s ease-out'
                }}>
                    <style>{`
                        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    `}</style>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notifications</h4>
                        {unreadCount > 0 && <span style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: '700' }}>{unreadCount} UNREAD</span>}
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid #f8fafc',
                                        background: n.isRead ? 'transparent' : '#f0f7ff',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease',
                                        position: 'relative'
                                    }}
                                    onClick={() => handleAction(n)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = n.isRead ? '#f8fafc' : '#e0efff'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : '#f0f7ff'}
                                >
                                    {!n.isRead && <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '3px', background: '#2563eb' }}></div>}
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div style={{ marginTop: '2px' }}>{getTypeIcon(n.type)}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b' }}>{n.title}</div>
                                                {!n.isRead && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                                                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '2px' }}
                                                        title="Mark as Read"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginBottom: '8px' }}>{n.message}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' }}>
                                                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {n.link && (
                                                    <span style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                        RESOLVE <ExternalLink size={10} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                                <Bell size={32} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', margin: 0 }}>All caught up!</p>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '0.75rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}
                        >
                            VIEW HUB
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}
                        >
                            Close Panel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
