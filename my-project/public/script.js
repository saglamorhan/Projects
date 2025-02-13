let correctWord = ""; // Doğru kelime burada saklanacak
let currentRow = 0;
let currentCol = 0;
let wordList = new Set();
const gameBoard = document.getElementById("game-board"); // game-board id'sine sahip div
let gameOver = false;
let enterKeyEnable;

function initializeGame() {
    try {
        loadWordList();

        // Eğer doğru kelime daha önce kaydedilmişse, bunu al
        if (!localStorage.getItem("correctWord")) {
            correctWord = assignRandomWord();
            localStorage.setItem("correctWord", correctWord);  // Doğru kelimeyi kaydet
            // Oyun başlatma (tahtayı ve klavye oluştur)

        } else {
            createBoard();
            createKeyboard();
            correctWord = localStorage.getItem("correctWord");  // Kaydedilen doğru kelimeyi al
            loadGameState();
            loadKeyboardState();  // Klavye renk durumu yüklenir
            loadGuessState();  // Önceden girilen tahminler yüklenir
            disablePreviousRows();  // Önceki satırlarda düzenleme yapılmasın


        }

        console.log("Doğru kelime:", correctWord);
    } catch (error) {
        console.error("Oyun başlatılamadı:", error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedGameOver = JSON.parse(localStorage.getItem('gameOver'));

    if (savedGameOver) {
        gameOver = true; // Oyun bitti olarak işaretle
        //showEndMessage(); // Tebrik veya kaybetme mesajı göster
        showNewGameButton(); // Yeni oyun butonunu göster
    } else {
        loadGameState(); // Mevcut oyun durumunu yükle
    }
});

function endGame() {
    gameOver = true; // Oyunun bittiğini işaretle
    localStorage.setItem('gameOver', JSON.stringify(gameOver)); // Durumu kaydet
    //showEndMessage(); // Tebrik veya kaybetme mesajı göster
    showNewGameButton(); // Yeni oyun butonunu göster
}


function loadGameState() {
    // Doğru kelimeyi yükle
    const savedCorrectWord = localStorage.getItem("correctWord");
    if (savedCorrectWord) {
        correctWord = savedCorrectWord;  // Doğru kelimeyi geri yükle
        //wordList = localStorage.getItem("wordList")
    }

    // Önceki tahminleri yükle
    const savedCurrentRow = localStorage.getItem("currentRow");
    const savedCurrentCol = localStorage.getItem("currentCol");
    if (savedCurrentRow !== null && savedCurrentCol !== null) {
        currentRow = parseInt(savedCurrentRow);
        currentCol = parseInt(savedCurrentCol);
    }

    // Klavye renklerini yükle
    const savedKeyColors = JSON.parse(localStorage.getItem("keyColors"));
    if (savedKeyColors) {
        const keys = document.querySelectorAll(".key");
        keys.forEach(key => {
            const letter = key.textContent;
            if (savedKeyColors[letter]) {
                key.style.backgroundColor = savedKeyColors[letter];
            }
        });
    }

    // Tahminler (cell renkleri) ve satır durumunu yükle
    const savedCells = JSON.parse(localStorage.getItem("cells"));
    if (savedCells) {
        savedCells.forEach((cellData, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const cell = document.querySelector(`.cell[data-row='${row}'][data-index='${col}']`);
            if (cell) {
                cell.textContent = cellData.letter;
                if (cellData.status) {
                    cell.classList.add(cellData.status);
                }
            }
        });
    }

    const revealWord = localStorage.getItem("revealWord");
    if (revealWord) {
        revealCorrectWord(revealWord);
    }
}

function saveGameState() {
    // Doğru kelimeyi kaydet
    localStorage.setItem("correctWord", correctWord);

    // Mevcut satır ve sütun bilgisini kaydet
    localStorage.setItem("currentRow", currentRow);
    localStorage.setItem("currentCol", currentCol);
    //localStorage.setItem("wordList", wordList);

    // Klavye renklerini kaydet
    const keyColors = {};
    const keys = document.querySelectorAll(".key");
    keys.forEach(key => {
        const letter = key.textContent;
        keyColors[letter] = key.style.backgroundColor;
    });
    localStorage.setItem("keyColors", JSON.stringify(keyColors));

    // Tahminler (cell renkleri) kaydet
    const cells = [];
    const cellElements = document.querySelectorAll(".cell");
    cellElements.forEach(cell => {
        const row = cell.getAttribute("data-row");
        const index = cell.getAttribute("data-index");
        cells.push({
            letter: cell.textContent,
            status: cell.className.includes("correct") ? "correct" :
                cell.className.includes("present") ? "present" :
                    cell.className.includes("absent") ? "absent" : null
        });
    });
    localStorage.setItem("cells", JSON.stringify(cells));
}

function disablePreviousRows() {
    for (let row = 0; row < currentRow; row++) {
        const cells = document.querySelectorAll(`.cell[data-row='${row}']`);
        cells.forEach(cell => {
            cell.setAttribute("contenteditable", "false");  // İçeriği değiştirilemez yap
        });
    }
}

// Klavye renklerini kaydet
function saveKeyboardState() {
    const keyboardKeys = document.querySelectorAll('.key');
    const keyboardState = {};

    keyboardKeys.forEach(key => {
        const letter = key.textContent;
        if (key.classList.contains('correct')) {
            keyboardState[letter] = 'correct';
        } else if (key.classList.contains('present')) {
            keyboardState[letter] = 'present';
        } else if (key.classList.contains('absent')) {
            keyboardState[letter] = 'absent';
        } else {
            keyboardState[letter] = 'default'; // Renk değişmemişse
        }
    });

    localStorage.setItem('keyboardState', JSON.stringify(keyboardState));
}

// Klavye renklerini yükle
function loadKeyboardState() {
    const keyboardState = JSON.parse(localStorage.getItem('keyboardState'));
    if (keyboardState) {
        const keyboardKeys = document.querySelectorAll('.key');
        keyboardKeys.forEach(key => {
            const letter = key.textContent;
            if (keyboardState[letter]) {
                key.classList.add(keyboardState[letter]);
            }
        });
    }
}

// Tahminleri kaydet
function saveGuessState() {
    const rows = document.querySelectorAll('.row');
    const guesses = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll('.cell');
        const guess = Array.from(cells).map(cell => cell.textContent).join('');
        guesses.push(guess);
    });

    localStorage.setItem('guesses', JSON.stringify(guesses));
}

