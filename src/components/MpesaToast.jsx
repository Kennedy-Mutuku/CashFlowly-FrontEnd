import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, X, ArrowRight } from 'lucide-react';

/**
 * MpesaToast — slides in from the bottom when a new M-Pesa SMS is detected.
 * Props:
 *   transaction: { amount, title, type }  — the parsed transaction to display
 *   onClose: () => void
 */
const MpesaToast = ({ transaction, onClose }) => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    // Animate in on mount
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 50);
        // Auto-dismiss after 12 seconds
        const dismiss = setTimeout(() => handleClose(), 12000);
        return () => { clearTimeout(t); clearTimeout(dismiss); };
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 350); // wait for slide-out animation
    };

    const handleReview = () => {
        handleClose();
        navigate('/mpesa-review');
    };

    const isIncome = transaction?.type === 'income' || transaction?.type === 'savings-withdrawal';
    const amountColor = isIncome ? '#059669' : '#dc2626';
    const amountPrefix = isIncome ? '+' : '-';

    return (
        <>
            <style>{`
                @keyframes mpesaSlideUp {
                    from { transform: translateY(120%); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @keyframes mpesaSlideDown {
                    from { transform: translateY(0);    opacity: 1; }
                    to   { transform: translateY(120%); opacity: 0; }
                }
                .mpesa-toast {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%) translateY(120%);
                    width: min(92vw, 420px);
                    background: #fff;
                    border-radius: 18px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1);
                    border: 2px solid #e2e8f0;
                    z-index: 99999;
                    overflow: hidden;
                    transition: none;
                }
                .mpesa-toast.visible {
                    animation: mpesaSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .mpesa-toast.hiding {
                    animation: mpesaSlideDown 0.35s ease-in forwards;
                }
                .mpesa-progress {
                    height: 3px;
                    background: linear-gradient(90deg, #059669, #10b981);
                    animation: shrink 12s linear forwards;
                    transform-origin: left;
                }
                @keyframes shrink {
                    from { transform: scaleX(1); }
                    to   { transform: scaleX(0); }
                }
            `}</style>

            <div className={`mpesa-toast ${visible ? 'visible' : ''}`}>
                {/* Progress bar */}
                <div className="mpesa-progress" />

                <div style={{ padding: '1rem 1.1rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #059669, #047857)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <Smartphone size={18} color="#fff" />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    📲 M-PESA Received
                                </p>
                                <p style={{ margin: 0, fontSize: '0.62rem', color: '#94a3b8', fontWeight: '600' }}>
                                    New transaction needs categorising
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '6px' }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Transaction details */}
                    <div style={{
                        background: '#f8fafc', borderRadius: '12px', padding: '0.7rem 0.9rem',
                        marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
                                {transaction?.title || 'M-PESA Transaction'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.67rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                                {isIncome ? 'Money received' : 'Payment made'}
                            </p>
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '900', color: amountColor, whiteSpace: 'nowrap' }}>
                            {amountPrefix} Ksh {Number(transaction?.amount || 0).toLocaleString()}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={handleReview}
                            style={{
                                flex: 1, padding: '0.6rem 1rem',
                                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                                color: '#fff', border: 'none', borderRadius: '10px',
                                fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.4rem', letterSpacing: '0.04em'
                            }}
                        >
                            CATEGORISE NOW <ArrowRight size={13} />
                        </button>
                        <button
                            onClick={handleClose}
                            style={{
                                padding: '0.6rem 0.9rem',
                                background: '#f1f5f9', color: '#64748b',
                                border: '1px solid #e2e8f0', borderRadius: '10px',
                                fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer'
                            }}
                        >
                            LATER
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MpesaToast;
