import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
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
            if (res.data.token) {
                localStorage.setItem('admin_token', res.data.token);
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
        <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 relative overflow-hidden">
            <div className="card w-full max-w-sm relative z-10 px-8 py-10">
                <div className="text-center mb-8 flex flex-col items-center">
                    <img src="/logo.png" alt="Setorial" className="w-16 h-16 rounded-2xl shadow-sm mb-5" />
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        Sign in to admin
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Authenticate to access the control center</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-6">
                        <p className="text-red-600 font-medium text-sm text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 block">Email address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field w-full pl-10"
                                placeholder="admin@setorial.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 pb-2">
                        <label className="text-sm font-medium text-zinc-700 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-field w-full pl-10"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center h-10"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
