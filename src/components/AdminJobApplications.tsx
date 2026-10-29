import React, { useState } from 'react';
import { storageService, buildWhatsAppUrl, JobApplication } from '../services/storageService';
import { 
  Check, X, User, Phone, Briefcase, Link, Camera, Award, 
  FileText, MessageSquare, Copy, CheckCircle2, Search, Filter, ShieldCheck, Key
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminJobApplications({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const isRtl = lang === 'ar';
  const [applications, setApplications] = useState<JobApplication[]>(() => storageService.getApplications());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer_service' | 'programmer' | 'monitor'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'programmer':
        return {
          labelAr: 'مبرمج ومطور (Full-Stack)',
          labelEn: 'Programmer / Developer',
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
        };
      case 'customer_service':
        return {
          labelAr: 'خدمة عملاء ودعم فني (Support)',
          labelEn: 'Customer Support Lead',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
      case 'monitor':
        return {
          labelAr: 'مراقب جودة ومنصة (Monitor)',
          labelEn: 'Platform & Quality Monitor',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
      default:
        return {
          labelAr: role,
          labelEn: role,
          color: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
        };
    }
  };

  const handleStatusUpdate = (id: string, status: 'accepted' | 'rejected') => {
    const res = storageService.updateApplicationStatus(id, status);
    setApplications(storageService.getApplications());

    if (res && res.whatsappUrl) {
      // Auto-open WhatsApp chat with the applicant
      try {
        window.open(res.whatsappUrl, '_blank');
      } catch (err) {
        console.warn('Popup blocked, available via button', err);
      }
    }

    if (status === 'accepted') {
      toast.success(
        isRtl 
          ? `🎉 تم قبول طلب (${res.app?.name || 'المتقدم'}) وتوليد كود الدخول (100100) وإرسال رسالة واتساب للرقم (${res.app?.phone || ''})!`
          : `🎉 Application for (${res.app?.name}) accepted! WhatsApp opened with login credentials.`
      );
    } else {
      toast.info(
        isRtl 
          ? `تم تحديث حالة طلب (${res.app?.name || 'المتقدم'}) إلى مرفوض وإرسال رسالة الشكر عبر واتساب.`
          : `Application rejected and appreciation message generated.`
      );
    }
  };

  const handleManualWhatsApp = (app: JobApplication) => {
    const roleInfo = getRoleBadge(app.role);
    const roleName = isRtl ? roleInfo.labelAr : roleInfo.labelEn;

    let message = '';
    if (app.status === 'accepted') {
      message = `مرحباً بك أستاذ/ة ${app.name} 🌟\nتهانينا الحارة! يسر إدارة منصة ليرن ويب (Lern Web) إبلاغك بأنه تم قبول طلب انضمامك رسمياً كـ [${roleName}] ضمن طاقم عمل المنظومة! 🎉\n\n🔐 *بيانات الدخول المعتمدة للوحة التحكم:*\n• رقم الهاتف المعتمد: ${app.phone}\n• كود المشرف / المسؤول: 100100\n\nتم تفعيل الصلاحيات المخصصة لدورك كـ (${roleName}) فورياً. يمكنك الآن التوجه للمنصة وتسجيل الدخول عبر نافذة الدخول الإداري برقم هاتفك وكود 100100.\n\nيسعدنا انضمامك لفريقنا، ونتطلع إلى إبداعك ومسيرتك المثمرة معنا! 🚀`;
    } else if (app.status === 'rejected') {
      message = `مرحباً بك أستاذ/ة ${app.name} 🌟\nنشكرك جزيل الشكر على اهتمامك ورغبتك الكريمة في الانضمام لمنصة ليرن ويب (Lern Web) والتقديم على دور [${roleName}].\n\nنود إبلاغك بأنه بعد المراجعة الدقيقة لملفات التقديم، تعذر قبول طلبك في هذه المرحلة لعدم توافق الشروط الحالية، وسيتم الاحتفاظ ببياناتك وسيرتك الذاتية في سجلاتنا للرجوع إليها في الفرص القادمة بإذن الله.\n\nنتمنى لك كل التوفيق والنجاح والتميز في مسيرتك المهنية! 🌟`;
    } else {
      message = `مرحباً بك أستاذ/ة ${app.name}، بخصوص طلب انضمامك لمنصة ليرن ويب كـ [${roleName}]، نود التواصل معك لاستكمال المقابلة والمراجعة الفنية.`;
    }

    const url = buildWhatsAppUrl(app.phone, message);
    window.open(url, '_blank');
  };

  const handleCopyCredentials = (app: JobApplication) => {
    const text = `بيانات دخول لوحة تحكم ليرن ويب للموظف [${app.name}]:\nالهاتف: ${app.phone}\nكود الدخول: 100100\nالدور: ${app.role}`;
    navigator.clipboard.writeText(text);
    setCopiedId(app.id);
    toast.success(isRtl ? 'تم نسخ بيانات الدخول (الهاتف + كود 100100) للحافظة!' : 'Credentials copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredApps = applications.filter((app) => {
    if (roleFilter !== 'all' && app.role !== roleFilter) return false;
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = app.name.toLowerCase().includes(q);
      const matchPhone = app.phone.includes(q);
      const matchReason = (app.reason || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchReason;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <span>{isRtl ? `طلبات الانضمام والتوظيف (${applications.length})` : `Job Applications (${applications.length})`}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {isRtl 
              ? 'مراجعة المتقدمين، إرسال إشعار واتساب تلقائي باسم المتقدم ودوره، وتفعيل صلاحيات لوحة التحكم بكود 100100.'
              : 'Review applicants, auto-send WhatsApp notifications with role, and unlock role-based dashboard access.'}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">{isRtl ? 'كل الأدوار' : 'All Roles'}</option>
            <option value="programmer">{isRtl ? 'مبرمج (Developer)' : 'Programmer'}</option>
            <option value="customer_service">{isRtl ? 'خدمة عملاء (Support)' : 'Support'}</option>
            <option value="monitor">{isRtl ? 'مراقب (Monitor)' : 'Monitor'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">{isRtl ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="pending">{isRtl ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="accepted">{isRtl ? 'مقبول' : 'Accepted'}</option>
            <option value="rejected">{isRtl ? 'مرفوض' : 'Rejected'}</option>
          </select>
        </div>
      </div>

      {/* Applications Cards List */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/50 rounded-3xl border border-dashed border-slate-800 text-slate-500 space-y-2">
            <Briefcase className="w-10 h-10 mx-auto text-slate-700" />
            <p className="font-bold text-sm">{isRtl ? 'لا توجد طلبات انضمام مطابقة للبحث.' : 'No matching applications.'}</p>
            <p className="text-xs text-slate-600">{isRtl ? 'طلبات الانضمام المقدمة عبر المنصة ستظهر هنا فورياً.' : 'Submissions from the join form will appear here.'}</p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const roleInfo = getRoleBadge(app.role);

            return (
              <div 
                key={app.id} 
                className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl hover:border-slate-700 transition"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow">
                      <User size={24} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-white">{app.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleInfo.color}`}>
                          {isRtl ? roleInfo.labelAr : roleInfo.labelEn}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          <Phone size={12} />
                          <span>{app.phone}</span>
                        </span>

                        <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          <Award size={12} />
                          <span>{app.yearsExperience} {isRtl ? 'سنوات خبرة' : 'years experience'}</span>
                        </span>

                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(app.appliedAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Action Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {app.status === 'pending' ? (
                      <>
                        <button 
                          type="button"
                          onClick={() => handleStatusUpdate(app.id, 'rejected')} 
                          className="px-4 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition flex items-center gap-1.5 cursor-pointer"
                          title={isRtl ? 'رفض الطلب وإرسال رسالة اعتذار عبر واتساب' : 'Reject & Notify via WhatsApp'}
                        >
                          <X size={14}/>
                          <span>{isRtl ? 'رفض الطلب' : 'Reject'}</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleStatusUpdate(app.id, 'accepted')} 
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer"
                          title={isRtl ? 'قبول الطلب وتفعيل الصلاحيات وإرسال كود 100100 عبر واتساب' : 'Accept & Send WhatsApp with 100100 code'}
                        >
                          <Check size={14}/>
                          <span>{isRtl ? 'قبول المتقدم' : 'Accept'}</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                          app.status === 'accepted' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {app.status === 'accepted' ? <CheckCircle2 size={13} /> : <X size={13} />}
                          <span>{app.status === 'accepted' ? (isRtl ? 'تم القبول كـ عضو بالفريق ✓' : 'Accepted Member') : (isRtl ? 'تم الرفض ✗' : 'Rejected')}</span>
                        </span>

                        {app.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(app)}
                            className="p-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title={isRtl ? 'نسخ بيانات الدخول (100100 + الهاتف)' : 'Copy Login Code (100100)'}
                          >
                            <Key size={13} />
                            <span className="hidden sm:inline">{copiedId === app.id ? (isRtl ? 'تم النسخ!' : 'Copied!') : '100100'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Direct WhatsApp Message Trigger */}
                    <button
                      type="button"
                      onClick={() => handleManualWhatsApp(app)}
                      className="px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                      title={isRtl ? 'فتح محادثة واتساب المباشرة مع المتقدم' : 'Direct WhatsApp Chat'}
                    >
                      <MessageSquare size={14} className="text-emerald-400" />
                      <span>{isRtl ? 'مراسلة واتساب' : 'WhatsApp'}</span>
                    </button>
                  </div>
                </div>

                {/* Role-Based Access Privileges Notice */}
                {app.status === 'accepted' && (
                  <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>
                        {isRtl 
                          ? `الصلاحيات المفعلة: يمكن لهذا الموظف الدخول بكود (100100) برقم (${app.phone}) بدور: [${roleInfo.labelAr}]`
                          : `Access Active: Staff member logs in with phone (${app.phone}) and passcode 100100.`}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 font-mono text-[10px] text-indigo-300">
                      Code: 100100
                    </span>
                  </div>
                )}

                {/* Details Grid: Links, Docs, and Reasons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/60">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{isRtl ? 'الروابط والمستندات:' : 'Links & Documents:'}</p>
                    <div className="flex flex-wrap gap-2">
                      {app.profileLink && (
                        <a 
                          href={app.profileLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-blue-400 hover:border-blue-500 transition"
                        >
                          <Link size={12}/>
                          <span>{isRtl ? 'رابط البروفايل' : 'Profile Link'}</span>
                        </a>
                      )}

                      {app.gitHubLink && (
                        <a 
                          href={app.gitHubLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-white hover:border-white transition"
                        >
                          <FileText size={12}/>
                          <span>GitHub Repo</span>
                        </a>
                      )}

                      {app.nationalIdPhotoUrl && (
                        <a 
                          href={app.nationalIdPhotoUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-400 hover:border-amber-500 transition"
                        >
                          <Camera size={12}/>
                          <span>{isRtl ? 'صورة البطاقة' : 'ID Document'}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{isRtl ? 'سبب الرغبة في الانضمام والخبرة:' : 'Reason for applying:'}</p>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed italic">
                      "{app.reason}"
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
