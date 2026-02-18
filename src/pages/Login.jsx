import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                background: '#fff',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>WELCOME BACK</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Login to your professional portal</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#b91c1c',
                        padding: '0.6rem',
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
                        <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" />
                    </div>
                    <div className="input-group">
                        <label style={{ color: '#475569', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
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
                    <button type="submit" className="btn btn-primary" style={{
                        width: '100%',
                        padding: '0.8rem',
                        marginTop: '0.5rem',
                        background: '#0f172a',
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.85rem'
                    }}>
                        Login
                    </button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: '700' }}>REGISTER</Link>
                </p>
            </div>

            <style>{`
                .input-group input:focus {
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

export default Login;
