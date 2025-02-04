import json

def read_words_from_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            words = [line.strip() for line in file.readlines()]
        return words
    except FileNotFoundError:
        print("Hata: Dosya bulunamadı!")
        return []
    except Exception as e:
        print(f"Hata: {e}")
        return []

# Dosya adını belirt
file_path = "bes_harfli_kelime_listesi.txt"

# Kelime listesini oku
word_list = read_words_from_file(file_path)

# JavaScript dosyasına aktar
js_content = f"const wordList = {json.dumps(word_list, ensure_ascii=False)};"

# Yeni JS dosyasına yaz
with open("kelimearray.js", "w", encoding="utf-8") as js_file:
    js_file.write(js_content)

print("Kelime listesi kelimeler.js dosyasına kaydedildi.")
