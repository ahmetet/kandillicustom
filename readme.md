# İstanbul ve Çevresi Deprem Takip Sistemi 🌍⚠️

Bu proje, **Boğaziçi Üniversitesi Kandilli Rasathanesi** tarafından sağlanan verileri kullanarak **İstanbul ve çevresindeki depremleri** belirli aralıklarla takip eder, önemli sarsıntılar için masaüstü bildirimi gönderir ve bilgileri bir JSON dosyasına kaydeder.

## Özellikler

- 📡 Veriler `http://www.koeri.boun.edu.tr/` adresinden çekilir.
- 🌐 İstanbul ve Marmara Bölgesi’ne özel filtreleme.
- 📊 Minimum büyüklük değeri: **1.7 ML**
- 🔔 Yeni deprem tespit edildiğinde:
  - Konsola log basılır.
  - `earthquakes.json` dosyasına eklenir.
  - Masaüstü bildirimi gönderilir (ikonlu, sesli).
- 🕒 Her **3 saniyede bir** kontrol yapılır.

## İzlenen Bölgeler (Anahtar Kelimeler)

Aşağıdaki bölgelere ait kayıtlar filtrelenerek alınır:

- `MARMARA DENIZI`
- `SILIVRI`
- `AVCILAR`
- `GURPINAR`
- `BUYUKCEKMECE`
- `ISTANBUL`

> Yeni bölgeler eklemek için `istanbulKeywords` dizisine eklemeniz yeterlidir.
> Minimum büyüklük değeri 1.7 olarak ayarlanmıştır, isteğinize göre değiştirebilirsiniz.
