let correctWord = ""; // Doğru kelime burada saklanacak
let currentRow = 0;
let currentCol = 0;
let wordList = new Set();
const gameBoard = document.getElementById("game-board"); // game-board id'sine sahip div

async function initializeGame() {
    try {
        // Rastgele kelimeyi ata ve kelime listesini yükle
        await loadWordList();
        correctWord = await assignRandomWord();
        console.log("Doğru kelime:", correctWord);

        // Oyunu başlat
        createBoard();
        createKeyboard();
    } catch (error) {
        console.error("Oyun başlatılamadı:", error.message);
    }
}

// Kelime listesini yükleyen fonksiyon
async function loadWordList() {
    try {
        const response = await fetch("./bes_harfli_kelime_listesi.txt");
        if (!response.ok) throw new Error("Kelime dosyası yüklenemedi.");

        const text = await response.text();
        const words = text
            .split("\n")
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length === 5);

        // Kelimeleri Set'e ekleyelim
        words.forEach(word => wordList.add(word));
    } catch (error) {
        console.error("Hata:", error.message);
    }
}

// Rastgele kelime seçen fonksiyon
async function assignRandomWord() {
    try {
        const response = await fetch("./bes_harfli_kelime_listesi.txt");
        if (!response.ok) throw new Error("Kelime dosyası yüklenemedi.");

        const text = await response.text();
        const words = text
            .split("\n")
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length === 5);
        return words[Math.floor(Math.random() * words.length)];
    } catch (error) {
        console.error("Hata:", error.message);
        return "AAAAA"; // Hata durumunda varsayılan kelime
    }
}

// Oyun tahtasını oluşturan fonksiyon
const createBoard = () => {
    for (let row = 0; row < 6; row++) {  // 6 satır oluşturacağız (6 tahmin)
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        // Her satırda 5 hücre olacak
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.setAttribute("data-row", row);  // Satır numarasını atıyoruz
            cell.setAttribute("data-index", col);  // Sütun numarasını atıyoruz
            rowDiv.appendChild(cell);
        }

        // Satırı gameBoard'a ekliyoruz
        gameBoard.appendChild(rowDiv);
    }
};

// Oyunda kullanilacak klavyeyi oluşturan fonksiyon
function createKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.className = "keyboard";
    "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("").forEach(letter => {
        const key = document.createElement("div");
        key.className = "key";
        key.textContent = letter;
        key.addEventListener("click", () => handleKeyInput(letter));
        keyboard.appendChild(key);
    });

    const backspaceKey = document.createElement("div");
    backspaceKey.className = "key";
    backspaceKey.textContent = "⌫";
    backspaceKey.addEventListener("click", handleBackspace);
    keyboard.appendChild(backspaceKey);

    const enterKey = document.createElement("div");
    enterKey.className = "key enter-key";
    enterKey.textContent = "ENTER";
    enterKey.addEventListener("click", handleEnter);
    keyboard.appendChild(enterKey);


}

// Tahmini oyun tahtasındaki ilgili satıra yazan fonksiyon
function handleKeyInput(letter) {
    if (currentCol < 5 && currentRow < 6) {  // 5 harfli kelimeyi oluşturana kadar
        const cell = document.querySelector(`.cell[data-row='${currentRow}'][data-index='${currentCol}']`);
        if (cell) {
            cell.textContent = letter.toUpperCase(); // Harfi hücreye yerleştir
            currentCol++;  // Bir sonraki hücreye geç
        }
    }
}

// Geri silme tuşuna basıldığında yapılacaklari ayarlayan fonksiyon
function handleBackspace() {
    if (currentCol > 0) {  // Eğer currentCol sıfırdan büyükse
        const cell = document.querySelector(`.cell[data-row='${currentRow}'][data-index='${currentCol - 1}']`);
        if (cell && !cell.classList.contains("disabled")) {  // Eğer hücre düzenlemeye açık ise
            cell.textContent = ""; // Hücreyi temizle
            currentCol--;  // Bir önceki hücreye git
        }
        document.getElementById("result").textContent = "";
    }
}

// Hücreleri silme veya yazmaya karşı engelleyen fonksiyon
function disableRowEditing(row) {
    const cells = document.querySelectorAll(`.cell[data-row='${row}']`);
    cells.forEach(cell => cell.classList.add("disabled"));  // Hücreleri düzenlemeye kapat
}

