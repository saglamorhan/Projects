let correctWord = ""; // Doğru kelime burada saklanacak
let currentRow = 0;
let currentCol = 0;
let wordList = new Set();


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

const gameBoard = document.getElementById("game-board"); // game-board id'sine sahip div

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

function handleKeyInput(letter) {
    if (currentCol < 5 && currentRow < 6) {  // 5 harfli kelimeyi oluşturana kadar
        const cell = document.querySelector(`.cell[data-row='${currentRow}'][data-index='${currentCol}']`);
        if (cell) {
            cell.textContent = letter.toUpperCase(); // Harfi hücreye yerleştir
            currentCol++;  // Bir sonraki hücreye geç
        }
    }
}


function handleBackspace() {
    /* if (currentCol > 0) {  // Eğer currentCol sıfırdan büyükse
        currentCol--;  // Bir önceki hücreye git
        const cell = document.querySelector(`.cell[data-row='${currentRow}'][data-index='${currentCol}']`);
        if (cell) {
            cell.textContent = ""; // Hücreyi temizle
        }
    } else if (currentRow > 0) {  // Eğer currentCol sıfırsa ve row 0'dan büyükse
        currentRow--;  // Bir önceki satıra geç
        currentCol = 4;  // Son sütuna geri git
        const cell = document.querySelector(`.cell[data-row='${currentRow}'][data-index='${currentCol}']`);
        if (cell) {
            cell.textContent = ""; // Hücreyi temizle
        }
    } */
        if (currentCol > 0) {  // Eğer currentCol sıfırdan büyükse
            const cell = document.querySelector(`.cell[data-row='${currentRow}'][data-index='${currentCol - 1}']`);
            if (cell && !cell.classList.contains("disabled")) {  // Eğer hücre düzenlemeye açık ise
                cell.textContent = ""; // Hücreyi temizle
                currentCol--;  // Bir önceki hücreye git
            }
        }
}

function disableRowEditing(row) {
    const cells = document.querySelectorAll(`.cell[data-row='${row}']`);
    cells.forEach(cell => cell.classList.add("disabled"));  // Hücreleri düzenlemeye kapat
}



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
        currentCol = 0;

        if (currentRow > 6) {
            // Eğer 6 tahmin yapıldıysa, oyun bitmiştir
            document.getElementById("result").textContent = `Maalesef! Doğru kelime: ${correctWord}`;
        }
    }
}

function checkGuess(guess) {
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

    if (guess === correctWord ) {
        document.getElementById("result").textContent = "Tebrikler! Kazandınız!";
    } else if (currentRow === 6) {
        document.getElementById("result").textContent = `Maalesef! Doğru kelime: ${correctWord}`;
    }

    //currentRow++;
    currentCol = 0;
}


function updateKeyboardColors(guess, checkedPositions) {
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
