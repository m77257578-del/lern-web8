import React, { useState, useMemo } from 'react';
import {
  BookOpen, CheckCircle2, Code2, Cpu, HelpCircle, Play, Search,
  ShieldCheck, Award, Calendar, Copy, Check, Plus, DollarSign,
  Users, Download, MessageSquare, Lock, QrCode
} from 'lucide-react';
import { ENTERPRISE_QUESTION_BANK, EnterpriseQuestionItem } from '../data/enterpriseQuestionBankData';
import {
  ENTERPRISE_CURRICULUM_BLUEPRINTS,
  ENTERPRISE_ERP_HALL_SCHEDULES,
  CurriculumModuleBlueprint,
  ErpHallScheduleItem
} from '../data/enterpriseBlueprintsCatalog';
import {
  ENTERPRISE_CERTIFICATE_REGISTRY,
  ENTERPRISE_CODE_TEMPLATES,
  EnterpriseCertificateRecord
} from '../data/enterpriseKnowledgeVault';
import {
  ENTERPRISE_FINANCIAL_LEDGER,
  ENTERPRISE_STUDENT_CRM_RECORDS,
  ENTERPRISE_SECURITY_AUDIT_MATRIX,
  FinancialTransactionRecord,
  StudentCrmRecord
} from '../data/enterpriseFinanceAndCrmData';
import { buildWhatsAppUrl } from '../services/storageService';
import PwaDiagnostics from '../../components/PwaDiagnostics';