// Tahminleri yükle
function loadGuessState() {
    const guesses = JSON.parse(localStorage.getItem('guesses'));
    if (guesses) {
        guesses.forEach((guess, rowIndex) => {
            const row = document.querySelectorAll('.row')[rowIndex];
            const cells = row.querySelectorAll('.cell');
            guess.split('').forEach((letter, colIndex) => {
                cells[colIndex].textContent = letter;
            });
        });
    }
}



// Kelime listesini yükleyen fonksiyon
function loadWordList() {
    try {
        // Kelimeleri Set'e ekleyelim
        besHarfliWordList.forEach(word => wordList.add(word));
    } catch (error) {
        console.error("Hata: ", error.message);
    }
}

// Rastgele kelime seçen fonksiyon
function assignRandomWord() {
    try {
        return besHarfliWordList[Math.floor(Math.random() * besHarfliWordList.length)];
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

function revealCorrectWord(sil) {
    if (sil) {
        const rowCells = Array.from(
            document.querySelectorAll(`.cell[data-row='${currentRow - 1}']`)
        );
        rowCells.forEach((cell, index) => {
            cell.textContent = correctWord[index];
            cell.style.backgroundColor = "#4CAF50";/*#e0d5d5 */
            cell.style.color = "white";
            cell.style.border = "2px solid red";
        });
    } else {
        const rowCells = Array.from(
            document.querySelectorAll(`.cell[data-row='${currentRow - 1}']`)
        );
        rowCells.forEach((cell, index) => {
            cell.textContent = correctWord[index];
            cell.style.backgroundColor = "#e0d5d5";/*#e0d5d5 */
            cell.style.color = "black";
            cell.style.border = "1px solid black";
        });
    }
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
            //document.getElementById("result").textContent = "Bu kelime sözlükte yok!";
            // Tahmin geçerli değilse satırı kırmızıya boya
            const rowCells = Array.from(
                document.querySelectorAll(`.cell[data-row='${currentRow}']`)
            );
            rowCells.forEach(cell => {
                cell.style.backgroundColor = "red";
                cell.style.color = "white";
            });

            // Rengi geri al (1 saniye sonra)
            setTimeout(() => {
                rowCells.forEach(cell => {
                    cell.style.backgroundColor = ""; // Orijinal rengi geri getir
                    cell.style.color = "";
                });
            }, 1000);

            return; // İşlemi sonlandır
        }

        // Tahmin sözlükte varsa doğru cevap kontrolünü yap
        checkGuess(guess);

        // Satır geçişini sağlayalım
        disableRowEditing(currentRow);
        currentRow++;


        // Oyun bitti mi kontrol et
        if (currentRow >= 6 || guess === correctWord) {
            if (guess === correctWord && currentRow < 5) {
                disableRowEditing(currentRow)
            }
            disableEnterKey();  // ENTER tuşunu pasif hale getir
            /* 
            const resultText = guess === correctWord
                ? alert("Tebrikler! Kazandınız!")
                : al ert(`Maalesef! Doğru kelime: ${correctWord}`);
            */
            endGame();
            revealCorrectWord(true);
            localStorage.setItem("revealWord", true);
            showNewGameButton(); // Yeni Oyun tuşunu göster
        }
        currentCol = 0;
        saveGameState();  // Durum kaydedilsin
    }
}

