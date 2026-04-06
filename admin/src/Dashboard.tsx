import { useState, useEffect } from 'react';
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
    XCircle,
    Search,
    DollarSign,
    UserCheck,
    Globe,
    Map,
    Edit2,
    Trash2,
    Plus,
    RefreshCcw,
    BookOpen,
    Wand2,
    Layers,
    Ticket,
    Bell,
    Percent
} from 'lucide-react';
import { adminApi } from './api';

/* ─── Reusable Components ──────────────────────────────────────────────────── */

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: { icon: any; label: string; active: boolean; onClick: () => void; badge?: number }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all relative ${active
            ? 'bg-zinc-100/80 text-zinc-900'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'
            }`}
    >
        <Icon size={18} />
        <span className="text-sm">{label}</span>
        {badge !== undefined && badge > 0 && (
            <span className="ml-auto bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/10 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center justify-center">{badge}</span>
        )}
    </button>
);

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
    <div className="card">
        <div className="flex items-center space-x-4 mb-2 -mt-1">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-100`}>
                <Icon size={20} className="text-zinc-700" />
            </div>
            <p className="text-zinc-500 font-medium text-sm">{label}</p>
        </div>
        <h3 className="text-3xl font-semibold text-zinc-900 mt-2 tracking-tight">{value}</h3>
    </div>
);

const tierBadge = (tier: string) => {
    const styles: Record<string, string> = {
        FREE: 'bg-zinc-100 text-zinc-700 ring-zinc-500/10',
        BRONZE: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        SILVER: 'bg-slate-100 text-slate-700 ring-slate-500/20',
        GOLD: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    };
    const style = styles[tier] || styles.FREE;
    return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${style}`}>{tier}</span>;
};

const kycBadge = (status: string) => {
    const styles: Record<string, string> = {
        UNVERIFIED: 'bg-zinc-100 text-zinc-700 ring-zinc-500/10',
        PENDING: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
        APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        REJECTED: 'bg-red-50 text-red-700 ring-red-600/10',
    };
    const style = styles[status] || styles.UNVERIFIED;
    return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${style}`}>{status}</span>;
};

