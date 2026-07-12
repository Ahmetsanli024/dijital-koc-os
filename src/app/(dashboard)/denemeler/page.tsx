"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Plus,
  FileSearch,
  ScanText,
  ArrowRight,
  Brain
} from "lucide-react"

export default function ExamsPage() {
  const router = useRouter()
  const [selectedStudent, setSelectedStudent] = useState<string>("1")
  const setSelectedStudentSafe = (v: string | null) => { if (v) setSelectedStudent(v) }
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any | null>(null)

  const mockStudents = [
    { id: "1", name: "Ali Yılmaz", class: "8-A" },
    { id: "2", name: "Zeynep Kaya", class: "8-A" },
    { id: "3", name: "Mehmet Demir", class: "8-B" },
    { id: "4", name: "Selin Şahin", class: "12-A" },
  ]

  const mockExams = [
    {
      id: "e1",
      studentName: "Ali Yılmaz",
      examName: "LGS - Lider Yayınları - 3",
      date: "10 Temmuz 2026",
      totalNet: 78.5,
      change: "+2.1",
      status: "analyzed"
    },
    {
      id: "e2",
      studentName: "Zeynep Kaya",
      examName: "LGS - Karekök - 4",
      date: "05 Temmuz 2026",
      totalNet: 82.0,
      change: "+3.5",
      status: "analyzed"
    },
    {
      id: "e3",
      studentName: "Mehmet Demir",
      examName: "LGS - Özdebir - 1",
      date: "28 Haziran 2026",
      totalNet: 65.3,
      change: "-1.2",
      status: "analyzed"
    }
  ]

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return
    if (file.type !== "application/pdf") {
      toast.error("Lütfen yalnızca PDF dosyası yükleyin.")
      return
    }
    setUploadedFile(file)
    setAnalysisResult(null)
    toast.success(`${file.name} yüklendi. Analize hazır.`)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleAnalyze = () => {
    if (!uploadedFile) {
      toast.error("Lütfen önce bir PDF dosyası yükleyin.")
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    // Simulated AI analysis (OpenAI GPT-4o Vision proxy call would happen here)
    setTimeout(() => {
      const result = {
        examName: uploadedFile.name.replace(".pdf", ""),
        studentName: mockStudents.find((s) => s.id === selectedStudent)?.name || "Öğrenci",
        date: "Bugün",
        totalNet: 76.8,
        subjects: [
          { name: "Türkçe", correct: 18, wrong: 2, empty: 0, total: 20, net: 17.5, accuracy: 87.5, weakTopics: ["Paragrafta Anlam"] },
          { name: "Matematik", correct: 12, wrong: 5, empty: 3, total: 20, net: 10.75, accuracy: 53.75, weakTopics: ["Çarpanlar ve Katlar", "Üslü İfadeler"] },
          { name: "Fen Bilimleri", correct: 16, wrong: 3, empty: 1, total: 20, net: 15.25, accuracy: 76.25, weakTopics: ["Basınç"] },
          { name: "T.C. İnkılap Tarihi", correct: 9, wrong: 1, empty: 0, total: 10, net: 8.75, accuracy: 87.5, weakTopics: [] },
          { name: "Din Kültürü", correct: 9, wrong: 1, empty: 0, total: 10, net: 8.75, accuracy: 87.5, weakTopics: [] },
          { name: "İngilizce", correct: 8, wrong: 1, empty: 1, total: 10, net: 7.75, accuracy: 77.5, weakTopics: ["Teen Life"] }
        ],
        weakTopicsCount: 5,
        recommendation: "Matematik dersinde Çarpanlar ve Katlar ile Üslü İfadeler konularında ciddi eksiklik tespit edildi. Bu konular akıllı ders programına öncelikli eklenmeli."
      }
      setAnalysisResult(result)
      setIsAnalyzing(false)
      toast.success("AI analizi tamamlandı! Konu eksikleri tespit edildi.")
    }, 2500)
  }

  const getAccuracyColor = (acc: number) => {
    if (acc >= 70) return "text-emerald-600"
    if (acc >= 40) return "text-amber-600"
    return "text-rose-600"
  }

  const getAccuracyBg = (acc: number) => {
    if (acc >= 70) return "bg-emerald-500"
    if (acc >= 40) return "bg-amber-500"
    return "bg-rose-500"
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Deneme Sınavları & AI Analiz
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          PDF olarak yüklediğiniz deneme sınavı sonuçlarını yapay zeka ile analiz edin, konu eksiklerini otomatik tespit edin.
        </p>
      </div>

      {/* Upload + Analiz Paneli */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* PDF Drop Zone */}
        <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-violet-600" />
              Deneme Sonucu PDF Yükle
            </CardTitle>
            <CardDescription>Sürükle-bırak veya tıkla ile PDF dosyasını yükleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Öğrenci Seçin</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudentSafe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.class} Sınıfı)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/20"
                  : "border-zinc-200 hover:border-violet-300 bg-zinc-50/30 dark:border-zinc-800 dark:bg-zinc-900/20"
              }`}
              onClick={() => document.getElementById("pdf-input")?.click()}
            >
              <input
                id="pdf-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              {uploadedFile ? (
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 text-violet-600 mx-auto" />
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{uploadedFile.name}</p>
                  <p className="text-xs text-zinc-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setAnalysisResult(null) }}
                    className="text-rose-600 hover:bg-rose-50 text-xs gap-1"
                  >
                    Dosyayı Kaldır
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <UploadCloud className="h-10 w-10 text-zinc-400 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    PDF buraya sürükleyin veya tıklayın
                  </p>
                  <p className="text-xs text-zinc-400">Maksimum 10MB · Yalnızca PDF formatı</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!uploadedFile || isAnalyzing}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2 font-bold py-5"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yapay Zeka Analiz Ediyor...
                </>
              ) : (
                <>
                  <ScanText className="h-4 w-4" />
                  AI ile PDF'i Analiz Et
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* AI Analysis Result */}
        <Card className={`border-zinc-200/80 shadow-sm dark:border-zinc-800 ${isAnalyzing ? "animate-pulse" : ""}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              Yapay Zeka Analiz Sonucu
            </CardTitle>
            <CardDescription>PDF'den otomatik çıkarılan ders ve konu bazlı sonuçlar</CardDescription>
          </CardHeader>
          <CardContent>
            {!analysisResult && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FileSearch className="h-10 w-10 text-zinc-300 mb-3" />
                <p className="text-sm font-semibold text-zinc-400">
                  Henüz analiz yapılmadı. PDF yükleyip "Analiz Et" butonuna basın.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
                <div className="relative">
                  <Brain className="h-14 w-14 text-violet-600" />
                  <Loader2 className="h-14 w-14 text-violet-600/40 animate-spin absolute inset-0" />
                </div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Yapay zeka PDF'i okuyor...
                </p>
                <p className="text-xs text-zinc-400">Ders, konu ve doğruluk oranları çıkarılıyor</p>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {/* Summary */}
                <div className="p-3 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-100 dark:border-violet-900/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-violet-800 dark:text-violet-300">{analysisResult.examName}</p>
                      <p className="text-[10px] text-zinc-500">{analysisResult.studentName} · {analysisResult.date}</p>
                    </div>
                    <Badge className="bg-violet-600 text-white hover:bg-violet-700">{analysisResult.totalNet} Net</Badge>
                  </div>
                </div>

                {/* Subject results */}
                <div className="space-y-3">
                  {analysisResult.subjects.map((subj: any, idx: number) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{subj.name}</span>
                        <span className={`font-bold ${getAccuracyColor(subj.accuracy)}`}>
                          {subj.net} Net · %{subj.accuracy}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div className={`h-full rounded-full ${getAccuracyBg(subj.accuracy)}`} style={{ width: `${subj.accuracy}%` }} />
                      </div>
                      <div className="flex gap-3 text-[10px] font-semibold text-zinc-500">
                        <span className="flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {subj.correct}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <XCircle className="h-3 w-3 text-rose-500" /> {subj.wrong}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MinusCircle className="h-3 w-3 text-zinc-400" /> {subj.empty}
                        </span>
                        {subj.weakTopics.length > 0 && (
                          <span className="text-rose-600 font-bold">
                            Eksik: {subj.weakTopics.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">AI Önerisi</p>
                      <p className="text-xs text-amber-900 dark:text-amber-300 font-medium mt-1">{analysisResult.recommendation}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => router.push("/ders-programi")}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2 font-bold text-xs"
                >
                  <ArrowRight className="h-4 w-4" />
                  Eksikleri Ders Programına Aktar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Son Yüklenen Denemeler Tablosu */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Geçmiş Deneme Sınavları
            </CardTitle>
            <CardDescription>Tüm öğrencilerin yüklenen deneme sonuçları ve AI analiz durumları</CardDescription>
          </div>
          <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300">
            Toplam {mockExams.length} deneme
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Öğrenci</TableHead>
                <TableHead className="font-bold">Deneme Adı</TableHead>
                <TableHead className="font-bold">Tarih</TableHead>
                <TableHead className="text-center font-bold">Toplam Net</TableHead>
                <TableHead className="text-center font-bold">Değişim</TableHead>
                <TableHead className="text-center font-bold">Durum</TableHead>
                <TableHead className="text-right font-bold">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExams.map((exam) => (
                <TableRow key={exam.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                  <TableCell className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{exam.studentName}</TableCell>
                  <TableCell className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{exam.examName}</TableCell>
                  <TableCell className="text-xs text-zinc-500">{exam.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 font-bold text-xs">
                      {exam.totalNet}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-xs font-bold flex items-center justify-center gap-0.5 ${exam.change.startsWith("+") ? "text-emerald-600" : "text-rose-600"}`}>
                      {exam.change.startsWith("+") ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {exam.change}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] py-0.5">
                      <CheckCircle2 className="h-3 w-3 inline mr-0.5" />
                      Analiz Edildi
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-xs gap-1 text-violet-600">
                      Detay <ArrowRight className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}