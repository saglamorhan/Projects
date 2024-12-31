def filter_words(input_file, output_file, allowed_chars):
    # İlk dosyadaki kelimeleri oku
    with open(input_file, 'r', encoding='utf-8') as infile:
        words = infile.read().splitlines()
    
    # Yeni dosyaya yazılacak kelimeleri sakla
    filtered_words = []
    removed_words = []
    
    for word in words:
        # Kelimenin tüm karakterlerinin allowed_chars içinde olup olmadığını kontrol et
        if all(char in allowed_chars for char in word):
            filtered_words.append(word)
        else:
            removed_words.append(word)
    
    # İlk dosyayı sadece uygun kelimelerle güncelle
    with open(input_file, 'w', encoding='utf-8') as infile:
        infile.write('\n'.join(filtered_words))
    
    # Yeni dosyaya farklı karakter içeren kelimeleri yaz
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write('\n'.join(removed_words))

# Kullanım örneği
allowed_string = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"
filter_words("bes_harfli_kelime_listesi.txt", "yeni_dosya.txt", allowed_string)
