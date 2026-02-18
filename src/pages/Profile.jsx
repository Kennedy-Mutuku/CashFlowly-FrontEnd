import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Phone, TrendingUp, Save, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        incomeLevel: user?.incomeLevel || 'Prefer not to say',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

            // Update context and local storage
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            setMessage('Profile updated successfully');
            setFormData({ ...formData, password: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Account Settings</h1>
                <p style={{ color: '#64748b', fontWeight: '600' }}>Manage your professional profile and account security</p>
            </div>

            {message && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600' }}>
                    <CheckCircle size={20} /> {message}
                </div>
            )}

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <div className="card" style={{ padding: '2.5rem' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', textTransform: 'uppercase', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>Personal Information</h3>

                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input name="name" type="text" value={formData.name} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email Address (Read Only)</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input type="email" value={formData.email} disabled style={{ paddingLeft: '2.5rem', background: '#f8fafc', cursor: 'not-allowed' }} />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input name="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Income Level</label>
                                <div style={{ position: 'relative' }}>
                                    <TrendingUp size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <select name="incomeLevel" value={formData.incomeLevel} onChange={handleChange} style={{ paddingLeft: '2.5rem' }}>
                                        <option value="Low">Low (Below Ksh 20k)</option>
                                        <option value="Middle">Middle (Ksh 20k - 50k)</option>
                                        <option value="High">High (Above Ksh 50k)</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', textTransform: 'uppercase', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>Security</h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>Leave password fields blank if you do not want to change your password.</p>

                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>New Password</label>
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
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#94a3b8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '2px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Confirm New Password</label>
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
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#94a3b8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '2px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', pt: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: '#fff', padding: '0.8rem 2rem', fontWeight: '800' }}>
                            <Save size={18} /> {loading ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
