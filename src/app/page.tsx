import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
import Link from 'next/link';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  GraduationCap,
  ChevronRight,
  Zap,
  BookOpen
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Dijital Koç <span className="text-indigo-400">OS</span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 font-medium">Öğrenci & PDR Yönetim Platformu</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#ozellikler" className="hover:text-indigo-400 transition-colors">Özellikler</a>
            <a href="#ai-gucu" className="hover:text-indigo-400 transition-colors">Yapay Zekâ</a>
            <a href="#moduller" className="hover:text-indigo-400 transition-colors">Modüller</a>
            <a href="#nasil-calisir" className="hover:text-indigo-400 transition-colors">Nasıl Çalışır?</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              Paneli Başlat
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* 2. Hero Section */}
        <section className="relative pt-20 pb-24 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-violet-600/15 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Yapay Zekâ Destekli 2.0 Sürümü Yayında</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
              Öğrenci Takibini ve Rehberliği{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                Yapay Zekâ Gücüyle
              </span>{' '}
              Yönetin
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Dijital Koç OS; LGS ve YKS öğrencilerinizin deneme netlerini, PDR analizlerini, haftalık çalışma programlarını ve veli iletişimini tek bir akıllı panelde toplar.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/ogrenciler"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                Yönetim Paneline Git
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#moduller"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold flex items-center justify-center gap-2 transition-all"
              >
                Modülleri İncele
              </a>
            </div>

            {/* Core Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-slate-800/80 pt-10">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-white">10.000+</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Takip Edilen Deneme Sınavı</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-indigo-400">%45</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Zaman Tasarrufu</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-violet-400">7/24</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Gemini AI Analiz Desteği</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-white">MEB & PDR</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Müfredat Uyumlu Şablonlar</p>
              </div>
            </div>

            {/* Dashboard Mockup Preview */}
            <div className="mt-14 relative max-w-5xl mx-auto">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-xs text-slate-400 font-mono ml-2">dijital-koc-os // ogrenci-analiz-paneli</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                    Canlı AI Analizi
                  </span>
                </div>
                
                {/* Mockup Grid Body */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 text-left">
                  <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">YKS Matematik Net Artışı</span>
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">32.5 Net <span className="text-xs text-emerald-400 font-normal">(+4.2)</span></p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[82%]" />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">AI PDR Değerlendirmesi</span>
                      <BrainCircuit className="h-4 w-4 text-indigo-400" />
                    </div>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      &quot;Öğrencinin Geometri konularındaki özgüveni arttı, ancak Paragraf hızlandırma çalışmalarına odaklanılmalı.&quot;
                    </p>
                    <span className="inline-block mt-2 text-[10px] text-indigo-400 font-medium">Gemini 1.5 Pro Tarafından Üretildi</span>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Otomatik Veli Mesajı</span>
                      <MessageSquare className="h-4 w-4 text-violet-400" />
                    </div>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      &quot;Sayın Velimiz, öğrencimizin bu haftaki 500 soru hedefi %94 başarıyla tamamlanmıştır...&quot;
                    </p>
                    <span className="inline-block mt-2 text-[10px] text-emerald-400 font-medium">WhatsApp İletimine Hazır</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Features Grid Section */}
        <section id="ozellikler" className="py-20 bg-slate-900/50 border-y border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Gelişmiş İşlevler</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                Bir Eğitim Koçunun İhtiyaç Duyduğu Tüm Araçlar
              </p>
              <p className="text-slate-400 mt-3 text-sm sm:text-base">
                Öğrenci koçluğu ve rehberlik süreçlerini karmaşık tablolardan kurtarıp modern bir işletim sistemine dönüştürün.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800/80 hover:border-indigo-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Deneme & Net Analitikleri</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  LGS ve YKS denemelerini ders, konu ve kazanım bazında grafikleştirişiniz. Eksiklerinizi anında tespit edin.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800/80 hover:border-violet-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-5 group-hover:bg-violet-600 group-hover:text-white transition-all">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Destekli PDR Paneli</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Öğrencilerin tutum, kaygı ve sınav stratejilerini psikolojik danışmanlık standartlarında otomatik raporlayın.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800/80 hover:border-pink-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-5 group-hover:bg-pink-600 group-hover:text-white transition-all">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Akıllı Veli İletişimi</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Haftalık gelişimi ve sınav sonuçlarını velilerin anlayacağı dilde profesyonel mesaj taslaklarına dönüştürün.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800/80 hover:border-emerald-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ders Programı & Takvim</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Haftalık çalışma saatlerini, soru hedeflerini ve görüşme takvimini entegre modül üzerinden planlayın.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800/80 hover:border-amber-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 group-hover:bg-amber-600 group-hover:text-white transition-all">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Sınıf & Kurum Yönetimi</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Sınıf bazlı genel sıralamalar, grup ortalamaları ve şube bazlı karşılaştırmalı gelişim raporları oluşturun.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800/80 hover:border-cyan-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Supabase ile Güvenli Veri</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Öğrenci verileriniz Supabase Row Level Security (RLS) ile tamamen kişisel ve yüksek korumalı saklanır.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. AI Showcase Section */}
        <section id="ai-gucu" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-4 border border-indigo-500/20">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Gemini Yapay Zekâ Entegrasyonu</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Saatler Süren Analizleri Saniyeler İçinde Tamamlayın
                </h2>
                <p className="text-slate-300 mt-4 text-base leading-relaxed">
                  Öğrencinin girdiği tüm deneme verilerini ve soru takip sonuçlarını analiz eden yapay zekâ asistanı, doğrudan aksiyon alınabilir tavsiyeler üretir.
                </p>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Öğrenciye özel kişiselleştirilmiş eksik konu listeleri</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">PDR standartlarına uygun rehberlik ve motivasyon notları</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Tek tıkla veliye gönderilebilir özelleştirilmiş bilgilendirme mesajı</span>
                  </li>
                </ul>
              </div>

              {/* Interactive AI Code/Prompt Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">AI Deneme Analizi Çıktısı</p>
                    <p className="text-xs text-slate-400">Öğrenci: Ahmet Yılmaz • 12. Sınıf Sayısal</p>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300">
                    <span className="text-indigo-400 font-semibold">[Gözlem]:</span> Matematik testinde Trigonometri ve Türev netlerinde düşüş gözlendi.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300">
                    <span className="text-violet-400 font-semibold">[Öneri]:</span> Gelecek hafta 3 adet Trigonometri soru bankası testi ve günlük 20 Paragraf sorusu atanmalı.
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-200">
                    <span className="text-emerald-400 font-semibold">[Veli Notu]:</span> Sayın Velimiz, öğrencimiz Fen netlerini yükseltmiştir. Matematik desteği için ek çalışma programı hazırlanmıştır.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. How It Works Section */}
        <section id="nasil-calisir" className="py-20 bg-slate-900/40 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Kolay Başlangıç</h2>
              <p className="text-3xl font-extrabold text-white mt-2">3 Adımda Kolay Yönetim</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Öğrenci Profilini Oluşturun</h3>
                <p className="text-slate-400 text-sm">
                  Öğrenci, veli ve sınıf bilgilerini sisteme kaydedin.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="h-14 w-14 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center mx-auto text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Deneme & Verileri Girin</h3>
                <p className="text-slate-400 text-sm">
                  Yapılan deneme sınavı netlerini ve ders programını güncelleyin.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="h-14 w-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Raporunu Alın ve Paylaşın</h3>
                <p className="text-slate-400 text-sm">
                  Yapay zekâ destekli PDR analizini ve veli mesajını tek tıkla oluşturun.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. CTA Banner Section */}
        <section className="py-20 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-indigo-900/80 via-indigo-900 to-violet-900/80 border border-indigo-500/30 p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Öğrenci Rehberliğinizi Bir Üst Seviyeye Taşıyın
                </h2>
                <p className="text-indigo-200 mt-4 max-w-xl mx-auto text-sm sm:text-base">
                  Dijital Koç OS ile zaman kazanın, veriye dayalı koçluk yapın ve veli memnuniyetini artırın.
                </p>
                <div className="mt-8 flex justify-center">
                  <Link
                    href="/signup"
                    className="px-8 py-3.5 rounded-xl bg-white text-indigo-950 font-bold hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2"
                  >
                    Ücretsiz Kaydolun & Başlayın
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Dijital Koç OS</span>
            <span>— Yapay Zekâ Destekli Eğitim İşletim Sistemi</span>
          </div>
          <p>© {new Date().getFullYear()} Ahmet Şanlı. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
