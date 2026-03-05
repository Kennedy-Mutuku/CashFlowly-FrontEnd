import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ExternalLink, Calendar, AlertTriangle, ShieldCheck, Landmark, Trash2, Filter } from 'lucide-react';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            await api.put(`/notifications/${id}`);
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (err) {
            console.error('Failed to mark as read');
            fetchNotifications(); // rollback
        }
    };

    const deleteNotification = async (id) => {
        try {
            setNotifications(prev => prev.filter(n => n._id !== id));
            await api.delete(`/notifications/${id}`);
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (err) {
            console.error('Failed to delete notification');
            fetchNotifications();
        }
    };

    const handleResolve = async (n) => {
        if (!n.isRead) await markAsRead(n._id);
        if (n.link) navigate(n.link);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'budget': return <AlertTriangle size={20} color="#ef4444" />;
            case 'debt': return <Landmark size={20} color="#eab308" />;
            case 'saving': return <ShieldCheck size={20} color="#22c55e" />;
            default: return <Bell size={20} color="#2563eb" />;
        }
    };

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#0f172a', margin: 0 }}>Notification Hub</h2>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
                    {['all', 'unread', 'read'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                border: 'none',
                                background: filter === f ? '#fff' : 'transparent',
                                color: filter === f ? '#0f172a' : '#64748b',
                                fontWeight: '800',
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                boxShadow: filter === f ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: '700' }}>Loading alerts...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
                    <Bell size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>No notifications found</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>You're all caught up! New alerts will appear here as they arrive.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filtered.map(n => (
                        <div
                            key={n._id}
                            style={{
                                background: n.isRead ? '#f8fafc' : '#fff',
                                border: n.isRead ? '1px solid #e2e8f0' : '2px solid #0f172a',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1.5rem',
                                boxShadow: n.isRead ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.1)'
                            }}
                        >
                            {!n.isRead && <div style={{ position: 'absolute', left: '-2px', top: '10%', bottom: '10%', width: '4px', background: '#2563eb', borderRadius: '0 4px 4px 0' }}></div>}

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: n.isRead ? '#e2e8f0' : '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {getTypeIcon(n.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#0f172a' }}>{n.title}</h4>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', fontWeight: '600' }}>{n.message}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {!n.isRead && (
                                    <button
                                        onClick={() => markAsRead(n._id)}
                                        className="btn"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800' }}
                                    >
                                        MARK AS READ
                                    </button>
                                )}
                                {n.link && (
                                    <button
                                        onClick={() => handleResolve(n)}
                                        className="btn btn-primary"
                                        style={{ padding: '0.4rem 1rem', fontSize: '0.65rem', background: '#0f172a', fontWeight: '800' }}
                                    >
                                        RESOLVE
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(n._id)}
                                    style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.5rem', transition: 'color 0.2s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                                    title="Delete notification"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
