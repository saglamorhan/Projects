import re

# Türk alfabesindeki harfler (küçük ve büyük harfler)
turk_alfabesi = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"

# 4 harfli ve sadece Türk alfabesi harflerinden oluşan kelimeleri seçen fonksiyon
def filtrele_6_harfli(kelime):
    return len(kelime) == 6 and all(harf in turk_alfabesi for harf in kelime)

# Dosya okuma
with open("BüyükTekHarfsizHarfOkunussuz.txt", "r", encoding="utf-8") as dosya:
    kelimeler = dosya.read().splitlines()

# Filtreleme işlemi
altı_harfli_kelimeler = [kelime for kelime in kelimeler if filtrele_6_harfli(kelime)]

# Sonuçları yeni dosyaya yazma
with open("6_harfli_kelimeler.txt", "w", encoding="utf-8") as cikti_dosyasi:
    cikti_dosyasi.write("\n".join(altı_harfli_kelimeler))

print(f"{len(altı_harfli_kelimeler)} kelime kaydedildi.")