-- EĞİTİM KOÇUM DATABASE SCHEMA

-- Enable uuid-ossp if not already done
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  class_number TEXT NOT NULL,
  school TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- subjects table (Dersler ve ana kategoriler)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL
);

-- subject_tracking table (Öğrenci konu bazlı takip verisi)
CREATE TABLE IF NOT EXISTS subject_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  empty_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0,
  status TEXT CHECK (status IN ('green','yellow','red')) DEFAULT 'red',
  last_exam_id UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- exams table (Yüklenen denemeler)
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  exam_type TEXT NOT NULL,
  pdf_url TEXT,
  total_score DECIMAL(5,2),
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- exam_results table (Deneme detay verileri)
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  correct INTEGER DEFAULT 0,
  wrong INTEGER DEFAULT 0,
  empty INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  net DECIMAL(5,2) DEFAULT 0,
  topic_name TEXT NOT NULL
);

-- lesson_templates table (Ders programı şablonları)
CREATE TABLE IF NOT EXISTS lesson_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('weekly','intensive','cyclic','block','pomodoro','weakness','exam_repeat','weekend','summer','adaptive')),
  config JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE
);

-- lesson_plans table (Öğrenci aktif/geçmiş programları)
CREATE TABLE IF NOT EXISTS lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  template_id UUID REFERENCES lesson_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- schedule_entries table (Ders programı satırları)
CREATE TABLE IF NOT EXISTS schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_plan_id UUID REFERENCES lesson_plans(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  topic_name TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TIME,
  end_time TIME,
  question_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- parent_contacts table (Veli iletişim bilgileri)
CREATE TABLE IF NOT EXISTS parent_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relation TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE
);

-- messages table (Gönderilen veli mesajları logu)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES parent_contacts(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('draft','sent','failed')) DEFAULT 'draft'
);

-- sticky_notes table (Sticker rehberlik notları)
CREATE TABLE IF NOT EXISTS sticky_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_number TEXT,
  exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  color TEXT CHECK (color IN ('yellow','blue','green','orange','red')) DEFAULT 'yellow',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- pdr_notes table (PDR ve seans değerlendirme gözlemleri)
CREATE TABLE IF NOT EXISTS pdr_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  mood TEXT CHECK (mood IN ('happy','neutral','sad','angry','anxious')),
  attitude TEXT CHECK (attitude IN ('engaged','distracted','withdrawn','unmotivated','curious')),
  observation TEXT,
  social_status JSONB DEFAULT '{}',
  session_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ai_evaluations table (Yapay zeka PDR uzman değerlendirmeleri)
CREATE TABLE IF NOT EXISTS ai_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  pdr_note_ids UUID[] DEFAULT '{}',
  evaluation TEXT,
  recommendation TEXT,
  severity TEXT CHECK (severity IN ('normal','attention','urgent')) DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- calendar_events table (Takvim, randevu ve sınav planlaması)
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  type TEXT CHECK (type IN ('meeting','exam','parent_meeting','reminder','other')) DEFAULT 'meeting',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed defaults for lesson_templates
INSERT INTO lesson_templates (name, description, type, config, is_default) VALUES
('Klasik Haftalık', 'Her gün belirli ders saatleri, dengeli dağılım', 'weekly', '{}', true),
('Yoğunlaştırılmış', 'Sınav öncesi, tekrar ağırlıklı, günde 6+ saat', 'intensive', '{}', true),
('Döngüsel', '2 günde bir tüm dersleri kapsayan döngü', 'cyclic', '{}', true),
('Konu Bazlı Blok', 'Günde tek ders, derinlemesine konu çalışması', 'block', '{}', true),
('Pomodoro Entegre', '25dk çalışma + 5dk mola döngüsü', 'pomodoro', '{}', true),
('Zayıf Alan Güçlendirme', 'Deneme sonuçlarına göre eksik konulara ağırlık', 'weakness', '{}', true),
('Deneme + TÜRE', 'Deneme sonrası tüm ünite reparasyonu', 'exam_repeat', '{}', true),
('Hafta Sonu Ağırlıklı', 'Okul günleri hafif, hafta sonu yoğun program', 'weekend', '{}', true),
('Yaz/Kamp Programı', 'Tatil dönemi, yoğun konu tekrarı + yeni konu', 'summer', '{}', true),
('Bireysel Uyarlamalı', 'Öğrenci profiline göre otomatik optimize', 'adaptive', '{}', true)
ON CONFLICT DO NOTHING;

-- Seed default subjects (8. Sınıf müfredatı için örnek konular)
INSERT INTO subjects (name, category) VALUES
('Fiilimsiler', 'Türkçe'),
('Sözcükte Anlam', 'Türkçe'),
('Cümlede Anlam', 'Türkçe'),
('Paragrafta Anlam', 'Türkçe'),
('Çarpanlar ve Katlar', 'Matematik'),
('Üslü İfadeler', 'Matematik'),
('Kareköklü İfadeler', 'Matematik'),
('Mevsimler ve İklim', 'Fen Bilimleri'),
('DNA ve Genetik Kod', 'Fen Bilimleri'),
('Basınç', 'Fen Bilimleri'),
('Bir Kahraman Doğuyor', 'T.C. İnkılap Tarihi'),
('Milli Uyanış', 'T.C. İnkılap Tarihi'),
('Kader İnancı', 'Din Kültürü'),
('Zekat ve Sadaka', 'Din Kültürü'),
('Friendship', 'İngilizce'),
('Teen Life', 'İngilizce')
ON CONFLICT DO NOTHING;