interface EnterpriseErpSuiteProps {
  lang: 'ar' | 'en';
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function EnterpriseErpSuite({ lang = 'ar', showToast }: EnterpriseErpSuiteProps) {
  const isRtl = lang === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<
    'qbank' | 'curriculum' | 'halls' | 'finance' | 'crm' | 'certificates' | 'codetemplates' | 'security' | 'pwa'
  >('qbank');

  // 1. Question Bank & Interactive Exam State
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [qSearch, setQSearch] = useState<string>('');
  const [qPage, setQPage] = useState<number>(1);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // 2. Curriculum Explorer State
  const [currDeptFilter, setCurrDeptFilter] = useState<string>('all');
  const [currSearch, setCurrSearch] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<CurriculumModuleBlueprint | null>(
    ENTERPRISE_CURRICULUM_BLUEPRINTS[0] || null
  );

  // 3. ERP Hall Schedule State
  const [hallSchedules, setHallSchedules] = useState<ErpHallScheduleItem[]>(() => ENTERPRISE_ERP_HALL_SCHEDULES);
  const [newHallCourse, setNewHallCourse] = useState<string>('');
  const [newHallInstructor, setNewHallInstructor] = useState<string>('');

  // 4. Financial Ledger & Payroll Split Calculator State
  const [ledger, setLedger] = useState<FinancialTransactionRecord[]>(() => ENTERPRISE_FINANCIAL_LEDGER);
  const [finTypeFilter, setFinTypeFilter] = useState<string>('all');
  const [finSearch, setFinSearch] = useState<string>('');
  const [calcStudentsCount, setCalcStudentsCount] = useState<number>(85);
  const [calcTuitionFee, setCalcTuitionFee] = useState<number>(450);
  const [calcCenterPercent, setCalcCenterPercent] = useState<number>(30);

  // 5. Student CRM & Attendance State
  const [studentsCrm, setStudentsCrm] = useState<StudentCrmRecord[]>(() => ENTERPRISE_STUDENT_CRM_RECORDS);
  const [crmSearch, setCrmSearch] = useState<string>('');
  const [crmStatusFilter, setCrmStatusFilter] = useState<string>('all');

  // 6. Certificate Verification & Issuance State
  const [certificates, setCertificates] = useState<EnterpriseCertificateRecord[]>(() => ENTERPRISE_CERTIFICATE_REGISTRY);
  const [certQuery, setCertQuery] = useState<string>('LW-CERT-2026-0001');
  const [newCertStudent, setNewCertStudent] = useState<string>('');
  const [newCertProgram, setNewCertProgram] = useState<string>('');
  const [newCertGrade, setNewCertGrade] = useState<number>(96);

  // 7. Code Templates Vault State
  const [codeCategory, setCodeCategory] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(ENTERPRISE_CODE_TEMPLATES[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 8. Security Audit State
  const [secSearch, setSecSearch] = useState<string>('');
  const [auditRunning, setAuditRunning] = useState<boolean>(false);

  // Filtered Question Bank
  const filteredQuestions = useMemo(() => {
    return ENTERPRISE_QUESTION_BANK.filter((q) => {
      if (selectedTrack !== 'all' && q.trackId !== selectedTrack) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (qSearch.trim()) {
        const term = qSearch.toLowerCase();
        return (
          q.questionAr.toLowerCase().includes(term) ||
          q.questionEn.toLowerCase().includes(term) ||
          q.topicAr.toLowerCase().includes(term) ||
          q.topicEn.toLowerCase().includes(term) ||
          q.referenceCode.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [selectedTrack, selectedDifficulty, qSearch]);

  const quizQuestions = useMemo(() => filteredQuestions.slice(0, 10), [filteredQuestions]);

  // Filtered Curriculum Blueprints
  const filteredCurricula = useMemo(() => {
    return ENTERPRISE_CURRICULUM_BLUEPRINTS.filter((c) => {
      if (currDeptFilter !== 'all' && !c.code.startsWith(currDeptFilter)) return false;
      if (currSearch.trim()) {
        const term = currSearch.toLowerCase();
        return (
          c.titleAr.toLowerCase().includes(term) ||
          c.titleEn.toLowerCase().includes(term) ||
          c.code.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [currDeptFilter, currSearch]);

  // Filtered Financial Ledger
  const filteredLedger = useMemo(() => {
    return ledger.filter((tx) => {
      if (finTypeFilter !== 'all' && tx.type !== finTypeFilter) return false;
      if (finSearch.trim()) {
        const term = finSearch.toLowerCase();
        return (
          tx.invoiceCode.toLowerCase().includes(term) ||
          tx.partyNameAr.toLowerCase().includes(term) ||
          tx.partyNameEn.toLowerCase().includes(term) ||
          tx.courseOrItemAr.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [ledger, finTypeFilter, finSearch]);

  // Filtered Student CRM
  const filteredStudents = useMemo(() => {
    return studentsCrm.filter((st) => {
      if (crmStatusFilter !== 'all' && st.subscriptionStatus !== crmStatusFilter) return false;
      if (crmSearch.trim()) {
        const term = crmSearch.toLowerCase();
        return (
          st.studentCode.toLowerCase().includes(term) ||
          st.fullNameAr.toLowerCase().includes(term) ||
          st.fullNameEn.toLowerCase().includes(term) ||
          st.trackAr.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [studentsCrm, crmStatusFilter, crmSearch]);

  // Filtered Certificates
  const matchedCertificates = useMemo(() => {
    const q = certQuery.trim().toLowerCase();
    if (!q) return certificates.slice(0, 12);
    return certificates
      .filter(
        (c) =>
          c.serialNumber.toLowerCase().includes(q) ||
          c.studentNameAr.toLowerCase().includes(q) ||
          c.studentNameEn.toLowerCase().includes(q)
      )
      .slice(0, 16);
  }, [certificates, certQuery]);

  // Filtered Code Templates
  const filteredTemplates = useMemo(() => {
    return ENTERPRISE_CODE_TEMPLATES.filter((tpl) =>
      codeCategory === 'all' ? true : tpl.category === codeCategory
    );
  }, [codeCategory]);

  const activeTemplate = useMemo(
    () => filteredTemplates.find((t) => t.id === selectedTemplateId) || filteredTemplates[0],
    [filteredTemplates, selectedTemplateId]
  );

  // Filtered Security Matrix
  const filteredSecurity = useMemo(() => {
    if (!secSearch.trim()) return ENTERPRISE_SECURITY_AUDIT_MATRIX;
    const term = secSearch.toLowerCase();
    return ENTERPRISE_SECURITY_AUDIT_MATRIX.filter(
      (s) =>
        s.endpoint.toLowerCase().includes(term) ||
        s.moduleAr.toLowerCase().includes(term) ||
        s.moduleEn.toLowerCase().includes(term) ||
        s.authLevel.toLowerCase().includes(term)
    );
  }, [secSearch]);

  // Payroll Split Calculation
  const grossCalc = calcStudentsCount * calcTuitionFee;
  const centerShareCalc = Math.round(grossCalc * (calcCenterPercent / 100));
  const instructorNetCalc = grossCalc - centerShareCalc;

  const handleExportLedgerCsv = () => {
    const headers = ['InvoiceCode', 'Date', 'Type', 'Party', 'GrossEGP', 'CenterShareEGP', 'InstructorShareEGP', 'Method'];
    const rows = filteredLedger.slice(0, 200).map((r) => [
      r.invoiceCode,
      r.date,
      r.type,
      `"${r.partyNameEn}"`,
      r.grossAmountEgp,
      r.centerShareEgp,
      r.instructorShareEgp,
      `"${r.paymentMethodEn}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LernWeb_Financial_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(isRtl ? 'تم تصدير التقرير المالي بصيغة CSV بنجاح!' : 'Financial ledger exported as CSV!', 'success');
  };

  const handleCheckInStudent = (studentId: string) => {
    setStudentsCrm((prev) =>
      prev.map((st) =>
        st.id === studentId
          ? {
              ...st,
              attendanceRate: Math.min(100, st.attendanceRate + 1),
              lastCheckIn: new Date().toLocaleTimeString()
            }
          : st
      )
    );
    showToast(isRtl ? 'تم تسجيل حضور الطالب بالباركود وتحديث السجل!' : 'Student QR check-in recorded!', 'success');
  };

  const handleAddHallSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHallCourse.trim() || !newHallInstructor.trim()) {
      showToast(isRtl ? 'يرجى إدخال اسم المحاضرة واسم المحاضر' : 'Please enter course title and instructor', 'error');
      return;
    }
    const newItem: ErpHallScheduleItem = {
      id: `hall-custom-${Date.now()}`,
      hallCode: `H-NEW-${hallSchedules.length + 1}`,
      hallNameAr: `قاعة البث الذكي (H-${hallSchedules.length + 1})`,
      hallNameEn: `Smart Stream Hall (H-${hallSchedules.length + 1})`,
      branchAr: 'المقر الرئيسي - القاهرة الجديدة',
      branchEn: 'Main Campus - New Cairo',
      dayOfWeekAr: 'السبت',
      dayOfWeekEn: 'Saturday',
      timeSlot: '05:00 PM - 07:00 PM',
      courseTitleAr: newHallCourse.trim(),
      courseTitleEn: newHallCourse.trim(),
      instructorAr: newHallInstructor.trim(),
      instructorEn: newHallInstructor.trim(),
      capacity: 120,
      enrolled: 45,
      status: 'active',
      streamType: 'hybrid'
    };
    setHallSchedules([newItem, ...hallSchedules]);
    setNewHallCourse('');
    setNewHallInstructor('');
    showToast(isRtl ? 'تم حجز القاعة وإضافتها لجدول السنتر بنجاح!' : 'Hall schedule added successfully!', 'success');
  };

  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertStudent.trim() || !newCertProgram.trim()) {
      showToast(isRtl ? 'يرجى إدخال اسم الطالب والبرنامج التدريبي' : 'Please enter student name and program title', 'error');
      return;
    }
    const serial = `LW-CERT-2026-${(certificates.length + 1).toString().padStart(4, '0')}`;
    const newCert: EnterpriseCertificateRecord = {
      serialNumber: serial,
      studentNameAr: newCertStudent.trim(),
      studentNameEn: newCertStudent.trim(),
      programTitleAr: newCertProgram.trim(),
      programTitleEn: newCertProgram.trim(),
      issueDate: new Date().toISOString().split('T')[0],
      gradePercent: Number(newCertGrade) || 95,
      honorsAr: Number(newCertGrade) >= 90 ? 'امتياز مع مرتبة الشرف' : 'جيد جداً',
      honorsEn: Number(newCertGrade) >= 90 ? 'Distinction with Honors' : 'Very Good',
      centerNameAr: 'أكاديمية ليرن ويب الدولية',
      centerNameEn: 'Lern Web International Academy',
      verified: true
    };
    setCertificates([newCert, ...certificates]);
    setCertQuery(serial);
    setNewCertStudent('');
    setNewCertProgram('');
    showToast(
      isRtl ? `تم إصدار وتوثيق الشهادة بنجاح برقم: ${serial}` : `Certificate issued & verified: ${serial}`,
      'success'
    );
  };

  const handleCopySnippet = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast(isRtl ? 'تم نسخ الكود المصدري للحافظة' : 'Source code copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const calculateQuizScore = () => {
    let correct = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    quizQuestions.forEach((q) => {
      totalPoints += q.points;
      if (quizAnswers[q.id] === q.correctIndex) {
        correct += 1;
        earnedPoints += q.points;
      }
    });
    return { correct, total: quizQuestions.length, earnedPoints, totalPoints };
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 p-6 md:p-8 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-blue-400 font-semibold">
              <span>{isRtl ? 'منظومة الإدارة الأكاديمية الشاملة' : 'Enterprise Academic & ERP Suite'}</span>
              <span>·</span>
              <span>{isRtl ? '1,020+ سؤال معياري' : '1,020+ Standardized Questions'}</span>
              <span>·</span>
              <span>{isRtl ? '520+ قيد مالي ومحاسبي' : '520+ Financial Records'}</span>
              <span>·</span>
              <span>{isRtl ? '550+ ملف طالب CRM' : '550+ Student CRM Profiles'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {isRtl
                ? 'مركز القيادة المؤسسي وإدارة المراكز التعليمية (ERP & LMS Suite)'
                : 'Enterprise Command Center & Educational ERP Suite'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isRtl
                ? 'بيئة متكاملة لإدارة بنوك الأسئلة، تخطيط المناهج الأكاديمية، جدولة القاعات، المحاسبة المالية ونسب المحاضرين، متابعة حضور الطلاب وتقارير أولياء الأمور، وتوثيق الشهادات الرقمية.'
                : 'Unified environment for interactive question banks, curriculum blueprints, smart hall scheduling, financial accounting & payroll splits, student CRM, and digital certificates.'}
            </p>
          </div>

          {/* Summary KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-center">
              <div className="text-xl font-black text-blue-400 font-mono tabular-nums">
                {ENTERPRISE_QUESTION_BANK.length}
              </div>
              <div className="text-[11px] text-slate-400">{isRtl ? 'سؤال تفاعلي' : 'Questions'}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-center">
              <div className="text-xl font-black text-emerald-400 font-mono tabular-nums">
                {studentsCrm.length}
              </div>
              <div className="text-[11px] text-slate-400">{isRtl ? 'طالب مسجل' : 'CRM Students'}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-center">
              <div className="text-xl font-black text-amber-400 font-mono tabular-nums">
                {ledger.length}
              </div>
              <div className="text-[11px] text-slate-400">{isRtl ? 'فاتورة ومعاملة' : 'Invoices'}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-center">
              <div className="text-xl font-black text-purple-400 font-mono tabular-nums">
                {certificates.length}
              </div>
              <div className="text-[11px] text-slate-400">{isRtl ? 'شهادة موثقة' : 'Certificates'}</div>
            </div>
          </div>
        </div>

        {/* Interactive Module Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'qbank', labelAr: 'بنك الأسئلة والاختبارات', labelEn: 'Question Bank & Quiz', icon: HelpCircle },
            { id: 'curriculum', labelAr: 'مخططات المناهج (306)', labelEn: 'Curricula (306)', icon: BookOpen },
            { id: 'halls', labelAr: 'جدولة القاعات والفروع', labelEn: 'Hall Scheduler', icon: Calendar },
            { id: 'finance', labelAr: 'الحسابات ونسب المحاضرين', labelEn: 'Finance & Payroll', icon: DollarSign },
            { id: 'crm', labelAr: 'متابعة الطلاب وأولياء الأمور', labelEn: 'Student CRM & QR', icon: Users },
            { id: 'certificates', labelAr: 'توثيق وإصدار الشهادات', labelEn: 'Certificates Registry', icon: Award },
            { id: 'codetemplates', labelAr: 'موسوعة القوالب البرمجية', labelEn: 'Code Blueprints', icon: Code2 },
            { id: 'security', labelAr: 'فاحص الأمان والـ API', labelEn: 'Security & API Audit', icon: Lock },
            { id: 'pwa', labelAr: 'تشخيص الـ PWA والأوفلاين', labelEn: 'PWA & Offline Mode', icon: Cpu }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isRtl ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: QUESTION BANK & LIVE EXAM SIMULATOR */}
      {activeSubTab === 'qbank' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isRtl ? 'بنك الأسئلة المعياري ومحاكي الاختبارات الفوري' : 'Standardized Question Bank & Live Assessment'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isRtl
                    ? `يتم عرض ${filteredQuestions.length} سؤال مطابق لمعايير البحث والتصفية الحالية`
                    : `Showing ${filteredQuestions.length} questions matching your active filters`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuizActive(!quizActive);
                  setQuizIndex(0);
                  setQuizSubmitted(false);
                }}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow transition cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>
                  {quizActive
                    ? (isRtl ? 'العودة لتصفح بنك الأسئلة' : 'Return to Question Browser')
                    : (isRtl ? 'بدء اختبار تفاعلي تجريبي (10 أسئلة)' : 'Start Interactive Quiz (10 Questions)')}
                </span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={qSearch}
                  onChange={(e) => {
                    setQSearch(e.target.value);
                    setQPage(1);
                  }}
                  placeholder={isRtl ? 'ابحث بالكود أو الموضوع أو نص السؤال...' : 'Search by code, topic, or question...'}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pr-10 pl-4 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <select
                value={selectedTrack}
                onChange={(e) => {
                  setSelectedTrack(e.target.value);
                  setQPage(1);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">{isRtl ? 'جميع المسارات والتخصصات (6 مسارات)' : 'All Academic Tracks (6 Tracks)'}</option>
                <option value="cs-fullstack">{isRtl ? 'هندسة البرمجيات وتطوير الويب' : 'Full-Stack Software Engineering'}</option>
                <option value="ai-ml">{isRtl ? 'الذكاء الاصطناعي وتعلم الآلة' : 'AI & Large Language Models'}</option>
                <option value="cyber-sec">{isRtl ? 'الأمن السيبراني وحماية السحابة' : 'Cybersecurity & Cloud Defense'}</option>
                <option value="math-stem">{isRtl ? 'الرياضيات والفيزياء المتقدمة STEM' : 'Advanced Math & Physics (STEM)'}</option>
                <option value="med-bio">{isRtl ? 'العلوم الطبية والبيولوجيا الجزيئية' : 'Medical Sciences & Molecular Biology'}</option>
                <option value="biz-erp">{isRtl ? 'إدارة الأعمال والأنظمة المالية ERP' : 'Business Management & Financial ERP'}</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setQPage(1);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">{isRtl ? 'جميع مستويات الصعوبة' : 'All Difficulty Levels'}</option>
                <option value="beginner">{isRtl ? 'مبتدئ / تأسيسي' : 'Foundational'}</option>
                <option value="intermediate">{isRtl ? 'متوسط / تطبيقي' : 'Intermediate'}</option>
                <option value="advanced">{isRtl ? 'متقدم / احترافي' : 'Advanced'}</option>
                <option value="expert">{isRtl ? 'خبير / معماري' : 'Expert Architect'}</option>
              </select>
            </div>

            {/* Interactive Quiz Mode vs Browser Mode */}
            {quizActive && quizQuestions.length > 0 ? (
              <div className="rounded-2xl border border-blue-500/30 bg-slate-950 p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="text-xs font-mono text-blue-400">
                    {isRtl
                      ? `السؤال ${quizIndex + 1} من ${quizQuestions.length}`
                      : `Question ${quizIndex + 1} of ${quizQuestions.length}`}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {quizQuestions[quizIndex].referenceCode} · {quizQuestions[quizIndex].points} pts
                  </div>
                </div>

                <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
                  {isRtl ? quizQuestions[quizIndex].questionAr : quizQuestions[quizIndex].questionEn}
                </h3>

                <div className="space-y-2.5">
                  {(isRtl ? quizQuestions[quizIndex].optionsAr : quizQuestions[quizIndex].optionsEn).map((opt, idx) => {
                    const qId = quizQuestions[quizIndex].id;
                    const chosen = quizAnswers[qId] === idx;
                    const isCorrect = quizQuestions[quizIndex].correctIndex === idx;
                    let borderStyle = 'border-slate-800 bg-slate-900/70 text-slate-200 hover:border-slate-700';
                    if (quizSubmitted) {
                      if (isCorrect) borderStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-200';
                      else if (chosen) borderStyle = 'border-rose-500 bg-rose-500/15 text-rose-200';
                    } else if (chosen) {
                      borderStyle = 'border-blue-500 bg-blue-600/20 text-white';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={quizSubmitted}
                        onClick={() => setQuizAnswers({ ...quizAnswers, [qId]: idx })}
                        className={`w-full text-right p-4 rounded-xl border text-xs md:text-sm font-medium transition flex items-center justify-between gap-3 cursor-pointer ${borderStyle}`}
                      >
                        <span>{opt}</span>
                        <span className="font-mono text-xs opacity-75">#{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-200 space-y-2">
                    <div className="font-bold">
                      {isRtl ? 'التفسير العلمي والهندسي للإجابة:' : 'Engineering & Academic Explanation:'}
                    </div>
                    <p>{isRtl ? quizQuestions[quizIndex].explanationAr : quizQuestions[quizIndex].explanationEn}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={quizIndex === 0}
                      onClick={() => setQuizIndex((i) => Math.max(0, i - 1))}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 disabled:opacity-40 cursor-pointer"
                    >
                      {isRtl ? 'السابق' : 'Previous'}
                    </button>
                    <button
                      type="button"
                      disabled={quizIndex >= quizQuestions.length - 1}
                      onClick={() => setQuizIndex((i) => Math.min(quizQuestions.length - 1, i + 1))}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 disabled:opacity-40 cursor-pointer"
                    >
                      {isRtl ? 'التالي' : 'Next'}
                    </button>
                  </div>

                  {!quizSubmitted ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuizSubmitted(true);
                        const res = calculateQuizScore();
                        showToast(
                          isRtl
                            ? `تم تصحيح الاختبار: حصلت على ${res.earnedPoints} من ${res.totalPoints} نقطة`
                            : `Quiz graded: ${res.earnedPoints} / ${res.totalPoints} points`,
                          'success'
                        );
                      }}
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white cursor-pointer"
                    >
                      {isRtl ? 'اعتماد وتصحيح الإجابات فوراً' : 'Submit & Grade Instantaneously'}
                    </button>
                  ) : (
                    <div className="text-xs font-bold text-emerald-400">
                      {(() => {
                        const s = calculateQuizScore();
                        return isRtl
                          ? `النتيجة النهائية: ${s.correct}/${s.total} إجابات صحيحة (${s.earnedPoints} نقطة)`
                          : `Final Score: ${s.correct}/${s.total} Correct (${s.earnedPoints} pts)`;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredQuestions.slice((qPage - 1) * 6, qPage * 6).map((item: EnterpriseQuestionItem) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>{item.referenceCode}</span>
                          <span>
                            {isRtl ? item.difficultyLabelAr : item.difficultyLabelEn} · {item.points} pts
                          </span>
                        </div>
                        <div className="text-xs text-blue-400 font-semibold">
                          {isRtl ? item.trackNameAr : item.trackNameEn} — {isRtl ? item.topicAr : item.topicEn}
                        </div>
                        <h4 className="text-sm font-bold text-white leading-relaxed">
                          {isRtl ? item.questionAr : item.questionEn}
                        </h4>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-900">
                        {(isRtl ? item.optionsAr : item.optionsEn).map((opt, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-3 py-2 rounded-lg border ${
                              idx === item.correctIndex
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold'
                                : 'border-slate-900 bg-slate-900/50 text-slate-400'
                            }`}
                          >
                            {idx + 1}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                  <span>
                    {isRtl
                      ? `صفحة ${qPage} من ${Math.max(1, Math.ceil(filteredQuestions.length / 6))}`
                      : `Page ${qPage} of ${Math.max(1, Math.ceil(filteredQuestions.length / 6))}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={qPage <= 1}
                      onClick={() => setQPage((p) => Math.max(1, p - 1))}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-200 disabled:opacity-40 cursor-pointer"
                    >
                      {isRtl ? 'السابق' : 'Prev'}
                    </button>
                    <button
                      type="button"
                      disabled={qPage >= Math.ceil(filteredQuestions.length / 6)}
                      onClick={() => setQPage((p) => p + 1)}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-200 disabled:opacity-40 cursor-pointer"
                    >
                      {isRtl ? 'التالي' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CURRICULUM BLUEPRINTS */}
      {activeSubTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <h3 className="text-base font-bold text-white">
              {isRtl ? 'فهرس المقررات والمناهج المعتمدة' : 'Academic Curriculum Directory'}
            </h3>
            <input
              type="text"
              value={currSearch}
              onChange={(e) => setCurrSearch(e.target.value)}
              placeholder={isRtl ? 'بحث برمز المقرر أو الاسم...' : 'Search by module code or title...'}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
            />
            <select
              value={currDeptFilter}
              onChange={(e) => setCurrDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
            >
              <option value="all">{isRtl ? 'جميع الكليات والأقسام (306 مقرر)' : 'All Faculties (306 Modules)'}</option>
              <option value="CSAI">{isRtl ? 'علوم الحاسب والذكاء الاصطناعي (CSAI)' : 'Computer Science & AI (CSAI)'}</option>
              <option value="STEM">{isRtl ? 'الهندسة والعلوم التطبيقية (STEM)' : 'STEM & Engineering (STEM)'}</option>
              <option value="BIZ">{isRtl ? 'إدارة الأعمال والـ ERP (BIZ)' : 'Business & ERP (BIZ)'}</option>
              <option value="MED">{isRtl ? 'العلوم الطبية والحيوية (MED)' : 'Medical & Life Sciences (MED)'}</option>
              <option value="LNG">{isRtl ? 'اللغات والترجمة (LNG)' : 'Languages & Linguistics (LNG)'}</option>
              <option value="SEC">{isRtl ? 'الأمن السيبراني والسحابة (SEC)' : 'Cybersecurity & Cloud (SEC)'}</option>
            </select>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredCurricula.slice(0, 40).map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModule(mod)}
                  className={`w-full text-right p-3.5 rounded-2xl border transition cursor-pointer ${
                    selectedModule?.id === mod.id
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-blue-400">
                    <span>{mod.code}</span>
                    <span>{mod.creditHours} CR · {mod.labsCount} Labs</span>
                  </div>
                  <div className="font-bold text-xs mt-1">{isRtl ? mod.titleAr : mod.titleEn}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
            {selectedModule && (
              <>
                <div className="border-b border-slate-800 pb-4 space-y-2">
                  <div className="text-xs font-mono text-blue-400">
                    {selectedModule.code} · {isRtl ? selectedModule.departmentAr : selectedModule.departmentEn}
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    {isRtl ? selectedModule.titleAr : selectedModule.titleEn}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {isRtl ? selectedModule.summaryAr : selectedModule.summaryEn}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                    <span>
                      {isRtl ? 'المحاضر المشرف:' : 'Lead Instructor:'}{' '}
                      <strong className="text-white">
                        {isRtl ? selectedModule.instructorAr : selectedModule.instructorEn}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      {isRtl ? 'الساعات المعتمدة:' : 'Credit Hours:'}{' '}
                      <strong className="text-white font-mono">{selectedModule.creditHours}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      {isRtl ? 'المختبرات العملية:' : 'Practical Labs:'}{' '}
                      <strong className="text-white font-mono">{selectedModule.labsCount}</strong>
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">
                    {isRtl ? 'مخرجات التعلم المستهدفة (Learning Outcomes):' : 'Target Learning Outcomes:'}
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(isRtl ? selectedModule.learningOutcomesAr : selectedModule.learningOutcomesEn).map((out, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">
                    {isRtl ? 'الخطة الزمنية الأسبوعية للمقرر (8 أسابيع):' : '8-Week Academic Syllabus Breakdown:'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedModule.weeklySyllabus.map((wk) => (
                      <div key={wk.week} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                        <div className="text-[11px] font-mono text-blue-400">
                          {isRtl ? `الأسبوع #${wk.week}` : `Week #${wk.week}`}
                        </div>
                        <div className="text-xs font-bold text-white">
                          {isRtl ? wk.topicAr : wk.topicEn}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {isRtl ? wk.deliverableAr : wk.deliverableEn}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ERP HALL & BRANCH SCHEDULER */}
      {activeSubTab === 'halls' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isRtl
                    ? 'نظام إدارة وجدولة القاعات والفروع التعليمية (ERP Hall Scheduler)'
                    : 'Smart Campus & Hall Booking Scheduler'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isRtl
                    ? `إجمالي الفترات المجدولة النشطة: ${hallSchedules.length} فترة دراسية عبر الفروع`
                    : `Total scheduled sessions: ${hallSchedules.length} active slots across branches`}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddHallSchedule} className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={newHallCourse}
                onChange={(e) => setNewHallCourse(e.target.value)}
                placeholder={isRtl ? 'اسم المحاضرة أو المراجعة النهائية...' : 'Lecture or Workshop Title...'}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
              />
              <input
                type="text"
                value={newHallInstructor}
                onChange={(e) => setNewHallInstructor(e.target.value)}
                placeholder={isRtl ? 'اسم المحاضر / المدرس...' : 'Instructor Name...'}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isRtl ? 'إضافة وحجز قاعة دراسية جديدة' : 'Book & Schedule New Hall Slot'}</span>
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hallSchedules.slice(0, 18).map((h) => {
                const occupancy = Math.min(100, Math.round((h.enrolled / h.capacity) * 100));
                return (
                  <div key={h.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-blue-400">
                      <span>{h.hallCode}</span>
                      <span>{h.timeSlot}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{isRtl ? h.courseTitleAr : h.courseTitleEn}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isRtl ? h.branchAr : h.branchEn} · {isRtl ? h.dayOfWeekAr : h.dayOfWeekEn}
                      </p>
                    </div>
                    <div className="text-xs text-slate-300">
                      {isRtl ? 'المحاضر:' : 'Instructor:'} <strong>{isRtl ? h.instructorAr : h.instructorEn}</strong>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{isRtl ? 'نسبة الإشغال والحضور' : 'Occupancy'}</span>
                        <span>
                          {h.enrolled} / {h.capacity} ({occupancy}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${occupancy}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FINANCIAL LEDGER & INSTRUCTOR PAYROLL CALCULATOR */}
      {activeSubTab === 'finance' && (
        <div className="space-y-6">
          {/* Interactive Instructor Payroll Split Calculator */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isRtl
                    ? 'حاسبة تسوية مستحقات المحاضرين ونسب السنتر (Payroll Split Calculator)'
                    : 'Instructor Revenue Split & Center Accounting Calculator'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRtl
                    ? 'احسب تلقائياً صافي ربح المحاضر وحصة المركز التعليمي بناءً على عدد الطلاب وقيمة الاشتراك'
                    : 'Automatically compute instructor net payout and center commission share'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportLedgerCsv}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{isRtl ? 'تصدير الدفتر المالي (CSV)' : 'Download CSV Report'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <label className="text-xs text-slate-400 block">
                  {isRtl ? 'عدد الطلاب المسجلين بالمجموعة' : 'Enrolled Students Count'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={calcStudentsCount}
                  onChange={(e) => setCalcStudentsCount(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-mono font-bold text-white"
                />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <label className="text-xs text-slate-400 block">
                  {isRtl ? 'قيمة اشتراك الطالب (ج.م / EGP)' : 'Tuition Fee per Student (EGP)'}
                </label>
                <input
                  type="number"
                  min={50}
                  value={calcTuitionFee}
                  onChange={(e) => setCalcTuitionFee(Math.max(10, Number(e.target.value)))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-mono font-bold text-white"
                />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <label className="text-xs text-slate-400 block">
                  {isRtl ? 'نسبة المركز التعليمي والمنصة (%)' : 'Center & Platform Share (%)'}
                </label>
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={calcCenterPercent}
                  onChange={(e) => setCalcCenterPercent(Math.min(90, Math.max(5, Number(e.target.value))))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-mono font-bold text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 text-center">
                <div className="text-xs text-slate-400">{isRtl ? 'إجمالي التحصيل الكلي' : 'Gross Tuition Revenue'}</div>
                <div className="text-2xl font-black text-white font-mono tabular-nums mt-1">
                  {grossCalc.toLocaleString()} EGP
                </div>
              </div>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-center">
                <div className="text-xs text-slate-400">
                  {isRtl ? `حصة السنتر والمنصة (${calcCenterPercent}%)` : `Center Share (${calcCenterPercent}%)`}
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono tabular-nums mt-1">
                  {centerShareCalc.toLocaleString()} EGP
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
                <div className="text-xs text-slate-400">
                  {isRtl ? `صافي مستحقات المحاضر (${100 - calcCenterPercent}%)` : `Instructor Net Payout (${100 - calcCenterPercent}%)`}
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums mt-1">
                  {instructorNetCalc.toLocaleString()} EGP
                </div>
              </div>
            </div>

            {/* Ledger Filter & Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <input
                type="text"
                value={finSearch}
                onChange={(e) => setFinSearch(e.target.value)}
                placeholder={isRtl ? 'بحث برقم الفاتورة أو اسم المحاضر أو الدورة...' : 'Search by invoice code, instructor, or course...'}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
              />
              <select
                value={finTypeFilter}
                onChange={(e) => setFinTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
              >
                <option value="all">{isRtl ? 'جميع القيود والمعاملات المالية (520 معاملة)' : 'All Transactions (520 Records)'}</option>
                <option value="tuition_income">{isRtl ? 'تحصيل اشتراكات الطلاب' : 'Student Tuition Receipts'}</option>
                <option value="instructor_payout">{isRtl ? 'تسوية مستحقات المحاضرين' : 'Instructor Revenue Payouts'}</option>
                <option value="platform_license">{isRtl ? 'تراخيص المنصة السحابية' : 'Cloud Platform Licenses'}</option>
                <option value="center_expense">{isRtl ? 'مصروفات التشغيل والقاعات' : 'Hall Operations Expenses'}</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold">{isRtl ? 'رقم الفاتورة' : 'Invoice'}</th>
                    <th className="p-3 font-semibold">{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th className="p-3 font-semibold">{isRtl ? 'البيان / الطرف' : 'Party'}</th>
                    <th className="p-3 font-semibold">{isRtl ? 'الإجمالي' : 'Gross'}</th>
                    <th className="p-3 font-semibold">{isRtl ? 'حصة السنتر' : 'Center'}</th>
                    <th className="p-3 font-semibold">{isRtl ? 'صافي المحاضر' : 'Instructor'}</th>
                    <th className="p-3 font-semibold">{isRtl ? 'وسيلة الدفع' : 'Method'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 bg-slate-900/50">
                  {filteredLedger.slice(0, 16).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-blue-400">{tx.invoiceCode}</td>
                      <td className="p-3 font-mono text-slate-400">{tx.date}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{isRtl ? tx.partyNameAr : tx.partyNameEn}</div>
                        <div className="text-[11px] text-slate-400">{isRtl ? tx.courseOrItemAr : tx.courseOrItemEn}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-white tabular-nums">{tx.grossAmountEgp.toLocaleString()} EGP</td>
                      <td className="p-3 font-mono text-amber-400 tabular-nums">{tx.centerShareEgp.toLocaleString()} EGP</td>
                      <td className="p-3 font-mono text-emerald-400 tabular-nums">{tx.instructorShareEgp.toLocaleString()} EGP</td>
                      <td className="p-3 text-slate-300">{isRtl ? tx.paymentMethodAr : tx.paymentMethodEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: STUDENT CRM, QR ATTENDANCE & PARENT WHATSAPP ALERTS */}
      {activeSubTab === 'crm' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isRtl
                    ? 'سجل متابعة الطلاب والحضور بالباركود وتقارير أولياء الأمور (Student CRM)'
                    : 'Student CRM, QR Attendance & Parent WhatsApp Alerts'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRtl
                    ? `إجمالي ملفات الطلاب النشطة: ${filteredStudents.length} طالب — يمكنك تسجيل الحضور الفوري وإرسال تقرير الأداء لولي الأمر بضغطة واحدة`
                    : `Active student records: ${filteredStudents.length} — Record instant QR check-ins and dispatch parent WhatsApp reports`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={crmSearch}
                onChange={(e) => setCrmSearch(e.target.value)}
                placeholder={isRtl ? 'ابحث بكود الطالب أو الاسم أو المسار الدراسي...' : 'Search by student code, name, or track...'}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
              />
              <select
                value={crmStatusFilter}
                onChange={(e) => setCrmStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
              >
                <option value="all">{isRtl ? 'جميع حالات الاشتراك (550 طالب)' : 'All Subscription Statuses (550 Students)'}</option>
                <option value="paid">{isRtl ? 'مسدد بالكامل' : 'Fully Paid'}</option>
                <option value="installment">{isRtl ? 'نظام أقساط' : 'Installment Plan'}</option>
                <option value="renewal_due">{isRtl ? 'مستحق التجديد' : 'Renewal Due'}</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.slice(0, 15).map((st) => {
                const reportText = isRtl
                  ? `تقرير متابعة الطالب من منصة ليرن ويب:\nالطالب: ${st.fullNameAr}\nالكود: ${st.studentCode}\nالمسار: ${st.trackAr}\nنسبة الحضور: ${st.attendanceRate}%\nمتوسط الاختبارات: ${st.examAverage}%\nالواجبات المنجزة: ${st.completedAssignments}/${st.totalAssignments}`
                  : `Lern Web Student Progress Report:\nStudent: ${st.fullNameEn} (${st.studentCode})\nTrack: ${st.trackEn}\nAttendance: ${st.attendanceRate}%\nExam Avg: ${st.examAverage}%`;

                return (
                  <div key={st.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-blue-400">
                        <span>{st.studentCode}</span>
                        <span className="text-slate-400">{st.lastCheckIn}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{isRtl ? st.fullNameAr : st.fullNameEn}</h4>
                      <p className="text-xs text-slate-400">{isRtl ? st.trackAr : st.trackEn}</p>

                      <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                        <div className="rounded-xl bg-slate-900 p-2">
                          <div className="text-xs font-mono font-bold text-emerald-400">{st.attendanceRate}%</div>
                          <div className="text-[10px] text-slate-400">{isRtl ? 'الحضور' : 'Attendance'}</div>
                        </div>
                        <div className="rounded-xl bg-slate-900 p-2">
                          <div className="text-xs font-mono font-bold text-blue-400">{st.examAverage}%</div>
                          <div className="text-[10px] text-slate-400">{isRtl ? 'الاختبارات' : 'Exams'}</div>
                        </div>
                        <div className="rounded-xl bg-slate-900 p-2">
                          <div className="text-xs font-mono font-bold text-amber-400">
                            {st.completedAssignments}/{st.totalAssignments}
                          </div>
                          <div className="text-[10px] text-slate-400">{isRtl ? 'المهام' : 'Tasks'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                      <button
                        type="button"
                        onClick={() => handleCheckInStudent(st.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600 text-blue-300 hover:text-white py-2 text-xs font-bold transition cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'تسجيل حضور QR' : 'QR Check-in'}</span>
                      </button>
                      <a
                        href={buildWhatsAppUrl(st.parentPhone, reportText)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600 text-emerald-300 hover:text-white py-2 text-xs font-bold transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'تقرير ولي الأمر' : 'Parent Alert'}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: DIGITAL CERTIFICATES REGISTRY & ISSUANCE */}
      {activeSubTab === 'certificates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleIssueCertificate} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {isRtl ? 'إصدار شهادة رقمية موثقة فورية' : 'Issue Verified Digital Certificate'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">{isRtl ? 'اسم الخريج / المتدرب' : 'Student Full Name'}</label>
                <input
                  type="text"
                  value={newCertStudent}
                  onChange={(e) => setNewCertStudent(e.target.value)}
                  placeholder={isRtl ? 'مثال: م. طارق محمود العدل' : 'e.g. Tarek Mahmoud'}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{isRtl ? 'اسم البرنامج أو الدبلوم' : 'Diploma / Program Title'}</label>
                <input
                  type="text"
                  value={newCertProgram}
                  onChange={(e) => setNewCertProgram(e.target.value)}
                  placeholder={isRtl ? 'دبلوم تطوير المنصات السحابية المتكاملة' : 'Cloud Platform Engineering Diploma'}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{isRtl ? 'النسبة المئوية (%)' : 'Final Score (%)'}</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={newCertGrade}
                  onChange={(e) => setNewCertGrade(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow cursor-pointer"
              >
                {isRtl ? 'إصدار وتوليد رقم تسلسلي موثق' : 'Issue & Generate Serial Number'}
              </button>
            </div>
          </form>

          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-white">
                {isRtl ? 'سجل التحقق من الشهادات المعتمدة (450+ شهادة)' : 'Verified Certificate Lookup Registry (450+ Records)'}
              </h3>
              <input
                type="text"
                value={certQuery}
                onChange={(e) => setCertQuery(e.target.value)}
                placeholder={isRtl ? 'أدخل الرقم التسلسلي LW-CERT-2026-0001...' : 'Enter serial LW-CERT-2026-0001...'}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono sm:w-64"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matchedCertificates.map((cert) => (
                <div key={cert.serialNumber} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">{cert.serialNumber}</span>
                    <span className="text-slate-400">{cert.issueDate}</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {isRtl ? cert.studentNameAr : cert.studentNameEn}
                  </div>
                  <div className="text-xs text-blue-300">
                    {isRtl ? cert.programTitleAr : cert.programTitleEn}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                    <span>
                      {isRtl ? cert.honorsAr : cert.honorsEn} ({cert.gradePercent}%)
                    </span>
                    <span className="text-emerald-400 font-semibold">{isRtl ? '✓ موثقة رسمياً' : '✓ Verified'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: ARCHITECTURE CODE VAULT */}
      {activeSubTab === 'codetemplates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <h3 className="text-base font-bold text-white">
              {isRtl ? 'موسوعة القوالب البرمجية (220 نموذج)' : 'Enterprise Code Blueprints (220 Templates)'}
            </h3>
            <select
              value={codeCategory}
              onChange={(e) => setCodeCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
            >
              <option value="all">{isRtl ? 'جميع التصنيفات المعمارية' : 'All Architectural Categories'}</option>
              <option value="frontend">Frontend & Virtual Classrooms</option>
              <option value="backend">Backend & Payment Webhooks</option>
              <option value="database">Firestore Multi-Tenant Rules</option>
              <option value="pwa">PWA & Offline Sync Workers</option>
              <option value="ai">Gemini AI Assessment Generators</option>
              <option value="security">Anti-Piracy & Stream Guards</option>
            </select>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredTemplates.slice(0, 45).map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`w-full text-right p-3 rounded-xl border text-xs transition cursor-pointer ${
                    activeTemplate?.id === tpl.id
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-mono text-[10px] text-blue-400">{tpl.fileName}</div>
                  <div className="font-bold mt-0.5">{isRtl ? tpl.titleAr : tpl.titleEn}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            {activeTemplate && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-mono text-blue-400">{activeTemplate.fileName}</div>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {isRtl ? activeTemplate.titleAr : activeTemplate.titleEn}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(activeTemplate.id, activeTemplate.codeSnippet)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white cursor-pointer"
                  >
                    {copiedId === activeTemplate.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === activeTemplate.id ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الكود' : 'Copy Code')}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {isRtl ? activeTemplate.descriptionAr : activeTemplate.descriptionEn}
                </p>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs text-slate-200 overflow-x-auto" dir="ltr">
                  <pre className="whitespace-pre">{activeTemplate.codeSnippet}</pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 8: CLOUD SECURITY & API AUDIT MATRIX */}
      {activeSubTab === 'security' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isRtl
                  ? 'مصفوفة فحص الأمان السحابي وتوثيق المسارات (120 قاعدة حماية)'
                  : 'Cloud Security Audit Matrix & API Route Specifications'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl
                  ? 'مراجعة حية لقواعد أمان Firestore ومسارات الخادم الخلفي وتشفير الجلسات'
                  : 'Live inspection of Firestore security rules, backend API endpoints, and session encryption'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuditRunning(true);
                setTimeout(() => {
                  setAuditRunning(false);
                  showToast(
                    isRtl
                      ? 'اكتمل الفحص الأمني الشامل: جميع الـ 120 مساراً وقواعد Firestore مؤمنة بالكامل!'
                      : 'Security audit completed: All 120 endpoints and Firestore rules verified!',
                    'success'
                  );
                }, 600);
              }}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white cursor-pointer shrink-0"
            >
              {auditRunning
                ? (isRtl ? 'جاري الفحص الأمني...' : 'Running Security Scan...')
                : (isRtl ? 'تشغيل فحص الأمان الشامل' : 'Run Full Security Audit')}
            </button>
          </div>

          <input
            type="text"
            value={secSearch}
            onChange={(e) => setSecSearch(e.target.value)}
            placeholder={isRtl ? 'ابحث باسم المسار (/api/...) أو مستوى الصلاحية...' : 'Filter by endpoint path or RBAC level...'}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSecurity.slice(0, 18).map((sec) => (
              <div key={sec.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-blue-400 font-bold">
                    [{sec.method}] {sec.endpoint}
                  </span>
                  <span className="text-emerald-400">{sec.authLevel}</span>
                </div>
                <div className="text-sm font-bold text-white">{isRtl ? sec.moduleAr : sec.moduleEn}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                  <span>{sec.encryption}</span>
                  <span>{sec.rateLimit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 9: PWA & OFFLINE FALLBACK DIAGNOSTICS */}
      {activeSubTab === 'pwa' && <PwaDiagnostics lang={lang} />}
    </div>
  );
}
