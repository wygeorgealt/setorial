import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { adminApi } from './api';

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await adminApi.login({ email, password });
            if (res.data.access_token) {
                localStorage.setItem('admin_token', res.data.access_token);
                // Assuming the backend returns role. If not, we just rely on the token
                onLoginSuccess();
            } else {
                setError('Invalid response from server');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Are you an admin?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Gamified Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="card w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-3xl border-2 border-b-4 border-slate-700 mb-4 transform -rotate-6">
                        <ShieldCheck size={40} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter">
                        SETORIAL <span className="text-primary">ADMIN</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2">Enter credentials to govern</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border-2 border-red-500/50 p-4 rounded-2xl mb-6">
                        <p className="text-red-400 font-bold text-sm text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field w-full pl-12"
                                placeholder="admin@setorial.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pb-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-field w-full pl-12"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center"
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : 'AUTHORIZE'}
                    </button>
                </form>
            </div>
        </div>
    );
}