// Enter tuşuna basıldığında yapılacakları ayarlayan fonksiyon
function handleEnter() {
    if (currentCol === 5) { // Eğer 5 harf tamamlandıysa
        const guess = Array.from(
            document.querySelectorAll(`.cell[data-row='${currentRow}']`)
        )
            .map(cell => cell.textContent.toUpperCase()) // Her hücrenin içeriğini al
            .join(""); // Harfleri birleştir

        // Tahminin sözlükte olup olmadığını kontrol et
        if (!wordList.has(guess)) {
            // Tahmin sözlükte yoksa kullanıcıya hata mesajı göster
            document.getElementById("result").textContent = "Bu kelime sözlükte yok!";
            return; // İşlemi sonlandır
        }

        // Tahmin sözlükte varsa doğru cevap kontrolünü yap
        checkGuess(guess);

        // Satır geçişini sağlayalım
        disableRowEditing(currentRow);
        currentRow++;


        // Oyun bitti mi kontrol et
        if (currentRow > 6 || guess === correctWord) {
            if (guess === correctWord && currentRow < 5) {
                disableRowEditing(currentRow)
            }
            disableEnterKey();  // ENTER tuşunu pasif hale getir
            const resultText = guess === correctWord
                ? "Tebrikler! Kazandınız!"
                : `Maalesef! Doğru kelime: ${correctWord}`;
            document.getElementById("result").textContent = resultText;
        }
        currentCol = 0;
    }
}

function disableEnterKey() {
    // Tüm key elemanlarını seç
    const keys = document.querySelectorAll(".key");

    // "ENTER" yazan tuşu bul ve devre dışı bırak
    keys.forEach(key => {
        if (key.textContent === "ENTER") {
            key.style.pointerEvents = "none"; // Tıklanamaz hale getir
            key.style.opacity = "0.5"; // Görsel olarak pasif göster
        }
    });
}

// Tahmini kontrol edip ayarlamalar yapan fonksiyon
function checkGuess(guess) {
    /* 
         --guess: Kullanicinin tahmini
         --correctWord: Dogru kelime
         --currentRow: Tahmin sayisi
         --currentCol: Tahmin edilen satir
    
    
         Tahmini kontrol eder. Tahmin edilen kelimedeki hücreleri renklendirir.
         Tahmin doğru ise oyunu sonlandırır.
         Verilen haklarda kelime tahmin edilemezse oyunu sonlandırır. 
         Renkler ve anlamlari:
            Yeşil: Tahmin edilen karakter kelimede var ve pozisyonu doğru
            Turuncu: Tahmin edilen karakter kelimede var ama pozisyonu yanlış
            Gri: Tahmin edilen karakter kelimeye ait degil
    */

    console.log("Tahmin edilen kelime:", guess); // Doğru tahminin tamamını konsola yazdır

    const row = Array.from(document.querySelectorAll(".cell"))
        .slice(currentRow * 5, currentRow * 5 + 5);
    const correctWordArray = correctWord.split("");
    const checkedPositions = Array(5).fill(false);

    // İlk geçiş: Doğru pozisyon için kontrol (Yeşil)
    for (let i = 0; i < 5; i++) {
        if (guess[i] === correctWordArray[i]) {
            row[i].classList.add("correct");
            checkedPositions[i] = true;
            correctWordArray[i] = null;
        }
    }

    // İkinci geçiş: Yanlış pozisyon için kontrol (Turuncu)
    for (let i = 0; i < 5; i++) {
        if (!row[i].classList.contains("correct")) {
            const index = correctWordArray.indexOf(guess[i]);
            if (index !== -1) {
                row[i].classList.add("present");
                correctWordArray[index] = null;
            } else {
                row[i].classList.add("absent");
            }
        }
    }

    updateKeyboardColors(guess, checkedPositions);

    if (guess === correctWord) {
        document.getElementById("result").textContent = "Tebrikler! Kazandınız!";
    } else if (currentRow === 6) {
        document.getElementById("result").textContent = `Maalesef! Doğru kelime: ${correctWord}`;
    }

    //currentRow++;
    currentCol = 0;
}

// Tahmine göre klavye renklerini günceller
function updateKeyboardColors(guess, checkedPositions) {
    /* 
         --guess: Kullanicinin tahmini
         --checkedPositions : Kontrol edilen pozisyonlar
    
         Klavyeyi tahmin sonrasinda tahmine göre günceller.
         Renkler ve anlamlari:
            Yeşil: Tahmin edilen karakter kelimede var ve pozisyonu doğru
            Turuncu: Tahmin edilen karakter kelimede var ama pozisyonu yanlış
            Gri: Tahmin edilen karakter kelimeye ait degil
    */

    const keyboardKeys = document.querySelectorAll(".key");
    guess.split("").forEach((letter, index) => {
        const key = Array.from(keyboardKeys).find(key => key.textContent === letter);

        if (key) {
            // Eğer harf doğru pozisyonda ise, yeşil yap
            if (checkedPositions[index]) {
                key.style.backgroundColor = "green";
                key.style.color = "white";
            }
            // Eğer harf yanlış pozisyonda ise, turuncu yap
            else if (correctWord.includes(letter)) {
                key.style.backgroundColor = "orange";
                key.style.color = "white";
            }
            // Eğer harf doğru değilse, gri yap
            else {
                key.style.backgroundColor = "grey";
                key.style.color = "white";
            }
        }
    });
}

// Oyun başlatma
initializeGame();
