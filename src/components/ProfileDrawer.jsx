import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Phone, TrendingUp, Save, AlertCircle, CheckCircle, X, Eye, EyeOff, LogOut } from 'lucide-react';

const ProfileDrawer = ({ isOpen, onClose }) => {
    const { user, setUser, logout } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        incomeLevel: user?.incomeLevel || 'Prefer not to say',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.put('/auth/profile', {
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                incomeLevel: formData.incomeLevel,
                password: formData.password || undefined
            });

            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            setMessage('Profile updated successfully');
            setFormData({ ...formData, password: '', confirmPassword: '' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            height: '100vh',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s ease'
        }} onClick={onClose}>
            <div style={{
                width: '100%',
                maxWidth: '450px',
                background: '#fff',
                height: '100%',
                boxShadow: '-10px 0 25px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideIn 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0f172a' }}>Account Settings</h2>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Manage your professional profile</p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.5rem', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {message && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.6rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600' }}>
                            <CheckCircle size={16} /> {message}
                        </div>
                    )}

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '0.6rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <section>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Personal Information</h3>

                                <div className="input-group">
                                    <label>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input name="name" type="text" value={formData.name} onChange={handleChange} style={{ paddingLeft: '2.2rem' }} required />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Email (Immutable)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                                        <input type="email" value={formData.email} disabled style={{ paddingLeft: '2.2rem', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input name="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} required />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Income Level</label>
                                    <div style={{ position: 'relative' }}>
                                        <TrendingUp size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <select name="incomeLevel" value={formData.incomeLevel} onChange={handleChange} style={{ paddingLeft: '2.2rem' }}>
                                            <option value="Low">Low (Below Ksh 20k)</option>
                                            <option value="Middle">Middle (Ksh 20k - 50k)</option>
                                            <option value="High">High (Above Ksh 50k)</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Security</h3>
                                <div className="input-group">
                                    <label>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            style={{ paddingRight: '2.5rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Confirm Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            style={{ paddingRight: '2.5rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: '#0f172a', color: '#fff', padding: '1rem', fontWeight: '800', letterSpacing: '0.05em', fontSize: '0.9rem' }}>
                                <Save size={18} /> {loading ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="btn"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    fontWeight: '800',
                                    letterSpacing: '0.05em',
                                    border: '1px solid #fee2e2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.6rem',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <LogOut size={18} /> LOGOUT
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .input-group input:focus, .input-group select:focus {
                    border-color: #0f172a;
                    background: #fff;
                }
            `}</style>
        </div>
    );
};

export default ProfileDrawer;