// Yeni oyun tuşunu gösteren fonksiyon
function showNewGameButton() {
    const newGameButton = document.getElementById("new-game");
    newGameButton.style.display = "block"; // Tuşu görünür yap
    newGameButton.addEventListener("click", startNewGame); // Tıklanabilirlik ekle
}

function resetGameState() {
    localStorage.removeItem('cells');
    localStorage.removeItem('keyboardState');
    localStorage.removeItem('guesses');
    localStorage.removeItem('correctWord');
    localStorage.removeItem('keyColors')
    localStorage.removeItem('currentRow')
    localStorage.removeItem('currentCol')
    localStorage.removeItem('revealWord')


}

function clearGameBoard() {
    // Oyun tahtasını temizle
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
        const cells = row.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';  // Hücreyi boşalt
            cell.classList.remove('correct', 'present', 'absent');  // Renkleri sıfırla
        });
    });

    // Klavye renklerini sıfırla
    const keyboardKeys = document.querySelectorAll('.key');
    keyboardKeys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });

    // Sonuç mesajını sıfırla
    document.getElementById("result").textContent = '';
}


function clearKeyboardColor() {
    const keyboardKeys = document.querySelectorAll('.key');
    keyboardKeys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent'); // Ekstra olarak stil değişikliği yapalım
        key.style.backgroundColor = "";  // Örneğin arka plan rengini sıfırlama
        key.style.color = "";  // Metin rengini sıfırlama
    });
}

// Oyunu sıfırlayan fonksiyon
function startNewGame() {
    // Tahtayı temizle
    // LocalStorage verilerini temizle
    localStorage.setItem("revealWord", false)
    revealCorrectWord(false);
    resetGameState();
    gameOver = false;
    localStorage.setItem('gameOver', gameOver);

    // Oyun tahtasını temizle
    clearGameBoard();
    clearKeyboardColor();
    currentCol = 0;
    currentRow = 0;

    // Enter tuşunu yeniden aktif hale getir
    enableEnterKey();
    // Yeni oyun başlatma
    initializeGame();  // Oyun başlatma fonksiyonunu çağır

    // "Yeni Oyun" tuşunu tekrar gizle
    const newGameButton = document.getElementById("new-game");
    newGameButton.style.display = "none";


}

function enableEnterKey() {
    // Tüm key elemanlarını seç
    const keys = document.querySelectorAll(".key");

    // "ENTER" yazan tuşu bul ve yeniden aktif hale getir
    keys.forEach(key => {
        if (key.textContent === "ENTER") {
            key.style.pointerEvents = "auto"; // Tıklanabilir hale getir
            key.style.opacity = "1"; // Görsel olarak aktif göster
        }
    });
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




    updateKeyboardColors(guess, checkedPositions, correctWord);

    //currentRow++;
    currentCol = 0;
}

// Tahmine göre klavye renklerini günceller
function updateKeyboardColors(guess, checkedPositions, correctWord) {
    const keyboardKeys = document.querySelectorAll(".key");

    // Klavye renk öncelik sırası
    const colorPriority = {
        "#4CAF50": 3,
        "orange": 2,
        "grey": 1,
        "": 0 // Hiç renk atanmamış
    };

    guess.split("").forEach((letter, index) => {
        const key = Array.from(keyboardKeys).find(k => k.textContent === letter);

        if (key) {
            let currentColor = key.style.backgroundColor || ""; // Mevcut renk
            let newColor = "";

            if (checkedPositions[index]) {
                newColor = "#4CAF50"; // Doğru pozisyon- green
            } else if (correctWord.includes(letter)) {
                newColor = "orange"; // Yanlış pozisyon
            } else {
                newColor = "grey"; // Kelimede yok
            }

            // Eğer yeni renk daha yüksek önceliğe sahipse değiştir
            if (colorPriority[newColor] > colorPriority[currentColor]) {
                key.style.backgroundColor = newColor;
            }
        }
    });
}



// Oyun başlatma
initializeGame();