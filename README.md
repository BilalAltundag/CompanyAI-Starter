# CompanyAI Starter

**CompanyAI Starter** - Şirketlerin dağınık verilerine güvenli, hızlı ve akıllı erişim sağlayan uçtan uca AI platformu için başlangıç şablonu.

> **Not**: Bu bir demo/template uygulamadır. Veriler `localStorage`'da saklanır. Production kullanımı için veritabanı entegrasyonu gereklidir.>
> 
<img width="1423" height="760" alt="company_ai_screenshot" src="https://github.com/user-attachments/assets/8f597f9a-7e4c-48a9-8181-4ceec7ad839e" />

Website: https://bilal-altundag-website.vercel.app/blog/company-ai-starter

## 📋 Proje Hakkında

CompanyAI Starter, şirketlerin kendi AI destekli veri yönetimi ve chatbot sistemlerini hızlıca oluşturabilmeleri için hazırlanmış bir başlangıç şablonudur. Bu template üzerine inşa ederek, şirketinizin ihtiyaçlarına göre özelleştirebilir ve genişletebilirsiniz.

## 🚀 Özellikler

- **Departman Bazlı Veri Yönetimi**: Verileri departmanlara göre organize edin
- **Çoklu Veri Tipi Desteği**: PDF, Excel, video, görsel ve daha fazlası
- **Otomatik Chatbot Oluşturma**: Her departman için özelleşmiş RAG tabanlı chatbotlar
- **Rol Tabanlı Erişim**: Admin, departman kullanıcısı ve kişisel alanlar
- **Mobile-First Tasarım**: iOS tarzı responsive arayüz
- **Güvenli Veri Paylaşımı**: Row-level security ile güvenli erişim

## 🛠 Teknoloji Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **UI Components**: ShadCN/UI, Radix UI
- **AI/LLM**: Google Gemini API (LangChain)
- **Monitoring**: LangSmith
- **State Management**: React Hooks, localStorage (demo)
- **Deployment**: Vercel/Netlify

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Ana dashboard sayfası
│   ├── data/             # Veri yönetimi sayfası
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Ana sayfa (onboarding)
├── components/
│   ├── dashboard/        # Dashboard bileşenleri
│   ├── data/            # Veri yönetimi bileşenleri
│   ├── layout/          # Layout bileşenleri
│   ├── onboarding/      # Onboarding wizard
│   └── ui/              # ShadCN UI bileşenleri
├── lib/
│   ├── constants.ts     # Uygulama sabitleri
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Yardımcı fonksiyonlar
└── types/
    └── index.ts         # TypeScript tipleri
```

## 🗄 Veritabanı Şeması

### Ana Tablolar

- **departments**: Departman bilgileri
- **users**: Kullanıcı bilgileri ve roller
- **user_departments**: Kullanıcı-departman ilişkileri
- **files**: Yüklenen dosyalar ve metadata
- **chatbots**: Departman ve kişisel chatbotlar
- **conversations**: Chat geçmişi
- **messages**: Chat mesajları

### Güvenlik

- Row Level Security (RLS) aktif
- Rol tabanlı erişim kontrolleri
- Departman bazlı veri izolasyonu

## 🚀 Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd ai-company
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın:**
```bash
# .env.local dosyası oluşturun
```

`.env.local` dosyasına gerekli API key'leri ekleyin:
```
# Google Gemini API Key
GOOGLE_API_KEY=your_gemini_api_key

# LangSmith (Optional - for monitoring)
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=company_ai
```

4. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

## 📱 Kullanım

### 1. İlk Kurulum

Uygulamayı ilk açtığınızda:
- **Kurulum** sayfasından şirket bilgilerinizi girin
- Yönetici hesabınızı oluşturun
- Departmanları ekleyin

### 2. Giriş Yap

- Oluşturduğunuz yönetici hesabıyla giriş yapın
- Dashboard'a yönlendirileceksiniz

### 3. Veri Yönetimi

- **Veriler** sayfasından dosya yükleyin
- Genel, departman veya kişisel alan seçin
- Dosyalar `public/uploads` klasörüne kaydedilir

### 4. Chatbot Oluşturma

- **Chatbotlar** sayfasından yeni asistan oluşturun
- Veri kaynaklarını seçin (Genel, Departman, Kişisel)
- Oluşturduğunuz chatbot ile sohbet edin

### 5. Admin Panel

- Yönetici olarak **Sistem Ayarları** sayfasından:
  - Departmanları yönetin
  - Kullanıcıları ekleyin/düzenleyin
  - Dosya onaylarını yönetin

## 🔒 Güvenlik (Demo Mode)

- **Authentication**: localStorage tabanlı basit auth (demo)
- **Authorization**: Rol tabanlı erişim (admin, department_leader, employee)
- **Data Storage**: localStorage (demo) - Production için veritabanı gerekli
- **File Storage**: Local file system (`public/uploads`)

> **Production için**: Supabase veya başka bir veritabanı entegrasyonu yapılmalıdır.

## 📊 Desteklenen Veri Tipleri

1. **Metin Dokümanları**: PDF, Word, düz metin, Markdown
2. **Veri Dosyaları**: CSV, Excel, TSV
3. **Sunum**: PowerPoint, Keynote
4. **Görsel**: JPG, PNG, SVG, WebP
5. **Video**: MP4, MOV, AVI, WebM
6. **Ses**: MP3, WAV, M4A, OGG
7. **Yapılandırılmış Veri**: JSON, XML, YAML
8. **Dış Kaynak**: Web linkleri

## 🔄 API Endpoints

### Chat API
- `POST /api/chat` - Chat mesajı gönder (RAG veya genel sohbet)
  - Mesaj otomatik olarak sınıflandırılır (döküman/genel)
  - Döküman sorularında RAG kullanılır ve kaynak gösterilir
  - Genel sorularda normal sohbet yapılır

### File Upload
- `POST /api/upload` - Dosya yükle
- `DELETE /api/upload` - Dosya sil

## 🚀 Deployment

### Vercel

1. Vercel hesabınıza bağlanın
2. GitHub repository'yi import edin
3. Environment değişkenlerini ayarlayın:
   - `GOOGLE_API_KEY`
   - `LANGSMITH_*` (opsiyonel)
4. Deploy edin

### Notlar

- `public/uploads` klasörü git'e commit edilmez
- Production'da dosya storage için cloud storage (S3, Supabase Storage) kullanılmalı
- localStorage yerine veritabanı kullanılmalı

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## ✨ Özellikler

- ✅ **Akıllı Mesaj Sınıflandırma**: Otomatik olarak döküman/genel soru ayrımı
- ✅ **RAG (Retrieval Augmented Generation)**: Dökümanlardan bilgi çekme
- ✅ **Kaynak Gösterimi**: Sadece kullanılan dosyalar kaynak olarak gösterilir
- ✅ **Kullanıcıya Özel Chatbotlar**: Her kullanıcı kendi chatbotlarını görür
- ✅ **Rol Tabanlı Erişim**: Admin, departman lideri, çalışan rolleri
- ✅ **Dosya Onay Sistemi**: Genel ve departman dosyaları için onay mekanizması
- ✅ **LangSmith Entegrasyonu**: AI çağrılarını izleme ve debug

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Not**: Bu bir starter template'dir. Production kullanımı için veritabanı ve cloud storage entegrasyonu yapılmalıdır.
