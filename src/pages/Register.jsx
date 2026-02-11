import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Wallet, AlertCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        incomeLevel: 'Prefer not to say',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            setError('Please enter a valid phone number');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            await register({
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                incomeLevel: formData.incomeLevel,
                password: formData.password
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem 1rem',
            background: '#f8fafc'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                background: '#fff',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>CREATE ACCOUNT</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Join the professional finance tracker</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#b91c1c',
                        padding: '0.6rem',
                        borderRadius: '0',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Full Name</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="e.g. Kennedy Mutuku"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Phone</label>
                        <input
                            name="phoneNumber"
                            type="tel"
                            placeholder="+254..."
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Income Level</label>
                        <select
                            name="incomeLevel"
                            value={formData.incomeLevel}
                            onChange={handleChange}
                        >
                            <option value="Prefer not to say">Select Level</option>
                            <option value="Low">Below Ksh 20,000</option>
                            <option value="Middle">Ksh 20,000 - Ksh 50,000</option>
                            <option value="High">Above Ksh 50,000</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
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
                                    padding: '2px'
                                }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
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
                                    padding: '2px'
                                }}
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            marginTop: '0.5rem',
                            background: '#0f172a',
                            color: '#fff',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontSize: '0.85rem'
                        }}
                    >
                        {loading ? 'Processing...' : 'Register Account'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: '700' }}>LOGIN</Link>
                </p>
            </div>

            <style>{`
                .input-group input:focus, .input-group select:focus {
                    background: #fff;
                    border-color: #0f172a;
                    box-shadow: none;
                }
                label {
                    margin-bottom: 4px !important;
                }
            `}</style>
        </div>
    );
};

export default Register;