/* ─── Main Dashboard ───────────────────────────────────────────────────────── */

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<any>(null);
    const [kycRequests, setKycRequests] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [payoutBatches, setPayoutBatches] = useState<any[]>([]);
    const [pricingList, setPricingList] = useState<any[]>([]);
    const [regionalStats, setRegionalStats] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [mocks, setMocks] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingSyllabus, setGeneratingSyllabus] = useState(false);

    // Lesson Modal State
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any>(null);
    const [lessonForm, setLessonForm] = useState({ name: '', content: '', videoFile: null as File | null });

    // Mock AI Modal State
    const [isMockAiModalOpen, setIsMockAiModalOpen] = useState(false);
    const [mockAiForm, setMockAiForm] = useState({ subjectId: '', title: '', numQuestions: '30' });

    // Filters
    const [tierFilter, setTierFilter] = useState('');
    const [kycFilter, setKycFilter] = useState('');
    const [flagFilter, setFlagFilter] = useState('');
    const [userSearch, setUserSearch] = useState('');

    // Payout trigger
    const [payoutMonth, setPayoutMonth] = useState('');
    const [payoutRevenue, setPayoutRevenue] = useState('');

    // Notifications
    const [broadcastType, setBroadcastType] = useState<'push' | 'email'>('push');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    // Pricing Modal
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [editingPricing, setEditingPricing] = useState<any>(null);
    const [pricingForm, setPricingForm] = useState({
        countryCode: '',
        countryName: '',
        economicTier: 'TIER_C',
        multiplier: '1.0',
        currency: 'USD',
        bronzeMonthly: '0',
        silverMonthly: '0',
        goldMonthly: '0',
        bronzeAnnual: '0',
        silverAnnual: '0',
        goldAnnual: '0',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, [activeTab, tierFilter, kycFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const res = await adminApi.getDashboardStats();
                setStats(res.data);
            } else if (activeTab === 'kyc') {
                const res = await adminApi.getPendingKyc();
                setKycRequests(res.data);
            } else if (activeTab === 'users') {
                const params: any = {};
                if (tierFilter) params.tier = tierFilter;
                if (kycFilter) params.kycStatus = kycFilter;
                const res = await adminApi.getUsers(params);
                setUsers(res.data);
            } else if (activeTab === 'payouts') {
                const res = await adminApi.getPayoutBatches();
                setPayoutBatches(res.data);
            } else if (activeTab === 'pricing') {
                const res = await adminApi.getPricing();
                setPricingList(res.data);
            } else if (activeTab === 'regions') {
                const res = await adminApi.getRegionalStats();
                setRegionalStats(res.data);
            } else if (activeTab === 'learning') {
                const res = await adminApi.getSubjects();
                setSubjects(res.data);
            } else if (activeTab === 'mocks') {
                const res = await adminApi.getMocks();
                setMocks(res.data);
            } else if (activeTab === 'discounts') {
                const res = await adminApi.getDiscounts();
                setDiscounts(res.data);
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
        } catch (err) { alert('Failed to approve'); }
    };

    const handleRejectKyc = async (id: string) => {
        const reason = prompt('Reason for rejection?');
        if (!reason) return;
        try {
            await adminApi.rejectKyc(id, reason);
            fetchData();
        } catch (err) { alert('Failed to reject'); }
    };

    const handleFreezeUser = async (id: string, currentStatus: boolean) => {
        try {
            await adminApi.freezeUser(id, !currentStatus);
            fetchData();
        } catch (err) { alert('Failed to update freeze status'); }
    };

    const handleFlagUser = async (id: string, currentStatus: boolean) => {
        try {
            await adminApi.flagUser(id, !currentStatus);
            fetchData();
        } catch (err) { alert('Failed to update flag status'); }
    };

    const handleTriggerPayout = async () => {
        if (!payoutMonth || !payoutRevenue) { alert('Enter month (e.g. 2026-03) and revenue amount.'); return; }
        if (!confirm(`Trigger payout for ${payoutMonth} with ₦${Number(payoutRevenue).toLocaleString()} revenue?`)) return;
        try {
            await adminApi.triggerPayout(payoutMonth, Number(payoutRevenue));
            alert('Payout triggered successfully!');
            setPayoutMonth('');
            setPayoutRevenue('');
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Payout failed');
        }
    };

    const openPricingModal = (pricing: any = null) => {
        if (pricing) {
            setEditingPricing(pricing);
            setPricingForm({
                ...pricing,
                multiplier: String(pricing.multiplier),
                bronzeMonthly: String(pricing.bronzeMonthly),
                silverMonthly: String(pricing.silverMonthly),
                goldMonthly: String(pricing.goldMonthly),
                bronzeAnnual: String(pricing.bronzeAnnual),
                silverAnnual: String(pricing.silverAnnual),
                goldAnnual: String(pricing.goldAnnual),
            });
        } else {
            setEditingPricing(null);
            setPricingForm({
                countryCode: '',
                countryName: '',
                economicTier: 'TIER_C',
                multiplier: '1.0',
                currency: 'USD',
                bronzeMonthly: '0',
                silverMonthly: '0',
                goldMonthly: '0',
                bronzeAnnual: '0',
                silverAnnual: '0',
                goldAnnual: '0',
                isActive: true
            });
        }
        setIsPricingModalOpen(true);
    };

    const handleSavePricing = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...pricingForm,
                multiplier: Number(pricingForm.multiplier),
                bronzeMonthly: Number(pricingForm.bronzeMonthly),
                silverMonthly: Number(pricingForm.silverMonthly),
                goldMonthly: Number(pricingForm.goldMonthly),
                bronzeAnnual: Number(pricingForm.bronzeAnnual),
                silverAnnual: Number(pricingForm.silverAnnual),
                goldAnnual: Number(pricingForm.goldAnnual),
            };

            if (editingPricing) {
                await adminApi.updatePricing(editingPricing.id, payload);
            } else {
                await adminApi.createPricing(payload);
            }
            setIsPricingModalOpen(false);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save pricing configuration');
        }
    };

    const handleDeletePricing = async (id: string, countryName: string) => {
        if (!confirm(`Are you sure you want to delete pricing for ${countryName}? This will permanently remove the configuration for this region.`)) return;
        try {
            await adminApi.deletePricing(id);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete pricing');
        }
    };




    const handleGenerateAiLevels = async (subjectId: string, topicName: string) => {
        const numLevels = prompt('How many levels (lessons) should the AI generate? (e.g. 5)');
        if (!numLevels || isNaN(Number(numLevels))) return;

        if (!confirm(`Generate ${numLevels} AI levels for "${topicName}"? This will generate textbook-length content. This may take up to a minute.`)) return;
        
        setLoading(true);
        try {
            await adminApi.generateAiLevels({ subjectId, topicName, numLevels: Number(numLevels) });
            alert('Levels successfully generated!');
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to generate levels.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateLesson = async (lessonId: string, lessonName: string) => {
        if (!confirm(`Are you sure you want to REGENERATE AI content for "${lessonName}"? This will overwrite the current content and questions with deep textbook-style material.`)) return;
        
        setLoading(true);
        try {
            await adminApi.regenerateLesson(lessonId);
            alert('Lesson successfully regenerated with high-depth content!');
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to regenerate lesson');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAiMock = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminApi.generateAiMock({ 
                subjectId: mockAiForm.subjectId, 
                title: mockAiForm.title, 
                numQuestions: Number(mockAiForm.numQuestions) 
            });
            alert('AI Mock Exam generated successfully!');
            setIsMockAiModalOpen(false);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to generate mock exam');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubject = async () => {
        const name = prompt('Subject Name? (e.g. Mathematics)');
        const iconInfo = prompt('Icon Identifier or URL? (e.g. math)');
        
        if (name && iconInfo) {
            try {
                setLoading(true);
                const res = await adminApi.createSubject({ name, iconInfo, description: 'New Subject' });
                const subjectId = res.data.id;

                const numTopics = prompt('How many topics should the AI generate for this subject? (e.g. 5)');
                if (numTopics && !isNaN(Number(numTopics))) {
                    setLoading(false);
                    setGeneratingSyllabus(true);
                    try {
                        await adminApi.generateFullSubject({ subjectId, numTopics: Number(numTopics) });
                        alert('Full Subject Syllabus Generated Successfully!');
                    } catch (err: any) {
                        alert(err.response?.data?.message || 'AI Generation partially failed. Please check the subject.');
                    } finally {
                        setGeneratingSyllabus(false);
                    }
                }
                fetchData();
            } catch (err) { 
                alert('Failed to create subject'); 
                setLoading(false);
            }
        }
    };

    const handleCreateTopic = async (subjectId: string) => {
        const name = prompt('Topic Name? (e.g. Data Structures)');
        const description = prompt('Description?');
        const order = prompt('Order index? (e.g. 1)');
        if (name && order) {
            try {
                await adminApi.createTopic({ subjectId, name, description: description || '', order: Number(order) });
                fetchData();
            } catch (err) { alert('Failed to create'); }
        }
    };

    const handleDeleteSubject = async (id: string, name: string) => {
        if (!confirm(`Delete subject "${name}" and ALL its topics and lessons? This cannot be undone.`)) return;
        try {
            await adminApi.deleteSubject(id);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete subject');
        }
    };

    const handleDeleteTopic = async (id: string, name: string) => {
        if (!confirm(`Delete topic "${name}" and ALL its lessons?`)) return;
        try {
            await adminApi.deleteTopic(id);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete topic');
        }
    };

    const handleCreateMock = async () => {
        const title = prompt('Mock Exam Title?');
        const description = prompt('Description?');
        const duration = prompt('Duration (minutes)?');
        const price = prompt('Price (NGN)?');
        if (title && duration && price) {
            try {
                // For simplicity, we create with 0 questions initially or prompt for JSON
                await adminApi.createMock({ 
                    title, 
                    description, 
                    durationMinutes: Number(duration), 
                    price: Number(price),
                    questions: [] 
                });
                fetchData();
            } catch (err) { alert('Failed to create mock'); }
        }
    };

    const handleDeleteMock = async (id: string, title: string) => {
        if (!confirm(`Delete mock exam "${title}"?`)) return;
        try {
            await adminApi.deleteMock(id);
            fetchData();
        } catch (err) { alert('Failed to delete mock'); }
    };

    const handleSendBroadcast = async () => {
        const title = prompt('Notification Title?');
        const body = prompt('Notification Message?');
        if (title && body) {
            try {
                await adminApi.sendNotification({ title, body });
                alert('Push broadcast notification queued!');
            } catch (err) { alert('Failed to send push notification'); }
        }
    };

    const handleSendEmailBroadcast = async () => {
        if (!emailSubject || !emailBody) {
            alert('Please enter both subject and body for the email broadcast.');
            return;
        }

        if (!confirm(`Are you sure you want to send this email to all verified students?`)) return;

        setLoading(true);
        try {
            await adminApi.sendEmailBroadcast({ subject: emailSubject, body: emailBody });
            alert('Email broadcast sent successfully!');
            setEmailSubject('');
            setEmailBody('');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to send email broadcast');
        } finally {
            setLoading(false);
        }
    };

    const handleEditLesson = (lesson: any) => {
        setEditingLesson(lesson);
        setLessonForm({
            name: lesson.name,
            content: lesson.content || '',
            videoFile: null
        });
        setIsLessonModalOpen(true);
    };

    const handleSaveLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', lessonForm.name);
            formData.append('content', lessonForm.content);
            if (lessonForm.videoFile) {
                formData.append('video', lessonForm.videoFile);
            }

            await adminApi.updateLesson(editingLesson.id, formData);
            alert('Lesson updated successfully!');
            setIsLessonModalOpen(false);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update lesson');
        } finally {
            setLoading(false);
        }
    };

    /* ─── Tab Content ──────────────────────────────────────────────────────── */

    const renderContent = () => {
        if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

        switch (activeTab) {

            /* ── LEARNING CONTENT ────────────────────────────────────────── */
            case 'learning':
                return (
                    <div className="space-y-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Learning Journeys</h2>
                                <p className="text-sm text-zinc-500 mt-1">Manage subjects, topics, and automatically generate lessons via AI.</p>
                            </div>
                            <button
                                onClick={handleCreateSubject}
                                className="btn-primary h-10 px-6 text-sm"
                            >
                                <Plus size={18} className="mr-2" />
                                Create Subject
                            </button>
                        </div>

                        {subjects.length === 0 ? (
                            <div className="card text-center py-20 bg-zinc-50/50">
                                <BookOpen size={48} className="mx-auto text-zinc-300 mb-4" />
                                <h3 className="text-lg font-medium text-zinc-900">No Subjects Found</h3>
                                <p className="text-zinc-500 mt-1">Create your first subject to start building the learning pathway.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {subjects.map((subject: any) => (
                                    <div key={subject.id} className="card p-6 border border-zinc-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/50">
                                                    <BookOpen size={24} className="text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-zinc-900">{subject.name}</h3>
                                                    <p className="text-sm text-zinc-500">{subject.topics?.length || 0} Topics Available</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setMockAiForm({ ...mockAiForm, subjectId: subject.id, title: `AI Mock Exam for ${subject.name}` });
                                                        setIsMockAiModalOpen(true);
                                                    }}
                                                    className="btn-secondary h-9 px-4 text-xs !bg-purple-50 !text-purple-700 !ring-purple-200"
                                                >
                                                    <Wand2 size={14} className="mr-2" />
                                                    AI Mock
                                                </button>
                                                <button
                                                    onClick={() => handleCreateTopic(subject.id)}
                                                    className="btn-secondary h-9 px-4 text-xs"
                                                >
                                                    <Plus size={14} className="mr-2" />
                                                    Add Topic
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSubject(subject.id, subject.name)}
                                                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors ring-1 ring-red-200"
                                                    title="Delete Subject"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        {subject.topics?.length > 0 ? (
                                            <div className="space-y-3">
                                                {subject.topics.map((topic: any) => (
                                                    <div key={topic.id} className="bg-zinc-50 rounded-xl ring-1 ring-zinc-200/60 flex flex-col overflow-hidden">
                                                        <div className="p-4 flex items-center justify-between bg-white border-b border-zinc-100">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center shadow-sm border border-zinc-200">
                                                                    <Layers size={16} className="text-zinc-500" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-zinc-900 text-sm">{topic.name}</h4>
                                                                    <p className="text-xs text-zinc-500">{topic.lessons?.length || 0} Levels (Lessons) included</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {(!topic.lessons || topic.lessons.length === 0) ? (
                                                                    <button
                                                                        onClick={() => handleGenerateAiLevels(subject.id, topic.name)}
                                                                        className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-lg transition-colors text-xs ring-1 ring-purple-600/20"
                                                                    >
                                                                        <Wand2 size={14} />
                                                                        <span>Generate AI Course</span>
                                                                    </button>
                                                                ) : (
                                                                    <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 rounded-lg text-xs ring-1 ring-emerald-600/20">
                                                                        <CheckCircle2 size={14} />
                                                                        <span>AI Generated</span>
                                                                    </div>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteTopic(topic.id, topic.name)}
                                                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors ring-1 ring-red-200"
                                                                    title="Delete Topic"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {topic.lessons && topic.lessons.length > 0 && (
                                                            <div className="bg-zinc-50 px-4 py-3 space-y-2">
                                                                {topic.lessons.map((lesson: any) => (
                                                                    <div key={lesson.id} className="flex items-center justify-between text-sm py-1 border-b border-zinc-200 last:border-0 hover:bg-zinc-100/50 px-2 rounded-md transition-colors">
                                                                        <span className="text-zinc-700 font-medium">Lvl {lesson.order}: {lesson.name}</span>
                                                                        <div className="flex items-center space-x-3">
                                                                            <button 
                                                                                onClick={() => handleRegenerateLesson(lesson.id, lesson.name)}
                                                                                className="text-[10px] text-purple-600 hover:text-purple-800 font-bold uppercase tracking-wider px-2 py-1 rounded-md hover:bg-purple-50 transition-colors flex items-center"
                                                                                title="Regenerate with High Depth AI"
                                                                            >
                                                                                <RefreshCcw size={12} className="mr-1" />
                                                                                Regen AI
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleEditLesson(lesson)}
                                                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                                                                            >
                                                                                Edit & Video
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-zinc-50 p-6 rounded-xl border border-dashed border-zinc-300 text-center">
                                                <p className="text-zinc-500 text-sm">No topics added to this subject yet.</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            /* ── OVERVIEW ───────────────────────────────────────────────── */
            case 'overview':
                return (
                    <div className="space-y-10">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Platform Overview</h2>
                            <p className="text-sm text-zinc-500 mt-1">Real-time health and financial metrics for Setorial.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={TrendingUp} label="Month Revenue" value={`₦${(stats?.currentMonthRevenue ?? 0).toLocaleString()}`} />
                            <StatCard icon={CreditCard} label="Total Liability" value={`₦${(stats?.totalLiability ?? 0).toLocaleString()}`} />
                            <StatCard icon={Clock} label="Pending KYC" value={stats?.pendingKycCount ?? 0} />
                            <StatCard icon={Users} label="Total Students" value={stats?.totalUsers ?? 0} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StatCard icon={UserCheck} label="Approved KYC" value={stats?.approvedKycCount ?? 0} />
                            <StatCard icon={DollarSign} label="Reward Pool Cap" value={`₦${(stats?.rewardPoolCap ?? 0).toLocaleString()}`} />
                        </div>

                        {stats?.alert === 'LIABILITY EXCEEDS SAFE THRESHOLD' && (
                            <div className="bg-amber-50 ring-1 ring-inset ring-amber-600/20 p-5 rounded-xl flex items-center space-x-4">
                                <AlertTriangle size={24} className="text-amber-600" />
                                <div>
                                    <h4 className="text-amber-900 font-semibold text-sm">Financial Alert: Liability Ratio High</h4>
                                    <p className="text-amber-800 text-sm mt-0.5">Total liability exceeds the 20% reward pool cap. Distribution ratio: {((stats?.liabilityRatio ?? 0) * 100).toFixed(1)}%</p>
                                </div>
                            </div>
                        )}

                        <div className="card !p-0 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                                <h3 className="text-sm font-semibold text-zinc-900">Latest Payout Batch</h3>
                            </div>
                            <div className="p-6">
                                {stats?.latestPayoutBatch ? (
                                    <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-lg ring-1 ring-zinc-200">
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">MONTH {stats.latestPayoutBatch.month}</p>
                                            <p className="text-sm font-semibold text-zinc-900 mt-0.5 capitalize">{stats.latestPayoutBatch.status.toLowerCase()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Paid</p>
                                            <p className="text-sm font-bold text-secondary mt-0.5">₦{Number(stats.latestPayoutBatch.totalPaid).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-zinc-500 text-sm italic">No payout batches recorded yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            /* ── KYC REVIEW ─────────────────────────────────────────────── */
            case 'kyc':
                return (
                    <div className="space-y-10">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">KYC Review Queue</h2>
                            <p className="text-sm text-zinc-500 mt-1">Manual verification for student payout accounts.</p>
                        </div>

                        {kycRequests.length === 0 ? (
                            <div className="card flex flex-col items-center justify-center py-24 bg-zinc-50/50 border-dashed">
                                <CheckCircle2 size={40} className="text-zinc-300 mb-3" />
                                <p className="text-zinc-500 font-medium">No pending requests. All clear!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {kycRequests.map((req: any) => (
                                    <div key={req.id} className="card flex flex-col md:flex-row justify-between items-start md:items-center py-5">
                                        <div className="space-y-1.5 flex-1 w-full">
                                            <div className="flex items-center space-x-3">
                                                <h4 className="font-semibold text-zinc-900">{req.name || 'Unnamed Student'}</h4>
                                                {tierBadge(req.tier)}
                                            </div>
                                            <p className="text-sm text-zinc-500">{req.email} • <span className="text-[10px]">SUBMITTED {new Date(req.createdAt).toLocaleDateString()}</span></p>

                                            <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4 bg-zinc-50 p-4 rounded-lg ring-1 ring-zinc-200">
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Payout Method: {req.payoutMethod}</p>
                                                    {req.payoutMethod === 'NGN_BANK' ? (
                                                        <p className="text-sm font-medium text-zinc-700">{req.payoutAccount?.bankName} • {req.payoutAccount?.accountNumber} • <span className="uppercase">{req.payoutAccount?.accountName}</span></p>
                                                    ) : (
                                                        <p className="text-sm font-medium text-zinc-700">{req.payoutAccount?.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2 mt-6 md:mt-0 ml-0 md:ml-6">
                                            <button onClick={() => handleRejectKyc(req.id)} className="btn-secondary h-10 px-4 text-xs">
                                                <XCircle size={16} className="mr-2 text-zinc-400" />
                                                Reject
                                            </button>
                                            <button onClick={() => handleApproveKyc(req.id)} className="btn-primary h-10 px-4 text-xs">
                                                <CheckCircle2 size={16} className="mr-2" />
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            /* ── STUDENTS ───────────────────────────────────────────────── */
            case 'users':
                return (
                    <div className="space-y-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Student Directory</h2>
                                <p className="text-sm text-zinc-500 mt-1">Manage all platform users and their monetization levels.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={tierFilter}
                                    onChange={(e) => setTierFilter(e.target.value)}
                                    className="input-field w-32 h-10 py-0 text-xs font-medium cursor-pointer"
                                >
                                    <option value="">All Tiers</option>
                                    <option value="FREE">Free</option>
                                    <option value="BRONZE">Bronze</option>
                                    <option value="SILVER">Silver</option>
                                    <option value="GOLD">Gold</option>
                                </select>
                                <select
                                    value={kycFilter}
                                    onChange={(e) => setKycFilter(e.target.value)}
                                    className="input-field w-36 h-10 py-0 text-xs font-medium cursor-pointer"
                                >
                                    <option value="">All KYC Status</option>
                                    <option value="UNVERIFIED">Unverified</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                                <select
                                    value={flagFilter}
                                    onChange={(e) => setFlagFilter(e.target.value)}
                                    className="input-field w-28 h-10 py-0 text-xs font-medium cursor-pointer"
                                >
                                    <option value="">All Health</option>
                                    <option value="FLAGGED">Flagged</option>
                                    <option value="HEALTHY">Healthy</option>
                                </select>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="input-field pl-10 h-10 py-0 text-xs"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card !p-0 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-50 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Tier</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">KYC Status</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Points</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {users
                                        .filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                                        .filter(u => flagFilter === '' || (flagFilter === 'FLAGGED' ? u.isFlagged : !u.isFlagged))
                                        .map((u: any) => (
                                            <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-zinc-900">{u.name || 'Setorial Student'}</div>
                                                    <div className="text-xs text-zinc-500">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">{tierBadge(u.tier)}</td>
                                                <td className="px-6 py-4 text-center">{kycBadge(u.kycStatus)}</td>
                                                <td className="px-6 py-4 text-center space-y-1">
                                                    {u.isFrozen && <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10">FROZEN</span>}
                                                    {u.isFlagged && <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-[10px] font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10">FLAGGED</span>}
                                                    {!u.isFrozen && !u.isFlagged && <span className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-700 ring-1 ring-inset ring-zinc-500/10">HEALTHY</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-zinc-900">{(u.points ?? 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleFlagUser(u.id, u.isFlagged)}
                                                            className={`p-1.5 rounded-lg border ${u.isFlagged ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-zinc-200 text-zinc-400 hover:text-orange-600'}`}
                                                            title={u.isFlagged ? 'Unflag Account' : 'Flag for Review'}
                                                        >
                                                            <AlertTriangle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleFreezeUser(u.id, u.isFrozen)}
                                                            className={`p-1.5 rounded-lg border ${u.isFrozen ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-zinc-200 text-zinc-400 hover:text-red-600'}`}
                                                            title={u.isFrozen ? 'Unfreeze Wallet' : 'Freeze Wallet'}
                                                        >
                                                            <ShieldCheck size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            /* ── PAYOUTS ────────────────────────────────────────────────── */
            case 'payouts':
                return (
                    <div className="space-y-10">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Payout Management</h2>
                            <p className="text-sm text-zinc-500 mt-1">Simulate and trigger automated monthly rewards.</p>
                        </div>

                        <div className="card bg-zinc-900 text-white !border-0 shadow-lg">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center">
                                        <RefreshCcw size={20} className="mr-2 text-zinc-400" />
                                        Next Payout Cycle
                                    </h3>
                                    <p className="text-zinc-400 text-sm mt-1">Triggers automatically on the 28th, but can be forced manually.</p>
                                </div>
                                <div className="flex items-center space-x-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-48">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₦</span>
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-800 border-0 ring-1 ring-zinc-700/50 rounded-lg py-2 pl-7 pr-3 text-sm focus:ring-zinc-600"
                                            placeholder="Simulate Revenue"
                                            value={payoutRevenue} // Assuming payoutRevenue is the correct state variable
                                            onChange={(e) => setPayoutRevenue(e.target.value)} // Assuming setPayoutRevenue is the correct state setter
                                        />
                                    </div>
                                    <button onClick={handleTriggerPayout} className="btn-secondary !bg-white !text-zinc-900 !ring-0 hover:!bg-zinc-100 h-9 px-6 text-sm">
                                        Trigger Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-zinc-900 px-1">Payout History</h3>
                            <div className="card !p-0 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-zinc-50 border-b border-zinc-100">
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Month</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Amount Paid</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {payoutBatches.map((batch: any) => (
                                            <tr key={batch.id} className="hover:bg-zinc-50/50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-zinc-900 uppercase">MONTH {batch.month}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${batch.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                                        }`}>
                                                        {batch.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-zinc-900">₦{Number(batch.totalPaid).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-xs text-zinc-500">{new Date(batch.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            /* ── GLOBAL PRICING ─────────────────────────────────────────── */
            case 'pricing':
                return (
                    <div className="space-y-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Geo-Pricing Config</h2>
                                <p className="text-sm text-zinc-500 mt-1">Configure subscription costs per country.</p>
                            </div>
                            <button
                                onClick={() => openPricingModal()}
                                className="btn-primary h-10 px-6 text-sm"
                            >
                                <Plus size={18} className="mr-2" />
                                Add Country
                            </button>
                        </div>

                        <div className="card !p-0 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-50 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Country</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Multiplier</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Bronze</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Silver</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Gold</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {pricingList.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-zinc-900">{p.countryName}</div>
                                                <div className="text-[10px] font-bold text-zinc-400 tracking-wider font-mono">{p.countryCode}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 ring-1 ring-inset ring-zinc-500/10 uppercase">
                                                    {p.economicTier} ({p.multiplier}x)
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs font-medium text-zinc-600">
                                                {p.currency} {Number(p.bronzeMonthly).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs font-medium text-zinc-600">
                                                {p.currency} {Number(p.silverMonthly).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs font-medium text-zinc-600">
                                                {p.currency} {Number(p.goldMonthly).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end space-x-1">
                                                    <button onClick={() => openPricingModal(p)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeletePricing(p.id, p.countryName)} className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            /* ── REGIONAL STATS ─────────────────────────────────────────── */
            case 'regions':
                return (
                    <div className="space-y-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Regional Reward Pools</h2>
                                <p className="text-sm text-zinc-500 mt-1">Live reward pool metrics isolated per country.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {regionalStats.map((reg: any) => {
                                return (
                                    <div key={reg.country} className="card relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-zinc-900">{reg.country || 'Global'}</h3>
                                                <p className="text-xs text-zinc-500 font-medium">Regional Liability</p>
                                            </div>
                                            <Globe size={20} className="text-zinc-100" />
                                        </div>
                                        <div className="flex items-baseline space-x-2">
                                            <span className="text-2xl font-bold text-zinc-900">₦{Number(reg.liability).toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Liability</span>
                                        </div>
                                        <div className="mt-6 space-y-3">
                                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${reg.isHealthy ? 'bg-zinc-900' : 'bg-amber-500'}`}
                                                    style={{ width: `${Math.min(100, (reg.liability / reg.poolCap) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                                <span className="text-zinc-400">Pool: ₦{Number(reg.poolCap).toLocaleString()}</span>
                                                <span className={reg.isHealthy ? 'text-zinc-900' : 'text-amber-600'}>
                                                    {((reg.liability / reg.poolCap) * 100).toFixed(1)}% Used
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            /* ── DISCOUNTS ─────────────────────────────────────────────── */
            case 'discounts':
                return (
                    <div className="space-y-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Discount & Promo Codes</h2>
                                <p className="text-sm text-zinc-500 mt-1">Manage active promotional campaigns and track usage.</p>
                            </div>
                            <button className="btn-primary h-10 px-6 text-sm" onClick={() => {
                                const code = prompt('Enter code:');
                                const percent = prompt('Enter discount percent (e.g. 10):');
                                if (code && percent) {
                                    adminApi.createDiscount({ code, discountPercent: Number(percent) }).then(() => fetchData());
                                }
                            }}>
                                <Plus size={18} className="mr-2" />
                                Create New Code
                            </button>
                        </div>
                        <div className="card !p-0 overflow-hidden shadow-sm">
                            <AdminDiscountsTable />
                        </div>
                    </div>
                );

            /* ── MOCK EXAMS ─────────────────────────────────────────────── */
            case 'mocks':
                return (
                    <div className="space-y-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Mock Exam Management</h2>
                                <p className="text-sm text-zinc-500 mt-1">Create and manage standardized practice exams.</p>
                            </div>
                            <button className="btn-primary h-10 px-6 text-sm" onClick={handleCreateMock}>
                                <Plus size={18} className="mr-2" />
                                Create Mock Exam
                            </button>
                        </div>
                        <div className="space-y-4">
                            {mocks.map((mock: any) => (
                                <div key={mock.id} className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                                            <Ticket size={24} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-900">{mock.title}</h4>
                                            <p className="text-sm text-zinc-500">{mock.durationMinutes} mins • ₦{Number(mock.price).toLocaleString()} • {mock._count?.questions ?? 0} Questions</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMock(mock.id, mock.title)}
                                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors ring-1 ring-red-200"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            /* ── NOTIFICATIONS ───────────────────────────────────────────── */
            case 'notifications':
                return (
                    <div className="space-y-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Broadcast Center</h2>
                                <p className="text-sm text-zinc-500 mt-1">Communicate with your students via Push or Email.</p>
                            </div>
                            <div className="flex bg-zinc-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setBroadcastType('push')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${broadcastType === 'push' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                >
                                    Push Notification
                                </button>
                                <button
                                    onClick={() => setBroadcastType('email')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${broadcastType === 'email' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                >
                                    Email Broadcast
                                </button>
                            </div>
                        </div>

                        {broadcastType === 'push' ? (
                            <div className="card p-8 bg-zinc-900 text-white max-w-2xl border-0 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Broadcast Target</label>
                                        <div className="p-3 bg-zinc-800/50 rounded-lg flex items-center space-x-3 ring-1 ring-zinc-800">
                                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                <Users size={16} className="text-zinc-400" />
                                            </div>
                                            <span className="text-sm font-medium">All Platform Users with Push Enabled</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSendBroadcast}
                                        className="w-full h-12 bg-white text-zinc-900 font-bold rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <Bell size={18} />
                                        <span>Compose & Send Push</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Email Subject</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="e.g. Big Updates to the Platform!"
                                            value={emailSubject}
                                            onChange={(e) => setEmailSubject(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Content (HTML Supported)</label>
                                            <span className="text-[10px] text-zinc-400 font-medium">Wrapped in Setorial Template</span>
                                        </div>
                                        <textarea
                                            className="input-field min-h-[300px] py-4 resize-none"
                                            placeholder="Write your email content here..."
                                            value={emailBody}
                                            onChange={(e) => setEmailBody(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <button
                                        onClick={handleSendEmailBroadcast}
                                        className="w-full h-12 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <CheckCircle2 size={18} />
                                        <span>Send Mass Email</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Preview</label>
                                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                        <div className="bg-zinc-900 p-6 text-center">
                                            <h1 className="text-white font-black text-xl tracking-tighter">SETORIAL</h1>
                                        </div>
                                        <div className="p-8">
                                            <h2 className="text-lg font-bold text-zinc-900 mb-4">{emailSubject || 'Subject Line Goes Here'}</h2>
                                            <div
                                                className="text-zinc-600 space-y-4 text-sm leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: emailBody || '<p className="italic text-zinc-400">Content preview will appear here...</p>' }}
                                            ></div>
                                        </div>
                                        <div className="bg-zinc-50 p-4 border-t border-zinc-100 text-center">
                                            <p className="text-[10px] text-zinc-400">© {new Date().getFullYear()} Setorial Platform</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            /* ── CONFIG ─────────────────────────────────────────────────── */
            case 'configs':
                return (
                    <div className="space-y-10">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Global Configuration</h2>
                            <p className="text-sm text-zinc-500 mt-1">Adjust platform-wide constants and variables.</p>
                        </div>
                        <div className="card !p-0 overflow-hidden">
                            <AdminConfigTable />
                        </div>
                    </div>
                );
        }
    };

    /* ─── Layout ───────────────────────────────────────────────────────────── */

    return (
        <div className="min-h-screen flex bg-zinc-50 font-sans text-zinc-900">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-50 border-r border-zinc-200 px-4 py-6 flex flex-col shrink-0">
                <div className="mb-10 px-2 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shadow-sm">
                        <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold tracking-tight text-zinc-900">Setorial Admin</h1>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={ShieldCheck} label="KYC Review" active={activeTab === 'kyc'} onClick={() => setActiveTab('kyc')} badge={stats?.pendingKycCount} />
                    <SidebarItem icon={Users} label="Students" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <SidebarItem icon={BookOpen} label="Learning" active={activeTab === 'learning'} onClick={() => setActiveTab('learning')} />
                    <SidebarItem icon={Ticket} label="Mock Exams" active={activeTab === 'mocks'} onClick={() => setActiveTab('mocks')} />
                    <SidebarItem icon={Percent} label="Discounts" active={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')} />
                    <SidebarItem icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                    <SidebarItem icon={Globe} label="Geo-Pricing" active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')} />
                    <SidebarItem icon={Map} label="Region Pools" active={activeTab === 'regions'} onClick={() => setActiveTab('regions')} />
                    <SidebarItem icon={CreditCard} label="Payouts" active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} />
                    <SidebarItem icon={RefreshCcw} label="Config" active={activeTab === 'configs'} onClick={() => setActiveTab('configs')} />
                </nav>

                <button onClick={() => { localStorage.removeItem('admin_token'); window.location.reload(); }} className="mt-auto w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                    <LogOut size={18} />
                    <span className="text-sm">Log out</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-white p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>

            {/* Pricing Modal */}
            {isPricingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl ring-1 ring-zinc-950/5 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900">{editingPricing ? 'Edit' : 'Add'} Geo-Pricing</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Define regional subscription costs and multipliers.</p>
                            </div>
                            <button onClick={() => setIsPricingModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSavePricing} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-8 overflow-y-auto space-y-8">
                                {/* Primary Info */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Country Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="e.g. Nigeria"
                                            value={pricingForm.countryName}
                                            onChange={(e) => setPricingForm({ ...pricingForm, countryName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">ISO Code</label>
                                        <input
                                            type="text"
                                            className="input-field font-mono"
                                            placeholder="e.g. NG"
                                            value={pricingForm.countryCode}
                                            onChange={(e) => setPricingForm({ ...pricingForm, countryCode: e.target.value.toUpperCase() })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Economic Tier</label>
                                        <select
                                            className="input-field h-11 py-0 cursor-pointer text-sm"
                                            value={pricingForm.economicTier}
                                            onChange={(e) => setPricingForm({ ...pricingForm, economicTier: e.target.value })}
                                        >
                                            <option value="TIER_A">Tier A (High)</option>
                                            <option value="TIER_B">Tier B (Mid)</option>
                                            <option value="TIER_C">Tier C (Low)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Multiplier</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="input-field"
                                            value={pricingForm.multiplier}
                                            onChange={(e) => setPricingForm({ ...pricingForm, multiplier: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Currency</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="e.g. NGN"
                                            value={pricingForm.currency}
                                            onChange={(e) => setPricingForm({ ...pricingForm, currency: e.target.value.toUpperCase() })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Monthly Pricing */}
                                <div className="space-y-4 pt-4">
                                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Monthly Subs (Base)</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-600 ml-1">Bronze</label>
                                            <input type="number" className="input-field" value={pricingForm.bronzeMonthly} onChange={(e) => setPricingForm({ ...pricingForm, bronzeMonthly: e.target.value })} required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-600 ml-1">Silver</label>
                                            <input type="number" className="input-field" value={pricingForm.silverMonthly} onChange={(e) => setPricingForm({ ...pricingForm, silverMonthly: e.target.value })} required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-600 ml-1">Gold</label>
                                            <input type="number" className="input-field" value={pricingForm.goldMonthly} onChange={(e) => setPricingForm({ ...pricingForm, goldMonthly: e.target.value })} required />
                                        </div>
                                    </div>
                                </div>

                                {/* Annual Pricing */}
                                <div className="space-y-4 pt-4">
                                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Annual Subs (Base)</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-600 ml-1">Bronze</label>
                                            <input type="number" className="input-field" value={pricingForm.bronzeAnnual} onChange={(e) => setPricingForm({ ...pricingForm, bronzeAnnual: e.target.value })} required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-600 ml-1">Silver</label>
                                            <input type="number" className="input-field" value={pricingForm.silverAnnual} onChange={(e) => setPricingForm({ ...pricingForm, silverAnnual: e.target.value })} required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-600 ml-1">Gold</label>
                                            <input type="number" className="input-field" value={pricingForm.goldAnnual} onChange={(e) => setPricingForm({ ...pricingForm, goldAnnual: e.target.value })} required />
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center space-x-3 pt-4">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                        checked={pricingForm.isActive}
                                        onChange={(e) => setPricingForm({ ...pricingForm, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 cursor-pointer">Active and available for users</label>
                                </div>
                            </div>

                            <div className="px-8 py-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsPricingModalOpen(false)} className="btn-secondary h-10 px-6 text-sm">Cancel</button>
                                <button
                                    type="submit"
                                    className="btn-primary h-10 px-8 text-sm"
                                >
                                    {editingPricing ? 'Save Changes' : 'Create Region'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lesson Edit Modal */}
            {isLessonModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl ring-1 ring-zinc-950/5 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900">Edit Lesson: {editingLesson?.name}</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Update content and upload protected video content.</p>
                            </div>
                            <button onClick={() => setIsLessonModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveLesson} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-8 overflow-y-auto space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Lesson Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={lessonForm.name}
                                        onChange={(e) => setLessonForm({ ...lessonForm, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Markdown Content</label>
                                    <textarea
                                        className="input-field min-h-[300px] py-4 font-mono text-sm leading-relaxed"
                                        value={lessonForm.content}
                                        onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                                        placeholder="Enter detailed textbook-style markdown here..."
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 p-6 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Lesson Video (R2 Protected)</label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800"
                                        onChange={(e) => setLessonForm({ ...lessonForm, videoFile: e.target.files?.[0] || null })}
                                    />
                                    {editingLesson?.videoUrl && (
                                        <p className="mt-2 text-xs text-emerald-600 font-medium">✓ Current video exists. Uploading a new one will replace it.</p>
                                    )}
                                </div>
                            </div>

                            <div className="px-8 py-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="btn-secondary h-10 px-6 text-sm">Cancel</button>
                                <button type="submit" className="btn-primary h-10 px-8 text-sm" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Lesson'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Mock Exam Modal */}
            {isMockAiModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl ring-1 ring-zinc-950/5 w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900">Generate AI Mock Exam</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">The AI will create diverse questions based on the subject.</p>
                            </div>
                            <button onClick={() => setIsMockAiModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleGenerateAiMock} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Exam Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={mockAiForm.title}
                                    onChange={(e) => setMockAiForm({ ...mockAiForm, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Number of Questions (20-60)</label>
                                <input
                                    type="number"
                                    min="20"
                                    max="60"
                                    className="input-field"
                                    value={mockAiForm.numQuestions}
                                    onChange={(e) => setMockAiForm({ ...mockAiForm, numQuestions: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsMockAiModalOpen(false)} className="btn-secondary h-10 px-6 text-sm">Cancel</button>
                                <button type="submit" className="btn-primary bg-purple-600 hover:bg-purple-700 h-10 px-8 text-sm" disabled={loading}>
                                    {loading ? 'Generating...' : 'Start AI Generation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {generatingSyllabus && (
                <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-24 h-24 relative mb-8">
                        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Wand2 size={40} className="text-indigo-400 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Wormhole Active</h2>
                    <p className="text-indigo-200 text-lg max-w-md mx-auto leading-relaxed">
                        The AI is currently building the full curriculum, drafting high-depth lessons, and generating study materials...
                    </p>
                    <div className="mt-8 flex space-x-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    </div>
                    <p className="mt-12 text-zinc-500 text-sm font-medium uppercase tracking-widest">Please do not close this tab</p>
                </div>
            )}
        </div>
    );
}

/* ─── Sub-Components ────────────────────────────────────────────────────── */

const AdminConfigTable = () => {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await adminApi.getConfigs();
            setConfigs(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleUpdate = async (key: string, currentValue: string) => {
        const newValue = prompt(`Update value for ${key}:`, currentValue);
        if (newValue === null || newValue === currentValue) return;
        try {
            await adminApi.updateConfig(key, newValue);
            fetchConfigs();
        } catch (err) { alert('Update failed'); }
    };

    if (loading) return <div className="p-8 text-center text-zinc-400">Loading configs...</div>;

    return (
        <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Config Key</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
                {configs.map((c: any) => (
                    <tr key={c.id}>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-900 uppercase">{c.key}</td>
                        <td className="px-6 py-4 text-sm text-zinc-600">{c.value}</td>
                        <td className="px-6 py-4 text-xs text-zinc-500">{c.description || 'No description'}</td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => handleUpdate(c.key, c.value)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                                <Edit2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
                {configs.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-zinc-500 italic">No configurations found. Add them via API or Database.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

const AdminDiscountsTable = () => {
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const res = await adminApi.getDiscounts();
            setDiscounts(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleToggle = async (id: string, current: boolean) => {
        try {
            await adminApi.toggleDiscount(id, !current);
            fetchDiscounts();
        } catch (err) { alert('Failed to toggle'); }
    };

    if (loading) return <div className="p-8 text-center text-zinc-400">Loading discounts...</div>;

    return (
        <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Discount</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Usage</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
                {discounts.map((d: any) => (
                    <tr key={d.id}>
                        <td className="px-6 py-4 font-bold text-zinc-900 tracking-wider font-mono">{d.code}</td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-emerald-600">{d.discountPercent}% OFF</td>
                        <td className="px-6 py-4 text-center text-xs text-zinc-500">{d.usedCount} used {d.maxUses ? `/ ${d.maxUses}` : ''}</td>
                        <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${d.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-zinc-100 text-zinc-700 ring-zinc-500/10'}`}>
                                {d.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => handleToggle(d.id, d.isActive)} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900">
                                {d.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </td>
                    </tr>
                ))}
                {discounts.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-zinc-500 italic">No discount codes active.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};
