import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    CreditCard,
    LogOut,
    AlertTriangle,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { adminApi } from './api';

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 p-4 rounded-2xl font-bold transition-all ${active
            ? 'bg-primary border-2 border-b-4 border-primary-dark text-white'
            : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </button>
);

const StatCard = ({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: string | number, colorClass: string }) => (
    <div className="card">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
            <Icon size={24} className="text-white" />
        </div>
        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">{label}</p>
        <h3 className="text-3xl font-black mt-1">{value}</h3>
    </div>
);

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<any>(null);
    const [kycRequests, setKycRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const res = await adminApi.getDashboardStats();
                setStats(res.data);
            } else if (activeTab === 'kyc') {
                const res = await adminApi.getPendingKyc();
                setKycRequests(res.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveKyc = async (id: string) => {
        if (!confirm('Approve this KYC submission?')) return;
        try {
            await adminApi.approveKyc(id);
            fetchData();
        } catch (err) {
            alert('Failed to approve');
        }
    };

    const handleRejectKyc = async (id: string) => {
        const reason = prompt('Reason for rejection?');
        if (!reason) return;
        try {
            await adminApi.rejectKyc(id, reason);
            fetchData();
        } catch (err) {
            alert('Failed to reject');
        }
    };

    const renderContent = () => {
        if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <h2 className="text-4xl font-black">Platform Overview</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={TrendingUp} label="Month Revenue" value={`₦${stats?.currentMonthRevenue?.toLocaleString()}`} colorClass="bg-secondary" />
                            <StatCard icon={CreditCard} label="Total Liability" value={`₦${stats?.totalLiability?.toLocaleString()}`} colorClass="bg-primary" />
                            <StatCard icon={Clock} label="Pending KYC" value={stats?.pendingKycCount} colorClass="bg-accent" />
                            <StatCard icon={Users} label="Total Students" value={stats?.totalUsers} colorClass="bg-slate-700" />
                        </div>

                        {stats?.alert === 'LIABILITY EXCEEDS SAFE THRESHOLD' && (
                            <div className="bg-red-500/20 border-2 border-red-500 p-6 rounded-3xl flex items-center space-x-4">
                                <AlertTriangle size={32} className="text-red-500" />
                                <div>
                                    <h4 className="text-red-500 font-black text-xl">FINANCIAL ALERT</h4>
                                    <p className="font-bold">Total liability exceeds the 20% reward pool cap. Distribution ratio will be applied.</p>
                                </div>
                            </div>
                        )}

                        <div className="card">
                            <h3 className="text-xl font-bold mb-4">Latest Payout Batch</h3>
                            {stats?.latestPayoutBatch ? (
                                <div className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl border-2 border-slate-700">
                                    <div>
                                        <p className="text-sm font-bold text-gray-400">BATCH {stats.latestPayoutBatch.month}</p>
                                        <p className="text-lg font-black">{stats.latestPayoutBatch.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-400">Total Paid</p>
                                        <p className="text-lg font-black text-secondary">₦{Number(stats.latestPayoutBatch.totalPaid).toLocaleString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 font-bold">No payout batches recorded yet.</p>
                            )}
                        </div>
                    </div>
                );

            case 'kyc':
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <h2 className="text-4xl font-black">KYC Review Queue</h2>
                        {kycRequests.length === 0 ? (
                            <div className="card text-center py-20">
                                <CheckCircle2 size={64} className="mx-auto text-secondary mb-4 opacity-20" />
                                <p className="text-gray-400 font-bold text-xl">Queue is empty. Great job!</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {kycRequests.map((req: any) => (
                                    <div key={req.id} className="card flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">{req.tier}</span>
                                                <h4 className="font-black text-xl">{req.name}</h4>
                                            </div>
                                            <p className="font-bold text-gray-400">{req.email}</p>
                                            <div className="mt-2 text-sm bg-slate-900 p-3 rounded-xl border border-slate-700">
                                                <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Payout Account ({req.payoutMethod})</p>
                                                {req.payoutMethod === 'NGN_BANK' ? (
                                                    <p className="font-bold">{req.payoutAccount.bankName} • {req.payoutAccount.accountNumber} • <span className="text-white uppercase">{req.payoutAccount.accountName}</span></p>
                                                ) : (
                                                    <p className="font-bold">{req.payoutAccount.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex space-x-3 mt-4 md:mt-0">
                                            <button onClick={() => handleRejectKyc(req.id)} className="p-4 rounded-2xl bg-slate-700 hover:bg-red-500/20 text-gray-300 hover:text-red-500 border-2 border-b-4 border-slate-600 transition-all">
                                                <XCircle size={24} />
                                            </button>
                                            <button onClick={() => handleApproveKyc(req.id)} className="p-4 rounded-2xl bg-secondary hover:brightness-110 text-white border-2 border-b-4 border-secondary-dark transition-all">
                                                <CheckCircle2 size={24} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            default:
                return <div className="p-20 text-center font-bold text-gray-400">Coming soon...</div>;
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-80 bg-slate-900 border-r-2 border-slate-700 p-6 flex flex-col">
                <div className="mb-12">
                    <h1 className="text-3xl font-black italic tracking-tighter flex items-center">
                        <ShieldCheck size={32} className="text-primary mr-2" />
                        SETORIAL <span className="text-primary ml-1">ADMIN</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-500 uppercase mt-2 tracking-widest pl-10">Control Center</p>
                </div>

                <nav className="flex-1 space-y-3">
                    <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={ShieldCheck} label="KYC Review" active={activeTab === 'kyc'} onClick={() => setActiveTab('kyc')} />
                    <SidebarItem icon={Users} label="Students" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <SidebarItem icon={CreditCard} label="Payouts" active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} />
                </nav>

                <button onClick={() => { localStorage.removeItem('admin_token'); window.location.reload(); }} className="mt-auto flex items-center space-x-3 p-4 rounded-2xl font-bold text-red-500 hover:bg-red-500/10 transition-all">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-slate-900 p-12 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
}
