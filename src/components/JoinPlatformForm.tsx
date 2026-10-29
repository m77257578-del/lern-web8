import React, { useState } from 'react';
import { storageService, JobApplication } from '../services/storageService';
import { 
  Send, User, Phone, Briefcase, Link as LinkIcon, Camera, Award, 
  FileText, Clock, MessageSquare, CheckCircle2, Copy, ExternalLink, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

export default function JoinPlatformForm({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const isRtl = lang === 'ar';
  const settings = storageService.getSettings();
  const targetSupportPhone = settings?.targetWhatsAppNumber || '201024889921';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'customer_service' as 'programmer' | 'customer_service' | 'monitor',
    profileLink: '',
    gitHubLink: '',
    nationalIdPhotoUrl: '',
    yearsExperience: 1,
    reason: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{
    application: JobApplication;
    whatsappUrl: string;
    messageText: string;
  } | null>(null);

  const roleLabelsAr: Record<string, string> = {
    programmer: 'مبرمج ومطور برمجيات (Programmer)',
    customer_service: 'خدمة عملاء ودعم فني (Customer Support)',
    monitor: 'مراقب جودة وعمليات المنصة (Monitor)'
  };

  const roleLabelsEn: Record<string, string> = {
    programmer: 'Full-Stack Programmer / Developer',
    customer_service: 'Customer Support & Operations',
    monitor: 'Quality & Operations Monitor'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error(isRtl ? 'يرجى إدخال الاسم ورقم الهاتف' : 'Please provide name and phone');
      return;
    }

    const application: JobApplication = {
      ...formData,
      id: 'app-' + Date.now(),
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    const whatsappUrl = storageService.addApplication(application);
    const roleTitle = roleLabelsAr[formData.role] || formData.role;
    
    // Formatted confirmation message for platform support
    const messageText = 
      `📩 *طلب انضمام جديد إلى منصة ليرن ويب*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *اسم مقدم الطلب:* ${formData.name.trim()}\n` +
      `💼 *المجال والدور:* ${roleTitle}\n` +
      `📱 *رقم الهاتف للتواصل:* ${formData.phone.trim()}\n` +
      `⏳ *سنوات الخبرة:* ${formData.yearsExperience} سنوات\n` +
      (formData.profileLink ? `🔗 *رابط الملف الشخصي:* ${formData.profileLink}\n` : '') +
      (formData.gitHubLink ? `💻 *رابط GitHub:* ${formData.gitHubLink}\n` : '') +
      (formData.nationalIdPhotoUrl ? `🪪 *رابط بطاقة الهوية:* ${formData.nationalIdPhotoUrl}\n` : '') +
      `📝 *الدافع والمساهمة:*\n${formData.reason.trim()}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📅 *تاريخ التقديم:* ${new Date().toLocaleString('ar-EG')}\n` +
      `يرجى مراجعة الطلب في لوحة التحكم واتخاذ الإجراء اللازم.`;

    setLastSubmission({
      application,
      whatsappUrl,
      messageText
    });

    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }

    toast.success(isRtl ? 'تم تسجيل طلب الانضمام وتوجيه الإشعار للواتساب بنجاح!' : 'Application registered & WhatsApp opened!');
    setSubmitted(true);
  };

  const handleCopyMessage = () => {
    if (lastSubmission?.messageText) {
      navigator.clipboard.writeText(lastSubmission.messageText);
      toast.success(isRtl ? 'تم نسخ نص إشعار الطلب بنجاح!' : 'Notification text copied!');
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      phone: '',
      role: 'customer_service',
      profileLink: '',
      gitHubLink: '',
      nationalIdPhotoUrl: '',
      yearsExperience: 1,
      reason: ''
    });
    setSubmitted(false);
    setLastSubmission(null);
  };

  if (submitted && lastSubmission) {
    return (
      <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 to-emerald-950/30 p-6 md:p-8 space-y-6 shadow-2xl text-slate-100 animate-fadeIn">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white">
            {isRtl ? 'تم إرسال وتأكيد طلب الانضمام بنجاح!' : 'Application Sent & Confirmed!'}
          </h3>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {isRtl 
              ? `تم تسجيل طلبك بنجاح باسم (${lastSubmission.application.name}) لدور [${roleLabelsAr[lastSubmission.application.role]}]. تم إنشاء إشعار تلقائي عبر واتساب إلى رقم دعم المنصة (${targetSupportPhone}).`
              : `Your application has been received for (${lastSubmission.application.name}) as [${roleLabelsEn[lastSubmission.application.role]}]. An automated WhatsApp notification was directed to platform support.`}
          </p>
        </div>

        {/* WhatsApp Notification Preview Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <MessageSquare className="w-4 h-4" />
              <span>{isRtl ? 'معاينة إشعار واتساب التلقائي المرسل إلى رقم دعم المنصة:' : 'WhatsApp Support Notification Preview:'}</span>
            </div>
            <span className="font-mono text-xs text-slate-400">{targetSupportPhone}</span>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {lastSubmission.messageText}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => window.open(lastSubmission.whatsappUrl, '_blank')}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isRtl ? 'فتح واتساب الدعم الفني وتأكيد الرسالة الآن 📱' : 'Open WhatsApp Support Now'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopyMessage}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs md:text-sm border border-slate-700 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>{isRtl ? 'نسخ نص الإشعار' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetForm}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs md:text-sm border border-slate-800 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isRtl ? 'تقديم طلب جديد' : 'New Application'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl animate-fadeIn">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{isRtl ? 'قسم طلبات الانضمام للفريق' : 'Join the Team'}</span>
        </div>
        <h3 className="text-2xl font-black text-white flex items-center gap-2">
          <span>{isRtl ? 'انضم إلى فريق عمل منصة ليرن ويب' : 'Join Lern Web Team'}</span>
        </h3>
        <p className="text-xs text-slate-400">
          {isRtl 
            ? 'هل تمتلك الشغف والخبرة؟ قدّم طلبك الآن وسيقوم النظام تلقائياً بتوجيه إشعار واتساب مفصل إلى رقم دعم المنصة بمجرد الإرسال.' 
            : 'Apply now to join our team. The platform will automatically send a formatted WhatsApp alert to support.'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>{isRtl ? 'الاسم الكامل:' : 'Full Name:'}</span>
          </label>
          <input 
            required 
            type="text" 
            value={formData.name}
            placeholder={isRtl ? 'مثال: أحمد محمد عبد الرحمن' : 'e.g. Ahmed Mohamed'} 
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition" 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isRtl ? 'رقم الهاتف (للتواصل وإرسال الرد):' : 'Phone Number:'}</span>
          </label>
          <input 
            required 
            type="text" 
            value={formData.phone}
            placeholder="010XXXXXXXX" 
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white font-mono focus:border-blue-500 focus:outline-none transition" 
            onChange={e => setFormData({...formData, phone: e.target.value})} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRtl ? 'المجال والدور الوظيفي المطلوب:' : 'Desired Role:'}</span>
          </label>
          <select 
            value={formData.role}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition" 
            onChange={e => setFormData({...formData, role: e.target.value as any})}
          >
            <option value="customer_service">{isRtl ? '🎧 خدمة عملاء ودعم فني' : 'Customer Service'}</option>
            <option value="programmer">{isRtl ? '💻 مبرمج ومطور منصة (Programmer)' : 'Programmer'}</option>
            <option value="monitor">{isRtl ? '🛡️ مراقب جودة وعمليات المنصة (Monitor)' : 'Monitor'}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{isRtl ? 'سنوات الخبرة في هذا المجال:' : 'Years of Experience:'}</span>
          </label>
          <input 
            required 
            type="number" 
            min="0"
            value={formData.yearsExperience}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition" 
            onChange={e => setFormData({...formData, yearsExperience: parseInt(e.target.value) || 0})} 
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>{isRtl ? 'رابط حساب البروفايل (فيسبوك أو لينكد إن):' : 'Profile Link (FB/LinkedIn):'}</span>
        </label>
        <input 
          required 
          type="url" 
          value={formData.profileLink}
          placeholder="https://..." 
          className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-blue-400 font-mono focus:border-blue-500 focus:outline-none transition" 
          onChange={e => setFormData({...formData, profileLink: e.target.value})} 
        />
      </div>
      
      {formData.role === 'programmer' ? (
        <div className="space-y-1.5 animate-fadeIn">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isRtl ? 'رابط حساب جيت هاب (GitHub Profile URL):' : 'GitHub Profile URL:'}</span>
          </label>
          <input 
            required 
            type="url" 
            value={formData.gitHubLink}
            placeholder="https://github.com/username" 
            className="w-full rounded-xl bg-slate-950 border border-cyan-500/40 p-3 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none transition" 
            onChange={e => setFormData({...formData, gitHubLink: e.target.value})} 
          />
        </div>
      ) : (
        <div className="space-y-1.5 animate-fadeIn">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRtl ? 'رابط صورة البطاقة الشخصية (صورة واضحة):' : 'National ID Photo URL:'}</span>
          </label>
          <input 
            required 
            type="url" 
            value={formData.nationalIdPhotoUrl}
            placeholder="https://..." 
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white font-mono focus:border-blue-500 focus:outline-none transition" 
            onChange={e => setFormData({...formData, nationalIdPhotoUrl: e.target.value})} 
          />
          <p className="text-[10px] text-slate-500 italic">{isRtl ? 'ارفع الصورة على أي مركز رفع سحابي وضع الرابط هنا' : 'Upload photo and paste link here'}</p>
        </div>
      )}
      
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <span>{isRtl ? 'لماذا تريد العمل معنا؟ وما هي القيمة التي ستضيفها للمنصة؟' : 'Why join us & What is your contribution?'}</span>
        </label>
        <textarea 
          required 
          rows={3}
          value={formData.reason}
          placeholder={isRtl ? 'اكتب باختصار خبراتك وأهدافك وسبب اختيارك لفريق ليرن ويب...' : 'Briefly describe your experience and reasons...'} 
          className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-300 focus:border-blue-500 focus:outline-none transition" 
          onChange={e => setFormData({...formData, reason: e.target.value})} 
        />
      </div>

      <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex items-center gap-3 text-xs text-blue-300">
        <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          {isRtl 
            ? `سيتم فتح محادثة واتساب تلقائياً موجهة لرقم دعم المنصة (${targetSupportPhone}) مرفقة بكافة تفاصيل طلبك.` 
            : `Submitting will auto-generate a WhatsApp alert to platform support (${targetSupportPhone}).`}
        </span>
      </div>

      <button 
        type="submit" 
        className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base shadow-lg shadow-blue-600/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Send className="w-5 h-5" />
        <span>{isRtl ? 'إرسال طلب الانضمام وتوجيه إشعار الواتساب الآن 🚀' : 'Submit Application & Notify Support'}</span>
      </button>
    </form>
  );
}
