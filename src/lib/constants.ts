import { DataTypeInfo } from '@/types'

export const DATA_TYPES: DataTypeInfo[] = [
  {
    id: 'text_documents',
    name: 'Metin Dokümanları',
    description: 'PDF, Word, düz metin dosyaları',
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.md'],
    purpose: 'Okuma, arama, politika ve bilgi dokümanları'
  },
  {
    id: 'data_files',
    name: 'Veri Dosyaları',
    description: 'CSV, Excel, TSV dosyaları',
    extensions: ['.csv', '.xlsx', '.xls', '.tsv'],
    purpose: 'Tablo bazlı kayıtlar ve analiz verileri'
  },
  {
    id: 'presentations',
    name: 'Sunum & Eğitim',
    description: 'PowerPoint, Keynote dosyaları',
    extensions: ['.ppt', '.pptx', '.key'],
    purpose: 'Eğitim, anlatım ve iç bilgilendirme içerikleri'
  },
  {
    id: 'images',
    name: 'Görsel',
    description: 'JPG, PNG, SVG dosyaları',
    extensions: ['.jpg', '.jpeg', '.png', '.svg', '.webp'],
    purpose: 'Şema, taranmış evrak ve ürün görselleri'
  },
  {
    id: 'videos',
    name: 'Video',
    description: 'MP4, MOV, AVI dosyaları',
    extensions: ['.mp4', '.mov', '.avi', '.webm'],
    purpose: 'Eğitim videoları, toplantı ve kayıt içerikleri'
  },
  {
    id: 'audio',
    name: 'Ses',
    description: 'MP3, WAV, M4A dosyaları',
    extensions: ['.mp3', '.wav', '.m4a', '.ogg'],
    purpose: 'Görüşme kayıtları, sesli notlar'
  },
  {
    id: 'structured_data',
    name: 'Yapılandırılmış Teknik Veri',
    description: 'JSON, XML, YAML dosyaları',
    extensions: ['.json', '.xml', '.yaml', '.yml'],
    purpose: 'Sistem entegrasyonu ve yapılandırma verileri'
  },
  {
    id: 'external_links',
    name: 'Dış Kaynak / Link',
    description: 'Web linkleri ve harici referanslar',
    extensions: [],
    purpose: 'Dosya dışı referans içerikler'
  }
]

export const DEFAULT_DEPARTMENTS = [
  {
    name: 'Administrator',
    description: 'Genel yönetici departmanı - tüm yetkiler'
  },
  {
    name: 'İnsan Kaynakları',
    description: 'İK süreçleri ve çalışan yönetimi'
  },
  {
    name: 'Finans',
    description: 'Mali işlemler ve raporlama'
  },
  {
    name: 'Satış',
    description: 'Satış operasyonları ve müşteri yönetimi'
  },
  {
    name: 'Pazarlama',
    description: 'Pazarlama kampanyaları ve marka yönetimi'
  },
  {
    name: 'Operasyon',
    description: 'İş operasyonları ve süreç yönetimi'
  },
  {
    name: 'IT / Teknoloji',
    description: 'Teknoloji altyapısı ve sistem yönetimi'
  },
  {
    name: 'Hukuk',
    description: 'Hukuki süreçler ve sözleşme yönetimi'
  }
]
