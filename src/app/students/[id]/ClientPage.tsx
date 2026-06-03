'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import KanbanPlanner from './KanbanPlanner';
import { BOOK_CATALOG } from '@/lib/bookCatalog';
import { calculateLgsPercentile, getImprovementOpportunities } from '@/lib/lgsCalculator';
import { updateStudent } from '../../actions/student';
import { deleteExam } from '../../actions/exam';
import { generatePortalToken, addBadge, deleteBadge } from '../../actions/psycho';

export default function ClientPage({ initialStudent }: { initialStudent: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('karneler');
  const [showProgram, setShowProgram] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [showPsychoForm, setShowPsychoForm] = useState(false);
  const [psychoForm, setPsychoForm] = useState({ anxiety: 5, motivation: 5, focus: 5, note: '' });
  const [showWhatsAppReport, setShowWhatsAppReport] = useState(false);
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const [selectedTopicExams, setSelectedTopicExams] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const [exams, setExams] = useState(initialStudent.exams.map((e: any) => ({
    ...e,
    date: new Date(e.date).toLocaleDateString('tr-TR')
  })) || []);

  const [selectedScheduleForModal, setSelectedScheduleForModal] = useState<any>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isParsingPhoto, setIsParsingPhoto] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState<any>(null);
  const [photoAnalysisError, setPhotoAnalysisError] = useState<string | null>(null);
  const [studentStatus, setStudentStatus] = useState<string>('Başarılı');
  
  const [aiLetterHtml, setAiLetterHtml] = useState<string | null>(null);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewedTasks, setReviewedTasks] = useState<any[]>([]);
  const [isSavingReview, setIsSavingReview] = useState(false);
  
  // AI Preview Modal State
  const [reportPreview, setReportPreview] = useState<{ type: 'parent'|'principal', text: string } | null>(null);

  const [pastedImage, setPastedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    // Varsayılan olarak sadece SINGLE (Tekli) sınavları seç
    if (exams.length > 0 && selectedTopicExams.length === 0) {
      setSelectedTopicExams(exams.filter((e:any) => e.examType === 'SINGLE' || !e.examType).map((e:any) => e.id));
    }
    
    // Parse URL parameter to check if we should show a specific tab
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, [exams, selectedTopicExams]);

  // Bind Ctrl+V Paste Listener for images
  useEffect(() => {
    if (!showPhotoModal) {
      // Clean up preview url when modal closes
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setPastedImage(null);
      return;
    }

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setPastedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [showPhotoModal, previewUrl]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setPastedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  // Helper to match parsed subject with active schedule tasks
  const getInitialMatch = (subjectName: string) => {
    const activeTasks = initialStudent.schedules?.[0]?.tasks || [];
    const matched = activeTasks.find((t: any) => 
      t.subject.toLowerCase() === subjectName.toLowerCase() && t.status === 'PENDING'
    ) || activeTasks.find((t: any) => 
      t.subject.toLowerCase() === subjectName.toLowerCase()
    );
    return matched ? matched.id : 'none';
  };

  const [isUploading, setIsUploading]     = useState(false);
  const [showPortalModal, setPortalModal] = useState(false);
  const [portalToken, setPortalToken]     = useState(initialStudent.portalToken || '');
  const [isGenToken, setGenToken]         = useState(false);
  const [badges, setBadges]               = useState<any[]>(initialStudent.badges || []);
  const [showBadgePanel, setBadgePanel]   = useState(false);
  
  const [activeAiExam, setActiveAiExam] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [analysisSeconds, setAnalysisSeconds] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentId', initialStudent.id);
      if (selectedPublisher) {
        formData.append('publisher', selectedPublisher);
      }

      try {
        const res = await fetch('/api/upload-exam', {
          method: 'POST',
          body: formData
        });
        
        const data = await res.json();
        
        if (data.success && data.exam) {
          const newExam = {
            ...data.exam,
            date: new Date(data.exam.date).toLocaleDateString('tr-TR')
          };
          setExams((prev: any[]) => [newExam, ...prev]);
          alert(`"${data.exam.name}" başarıyla sisteme eklendi ve analiz edildi!`);
          router.refresh();
        } else {
          alert('Hata: ' + data.error);
        }
      } catch (err) {
        alert('Sunucuya bağlanırken hata oluştu.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUploadHomeworkPhoto = async (file: File, tone: string) => {
    setIsParsingPhoto(true);
    setPhotoAnalysisError(null);
    setPhotoAnalysis(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', initialStudent.id);
    formData.append('tone', tone);

    try {
      const res = await fetch('/api/parse-homework', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setPhotoAnalysis(data.analysis);
        
        // Prepare task list for Review & Confirm modal
        const parsed = (data.analysis.tasks || []).map((t: any, index: number) => ({
          id: `parsed-${index}`,
          subject: t.subject,
          planned: t.planned || 0,
          solved: t.solved || 0,
          status: t.status || 'COMPLETED',
          matchedTaskId: getInitialMatch(t.subject)
        }));
        
        setReviewedTasks(parsed);
        
        if (data.analysis.whatsappMessage) {
          setParentNote(data.analysis.whatsappMessage);
        }
        
        setShowPhotoModal(false);
        setShowReviewModal(true);
      } else {
        setPhotoAnalysisError(data.error || 'Tarama başarısız oldu.');
      }
    } catch (err) {
      setPhotoAnalysisError('Sunucu hatası veya internet bağlantı sorunu.');
    } finally {
      setIsParsingPhoto(false);
    }
  };

  const handleViewAi = async (exam: any) => {
    if (exam.aiSummary && exam.aiTopics) {
      setActiveAiExam(exam);
      return;
    }

    if (!exam.rawText) {
      alert('Bu sınavın ham metni bulunamadığı için yapay zeka analizi yapılamıyor. Lütfen yeni sistemle tekrar yükleyin.');
      return;
    }

    setIsAiLoading(true);
    setActiveAiExam({ ...exam, isLoading: true });
    setAnalysisSeconds(0);
    const interval = setInterval(() => {
      setAnalysisSeconds(s => s + 1);
    }, 1000);

    try {
      const res = await fetch('/api/ai-distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: exam.rawText, examType: exam.examType || 'SINGLE', publisher: exam.publisher })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const { aiData } = data;
      const aiSummary = aiData.evaluationSummary || 'Analiz başarılı.';
      const aiTopics = JSON.stringify(aiData.subjects || []);

      // Veritabanına kaydet (server action)
      const { saveExamAiAnalysis } = await import('../../actions/exam');
      await saveExamAiAnalysis(exam.id, aiSummary, aiTopics);

      // Ekranda güncelle
      const updatedExam = { ...exam, aiSummary, aiTopics };
      setExams((prev: any[]) => prev.map((e: any) => e.id === exam.id ? updatedExam : e));
      setActiveAiExam(updatedExam);
      router.refresh();

    } catch (err: any) {
      alert(`Yapay Zeka Hatası: ${err.message}`);
      setActiveAiExam(null);
    } finally {
      clearInterval(interval);
      setIsAiLoading(false);
    }
  };

  const getAIEvaluation = () => {
    if (exams.length === 0) return "Öğrencinin henüz sistemde kayıtlı verisi bulunmuyor. Düzenli takip için karne yüklemesi yapabilirsiniz.";
    const latestExam = exams[0];
    
    let weakTopicsText = '[İlgili Dersler ve Konular]';
    
    if (latestExam.aiTopics) {
      try {
        const subjects = JSON.parse(latestExam.aiTopics);
        const weakList: string[] = [];
        subjects.forEach((sub: any) => {
          if (sub.topics && Array.isArray(sub.topics)) {
            const weaks = sub.topics.filter((t: any) => t.isWeak || t.percentage < 50).map((t: any) => t.name);
            if (weaks.length > 0) {
              weakList.push(`${sub.name} dersinden ${weaks.join(', ')}`);
            }
          } else if (sub.weakTopic) {
             weakList.push(`${sub.name} dersinden ${sub.weakTopic}`);
          }
        });
        if (weakList.length > 0) {
          weakTopicsText = weakList.join('; ');
        }
      } catch(e) {}
    }
    return weakTopicsText;
  };

  const generateWhatsAppText = (status: string) => {
    // Find active schedule or recent schedule
    const activeSched = initialStudent.schedules?.[0];
    let homeworkStatStr = '';
    let sadakatSkoruStr = '';
    if (activeSched) {
      const totalPlanned = activeSched.tasks?.reduce((sum: number, t: any) => sum + t.questionCount, 0) || 0;
      const totalSolved = activeSched.tasks?.reduce((sum: number, t: any) => sum + (t.solvedQuestions || 0), 0) || 0;
      const completedCount = activeSched.tasks?.filter((t: any) => t.isCompleted || t.status === 'COMPLETED').length || 0;
      const totalTasks = activeSched.tasks?.length || 0;
      const rate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
      const sadakatSkoru = totalPlanned > 0 ? Math.round((totalSolved / totalPlanned) * 100) : 100;
      
      homeworkStatStr = `ödev hedeflerinin %${rate}'ini (${totalSolved}/${totalPlanned} Soru) tamamladı.`;
      sadakatSkoruStr = `\n🎯 Ödev Sadakat Skoru: %${sadakatSkoru}`;
    } else {
      homeworkStatStr = `bu haftaki haftalık ödev programını başarıyla tamamladı.`;
      sadakatSkoruStr = `\n🎯 Ödev Sadakat Skoru: %100`;
    }

    const recentExam = exams?.[0];
    const examStr = recentExam ? `Son denemesinde ${recentExam.totalNet} net yaptı.` : '';

    // Find next appointment
    const nextAppt = initialStudent.appointments?.find((a: any) => new Date(a.date) > new Date() && a.status === 'SCHEDULED');
    const nextApptStr = nextAppt 
      ? `\n📅 Bir Sonraki Seansımız: ${new Date(nextAppt.date).toLocaleString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`
      : '';

    let intro = '';
    let body = '';
    let closing = '\n\nDesteğiniz için teşekkür ederim. İyi günler dilerim.\n\nAhmet ŞANLI\nEğitim Danışmanı ve Rehber Öğretmen';

    if (status === 'Başarılı') {
      intro = `Sayın Velimiz,\n\nBugün ${initialStudent.firstName} ile seansımızı gerçekleştirdik.`;
      body = `\n\n📊 Ödev Durumu: Özverili öğrencimiz ${homeworkStatStr}${sadakatSkoruStr}\n📈 Akademik Gelişat: ${examStr} Öğrencimizin tempodan ödün vermeyen disiplinli çalışmasını tebrik ediyor, motivasyonunu takdir ediyorum. Sürecin bu şekilde kararlılıkla devam etmesi başarısını katlayacaktır.${nextApptStr}`;
    } else if (status === 'Aksayan') {
      intro = `Sayın Velimiz,\n\nBugün ${initialStudent.firstName} ile seansımızı gerçekleştirdik.`;
      body = `\n\n📊 Ödev Durumu: Öğrencimiz ${homeworkStatStr}${sadakatSkoruStr}\n📈 Akademik Gidişat: ${examStr} Bu hafta planlanan bazı görevler aksamış görünüyor. Ödev hedeflerine tam sadakat sağlanması, eksiklerin birikmemesi açısından çok kritiktir. Evdeki çalışma saatlerini daha sıkı takip edelim.${nextApptStr}`;
    } else if (status === 'Kaygılı') {
      intro = `Sayın Velimiz,\n\nBugün ${initialStudent.firstName} ile motivasyon ve durum değerlendirmesi odaklı bir seans yaptık.`;
      body = `\n\n📊 Ödev Durumu: Öğrencimiz ${homeworkStatStr}${sadakatSkoruStr}\n📈 Akademik Gidişat: ${examStr} Bu dönemde sınav kaygısı ve yorgunluk normaldir. Öğrencimizin kaygısını hafifletmek ve özgüvenini artırmak adına programı biraz daha esnetip moral odaklı ilerledik. Evde de kendisini destekleyici, olumlu bir iklim oluşturmanız çok önemlidir.${nextApptStr}`;
    }

    return `${intro}${body}${closing}`;
  };

  const [parentNote, setParentNote] = useState<string>('');
  
  useEffect(() => {
    setParentNote(generateWhatsAppText('Başarılı'));
  }, [exams, initialStudent]);

  const addNoteTemplate = (type: string) => {
    let addition = '';
    if (type === 'academic') addition = '\n\n📌 Akademik Süreç: Öğrencimizin netlerinde zaman zaman dalgalanmalar gözlemlense de, odaklanma süresini ve soru çözüm hızını artırmak adına yürüttüğümüz çalışmalar planlandığı gibi ilerlemektedir.';
    if (type === 'social') addition = '\n\n📌 Sosyal & Psikolojik Durum: Öğrencimizin uyumu ve motivasyonu son derece olumludur. Sınav kaygısını optimum düzeyde tutabilmek amacıyla, çalışma aralarında rahatlatıcı aktivitelere vakit ayırmasını tavsiye etmekteyim.';
    if (type === 'homework') addition = '\n\n📌 Ödev & Sorumluluk Takibi: Kendisine atanan görevlerin zamanında yapılması konusunda küçük aksaklıklar tespit edilmiştir. Evdeki çalışma disiplininin artırılması sürecin başarısı açısından kritik öneme sahiptir.';
    
    setParentNote(prev => {
      const closing = '\n\nAhmet ŞANLI\nEğitim Danışmanı ve Rehber Öğretmen';
      
      if (prev.includes(closing)) {
        return prev.replace(closing, addition + closing);
      }
      return prev + addition;
    });
  };

  const handleWhatsApp = () => {
    const phone = initialStudent.parentPhone?.replace(/\D/g, '') || '';
    if (!phone) {
      alert('Veli telefon numarası bulunamadı!');
      return;
    }
    const cleanPhone = phone.startsWith('0') ? '90' + phone.substring(1) : (phone.length === 10 ? '90' + phone : phone);
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(parentNote)}`;
    window.open(url, '_blank');
  };

  const handlePrintAi = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && activeAiExam) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sınav Değerlendirme Raporu - ${initialStudent.firstName} ${initialStudent.lastName}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 24px; color: #111; text-transform: uppercase; letter-spacing: 1px; }
              .header p { margin: 5px 0 0 0; font-size: 14px; color: #666; }
              .student-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-weight: bold; font-size: 16px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
              .content { font-size: 16px; margin-bottom: 50px; text-align: justify; white-space: pre-wrap; }
              .signature { margin-top: 60px; text-align: right; }
              .signature strong { display: block; font-size: 18px; margin-bottom: 5px; }
              .signature span { color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Sınav Değerlendirme Raporu</h1>
              <p>Eğitim Danışmanlığı ve Rehberlik</p>
            </div>
            <div class="student-info">
              <div>Öğrenci: ${initialStudent.firstName} ${initialStudent.lastName}</div>
              <div>Sınav: ${activeAiExam.name}</div>
              <div>Tarih: ${new Date().toLocaleDateString('tr-TR')}</div>
            </div>
            <div class="content">
              ${activeAiExam.aiSummary}
            </div>
            <div class="signature">
              <strong>Ahmet ŞANLI</strong>
              <span>Eğitim Danışmanı ve Rehber Öğretmen</span>
            </div>
            <script>
              window.onload = () => { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };


  // Grafikler için kıyaslamalı veri (Son Sınav vs Genel Ortalama) hazırlığı
  const getComparisonChartData = () => {
    if (!exams || exams.length === 0) return null;
    
    // 1. Son Sınav Verisi
    const latestExamWithDetails = exams.find((e: any) => e.subjectDetails && e.subjectDetails !== '[]');
    let latestDetails: any[] = [];
    if (latestExamWithDetails) {
      try {
        latestDetails = JSON.parse(latestExamWithDetails.subjectDetails);
      } catch(e) {}
    }

    // 2. Ortalama Veri (Tüm sınavların ders bazlı net ortalaması)
    const subjectSums: Record<string, { totalNet: number, count: number }> = {};
    exams.forEach((exam: any) => {
      if (exam.subjectDetails && exam.subjectDetails !== '[]') {
        try {
          const details = JSON.parse(exam.subjectDetails);
          details.forEach((d: any) => {
            const name = d.name.substring(0, 3);
            if (!subjectSums[name]) subjectSums[name] = { totalNet: 0, count: 0 };
            subjectSums[name].totalNet += parseFloat(d.net || 0);
            subjectSums[name].count += 1;
          });
        } catch(e) {}
      }
    });

    // 3. Birleştirme
    const chartData = [];
    for (const [subj, data] of Object.entries(subjectSums)) {
      const avgNet = parseFloat((data.totalNet / data.count).toFixed(2));
      const latestMatched = latestDetails.find(d => d.name.substring(0,3) === subj);
      const latestNet = latestMatched ? parseFloat(latestMatched.net) : 0;
      
      chartData.push({
        name: subj,
        avgNet: avgNet,
        latestNet: latestNet
      });
    }

    return chartData.length > 0 ? chartData : null;
  };
  const comparisonChartData = getComparisonChartData();

  const calculateHomeworkStats = () => {
    if (!initialStudent.schedules) return {};
    const stats: Record<string, Record<string, number>> = {};
    initialStudent.schedules.forEach((sched: any) => {
      sched.tasks?.forEach((task: any) => {
        if (task.isCompleted) {
          if (!stats[task.subject]) stats[task.subject] = {};
          if (!stats[task.subject][task.topic]) stats[task.subject][task.topic] = 0;
          stats[task.subject][task.topic] += task.questionCount;
        }
      });
    });
    return stats;
  };
  const homeworkStats = calculateHomeworkStats();

  const [openSubjectStat, setOpenSubjectStat] = useState<string | null>(null);

  const [worksheetHtml, setWorksheetHtml] = useState<string | null>(null);
  const [isWorksheetLoading, setIsWorksheetLoading] = useState(false);

  const generateWorksheet = async (subjectName: string, topicsStr: string) => {
    setIsWorksheetLoading(true);
    try {
      const res = await fetch('/api/generate-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: initialStudent.firstName,
          grade: initialStudent.grade,
          weakTopics: `${subjectName}: ${topicsStr}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setWorksheetHtml(data.html);
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Test üretilirken hata oluştu.');
    }
    setIsWorksheetLoading(false);
  };



  // LGS Puan Tahmini
  const getLgsPrediction = () => {
    if (exams.length === 0) return null;
    const recentExams = exams.slice(0, 3).filter((e:any) => e.totalNet > 0);
    if (recentExams.length === 0) return null;
    
    const avgNet = recentExams.reduce((acc:any, e:any) => acc + e.totalNet, 0) / recentExams.length;
    let score = 150 + (avgNet / 90) * 350;
    if (score > 500) score = 500;
    
    const latestExamWithDetails = exams.find((e: any) => e.subjectDetails && e.subjectDetails !== '[]');
    let opportunities: any[] = [];
    if (latestExamWithDetails) {
      try {
        const details = JSON.parse(latestExamWithDetails.subjectDetails);
        opportunities = getImprovementOpportunities(details);
      } catch(e) {}
    }
    
    return {
      avgNet: avgNet.toFixed(1),
      score: Math.round(score),
      percentile: calculateLgsPercentile(Math.round(score)),
      opportunities: opportunities.slice(0, 3), // Top 3 opportunities
      gap: initialStudent.target ? `${initialStudent.target} hedefine ulaşmak için analizleri inceleyin.` : "Öğrenci profiline hedef lise girmelisiniz."
    };
  };
  const lgsPrediction = getLgsPrediction();

  // Strategic targets & Milestones
  const getCountdownDays = () => {
    const isLgs = initialStudent.grade?.includes('8');
    const examDate = isLgs ? new Date('2026-06-07T09:00:00') : new Date('2026-06-20T09:00:00');
    const examName = isLgs ? 'LGS 2026' : 'YKS 2026';
    const now = new Date();
    const diffTime = examDate.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days, examName };
  };
  const countdown = getCountdownDays();

  const totalSessions = initialStudent.totalTargetSessions || 36;
  const completedSessions = initialStudent.sessions?.length || 0;
  const sessionProgressPct = Math.round((completedSessions / totalSessions) * 100);

  // Sınavza Alarms
  const hasNetDropAlarm = exams.length >= 3 && (() => {
    const sorted = [...exams].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0].totalNet < sorted[1].totalNet && sorted[1].totalNet < sorted[2].totalNet;
  })();

  const getChronicWeaknesses = () => {
    if (exams?.length < 3) return [];
    const sorted = [...exams].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const topicsSets = sorted.slice(0, 3).map((exam: any) => {
      const set = new Set<string>();
      if (exam.subjectDetails && exam.subjectDetails !== '[]') {
        try {
          const details = JSON.parse(exam.subjectDetails);
          details.forEach((sub: any) => {
            if (sub.topics) {
              sub.topics.forEach((t: any) => {
                const total = (t.correct || 0) + (t.incorrect || 0) + (t.blank || 0);
                const success = total > 0 ? (t.correct / total) * 100 : 100;
                if (t.incorrect > 0 || success < 60) {
                  set.add(`${sub.name} - ${t.name}`);
                }
              });
            }
          });
        } catch (e) {}
      }
      return set;
    });

    const common: string[] = [];
    topicsSets[0].forEach((topic: string) => {
      if (topicsSets[1].has(topic) && topicsSets[2].has(topic)) {
        common.push(topic);
      }
    });
    return common;
  };
  const chronicWeaknesses = getChronicWeaknesses();

  // ── Yardımcı hesaplamalar ─────────────────────────────────────────
  const lastExam      = exams[0];
  const lastPsycho    = initialStudent.psychoRecords?.[0];
  const activeSched   = initialStudent.schedules?.find((s: any) => s.status === 'ACTIVE');
  const totalTasks    = activeSched?.tasks?.length || 0;
  const doneTasks     = activeSched?.tasks?.filter((t: any) => t.isCompleted).length || 0;
  const programPct    = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : null;
  const programColor  = programPct === null ? '#94A3B8' : programPct >= 70 ? '#10B981' : programPct >= 40 ? '#F59E0B' : '#EF4444';

  // Psikolojik renk
  const psychoRisk = lastPsycho && (lastPsycho.anxietyLevel > 7 || lastPsycho.motivationLevel < 4);

  // Net trend ok
  const netTrend = exams.length >= 2
    ? exams[0].totalNet > exams[1].totalNet ? '↑' : exams[0].totalNet < exams[1].totalNet ? '↓' : '→'
    : null;
  const netTrendColor = netTrend === '↑' ? '#10B981' : netTrend === '↓' ? '#EF4444' : '#94A3B8';

  // Kart stili
  const metricCard = (accent: string): React.CSSProperties => ({
    background: 'white', border: '1px solid var(--border)', borderRadius: '10px',
    padding: '1rem 1.25rem', borderTop: `3px solid ${accent}`,
  });

  return (
    <div style={{ maxWidth: '1300px', width: '100%' }}>

      {/* ── BREADCRUMB + AKSİYONLAR ──────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Link href="/students" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>Koçluk Portföyü</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{initialStudent.firstName} {initialStudent.lastName}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {initialStudent.sinavzaLink && (
            <button onClick={() => window.open(initialStudent.sinavzaLink, '_blank')} style={{ padding: '0.4rem 0.8rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
              Sınavza ↗
            </button>
          )}
          <button onClick={() => setShowKanban(true)} style={{ padding: '0.4rem 0.8rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
            🖐️ Kanban
          </button>
          <Link href={`/assignments?studentId=${initialStudent.id}`} style={{ padding: '0.4rem 0.9rem', borderRadius: '7px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none' }}>
            📅 Program Hazırla
          </Link>
          <button onClick={() => {
            let report = `Sayın Velimiz,\n\n${initialStudent.firstName} adlı öğrencimizin bu haftaki durum değerlendirmesi:\n\n`;
            if (exams.length > 0) report += `📌 Son Deneme: ${exams[0].name} (Net: ${exams[0].totalNet})\n`;
            if (chronicWeaknesses.length > 0) report += `⚠️ Zayıf Konular: ${chronicWeaknesses.slice(0,3).join(', ')}\n`;
            report += `\nDesteğiniz için teşekkür ederim.\n\nAhmet ŞANLI — Eğitim Koçu`;
            window.open(`https://wa.me/${(initialStudent.parentPhone || '').replace(/\s+/g, '')}?text=${encodeURIComponent(report)}`, '_blank');
          }} style={{ padding: '0.4rem 0.9rem', borderRadius: '7px', border: 'none', background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
            💬 WhatsApp
          </button>
          <button onClick={() => setPortalModal(true)} style={{ padding: '0.4rem 0.8rem', borderRadius: '7px', border: '1px solid #7C3AED', background: '#F5F3FF', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', color: '#7C3AED' }}>
            🔗 Portal Linki
          </button>
          <button onClick={() => setBadgePanel(v => !v)} style={{ padding: '0.4rem 0.8rem', borderRadius: '7px', border: '1px solid #D97706', background: '#FFFBEB', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', color: '#D97706' }}>
            🏆 Rozet Ver
          </button>
          <button onClick={() => setShowEditModal(true)} style={{ padding: '0.4rem 0.8rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
            ✏️ Düzenle
          </button>
        </div>
      </div>

      {/* ── ÖĞRENCİ PROFIL KARTI ─────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1e40af 100%)', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '1.25rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative' }}>
          {/* Sol: Kimlik */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.3rem', flexShrink: 0 }}>
              {initialStudent.firstName[0]}{initialStudent.lastName[0]}
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: '0.15rem' }}>
                {initialStudent.firstName} {initialStudent.lastName}
              </h1>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span>📚 {initialStudent.grade}</span>
                {initialStudent.school && <span>🏫 {initialStudent.school}</span>}
                {initialStudent.field && <span>🎓 {initialStudent.field}</span>}
                {initialStudent.parentName && <span>👨‍👩‍👧 {initialStudent.parentName} · {initialStudent.parentPhone}</span>}
              </div>
            </div>
          </div>
          {/* Sağ: Hedef */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Akademik Hedef</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{initialStudent.targetSchool || initialStudent.target || '—'}</div>
            {initialStudent.targetNets && <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>{initialStudent.targetNets}</div>}
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>{countdown.examName} · {countdown.days} gün kaldı</div>
          </div>
        </div>
      </div>

      {/* ── UYARI BANDI ──────────────────────────────────────── */}
      {(hasNetDropAlarm || chronicWeaknesses.length > 0 || psychoRisk) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
          {hasNetDropAlarm && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '4px solid #EF4444', color: '#7F1D1D', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ <strong>Performans Alarmı:</strong> Son 2 denemede üst üste net düşüşü — bireysel gelişim programı acilen güncellenmeli.
            </div>
          )}
          {chronicWeaknesses.length > 0 && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderLeft: '4px solid #F59E0B', color: '#78350F', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🚨 <strong>Kronik Zayıflık:</strong> {chronicWeaknesses.slice(0, 3).join(' · ')}
            </div>
          )}
          {psychoRisk && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #3B82F6', color: '#1E3A8A', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🧠 <strong>Psikolojik Destek:</strong> Kaygı veya motivasyon sinyali — bir sonraki seansta bütünsel destek görüşmesi planlanmalı.
            </div>
          )}
        </div>
      )}

      {/* ── HIZLI METRİK KARTI SATIRI ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.85rem', marginBottom: '1.25rem' }}>
        {/* Son Net */}
        <div style={metricCard('#2563EB')}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Son Deneme Neti</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563EB', lineHeight: 1 }}>
            {lastExam ? lastExam.totalNet : '—'}
            {netTrend && <span style={{ fontSize: '1rem', marginLeft: '0.3rem', color: netTrendColor }}>{netTrend}</span>}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{lastExam?.name || 'Sınav girilmedi'}</div>
        </div>

        {/* LGS Tahmini */}
        <div style={metricCard('#7C3AED')}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>LGS Tahmin Puanı</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7C3AED', lineHeight: 1 }}>{lgsPrediction?.score || '—'}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>%{lgsPrediction?.percentile || '—'} dilim</div>
        </div>

        {/* Seans İlerlemesi */}
        <div style={metricCard('#059669')}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Koçluk Seansları</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>{completedSessions}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/{totalSessions}</span></div>
          <div style={{ height: '4px', background: '#D1FAE5', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${sessionProgressPct}%`, background: '#059669', borderRadius: '2px' }} />
          </div>
        </div>

        {/* Program Tamamlama */}
        <div style={metricCard(programColor)}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Program Tamamlama</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: programColor, lineHeight: 1 }}>
            {programPct !== null ? `%${programPct}` : '—'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {totalTasks > 0 ? `${doneTasks}/${totalTasks} görev` : 'Aktif program yok'}
          </div>
        </div>

        {/* Psikolojik Durum */}
        <div style={metricCard(psychoRisk ? '#EF4444' : '#F59E0B')}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Psikolojik Durum</div>
          {lastPsycho ? (
            <>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>🚀 {lastPsycho.motivationLevel}/10</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>😰 {lastPsycho.anxietyLevel}/10</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: psychoRisk ? '#EF4444' : 'var(--text-muted)', fontWeight: psychoRisk ? 700 : 400 }}>
                {psychoRisk ? '⚠️ Destek gerekiyor' : '✅ Stabil'}
              </div>
            </>
          ) : <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Kayıt yok</div>}
        </div>
      </div>

      {/* ── PORTAL LİNK MODAL ────────────────────────────────── */}
      {showPortalModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#7C3AED' }}>🔗 Öğrenci Portal Linki</h3>
              <button onClick={() => setPortalModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Bu link üzerinden <strong>{initialStudent.firstName}</strong> kendi programını, sınav sonuçlarını ve koçun mesajını görebilir. Linki WhatsApp veya e-posta ile paylaşın.
            </p>
            {portalToken ? (
              <>
                <div style={{ background: '#F5F3FF', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem', wordBreak: 'break-all', fontSize: '0.82rem', color: '#7C3AED', fontWeight: 600, border: '1px solid #DDD6FE' }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/portal/${portalToken}` : `/portal/${portalToken}`}
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/portal/${portalToken}`); }} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #7C3AED', background: 'white', color: '#7C3AED', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    📋 Linki Kopyala
                  </button>
                  <button onClick={() => { const url = `${window.location.origin}/portal/${portalToken}`; window.open(`https://wa.me/${(initialStudent.parentPhone||'').replace(/\D/g,'')}?text=${encodeURIComponent(`${initialStudent.firstName} için koçluk portalı: ${url}`)}`, '_blank'); }}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    💬 WhatsApp Gönder
                  </button>
                </div>
              </>
            ) : (
              <div style={{ background: '#FFF7ED', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#92400E', border: '1px solid #FED7AA' }}>
                Bu öğrenci için henüz portal linki oluşturulmadı.
              </div>
            )}
            <button onClick={async () => { setGenToken(true); const r = await generatePortalToken(initialStudent.id); if (r.success) setPortalToken(r.token!); setGenToken(false); }}
              disabled={isGenToken}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#7C3AED', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: isGenToken ? 0.6 : 1 }}>
              {isGenToken ? '⏳ Oluşturuluyor...' : portalToken ? '🔄 Yeni Link Oluştur' : '✨ Portal Linki Oluştur'}
            </button>
          </div>
        </div>
      )}

      {/* ── ROZET PANELİ ─────────────────────────────────────── */}
      {showBadgePanel && (
        <div style={{ background: 'white', border: '1.5px solid #D97706', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#D97706' }}>🏆 Rozet Ver — {initialStudent.firstName}</h3>
            <button onClick={() => setBadgePanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>✕</button>
          </div>
          {/* Hazır Rozetler */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { icon: '🔥', title: 'Devamlılık' }, { icon: '🚀', title: 'Hızlı Yükseliş' },
              { icon: '⭐', title: 'Hafta Yıldızı' }, { icon: '💪', title: 'Güçlü Çalışma' },
              { icon: '🎯', title: 'Hedefe Ulaştı' }, { icon: '📈', title: 'Net Artışı' },
              { icon: '🏅', title: 'Ödev Şampiyonu' }, { icon: '🧠', title: 'Zeka Küpü' },
              { icon: '❤️', title: 'Azimli' }, { icon: '🌟', title: 'Üstün Başarı' },
            ].map(b => (
              <button key={b.title} onClick={async () => {
                const r = await addBadge(initialStudent.id, b.title, b.icon);
                if (r.success) setBadges(prev => [...prev, r.badge]);
              }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--bg-main)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                {b.icon} {b.title}
              </button>
            ))}
          </div>
          {/* Mevcut Rozetler */}
          {badges.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Kazanılan Rozetler ({badges.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {badges.map((b: any) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', borderRadius: '20px', background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: '0.78rem', fontWeight: 700 }}>
                    {b.icon} {b.title}
                    <button onClick={async () => { await deleteBadge(b.id, initialStudent.id); setBadges(prev => prev.filter((x: any) => x.id !== b.id)); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.7rem', marginLeft: '0.2rem' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB NAVİGASYON ──────────────────────────────────── */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', overflow: 'hidden' }}>
        {[
          { id: 'genel',    label: 'Genel Bakış',    icon: '🏠', count: null },
          { id: 'karneler', label: 'Sınav Karneleri', icon: '📊', count: exams.length },
          { id: 'konular',  label: 'Konu Analizi',    icon: '📚', count: exams.length > 0 ? 1 : 0 },
          { id: 'programlar',label: 'Çalışma Programı',icon: '📅', count: initialStudent.schedules?.length || 0 },
          { id: 'kitaplar', label: 'Kaynak Havuzu',   icon: '📖', count: initialStudent.books?.length || 0 },
          { id: 'psikoloji',label: 'Psikoloji',        icon: '🧠', count: initialStudent.psychoRecords?.length || 0 },
          { id: 'istatistik',label: 'Ödev Takibi',    icon: '📈', count: null },
        ].map((tab, i) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '0.75rem 0.5rem', border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
              borderRight: i < 6 ? '1px solid var(--border)' : 'none',
              background: activeTab === tab.id ? '#F0F7FF' : 'white',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 800 : 500,
              fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
            }}>
            <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
            <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
            {tab.count !== null && <span style={{ background: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-main)', color: activeTab === tab.id ? 'white' : 'var(--text-muted)', borderRadius: '10px', padding: '0.05rem 0.4rem', fontSize: '0.65rem', fontWeight: 800 }}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ── GENEL BAKIŞ SEKMESİ ──────────────────────────────── */}
      {activeTab === 'genel' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

            {/* LGS Tahmini & Fırsat */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🎯 LGS Performans Tahmini
              </div>
              {lgsPrediction ? (
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', borderRadius: '10px', padding: '1rem', color: 'white', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', opacity: 0.8, marginBottom: '0.3rem' }}>TAHMİN PUAN</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{lgsPrediction.score}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>%{lgsPrediction.percentile} dilim</div>
                    </div>
                    <div style={{ flex: 1, background: '#F8FAFC', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>ORTALAMA NET</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{lgsPrediction.avgNet}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Son 3 deneme</div>
                    </div>
                  </div>
                  {lgsPrediction.opportunities.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Öncelikli Konu Fırsatları</div>
                      {lgsPrediction.opportunities.slice(0,3).map((o: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#F0FDF4', borderRadius: '6px', marginBottom: '0.3rem', fontSize: '0.78rem' }}>
                          <span style={{ fontWeight: 600 }}>{o.subject}</span>
                          <span style={{ fontWeight: 800, color: '#10B981' }}>+{o.potentialIncrease} puan</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tahmin için en az 1 sınav yükleyin</div>
              )}
            </div>

            {/* Seans & Program Özeti */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📋 Koçluk Süreci Özeti
              </div>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Seans İlerlemesi */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <span>🤝 Seans İlerlemesi</span>
                    <span style={{ color: 'var(--primary)' }}>{completedSessions}/{totalSessions}</span>
                  </div>
                  <div style={{ height: '7px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sessionProgressPct}%`, background: 'linear-gradient(90deg, var(--primary), #60A5FA)', borderRadius: '4px' }} />
                  </div>
                </div>
                {/* Program Tamamlama */}
                {programPct !== null && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      <span>📅 Haftalık Program</span>
                      <span style={{ color: programColor }}>%{programPct}</span>
                    </div>
                    <div style={{ height: '7px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${programPct}%`, background: programColor, borderRadius: '4px' }} />
                    </div>
                  </div>
                )}
                {/* Psikolojik Trend */}
                {lastPsycho && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                    {[
                      { label: 'Motivasyon', val: lastPsycho.motivationLevel, color: lastPsycho.motivationLevel >= 6 ? '#10B981' : '#EF4444' },
                      { label: 'Odak', val: lastPsycho.focusLevel, color: lastPsycho.focusLevel >= 6 ? '#10B981' : '#F59E0B' },
                      { label: 'Kaygı', val: lastPsycho.anxietyLevel, color: lastPsycho.anxietyLevel <= 5 ? '#10B981' : '#EF4444' },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', padding: '0.5rem' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: m.color }}>{m.val}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Hızlı Aksiyon */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                  <button onClick={() => setActiveTab('psikoloji')} style={{ flex: 1, padding: '0.5rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    + Psikoloji Notu
                  </button>
                  <button onClick={() => setShowPsychoForm(true)} style={{ flex: 1, padding: '0.5rem', borderRadius: '7px', border: 'none', background: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    + Seans Kaydı
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sınav Karşılaştırma Grafiği */}
          {comparisonChartData && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📊 Ders Bazlı: Genel Ortalama vs. Son Sınav
              </div>
              <div style={{ height: '250px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 700, fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '13px' }} />
                    <Bar dataKey="avgNet" name="Genel Ortalama" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="latestNet" name="Son Sınav" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'karneler' && (
        <section style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Arşivdeki Sınav Karneleri</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label className="btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 600, opacity: isUploading ? 0.7 : 1 }}>
                <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleUpload} disabled={isUploading} />
                <span>{isUploading ? 'Yükleniyor...' : '+ Yeni Karne Yükle'}</span>
              </label>
            </div>
          </div>

          {lgsPrediction && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #312e81 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-10%', top: '-10%', fontSize: '6rem', opacity: 0.1 }}>🎯</div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>YZ Tahmini LGS Performansı</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>{lgsPrediction.score}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#A7F3D0' }}>PUAN</div>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#6EE7B7' }}>
                  Tahmini Yüzdelik: %{lgsPrediction.percentile}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                  Son denemelerdeki <strong>{lgsPrediction.avgNet}</strong> ortalama net baz alınmıştır.
                </div>
              </div>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>📈</span> Açığı Kapatma Simülasyonu
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Sınav röntgenine göre aşağıdaki alanlardaki hataları giderdiğinizde LGS puanınıza yansıyacak <strong>net artış</strong> potansiyeli:
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {lgsPrediction.opportunities.length > 0 ? lgsPrediction.opportunities.map((opp: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opp.subject} - <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{opp.topic}</span></span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 900, fontSize: '0.9rem' }}>
                        +{opp.potentialIncrease} Puan Artışı
                      </span>
                    </div>
                  )) : (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                      Öğrencinin güncel kazanım bazlı hata verisi bulunamadı. Lütfen detaylı bir sınav yükleyin.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {comparisonChartData && (
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.05))', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span> Genel Ortalama vs. Son Sınav Kıyaslaması
              </h3>
              <div style={{ height: '320px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="avgNet" name="Genel Ortalama Net" fill="rgba(148, 163, 184, 0.5)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="latestNet" name="Son Sınav Neti" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border)' }}>Sınav Adı</th>
                  <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border)' }}>Tarih</th>
                  <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '2px solid var(--border)' }}>D - Y - B</th>
                  <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border)' }}>Toplam Net</th>
                  <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border)' }}>Sıralama</th>
                  <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border)' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam: any) => (
                  <tr key={exam.id}>
                    <td style={{ fontWeight: 600 }}>
                      {exam.name}
                      {exam.examType === 'MERGED' && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: 'rgb(139, 92, 246)', borderRadius: '4px', verticalAlign: 'middle' }}>Birleştirilmiş</span>
                      )}
                      {exam.examType === 'PRIORITY' && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: 'rgb(217, 119, 6)', borderRadius: '4px', verticalAlign: 'middle' }}>Öncelikli</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{exam.date}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>{exam.totalCorrect ?? '-'}</span> /{' '}
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{exam.totalIncorrect ?? '-'}</span> /{' '}
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{exam.totalBlank ?? '-'}</span>
                    </td>
                    <td><span style={{ color: 'var(--primary)', fontWeight: 700 }}>{exam.totalNet}</span> / 90</td>
                    <td>{exam.rank}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleViewAi(exam)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>🧠</span> Analiz
                      </button>
                      <button onClick={async () => {
                        if (confirm(`"${exam.name}" sınavını silmek istediğinize emin misiniz?`)) {
                          const result = await deleteExam(exam.id, initialStudent.id);
                          if (result.success) {
                            setExams((prev: any[]) => prev.filter((e: any) => e.id !== exam.id));
                          } else {
                            alert('Silme hatası: ' + (result.error || 'Bilinmeyen hata'));
                          }
                        }
                      }} style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>Sil</button>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Henüz karne bulunmuyor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      
      {activeTab === 'konular' && (
        <section style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>📚 Konu Takip Listesi</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Öğrencinin bugüne kadar yüklenen tüm sınavlarındaki konu bazlı başarı dökümü aşağıdadır.</p>
          
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-main)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>📊 Analize Dahil Edilecek Sınavları Seçin (Çift sayımı önlemek için tekli sınavlar veya sadece birleştirilmiş karne seçin)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {exams.map((exam: any) => (
                <label key={exam.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', opacity: selectedTopicExams.includes(exam.id) ? 1 : 0.6 }}>
                  <input 
                    type="checkbox" 
                    checked={selectedTopicExams.includes(exam.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTopicExams(prev => [...prev, exam.id]);
                      else setSelectedTopicExams(prev => prev.filter(id => id !== exam.id));
                    }}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  {exam.name}
                  {exam.examType !== 'SINGLE' && <span style={{ fontSize: '0.65rem', background: 'var(--primary)', color: 'white', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{exam.examType}</span>}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(() => {
              // Aggregate topics
              const subjectMap: Record<string, Record<string, { correct: number, incorrect: number, blank: number }>> = {};
              exams.filter((e:any) => selectedTopicExams.includes(e.id)).forEach((exam: any) => {
                if (exam.subjectDetails && exam.subjectDetails !== '[]') {
                  try {
                    const details = JSON.parse(exam.subjectDetails);
                    details.forEach((sub: any) => {
                      if (!subjectMap[sub.name]) subjectMap[sub.name] = {};
                      if (sub.topics) {
                        sub.topics.forEach((t: any) => {
                          if (!subjectMap[sub.name][t.name]) {
                            subjectMap[sub.name][t.name] = { correct: 0, incorrect: 0, blank: 0 };
                          }
                          subjectMap[sub.name][t.name].correct += (t.correct || 0);
                          subjectMap[sub.name][t.name].incorrect += (t.incorrect || 0);
                          subjectMap[sub.name][t.name].blank += (t.blank || 0);
                        });
                      }
                    });
                  } catch (e) {}
                }
              });

              const subjects = Object.keys(subjectMap);
              if (subjects.length === 0) {
                return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Henüz konu analizi içeren bir sınav yüklenmemiş.</div>;
              }

              return subjects.map(subName => {
                const topics = Object.entries(subjectMap[subName]).map(([name, stats]) => ({ name, ...stats }));
                const isOpen = openSubject === subName;
                
                return (
                  <div key={subName} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <button 
                      onClick={() => setOpenSubject(isOpen ? null : subName)}
                      style={{ 
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '1.25rem 1.5rem', background: isOpen ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-main)', 
                        border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: isOpen ? '1px solid var(--border)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{subName}</span>
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{isOpen ? '▲' : '▼'}</span>
                    </button>
                    
                    {isOpen && (
                      <div style={{ padding: '0' }}>
                        <div style={{ padding: '1rem', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                           <button 
                             disabled={isWorksheetLoading}
                             onClick={() => {
                               const weakTopics = topics.filter(t => {
                                 const tot = t.correct + t.incorrect + t.blank;
                                 return tot > 0 && (t.correct/tot) < 0.6;
                               }).map(t => t.name).join(', ');
                               generateWorksheet(subName, weakTopics || topics[0].name);
                             }} 
                             className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                             {isWorksheetLoading ? '⏳ Test Üretiliyor...' : '🤖 Zayıf Konulara Özel Test Üret'}
                           </button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '2px solid var(--border)' }}>
                              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', width: '50%' }}>Konu Adı</th>
                              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--success)' }}>D</th>
                              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--danger)' }}>Y</th>
                              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>B</th>
                              <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Başarı Yüzdesi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topics.sort((a,b) => b.correct - a.correct).map((t, i) => {
                              const total = t.correct + t.incorrect + t.blank;
                              const pct = total > 0 ? (t.correct / total) * 100 : 0;
                              return (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{t.name}</td>
                                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{t.correct}</td>
                                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{t.incorrect}</td>
                                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{t.blank}</td>
                                  <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--primary)' : 'var(--danger)' }}></div>
                                      </div>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '40px' }}>{pct.toFixed(0)}%</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </section>
      )}


      {activeTab === 'programlar' && (
        <section style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Haftalık Çalışma Programları</h2>
            <button className="btn-primary" onClick={() => window.location.href='/assignments'}>+ Yeni Plan Oluştur</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {initialStudent.schedules && initialStudent.schedules.length > 0 ? (
              initialStudent.schedules.map((schedule: any, idx: number) => {
                const totalTargetQuestions = schedule.tasks?.reduce((sum: number, t: any) => sum + t.questionCount, 0) || 0;
                const totalSolvedQuestions = schedule.tasks?.reduce((sum: number, t: any) => sum + (t.solvedQuestions || 0), 0) || 0;
                const completedCount = schedule.tasks?.filter((t: any) => t.isCompleted || t.status === 'COMPLETED').length || 0;
                const totalTasksCount = schedule.tasks?.length || 0;
                const successRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;
                
                const startDateStr = new Date(schedule.startDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
                const endDateStr = new Date(schedule.endDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });

                return (
                  <div key={schedule.id} className="card" style={{ borderTop: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Hafta {initialStudent.schedules.length - idx} Programı</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{startDateStr} - {endDateStr}</p>
                        </div>
                        <span className={`badge ${successRate >= 80 ? 'badge-success' : 'badge-warning'}`}>
                          %{successRate} Başarı
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Hedeflenen Soru: <strong>{totalTargetQuestions}</strong> <br/>
                        Çözülen Soru: <strong>{totalSolvedQuestions}</strong>
                      </p>
                    </div>
                    <button 
                      className="btn-secondary" 
                      onClick={() => {
                        setSelectedScheduleForModal(schedule);
                        setShowProgram(true);
                      }} 
                      style={{ width: '100%' }}
                    >
                      Tabloyu Aç & Ödevleri Değerlendir
                    </button>
                  </div>
                );
              })
            ) : (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem', background: 'white', border: '1px solid var(--border)', borderRadius: '12px' }}>
                Henüz tanımlanmış haftalık çalışma programı bulunmuyor.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Görüşmeler tabı zincirleme iş akışı kapsamında Ödev Değerlendirme modalına taşındı */}

      <style>{`
        .print-only {
          display: none !important;
        }
        .print-only-block {
          display: none !important;
        }
        @media print {
          /* Clean background and hide default headers/aside of RootLayout */
          html, body {
            background: white !important;
            color: black !important;
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Hide app sidebar, top-header and general wizard buttons/tabs */
          aside,
          header.top-header,
          header,
          .no-print,
          .no-print * {
            display: none !important;
          }

          .print-only {
            display: inline-block !important;
          }
          .print-only-block {
            display: block !important;
          }

          /* Force modal to occupy full A4 width cleanly without scale distortion */
          .print-modal {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            z-index: 99999 !important;
            overflow: visible !important;
            transform: none !important;
            box-shadow: none !important;
          }

          @page {
            size: A4 landscape;
            margin: 8mm 10mm;
          }
          
          /* Strict table styling for print */
          .print-modal table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 2px solid #000 !important;
            margin-top: 0.4rem !important;
            margin-bottom: 0.5rem !important;
            table-layout: fixed !important;
            page-break-inside: avoid;
          }
          
          .print-modal table tr {
            page-break-inside: avoid;
            page-break-after: avoid;
          }
          
          .print-modal table th, 
          .print-modal table td {
            border: 1px solid #000 !important;
            padding: 4px 3px !important;
            font-size: 0.7rem !important;
            line-height: 1.1 !important;
            color: #000 !important;
            background: none !important;
            word-wrap: break-word !important;
          }

          .print-modal table th {
            font-weight: 800 !important;
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-modal table td div {
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Bottom layout details (note & eval) under the table, signatures below details */
          .print-modal .details-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1.25rem !important;
            margin-top: 0.6rem !important;
            width: 100% !important;
          }

          .print-modal .details-container > div {
            border: 1px solid #000 !important;
            padding: 0.6rem !important;
            border-radius: 0 !important;
            box-sizing: border-box !important;
            background: white !important;
          }

          .print-modal .details-container h4 {
            font-size: 0.75rem !important;
            font-weight: 800 !important;
            margin: 0 0 0.3rem 0 !important;
            color: #000 !important;
            border-bottom: 1px solid #000 !important;
            padding-bottom: 0.2rem !important;
          }

          .print-modal .details-container p,
          .print-modal .details-container div {
            font-size: 0.7rem !important;
            line-height: 1.3 !important;
            color: #000 !important;
          }

          .print-modal .signatures-container {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            margin-top: 1rem !important;
            width: 100% !important;
            padding: 0 1rem !important;
            box-sizing: border-box !important;
          }

          .print-modal .signatures-container > div {
            text-align: center !important;
            min-width: 150px !important;
          }

          .print-modal .signatures-container p {
            margin: 0 !important;
            font-size: 0.75rem !important;
            color: #000 !important;
          }
          
          .print-modal .signatures-container p:first-child {
            font-weight: 800 !important;
            border-bottom: 1px dotted #555 !important;
            padding-bottom: 1.5rem !important;
            margin-bottom: 0.25rem !important;
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {activeTab === 'kitaplar' && (
        <section style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Öğrencinin Kaynak Kitap Havuzu</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-main)', border: '1px solid var(--border)', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>+ Yeni Kitap Kaydet</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const { addStudentBook } = await import('../../actions/student');
                await addStudentBook(
                  initialStudent.id, 
                  formData.get('title') as string,
                  formData.get('publisher') as string,
                  formData.get('difficulty') as string,
                  parseInt(formData.get('totalPages') as string) || 200
                );
                (e.currentTarget as HTMLFormElement).reset();
                router.refresh();
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Kitap Seçimi (Veritabanından)</label>
                  <select name="title" required style={{ width: '100%', padding: '0.6rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <option value="">Lütfen sistemdeki havuzdan kitap seçin...</option>
                    {Object.entries(BOOK_CATALOG).map(([category, books]) => (
                      <optgroup label={category} key={category}>
                        {books.map((b: string) => <option value={b} key={b}>{b}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Yayın Evi / Marka (İsteğe Bağlı)</label>
                  <input type="text" name="publisher" placeholder="Varsa yayını belirtebilirsiniz..." style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Zorluk Seviyesi</label>
                    <select name="difficulty" required style={{ width: '100%', padding: '0.6rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <option value="KOLAY">Kolay</option>
                      <option value="ORTA">Orta</option>
                      <option value="ZOR">Zor</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Toplam Sayfa</label>
                    <input type="number" name="totalPages" required defaultValue={200} min={1} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Kitaplığına Ekle</button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {initialStudent.books?.length > 0 ? initialStudent.books.map((book: any) => {
                const bookTasks = book.tasks || [];
                const totalQuestionsAssigned = bookTasks.reduce((sum: number, t: any) => sum + t.questionCount, 0);
                const totalQuestionsSolved = bookTasks.reduce((sum: number, t: any) => sum + t.solvedQuestions, 0);
                
                const pct = totalQuestionsAssigned > 0 
                  ? Math.min(Math.round((totalQuestionsSolved / totalQuestionsAssigned) * 100), 100)
                  : (book.totalPages > 0 ? Math.min(Math.round((book.completedPages / book.totalPages) * 100), 100) : 0);
                return (
                  <div key={book.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, marginRight: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{book.title}</h3>
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '4px', background: book.difficulty === 'ZOR' ? 'var(--danger)' : book.difficulty === 'ORTA' ? 'var(--accent)' : 'var(--success)', color: 'white', fontWeight: 800 }}>{book.difficulty}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Yayıncı: {book.publisher} • Toplam: {book.totalPages} Sayfa
                        {totalQuestionsAssigned > 0 && ` • Çözülen Soru: ${totalQuestionsSolved}/${totalQuestionsAssigned}`}
                      </p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--success)' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>%{pct} Tamamlandı</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <input 
                          type="number" 
                          defaultValue={book.completedPages} 
                          min={0}
                          max={book.totalPages}
                          onBlur={async (e) => {
                            const val = parseInt(e.target.value) || 0;
                            const { updateBookProgress } = await import('../../actions/student');
                            await updateBookProgress(book.id, initialStudent.id, val);
                            router.refresh();
                          }}
                          style={{ width: '60px', padding: '0.2rem', textAlign: 'center', fontSize: '0.8rem', border: '1px solid var(--border)' }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sayfa</span>
                      </div>
                      <button 
                        onClick={async () => {
                          if (confirm('Bu kitabı kütüphaneden silmek istediğinize emin misiniz?')) {
                            const { deleteBook } = await import('../../actions/student');
                            await deleteBook(book.id, initialStudent.id);
                            router.refresh();
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Kitabı Sil
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  Öğrencinin kütüphanesinde kayıtlı kitap bulunmuyor. Sol taraftan ekleme yapabilirsiniz.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {showProgram && (
        <div className="print-wrapper" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="card print-modal" style={{ width: '100%', maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto', background: 'white', animation: 'fadeIn 0.2s', padding: 0 }}>
            {/* Sadece yazıcıda çıkacak başlık */}
            <div className="print-only-block" style={{ display: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '0.4rem', marginBottom: '0.6rem', padding: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#000', margin: 0 }}>HAFTALIK DERS ÇALIŞMA PROGRAMI</h1>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>
                    Öğrenci: {initialStudent?.firstName} {initialStudent?.lastName} | Sınıf: {initialStudent?.grade}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#555' }}>Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            </div>
            <div className="no-print" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>HAFTALIK DERS ÇALIŞMA PLANI</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {initialStudent.firstName} {initialStudent.lastName} - {initialStudent.grade} | 
                    Hedef: {selectedScheduleForModal?.tasks?.reduce((sum: number, t: any) => sum + t.questionCount, 0) || 0} Soru
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button className="btn-secondary no-print" onClick={() => setShowPhotoModal(true)} style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, background: 'rgba(59, 130, 246, 0.05)', color: 'var(--secondary)', borderColor: 'var(--secondary)' }}>
                    <span>📸</span> Fotoğraf ile Ödev Raporla
                  </button>
                  <button className="btn-secondary no-print" onClick={() => setShowKanban(true)} style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                    <span style={{ fontSize: '1.2rem' }}>🖐️</span> Sürükle & Bırak ile Planla
                  </button>
                  <button className="btn-secondary no-print" onClick={async () => {
                    setIsGeneratingLetter(true);
                    try {
                      const weakTopics = exams.length >= 3 ? getChronicWeaknesses() : [];
                      const latestPsychoNote = initialStudent.psychoRecords?.[0]?.coachNote || '';
                      const totalTasks = selectedScheduleForModal?.tasks?.length || 0;
                      
                      const res = await fetch('/api/generate-motivation-letter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          studentName: initialStudent.firstName,
                          grade: initialStudent.grade,
                          weakTopics,
                          totalTasks,
                          latestPsychoNote
                        })
                      });
                      const data = await res.json();
                      if (data.html) {
                        setAiLetterHtml(data.html.replace(/\*\*/g, '').replace(/\*/g, ''));
                        alert('Yapay zeka mektubu hazır. Artık yazdırabilirsiniz!');
                      } else {
                        alert(data.error || 'Hata oluştu');
                      }
                    } catch (e) {
                      alert('Bağlantı hatası');
                    } finally {
                      setIsGeneratingLetter(false);
                    }
                  }} style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, background: 'rgba(245, 158, 11, 0.05)', color: '#D97706', borderColor: '#F59E0B' }}>
                    <span style={{ fontSize: '1.2rem' }}>🧠</span> {isGeneratingLetter ? 'Yazılıyor...' : 'Yapay Zeka Mektubu Ekle'}
                  </button>
                  <button className="btn-primary no-print" onClick={() => window.print()} style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, var(--accent), var(--primary))', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                    <span style={{ fontSize: '1.2rem' }}>🖨️</span> PDF Olarak Yazdır
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--text-primary)', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.8rem', border: '1px solid var(--text-primary)', textAlign: 'left', width: '140px', background: 'var(--bg-main)' }}>DERS / GÖREV</th>
                      {['PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ', 'PAZAR'].map(day => (
                        <th key={day} style={{ padding: '0.8rem', border: '1px solid var(--text-primary)', textAlign: 'center', width: '130px', background: 'var(--bg-main)' }}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['TÜRKÇE', 'MATEMATİK', 'FEN BİLİMLERİ', 'T.C. İNKILAP TARİHİ', 'İNGİLİZCE', 'DİN KÜLTÜRÜ', 'PARAGRAF'].map((subject) => (
                      <tr key={subject}>
                        <td style={{ padding: '0.8rem', border: '1px solid var(--text-primary)', fontWeight: 800, background: 'var(--bg-main)' }}>{subject}</td>
                        {['PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ', 'PAZAR'].map((day) => {
                          const cellTask = selectedScheduleForModal?.tasks?.find(
                            (t: any) => t.subject.toUpperCase() === subject.toUpperCase() && 
                            (t.day.toUpperCase() === day.toUpperCase() || t.day.substring(0,3).toUpperCase() === day.substring(0,3).toUpperCase())
                          );

                          if (!cellTask) {
                            return (
                              <td key={day} style={{ border: '1px solid var(--text-primary)', padding: '0.5rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                -
                              </td>
                            );
                          }

                          const getCellBg = () => {
                            if (cellTask.status === 'COMPLETED') return 'rgba(16, 185, 129, 0.04)';
                            if (cellTask.status === 'PARTIAL') return 'rgba(245, 158, 11, 0.04)';
                            if (cellTask.status === 'FAILED') return 'rgba(239, 68, 68, 0.04)';
                            return 'transparent';
                          };

                          return (
                            <td key={day} style={{ border: '1px solid var(--text-primary)', verticalAlign: 'top', padding: 0, position: 'relative', background: getCellBg() }}>
                              <div style={{ padding: '0.5rem', height: '100%', display: 'flex', flexDirection: 'column', minHeight: '100px' }}>
                                
                                {/* Edit Question Solved Inline */}
                                {!cellTask.pagesRange && (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                                      <input 
                                        className="no-print"
                                        type="number" 
                                        defaultValue={cellTask.solvedQuestions || 0} 
                                        onBlur={async (e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          const { updateTaskStatus } = await import('../../actions/student');
                                          await updateTaskStatus(cellTask.id, initialStudent.id, cellTask.status, val);
                                        }}
                                        style={{ width: '50px', fontSize: '0.75rem', padding: '0.1rem 0', border: '1px solid var(--border)', textAlign: 'center', flexShrink: 0 }} 
                                      />
                                      <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>/ {cellTask.questionCount}</span>
                                    </div>
                                    <span className="print-only" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                                      {cellTask.solvedQuestions || 0} / {cellTask.questionCount} Soru
                                    </span>
                                  </div>
                                )}

                                {/* Task Topic */}
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-word', marginBottom: '0.3rem' }}>
                                  {cellTask.topic}
                                </div>

                                {/* Pages/Book Info */}
                                {cellTask.pagesRange && (
                                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.4rem' }}>
                                    <span>🎯</span> {cellTask.pagesRange}
                                  </div>
                                )}

                                {/* Interactive Status Selector */}
                                <div className="no-print" style={{ display: 'flex', gap: '0.2rem', marginTop: 'auto', borderTop: '1px dashed var(--border)', paddingTop: '0.3rem' }}>
                                  <button 
                                    onClick={async () => {
                                      const { updateTaskStatus } = await import('../../actions/student');
                                      const solvedVal = cellTask.solvedQuestions === 0 ? cellTask.questionCount : cellTask.solvedQuestions;
                                      await updateTaskStatus(cellTask.id, initialStudent.id, 'COMPLETED', solvedVal);
                                      router.refresh();
                                    }}
                                    style={{ flex: 1, padding: '0.1rem 0.2rem', fontSize: '0.7rem', border: '1px solid var(--border)', background: cellTask.status === 'COMPLETED' ? '#10b981' : 'white', color: cellTask.status === 'COMPLETED' ? 'white' : '#666', borderRadius: '3px', cursor: 'pointer' }}
                                    title="Tamamlandı"
                                  >
                                    ✅
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      if (confirm('Bu ödev eksik kalmış olarak işaretlenip, kalan kısım yeni bir görev olarak devredilsin mi?')) {
                                        const { rolloverTask } = await import('../../actions/student');
                                        await rolloverTask(cellTask.id, initialStudent.id);
                                        router.refresh();
                                      }
                                    }}
                                    style={{ flex: 1, padding: '0.1rem 0.2rem', fontSize: '0.7rem', border: '1px solid var(--border)', background: cellTask.status === 'PARTIAL' ? '#f59e0b' : 'white', color: cellTask.status === 'PARTIAL' ? 'white' : '#666', borderRadius: '3px', cursor: 'pointer' }}
                                    title="Eksik Kaldı (Devret)"
                                  >
                                    ⚠️
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      const { updateTaskStatus } = await import('../../actions/student');
                                      await updateTaskStatus(cellTask.id, initialStudent.id, 'FAILED', 0);
                                      router.refresh();
                                    }}
                                    style={{ flex: 1, padding: '0.1rem 0.2rem', fontSize: '0.7rem', border: '1px solid var(--border)', background: cellTask.status === 'FAILED' ? '#ef4444' : 'white', color: cellTask.status === 'FAILED' ? 'white' : '#666', borderRadius: '3px', cursor: 'pointer' }}
                                    title="Yapılmadı"
                                  >
                                    ❌
                                  </button>
                                </div>

                                <div className="print-only" style={{ marginTop: 'auto', fontSize: '0.7rem', fontWeight: 600, color: cellTask.status === 'COMPLETED' ? 'green' : cellTask.status === 'PARTIAL' ? 'orange' : cellTask.status === 'FAILED' ? 'red' : 'gray' }}>
                                  {cellTask.status === 'COMPLETED' ? 'TAMAMLANDI' : cellTask.status === 'PARTIAL' ? 'EKSİK KALDI' : cellTask.status === 'FAILED' ? 'YAPILMADI' : 'BEKLİYOR'}
                                </div>

                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    
                    <tr style={{ background: 'var(--bg-main)' }}>
                      <td style={{ padding: '0.8rem', border: '1px solid var(--text-primary)', fontWeight: 800 }}>GÜNLÜK TOPLAM</td>
                      {['PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ', 'PAZAR'].map((day) => {
                        let dayTargetTotal = 0;
                        let daySolvedTotal = 0;
                        
                        selectedScheduleForModal?.tasks?.forEach((t: any) => {
                          if (t.day.toUpperCase() === day.toUpperCase() || t.day.substring(0,3).toUpperCase() === day.substring(0,3).toUpperCase()) {
                            dayTargetTotal += t.questionCount || 0;
                            daySolvedTotal += t.solvedQuestions || 0;
                          }
                        });

                        return (
                          <td key={day} style={{ padding: '0.8rem', border: '1px solid var(--text-primary)', textAlign: 'center', fontWeight: 800 }}>
                            <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{daySolvedTotal} / {dayTargetTotal}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SORU</div>
                          </td>
                        );
                      })}
                    </tr>

                  </tbody>
                </table>
              </div>

              <div className="details-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ border: '1px solid var(--text-primary)', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>SEVGİLİ ÖĞRENCİM,</h4>
                  <p style={{ fontSize: '0.85rem' }}>Bu program senin yapay zeka LGS/YKS analizin baz alınarak sana özel hazırlanmıştır. Görevlerini sorumluluk bilinciyle, ertelemeden tamamlaman başarının en büyük anahtarıdır. Sana inancım tam!</p>
                </div>
                <div style={{ border: '1px solid var(--text-primary)', padding: '1rem', minHeight: '80px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>ÖĞRENCİ DEĞERLENDİRMESİ</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bu hafta zorlandığın konuları aşağıya not edebilirsin:</p>
                </div>
              </div>

              <div className="signatures-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>Öğrenci</p>
                  <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{initialStudent?.firstName} {initialStudent?.lastName}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>Eğitim Danışmanı & Rehber Öğretmen</p>
                  <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', marginTop: '0.2rem' }}>Ahmet ŞANLI</p>
                </div>
              </div>
            </div>
            
            {/* 2. Sayfa: AI Motivasyon Mektubu (Sadece Çıktıda Çıkar) */}
            {aiLetterHtml && (
              <div className="print-only-block" style={{ pageBreakBefore: 'always', padding: '2rem' }}>
                <div className="no-print" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--accent)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  💡 <strong>Editör Kontrolü:</strong> Yapay zekanın oluşturduğu aşağıdaki mektubun üzerine tıklayarak istediğiniz kelimeyi/cümleyi klavyenizle doğrudan düzenleyebilirsiniz. Çıktı aldığınızda ekranda gördüğünüz (düzenlediğiniz) son hali kağıda basılacaktır.
                </div>
                <div 
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => setAiLetterHtml(e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: aiLetterHtml }} 
                  style={{ outline: 'none', fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif", lineHeight: 1.8, fontSize: '1.05rem', color: '#1E293B', whiteSpace: 'pre-wrap' }}
                />
              </div>
            )}

            {/* ZİNCİRLEME İŞ AKIŞI: SEANS & VELİ BİLDİRİMİ (Sadece Ekranda Görünür, Çıktıya Yansımaz) */}
            <div className="no-print" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px dashed var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🤝</span> 2. Aşama: Haftalık Seans Değerlendirmesi
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--bg-main)', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
                  Ödev kontrolünü tamamladıysanız PDR notunuzu girin
                </span>
              </div>

              <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const { addSession } = await import('../../actions/student');
                  await addSession(initialStudent.id, formData);
                  (e.currentTarget as HTMLFormElement).reset();
                  router.refresh();
                }} id="session-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <input type="text" name="title" placeholder="Görüşme Başlığı" required style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
                    <input type="number" name="sessionNumber" placeholder="Seans No (Örn: 5)" defaultValue={completedSessions + 1} required style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
                    
                    <select name="maturityScore" required style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', fontWeight: 600 }}>
                      <option value="">Gidişat / Maturity Skoru (1-5)</option>
                      <option value="5">⭐⭐⭐⭐⭐ Çok İyi (5)</option>
                      <option value="4">⭐⭐⭐⭐ İyi (4)</option>
                      <option value="3">⭐⭐⭐ Orta (3)</option>
                      <option value="2">⭐⭐ Zayıf (2)</option>
                      <option value="1">⭐ Çok Zayıf (1)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <input type="number" name="plannedQuestions" placeholder="Planlanan Soru Sayısı" style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
                    <input type="number" name="solvedQuestions" placeholder="Çözülen Soru Sayısı" style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
                    <select name="timeManagement" required style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', fontWeight: 600 }}>
                      <option value="">⏱️ Süre Yönetimi</option>
                      <option value="Süre Yetti">⏱️ [Süre Yetti]</option>
                      <option value="Hafif Yetişmedi">⏱️ [Hafif Yetişmedi]</option>
                      <option value="Büyük Süre Sorunu">⏱️ [Büyük Süre Sorunu]</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <select name="weeklyAnxiety" style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', fontWeight: 600 }}>
                      <option value="5">Kaygı Seviyesi: 5/10 (Orta)</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>Kaygı: {n}/10</option>)}
                    </select>
                    <select name="weeklyMotivation" style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', fontWeight: 600 }}>
                      <option value="7">Motivasyon: 7/10 (İyi)</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>Motivasyon: {n}/10</option>)}
                    </select>
                    <select name="weeklyFocus" style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', fontWeight: 600 }}>
                      <option value="7">Odaklanma: 7/10 (İyi)</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>Odaklanma: {n}/10</option>)}
                    </select>
                  </div>

                  <textarea name="content" rows={3} placeholder="Görüşme detayları ve koç seans notları..." required style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', resize: 'vertical', background: 'var(--bg-main)' }}></textarea>
                  <textarea name="parentFeedback" rows={2} placeholder="Veliden alınan geri bildirim Notu..." style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', resize: 'vertical', background: 'var(--bg-main)' }}></textarea>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '0.85rem 2.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none', fontSize: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span>💾</span> Seansı Kaydet ve Raporla
                    </button>
                  </div>
                </form>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Önceki Seans Geçmişi & Veli Raporları</h3>
                {initialStudent.sessions?.length > 0 ? [...initialStudent.sessions].sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((session: any) => (
                  <div key={session.id} className="card" style={{ padding: '1.5rem', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                        {session.sessionNumber ? `Seans #${session.sessionNumber} - ` : ''}{session.title}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{new Date(session.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      {session.maturityScore && (
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', fontWeight: 700 }}>
                          Gidişat Skoru: {'⭐'.repeat(session.maturityScore)}
                        </span>
                      )}
                      {session.plannedQuestions && (
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 700 }}>
                          Soru: {session.solvedQuestions || 0}/{session.plannedQuestions} (%{Math.round(((session.solvedQuestions || 0)/session.plannedQuestions)*100)})
                        </span>
                      )}
                      {(session.weeklyAnxiety || session.weeklyMotivation) && (
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)' }}>
                          Kaygı: {session.weeklyAnxiety || 5}/10 | Mot: {session.weeklyMotivation || 5}/10 | Odak: {session.weeklyFocus || 5}/10
                        </span>
                      )}
                      {session.timeManagement && (
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent)', fontWeight: 700 }}>
                          ⏱️ {session.timeManagement}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {session.content}
                    </p>

                    {session.parentFeedback && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-main)', borderLeft: '3px solid var(--accent)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        <strong>💬 Veli Geri Bildirimi:</strong> "{session.parentFeedback}"
                      </div>
                    )}

                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={async (e) => {
                          e.currentTarget.innerText = "⏳ Üretiliyor...";
                          try {
                            const res = await fetch('/api/generate-session-report', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ studentName: initialStudent.firstName, sessionData: session, targetAudience: 'parent' })
                            });
                            const data = await res.json();
                            if (data.text) {
                              setReportPreview({ type: 'parent', text: data.text });
                            }
                          } catch(err) { alert('Hata oluştu'); }
                          e.currentTarget.innerHTML = "<span>💬</span> Veli (WhatsApp)";
                        }} style={{ padding: '0.5rem 1rem', background: '#25D366', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>💬</span> Veli (WhatsApp)
                        </button>
                        
                        <button onClick={async (e) => {
                          e.currentTarget.innerText = "⏳ Üretiliyor...";
                          try {
                            const res = await fetch('/api/generate-session-report', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ studentName: initialStudent.firstName, sessionData: session, targetAudience: 'principal' })
                            });
                            const data = await res.json();
                            if (data.text) {
                              setReportPreview({ type: 'principal', text: data.text });
                            }
                          } catch(err) { alert('Hata oluştu'); }
                          e.currentTarget.innerHTML = "<span>📋</span> Müdür Raporu";
                        }} style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, var(--accent), var(--primary))', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>📋</span> Müdür Raporu
                        </button>
                      </div>
                      
                      <button onClick={async () => {
                        if (confirm('Bu seans notunu silmek istediğinize emin misiniz?')) {
                          const { deleteSession } = await import('../../actions/student');
                          await deleteSession(session.id, initialStudent.id);
                          router.refresh();
                        }
                      }} style={{ padding: '0.4rem 0.8rem', background: 'none', color: 'var(--danger)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Sil</button>
                    </div>
                  </div>
                )) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem', background: 'var(--bg-main)', borderRadius: '12px' }}>Henüz geçmiş bir seans bulunmuyor.</p>
                )}
              </div>
            </div>
            {/* ZİNCİRLEME İŞ AKIŞI BİTİŞİ */}
            
          </div>
        </div>
      )}

      {/* 📸 Upload & OCR Scan Modal */}
      {showPhotoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '450px', background: 'white', padding: '2rem', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowPhotoModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>📸 Ödev Çıktı Fotoğrafı Taraması</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Öğrencinin getirdiği kağıt programın fotoğrafını yükleyin. AI el yazısını okuyarak çözülen soru sayılarını otomatik eşleştirecektir.</p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const fileInput = (e.currentTarget.elements.namedItem('photoFile') as HTMLInputElement)?.files?.[0];
              const fileToUpload = pastedImage || fileInput;
              if (fileToUpload) {
                await handleUploadHomeworkPhoto(fileToUpload, studentStatus);
              } else {
                alert('Lütfen bir fotoğraf sürükleyin, yapıştırın veya dosyadan seçin.');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: dragOver ? '2px dashed var(--primary)' : '2px dashed var(--border)',
                  padding: '2rem 1.5rem',
                  borderRadius: '8px',
                  background: dragOver ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-main)',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {previewUrl ? (
                  <div>
                    <img src={previewUrl} alt="Ödev Çıktısı Önizleme" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px', marginBottom: '0.5rem', objectFit: 'contain' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Görsel hazır! Değiştirmek için sürükleyin, yapıştırın veya tıklayın.</p>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📥</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Fotoğrafı buraya sürükleyin</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>veya WhatsApp Web'den kopyalayıp <strong>Ctrl+V / Cmd+V</strong> ile yapıştırın</p>
                  </div>
                )}
                <input 
                  type="file" 
                  name="photoFile" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPastedImage(null);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} 
                />
              </div>

              {isParsingPhoto ? (
                <div style={{ padding: '1rem', color: 'var(--secondary)', fontWeight: 800, fontSize: '0.9rem' }}>
                  🔄 Yapay Zeka Fotoğrafı İnceliyor... (Lütfen bekleyin)
                </div>
              ) : (
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>Fotoğrafı Tara & Raporla</button>
              )}

              {photoAnalysisError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>
                  ❌ Hata: {photoAnalysisError}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 📝 OCR Review & Confirm Modal */}
      {showReviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '650px', maxWidth: '100%', background: 'white', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>📝 AI Tarama Sonuçlarını Doğrula</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Yapay zeka görseli okudu. Lütfen verileri kontrol edin ve öğrencinin mevcut haftalık ödevleriyle eşleştirin.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              {reviewedTasks.map((t, idx) => (
                <div key={t.id} style={{ border: '1px solid var(--border)', padding: '1.2rem', borderRadius: '8px', background: 'var(--bg-main)', textAlign: 'left' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Ders</label>
                      <input 
                        type="text" 
                        value={t.subject} 
                        onChange={(e) => {
                          const updated = [...reviewedTasks];
                          updated[idx].subject = e.target.value;
                          setReviewedTasks(updated);
                        }}
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', border: '1px solid var(--border)' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Hedef Soru</label>
                      <input 
                        type="number" 
                        value={t.planned} 
                        onChange={(e) => {
                          const updated = [...reviewedTasks];
                          updated[idx].planned = parseInt(e.target.value) || 0;
                          setReviewedTasks(updated);
                        }}
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid var(--border)' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Çözülen Soru</label>
                      <input 
                        type="number" 
                        value={t.solved} 
                        onChange={(e) => {
                          const updated = [...reviewedTasks];
                          updated[idx].solved = parseInt(e.target.value) || 0;
                          setReviewedTasks(updated);
                        }}
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid var(--border)' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Durum</label>
                      <select 
                        value={t.status} 
                        onChange={(e) => {
                          const updated = [...reviewedTasks];
                          updated[idx].status = e.target.value;
                          setReviewedTasks(updated);
                        }}
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', border: '1px solid var(--border)' }}
                      >
                        <option value="COMPLETED">COMPLETED (Tamamlandı)</option>
                        <option value="PARTIAL">PARTIAL (Eksik Kaldı)</option>
                        <option value="FAILED">FAILED (Yapılmadı)</option>
                        <option value="PENDING">PENDING (Bekliyor)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Program Göreviyle Eşle</label>
                      <select 
                        value={t.matchedTaskId} 
                        onChange={(e) => {
                          const updated = [...reviewedTasks];
                          updated[idx].matchedTaskId = e.target.value;
                          setReviewedTasks(updated);
                        }}
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', border: '1px solid var(--border)' }}
                      >
                        <option value="none">-- Eşleme Yapma / Yoksay --</option>
                        {initialStudent.schedules?.[0]?.tasks?.map((task: any) => (
                          <option key={task.id} value={task.id}>
                            [{task.day}] {task.subject} - {task.topic} ({task.questionCount} Soru)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowReviewModal(false)} 
                className="btn-secondary" 
                style={{ padding: '0.6rem 1.5rem' }}
                disabled={isSavingReview}
              >
                Vazgeç
              </button>
              <button 
                onClick={async () => {
                  setIsSavingReview(true);
                  try {
                    const { updateTaskStatus } = await import('../../actions/student');
                    for (const t of reviewedTasks) {
                      if (t.matchedTaskId && t.matchedTaskId !== 'none') {
                        await updateTaskStatus(t.matchedTaskId, initialStudent.id, t.status, t.solved);
                      }
                    }
                    alert('Seçilen ödev durumları ve soru sayıları başarıyla güncellendi!');
                    setShowReviewModal(false);
                    router.refresh();
                  } catch (err) {
                    alert('Veritabanına kaydedilirken hata oluştu.');
                  } finally {
                    setIsSavingReview(false);
                  }
                }} 
                className="btn-primary" 
                style={{ padding: '0.6rem 1.5rem' }}
                disabled={isSavingReview}
              >
                {isSavingReview ? 'Kaydediliyor...' : 'Onayla & Veritabanına Yaz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Öğrenci Profilini Düzenle</h2>
            <form action={async (formData) => {
              await updateStudent(initialStudent.id, formData);
              setShowEditModal(false);
              router.refresh();
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Adı</label>
                  <input type="text" name="firstName" defaultValue={initialStudent.firstName} required style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Soyadı</label>
                  <input type="text" name="lastName" defaultValue={initialStudent.lastName} required style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Sınıfı</label>
                  <input type="text" name="grade" defaultValue={initialStudent.grade} required style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Okul</label>
                  <input type="text" name="school" defaultValue={initialStudent.school || ''} placeholder="Örn: Kadıköy Anadolu" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Alan (Sayısal, EA, vb.)</label>
                  <input type="text" name="field" defaultValue={initialStudent.field || ''} placeholder="Örn: Sayısal veya LGS" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Toplam Seans Hedefi</label>
                  <input type="number" name="totalTargetSessions" defaultValue={initialStudent.totalTargetSessions || 36} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Hedef Okul / Üniversite</label>
                  <input type="text" name="targetSchool" defaultValue={initialStudent.targetSchool || ''} placeholder="Örn: Galatasaray Lisesi" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2/' }}>Hedef Bölüm</label>
                  <input type="text" name="targetDepartment" defaultValue={initialStudent.targetDepartment || ''} placeholder="Örn: Fen Lisesi veya Tıp" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Hedef Şehir</label>
                  <input type="text" name="targetCity" defaultValue={initialStudent.targetCity || ''} placeholder="Örn: İstanbul" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Hedef Netler</label>
                  <input type="text" name="targetNets" defaultValue={initialStudent.targetNets || ''} placeholder="Örn: Mat: 18, Fen: 19" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Sınavza Hızlı Linki</label>
                  <input type="text" name="sinavzaLink" defaultValue={initialStudent.sinavzaLink || ''} placeholder="Örn: https://sinavza.com/student/1" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Genel Hedef (Eski Alan)</label>
                  <input type="text" name="target" defaultValue={initialStudent.target || ''} placeholder="Örn: 480 Puan" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Veli Adı</label>
                  <input type="text" name="parentName" defaultValue={initialStudent.parentName || ''} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Veli Telefonu</label>
                  <input type="text" name="parentPhone" defaultValue={initialStudent.parentPhone || ''} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary" style={{ flex: 1 }}>İptal</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Değişiklikleri Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* AI Analysis Modal */}
      {activeAiExam && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '800px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🧠</span> Yapay Zeka Sınav Röntgeni
              </h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {!activeAiExam.isLoading && (
                  <button onClick={handlePrintAi} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#8b5cf6', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                    <span>🖨️</span> PDF İndir / Çıktı Al
                  </button>
                )}
                <button onClick={() => setActiveAiExam(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
              </div>
            </div>
            
            {activeAiExam.isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                {/* Spinning Brain Icon with Gradient Ring */}
                <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '4px solid var(--border)',
                    borderTopColor: 'var(--primary)',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <div style={{
                    fontSize: '2.2rem',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    userSelect: 'none'
                  }}>🧠</div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Yapay Zeka Analiz Ediyor
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Öğrencinin bu sınava ait tüm konu kazanımları ve soru dökümü rehberlik amacıyla taranıyor.
                </p>
                
                {/* Progress Step List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left', margin: '1.5rem auto', maxWidth: '440px', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisSeconds >= 0 ? 1 : 0.4, transition: 'all 0.3s' }}>
                    <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: analysisSeconds >= 2 ? 'var(--success)' : 'rgba(4, 120, 87, 0.1)', color: analysisSeconds >= 2 ? 'white' : 'var(--primary)', fontWeight: 'bold' }}>
                      {analysisSeconds >= 2 ? '✓' : '•'}
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: analysisSeconds >= 2 ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      Sınav soru/konu kazanım tablosu okunuyor...
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisSeconds >= 2 ? 1 : 0.4, transition: 'all 0.3s' }}>
                    <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: analysisSeconds >= 7 ? 'var(--success)' : (analysisSeconds >= 2 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.05)'), color: analysisSeconds >= 7 ? 'white' : 'var(--primary)', fontWeight: 'bold' }}>
                      {analysisSeconds >= 7 ? '✓' : (analysisSeconds >= 2 ? '•' : '•')}
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: analysisSeconds >= 7 ? 'var(--text-secondary)' : (analysisSeconds >= 2 ? 'var(--text-primary)' : 'var(--text-muted)') }}>
                      Ders bazlı başarı yüzdeleri & zayıf konular saptanıyor...
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisSeconds >= 7 ? 1 : 0.4, transition: 'all 0.3s' }}>
                    <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: analysisSeconds >= 7 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.05)', color: 'var(--primary)', fontWeight: 'bold' }}>
                      •
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: analysisSeconds >= 7 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      Koçluk röntgeni ve tavsiyeler kaleme alınıyor...
                    </span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>
                  Lütfen tarayıcıyı kapatmayın veya yenilemeyin.
                </p>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>Sınav: {activeAiExam.name}</h3>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Rehberlik Özeti (Güçlü ve Zayıf Yönler)</h4>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {activeAiExam.aiSummary}
                  </p>
                </div>
                
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Ders Bazlı Zayıf Konu Trendi</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {activeAiExam.aiTopics && JSON.parse(activeAiExam.aiTopics).map((subject: any, idx: number) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>{subject.name}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: subject.weakTopic !== 'Günlük Rutin' && subject.weakTopic !== 'Genel Tekrar' ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {subject.weakTopic}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Haftalık Soru Hedefi: <strong>{subject.questionCount}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'istatistik' && (
        <section style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Kümülatif Soru Çözüm İstatistikleri</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Öğrencinin geçmiş çalışma programlarında <strong>"Yapıldı"</strong> olarak işaretlenen tüm hedeflerin ders ve konu bazlı dağılımı aşağıdadır.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.keys(homeworkStats).length > 0 ? Object.keys(homeworkStats).map(subject => {
              const totalSubjectQuestions = Object.values(homeworkStats[subject]).reduce((a,b) => a + b, 0);
              const isOpen = openSubjectStat === subject;
              
              return (
                <div key={subject} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'white' }}>
                  <div 
                    onClick={() => setOpenSubjectStat(isOpen ? null : subject)}
                    style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isOpen ? 'var(--bg-main)' : 'white', transition: 'background 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{subject}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Toplam {totalSubjectQuestions} Soru</span>
                      <span style={{ fontSize: '1.2rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                  </div>
                  
                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', background: '#fafafa', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                      {Object.entries(homeworkStats[subject]).map(([topic, count]) => (
                        <div key={topic} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{topic}</span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                Henüz tamamlanmış (işaretlenmiş) bir ödev kaydı bulunmuyor.
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'psikoloji' && (
        <section style={{ animation: 'fadeInSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>🧠 Psikoloji ve Kariyer Analizi</h2>
            {!showPsychoForm && (
              <button className="btn-primary" onClick={() => setShowPsychoForm(true)}>
                + Yeni Değerlendirme Ekle
              </button>
            )}
          </div>
          
          {showPsychoForm && (
            <div className="card fade-in" style={{ marginBottom: '2rem', border: '1px solid var(--primary)', background: '#F4FBF7' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>Yeni Psikolojik Gözlem</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Kaygı Seviyesi (1-10)</label>
                  <input type="number" min="1" max="10" value={psychoForm.anxiety} onChange={e => setPsychoForm({...psychoForm, anxiety: parseInt(e.target.value) || 5})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Motivasyon (1-10)</label>
                  <input type="number" min="1" max="10" value={psychoForm.motivation} onChange={e => setPsychoForm({...psychoForm, motivation: parseInt(e.target.value) || 5})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Odaklanma (1-10)</label>
                  <input type="number" min="1" max="10" value={psychoForm.focus} onChange={e => setPsychoForm({...psychoForm, focus: parseInt(e.target.value) || 5})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Görüşme Notları (Kariyer Hedefi, PDR Analizi)</label>
                <textarea rows={3} value={psychoForm.note} onChange={e => setPsychoForm({...psychoForm, note: e.target.value})} placeholder="Öğrencinin bu haftaki mental durumu ve kariyer hedefleri..." style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setShowPsychoForm(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>İptal</button>
                <button className="btn-primary" onClick={() => {
                  fetch('/api/psycho-record', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ studentId: initialStudent.id, anxietyLevel: psychoForm.anxiety, motivationLevel: psychoForm.motivation, focusLevel: psychoForm.focus, coachNote: psychoForm.note })
                  }).then(() => window.location.reload());
                }} style={{ borderRadius: 'var(--radius-sm)' }}>Kaydet</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem', background: 'linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <span style={{ fontSize: '1.4rem' }}>⏳</span> Geçmiş PDR Gözlem Kayıtları
              </h3>
              {(!initialStudent.psychoRecords || initialStudent.psychoRecords.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-main)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }}>📭</div>
                  <p style={{ fontWeight: 600 }}>Öğrenciye ait herhangi bir psikolojik gözlem bulunamadı.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {initialStudent.psychoRecords.map((rec:any, idx: number) => (
                    <div key={rec.id} style={{ 
                      background: 'white', 
                      border: '1px solid var(--border)', 
                      borderRadius: 'var(--radius-lg)', 
                      padding: '1.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {idx === 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} />}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                          {new Date(rec.date).toLocaleDateString('tr-TR')}
                        </span>
                        {idx === 0 && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)' }}>🌟 En Güncel Durum</span>}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ background: rec.anxietyLevel > 7 ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-main)', border: rec.anxietyLevel > 7 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent', padding: '1rem', borderRadius: '12px', textAlign: 'center', transition: 'all 0.2s' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kaygı (Stres)</div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: rec.anxietyLevel > 7 ? 'var(--danger)' : 'var(--text-primary)', marginTop: '0.25rem' }}>{rec.anxietyLevel}/10</div>
                        </div>
                        <div style={{ background: rec.motivationLevel < 4 ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-main)', border: rec.motivationLevel < 4 ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid transparent', padding: '1rem', borderRadius: '12px', textAlign: 'center', transition: 'all 0.2s' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Motivasyon</div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: rec.motivationLevel < 4 ? '#D97706' : 'var(--text-primary)', marginTop: '0.25rem' }}>{rec.motivationLevel}/10</div>
                        </div>
                        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Odaklanma</div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{rec.focusLevel}/10</div>
                        </div>
                      </div>

                      {rec.coachNote && (
                        <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>PDR Uzmanı Notu</div>
                          <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{rec.coachNote}"</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ background: 'var(--bg-main)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Kazanılan Rozetler</h3>
              {(!initialStudent.badges || initialStudent.badges.length === 0) ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Henüz rozet kazanmadı.</p>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {initialStudent.badges.map((b:any) => (
                    <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', width: '100px' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{b.icon}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>{b.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}


      {/* Worksheet Modal */}
      {worksheetHtml && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '800px', maxWidth: '100%', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Yapay Zeka Özel Testi</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if(printWindow) {
                    printWindow.document.write(`<html><head><title>Çalışma Kağıdı</title><style>body{font-family:sans-serif;padding:2rem;line-height:1.6;}</style></head><body>${worksheetHtml}</body></html>`);
                    printWindow.document.close();
                    setTimeout(() => printWindow.print(), 500);
                  }
                }} className="btn-primary">Yazdır / PDF İndir</button>
                <button onClick={() => setWorksheetHtml(null)} className="btn-secondary">Kapat</button>
              </div>
            </div>
            <div style={{ padding: '2rem', color: 'black', fontFamily: 'sans-serif' }} dangerouslySetInnerHTML={{ __html: worksheetHtml }} />
          </div>
        </div>
      )}

      {/* AI Report Preview & Edit Modal */}
      {reportPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, padding: '2rem' }}>
          <div className="card" style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '600px', maxWidth: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeInSlideUp 0.3s ease-out' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {reportPreview.type === 'parent' ? '💬 Veli Mesajı Düzenleme' : '📋 Kurumsal Rapor Düzenleme'}
              </h3>
              <button onClick={() => setReportPreview(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Yapay zeka tarafından hazırlanan metin aşağıdadır. Göndermeden veya kopyalamadan önce üzerinde dilediğiniz değişikliği yapabilirsiniz.
              </p>
              <textarea 
                value={reportPreview.text}
                onChange={(e) => setReportPreview({ ...reportPreview, text: e.target.value })}
                style={{ width: '100%', height: '300px', padding: '1rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border)', fontSize: '0.95rem', lineHeight: '1.6', resize: 'vertical' }}
              />
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-main)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
              <button onClick={() => setReportPreview(null)} className="btn-secondary">İptal</button>
              
              {reportPreview.type === 'parent' ? (
                <button 
                  className="btn-primary" 
                  style={{ background: '#25D366' }}
                  onClick={() => {
                    const url = `https://wa.me/?text=${encodeURIComponent(reportPreview.text)}`;
                    window.open(url, '_blank');
                    setReportPreview(null);
                  }}
                >
                  Whatsapp'a Aktar ve Gönder
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    navigator.clipboard.writeText(reportPreview.text);
                    alert('✅ Rapor metni başarıyla panoya kopyalandı! İstediğiniz yere yapıştırabilirsiniz.');
                    setReportPreview(null);
                  }}
                >
                  Panoya Kopyala
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Kanban Planner Modal */}
      {showKanban && <KanbanPlanner student={initialStudent} onClose={() => setShowKanban(false)} />}

    </div>
  );
}
