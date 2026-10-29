import React, { useState } from 'react';
import { 
  Users, Plus, Trash2, Edit3, Phone, MessageSquare, 
  ExternalLink, Check, Key, Search, Save, Copy, Code, Headphones, Eye, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { storageService, StaffMember } from '../services/storageService';

interface StaffManagerProps {
  staffList: StaffMember[];
  lang?: 'ar' | 'en';
  onRefresh: () => void;
  triggerSaveNotification: (msg: string) => void;
}

export const StaffManager: React.FC<StaffManagerProps> = ({
  staffList,
  lang = 'ar',
  onRefresh,
  triggerSaveNotification
}) => {
  const isRtl = lang === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'programmer' | 'support' | 'monitor' | 'admin'>('all');
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [roleType, setRoleType] = useState<'programmer' | 'support' | 'monitor' | 'admin'>('support');
  const [roleTitleCustom, setRoleTitleCustom] = useState('مسؤول خدمة العملاء والدعم');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['support', 'orders']);

  const PERMISSION_OPTIONS = [
    { id: 'support', labelAr: 'محادثات وتذاكر الدعم والطلبات', labelEn: 'Customer Support Tickets' },
    { id: 'orders', labelAr: 'مراجعة وتأكيد الطلبات والسداد', labelEn: 'Orders & Payment Verification' },
    { id: 'cms', labelAr: 'إدارة المشاريع والمقالات والوسائط', labelEn: 'CMS, Projects & Media' },
    { id: 'analytics', labelAr: 'عرض تحليلات وسجلات المنصة', labelEn: 'View Analytics & Logs' },
    { id: 'settings', labelAr: 'إعدادات المنظومة والمفاتيح', labelEn: 'System Settings & Keys' },
  ];

  const handleRoleTypeChange = (newRoleType: 'programmer' | 'support' | 'monitor' | 'admin') => {
    setRoleType(newRoleType);
    if (newRoleType === 'programmer') {
      setRoleTitleCustom(isRtl ? 'مبرمج ومطور المنصة (Programmer)' : 'Platform Developer & Programmer');
      setSelectedPermissions(['cms', 'analytics']);
    } else if (newRoleType === 'support') {
      setRoleTitleCustom(isRtl ? 'مسؤول الدعم الفني وخدمة العملاء (Support)' : 'Customer Support Specialist');
      setSelectedPermissions(['support', 'orders']);
    } else if (newRoleType === 'monitor') {
      setRoleTitleCustom(isRtl ? 'مراقب الجودة والعمليات (Monitor)' : 'Quality & Operations Monitor');
      setSelectedPermissions(['support', 'analytics']);
    } else {
      setRoleTitleCustom(isRtl ? 'مشرف عام كامل الصلاحيات (Super Admin)' : 'Super Administrator');
      setSelectedPermissions(['support', 'orders', 'cms', 'analytics', 'settings']);
    }
  };

  const handleTogglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleStartEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setName(member.name);
    const rType = member.roleType || (member.permissions?.includes('cms') ? 'programmer' : 'support');
    setRoleType(rType);
    setRoleTitleCustom(member.roleAr);
    setPhone(member.phone);
    setWhatsapp(member.whatsapp);
    setTelegram(member.telegram || '');
    setSelectedPermissions(member.permissions || ['support', 'orders']);
  };

  const handleCancelEdit = () => {
    setEditingStaff(null);
    setName('');
    handleRoleTypeChange('support');
    setPhone('');
    setWhatsapp('');
    setTelegram('');
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert(isRtl ? 'يرجى إدخال اسم الموظف ورقم الهاتف' : 'Please provide staff name and phone');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^\d]/g, '');
    const cleanWhatsapp = whatsapp.trim() || `https://wa.me/${cleanPhone.startsWith('2') ? cleanPhone : '2' + cleanPhone}`;

    const memberToSave: StaffMember = {
      id: editingStaff ? editingStaff.id : 'staff-' + Date.now(),
      name: name.trim(),
      roleType: roleType,
      roleAr: roleTitleCustom.trim() || (roleType === 'programmer' ? 'مبرمج المنصة' : roleType === 'support' ? 'دعم فني' : roleType === 'monitor' ? 'مراقب جودة' : 'مشرف عام'),
      roleEn: roleType === 'programmer' ? 'Platform Programmer' : roleType === 'support' ? 'Customer Support' : roleType === 'monitor' ? 'System Monitor' : 'Super Admin',
      phone: cleanPhone,
      whatsapp: cleanWhatsapp,
      telegram: telegram.trim() || undefined,
      permissions: selectedPermissions,
      isActive: editingStaff ? editingStaff.isActive : true,
      createdAt: editingStaff ? editingStaff.createdAt : new Date().toISOString()
    };

    storageService.saveStaffMember(memberToSave);
    onRefresh();
    handleCancelEdit();
    triggerSaveNotification(
      editingStaff 
        ? (isRtl ? 'تم تحديث بيانات العضو بنجاح!' : 'Staff details updated!') 
        : (isRtl ? `تم إضافة الموظف بنجاح! كود الدخول الخاص به: [${cleanPhone}] مع الرمز [100100]` : 'New staff added with passcode 100100!')
    );
  };

  const handleDelete = (id: string, memberName: string) => {
    if (window.confirm(isRtl ? `هل أنت متأكد من حذف الموظف (${memberName}) نهائياً؟` : `Delete staff member (${memberName})?`)) {
      storageService.deleteStaffMember(id);
      onRefresh();
      triggerSaveNotification(isRtl ? 'تم حذف العضو من فريق العمل.' : 'Staff member removed.');
    }
  };

  const copyLoginInfo = (member: StaffMember) => {
    const text = `بيانات الدخول إلى لوحة التحكم:\nالرابط: ${window.location.origin}\nرقم الهاتف: ${member.phone}\nرمز الدخول: 100100\nالدور المعين: ${member.roleAr}`;
    navigator.clipboard.writeText(text);
    toast.success(isRtl ? `تم نسخ بيانات دخول الموظف (${member.name}) بنجاح! (100100)` : 'Login info copied to clipboard!');
  };

  const filteredStaff = staffList.filter(s => {
    const matchesQuery = !searchQuery.trim() || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) || 
      s.phone.includes(searchQuery.trim()) || 
      s.roleAr.toLowerCase().includes(searchQuery.toLowerCase().trim());
    
    const sRole = s.roleType || 'support';
    const matchesRole = roleFilter === 'all' || sRole === roleFilter;

    return matchesQuery && matchesRole;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
            <Users className="w-4 h-4 text-blue-400" />
            <span>{isRtl ? 'طاقم عمل تحديث المجموعة وإدارة المشرفين' : 'Staff & Group Updates Management'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{isRtl ? 'رمز الدخول المعتمد: 100100 + رقم الهاتف' : 'Staff Passcode: 100100 + Phone'}</span>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          {isRtl ? 'إدارة طاقم العمل والصلاحيات المحدودة (مبرمج / دعم / مراقب)' : 'Staff Management & Role-Based Access'}
        </h2>
        <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
          {isRtl 
            ? 'يقوم النظام البرمجي الوسيط بالتحقق من رمز المسؤول والموظفين (100100) مقابل رقم الهاتف المدخل عند تسجيل الدخول، ليمنح وصولاً مخصصاً بدقة حسب الدور الوظيفي (مبرمج/دعم/مراقب).' 
            : 'The secure authentication middleware checks the passcode (100100) against the registered phone number, granting strictly scoped access based on the assigned role: Programmer, Customer Support, or Operations Monitor.'}
        </p>

        {/* Roles Quick Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-cyan-200">{isRtl ? 'دور المبرمج (Programmer)' : 'Programmer'}</h5>
              <p className="text-[11px] text-slate-400">{isRtl ? 'المشاريع، البورتفوليو، المقالات، الوسائط، والـ SEO' : 'Projects, Portfolio, Articles, Media, SEO'}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-emerald-200">{isRtl ? 'دور الدعم الفني (Support)' : 'Support'}</h5>
              <p className="text-[11px] text-slate-400">{isRtl ? 'التذاكر، طلبات الشراء، طلبات الانضمام، والأسئلة' : 'Tickets, Orders, Applications, FAQs'}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-purple-200">{isRtl ? 'دور المراقب (Monitor)' : 'Monitor'}</h5>
              <p className="text-[11px] text-slate-400">{isRtl ? 'تقييمات العملاء، المسودات، الإعلانات، والتحليلات' : 'Reviews, Drafts, Announcements, Analytics'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Staff Form */}
      <form onSubmit={handleSaveStaff} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            {editingStaff ? <Edit3 className="w-5 h-5 text-amber-400" /> : <Plus className="w-5 h-5 text-blue-400" />}
            <span>
              {editingStaff 
                ? (isRtl ? `تعديل بيانات العضو: ${editingStaff.name}` : `Edit Staff: ${editingStaff.name}`) 
                : (isRtl ? 'إضافة عضو جديد لطاقم العمل (مبرمج / دعم / مراقب)' : 'Add New Staff Member')}
            </span>
          </h3>

          {editingStaff && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
            >
              {isRtl ? 'إلغاء التعديل' : 'Cancel Edit'}
            </button>
          )}
        </div>

        {/* Role Type Selection Preset Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            {isRtl ? 'اختر الدور الوظيفي المعتمد (لتفعيل صلاحيات الدور تلقائياً):' : 'Select Designated Role (Auto-configures access scope):'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'programmer', labelAr: '💻 مبرمج (Programmer)', labelEn: 'Programmer', color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300' },
              { id: 'support', labelAr: '🎧 دعم (Customer Support)', labelEn: 'Customer Support', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' },
              { id: 'monitor', labelAr: '🛡️ مراقب (Monitor)', labelEn: 'Monitor', color: 'border-purple-500 bg-purple-950/40 text-purple-300' },
              { id: 'admin', labelAr: '👑 مشرف عام (Super Admin)', labelEn: 'Super Admin', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleTypeChange(r.id as any)}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  roleType === r.id 
                    ? r.color + ' ring-2 ring-blue-500/50 shadow-lg' 
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{isRtl ? r.labelAr : r.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{isRtl ? 'اسم الموظف / العضو:' : 'Staff Full Name:'}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isRtl ? 'مثال: م. أحمد عبد الله' : 'e.g. Ahmed Abdullah'}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{isRtl ? 'المسمى الوظيفي الظاهر:' : 'Display Title:'}</label>
            <input
              type="text"
              required
              value={roleTitleCustom}
              onChange={(e) => setRoleTitleCustom(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{isRtl ? 'رقم الهاتف (المستخدم للتحقق مع 100100):' : 'Phone Number (For 100100 Login):'}</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01012345678"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{isRtl ? 'رابط الواتساب (WhatsApp URL):' : 'WhatsApp Link:'}</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="https://wa.me/2010..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{isRtl ? 'رابط التلجرام (Telegram Link):' : 'Telegram Link:'}</label>
            <input
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="https://t.me/username"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-blue-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Permissions Selection Grid */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 block">{isRtl ? 'الصلاحيات المخصصة في لوحة التحكم:' : 'Assigned Permissions:'}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {PERMISSION_OPTIONS.map((p) => {
              const isSelected = selectedPermissions.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => handleTogglePermission(p.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                    isSelected 
                      ? 'bg-blue-950/40 border-blue-500 text-white' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-xs font-medium">{isRtl ? p.labelAr : p.labelEn}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-bold shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingStaff ? (isRtl ? 'حفظ التعديلات' : 'Update Staff') : (isRtl ? 'حفظ وإضافة الموظف' : 'Save & Add Staff')}</span>
          </button>
        </div>
      </form>

      {/* Staff List Header, Role Filters & Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>{isRtl ? `أعضاء الفريق المسجلون (${staffList.length})` : `Registered Staff (${staffList.length})`}</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              {[
                { id: 'all', labelAr: 'الكل' },
                { id: 'programmer', labelAr: '💻 مبرمج' },
                { id: 'support', labelAr: '🎧 دعم' },
                { id: 'monitor', labelAr: '🛡️ مراقب' },
                { id: 'admin', labelAr: '👑 مشرف عام' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setRoleFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    roleFilter === f.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.labelAr}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث باسم أو هاتف...' : 'Search name/phone...'}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Staff Members Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => {
            const mRoleType = member.roleType || 'support';
            return (
              <div key={member.id} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border ${
                        mRoleType === 'programmer' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                        mRoleType === 'support' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        mRoleType === 'monitor' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                        'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {mRoleType === 'programmer' ? <Code className="w-5 h-5" /> :
                         mRoleType === 'support' ? <Headphones className="w-5 h-5" /> :
                         mRoleType === 'monitor' ? <Eye className="w-5 h-5" /> :
                         <ShieldCheck className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">{member.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            mRoleType === 'programmer' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                            mRoleType === 'support' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            mRoleType === 'monitor' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                            'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {member.roleAr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(member)}
                        className="text-slate-400 hover:text-blue-400 p-1.5 rounded-xl transition cursor-pointer"
                        title={isRtl ? 'تعديل البيانات' : 'Edit'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(member.id, member.name)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-xl transition cursor-pointer"
                        title={isRtl ? 'حذف الموظف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 font-mono">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">{isRtl ? 'الهاتف (تسجيل الدخول):' : 'Phone:'}</span>
                      <span className="text-white font-bold">{member.phone}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300">
                      <span className="text-amber-400/80">{isRtl ? 'كود الدخول المعتمد:' : 'Passcode:'}</span>
                      <span className="font-bold font-mono">100100</span>
                    </div>

                    {member.whatsapp && (
                      <a href={member.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 hover:underline">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'محادثة الواتساب' : 'WhatsApp Chat'}</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">{isRtl ? 'الصلاحيات الممنوحة:' : 'Permissions:'}</span>
                    <div className="flex flex-wrap gap-1">
                      {(member.permissions || []).map((p, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={() => copyLoginInfo(member)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'نسخ بيانات الدخول (100100 + الهاتف)' : 'Copy Login Info (100100)'}</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'مُصرح ومُفعل' : 'Active & Authorized'}</span>
                    </span>
                    <span className="font-mono text-[10px]">{new Date(member.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
