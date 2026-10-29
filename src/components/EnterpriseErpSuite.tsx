import React, { useState, useMemo } from 'react';
import {
  BookOpen, CheckCircle2, Code2, Cpu, FileSpreadsheet, Filter, GraduationCap,
  Layers, Play, Search, ShieldCheck, Award, Calendar, Clock, Building2,
  Copy, Check, RefreshCw, ChevronRight, ChevronLeft, HelpCircle, Plus, Sparkles
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
import PwaDiagnostics from '../../components/PwaDiagnostics';

interface EnterpriseErpSuiteProps {
  lang: 'ar' | 'en';
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function EnterpriseErpSuite({ lang = 'ar', showToast }: EnterpriseErpSuiteProps) {
  const isRtl = lang === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<'qbank' | 'curriculum' | 'halls' | 'certificates' | 'codetemplates' | 'pwa'>('qbank');

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
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [newHallCourse, setNewHallCourse] = useState<string>('');
  const [newHallInstructor, setNewHallInstructor] = useState<string>('');

  // 4. Certificate Verification & Issuance State
  const [certificates, setCertificates] = useState<EnterpriseCertificateRecord[]>(() => ENTERPRISE_CERTIFICATE_REGISTRY);
  const [certQuery, setCertQuery] = useState<string>('LW-CERT-2026-0001');
  const [newCertStudent, setNewCertStudent] = useState<string>('');
  const [newCertProgram, setNewCertProgram] = useState<string>('');
  const [newCertGrade, setNewCertGrade] = useState<number>(96);

  // 5. Code Templates Vault State
  const [codeCategory, setCodeCategory] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(ENTERPRISE_CODE_TEMPLATES[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Filtered Hall Schedules
  const filteredHalls = useMemo(() => {
    return hallSchedules.filter((h) => {
      if (branchFilter !== 'all' && h.branchAr !== branchFilter && h.branchEn !== branchFilter) return false;
      if (dayFilter !== 'all' && h.dayOfWeekAr !== dayFilter && h.dayOfWeekEn !== dayFilter) return false;
      return true;
    });
  }, [hallSchedules, branchFilter, dayFilter]);

  // Filtered Certificates
  const matchedCertificates = useMemo(() => {
    const q = certQuery.trim().toLowerCase();
    if (!q) return certificates.slice(0, 12);
    return certificates.filter(
      (c) =>
        c.serialNumber.toLowerCase().includes(q) ||
        c.studentNameAr.toLowerCase().includes(q) ||
        c.studentNameEn.toLowerCase().includes(q)
    ).slice(0, 16);
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
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
              <span>{isRtl ? 'منظومة الإدارة الأكاديمية الشاملة' : 'Enterprise Academic & ERP Suite'}</span>
              <span>·</span>
              <span>{isRtl ? '1,020+ سؤال معياري' : '1,020+ Standardized Questions'}</span>
              <span>·</span>
              <span>{isRtl ? '306 منهج أكاديمي' : '306 Curriculum Blueprints'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {isRtl
                ? 'مركز القيادة المؤسسي وإدارة المراكز التعليمية (ERP & LMS Suite)'
                : 'Enterprise Command Center & Educational ERP Suite'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isRtl
                ? 'بيئة متكاملة لإدارة بنوك الأسئلة والاختبارات التفاعلية، تخطيط المناهج الأكاديمية، جدولة القاعات والسناتر، توثيق الشهادات الرقمية، ومكتبة القوالب البرمجية.'
                : 'Unified environment for interactive question banks, academic curriculum blueprints, smart hall scheduling, digital certificate verification, and full-stack code templates.'}
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
                {ENTERPRISE_CURRICULUM_BLUEPRINTS.length}
              </div>
              <div className="text-[11px] text-slate-400">{isRtl ? 'منهج ومقرر' : 'Curricula'}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-center">
              <div className="text-xl font-black text-amber-400 font-mono tabular-nums">
                {certificates.length}
              </div>
              <div className="text-[11px] text-slate-400">{isRtl ? 'شهادة موثقة' : 'Certificates'}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-center">
              <div className="text-xl font-black text-purple-400 font-mono tabular-nums">
                {ENTERPRISE_CODE_TEMPLATES.length}
              </div>
              <div className="text-[11px] text-slate-400">{isRtl ? 'قالب برمجي' : 'Code Blueprints'}</div>
            </div>
          </div>
        </div>

        {/* Interactive Module Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'qbank', labelAr: 'بنك الأسئلة ومحاكي الاختبارات', labelEn: 'Question Bank & Quiz Simulator', icon: HelpCircle },
            { id: 'curriculum', labelAr: 'مخططات المناهج الأكاديمية', labelEn: 'Curriculum Blueprints', icon: BookOpen },
            { id: 'halls', labelAr: 'جدولة القاعات والفروع (ERP)', labelEn: 'ERP Hall Scheduler', icon: Calendar },
            { id: 'certificates', labelAr: 'توثيق وإصدار الشهادات', labelEn: 'Certificates Registry', icon: Award },
            { id: 'codetemplates', labelAr: 'موسوعة القوالب البرمجية', labelEn: 'Architecture Code Vault', icon: Code2 },
            { id: 'pwa', labelAr: 'تشخيص الـ PWA ووضع الأوفلاين', labelEn: 'PWA & Offline Diagnostics', icon: Cpu }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
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
                    <span>{isRtl ? 'المحاضر المشرف:' : 'Lead Instructor:'} <strong className="text-white">{isRtl ? selectedModule.instructorAr : selectedModule.instructorEn}</strong></span>
                    <span>·</span>
                    <span>{isRtl ? 'الساعات المعتمدة:' : 'Credit Hours:'} <strong className="text-white font-mono">{selectedModule.creditHours}</strong></span>
                    <span>·</span>
                    <span>{isRtl ? 'المختبرات العملية:' : 'Practical Labs:'} <strong className="text-white font-mono">{selectedModule.labsCount}</strong></span>
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
                  {isRtl ? 'نظام إدارة وجدولة القاعات والفروع التعليمية (ERP Hall Scheduler)' : 'Smart Campus & Hall Booking Scheduler'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isRtl
                    ? `إجمالي الفترات المجدولة النشطة: ${filteredHalls.length} فترة دراسية عبر الفروع`
                    : `Total scheduled sessions: ${filteredHalls.length} active slots across branches`}
                </p>
              </div>
            </div>

            {/* Quick Add Hall Booking Form */}
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

            {/* Hall Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHalls.slice(0, 18).map((h) => {
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
                        <span>{h.enrolled} / {h.capacity} ({occupancy}%)</span>
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

      {/* SUB-TAB 4: DIGITAL CERTIFICATES REGISTRY & ISSUANCE */}
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
                    <span>{isRtl ? cert.honorsAr : cert.honorsEn} ({cert.gradePercent}%)</span>
                    <span className="text-emerald-400 font-semibold">{isRtl ? '✓ موثقة رسمياً' : '✓ Verified'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ARCHITECTURE CODE VAULT */}
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

      {/* SUB-TAB 6: PWA & OFFLINE FALLBACK DIAGNOSTICS */}
      {activeSubTab === 'pwa' && <PwaDiagnostics lang={lang} />}
    </div>
  );
}
