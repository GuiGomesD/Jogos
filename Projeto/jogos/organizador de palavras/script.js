var themes = {
    programacao: ["PROGRAMAR", "JAVASCRIPT", "COMPUTADOR", "DESAFIO", "JOGO"],
    animais: ["ELEFANTE", "GIRAFA", "CACHORRO", "GATO", "PAPAGAIO"],
    frutas: ["ABACAXI", "BANANA", "LARANJA", "UVA", "MORANGO"],
    paises: ["BRASIL", "ARGENTINA", "CANADA", "JAPAO", "FRANCA"]
};

var word = "";
var correct = [];
var remainingWords = [];
var hintUsed = false;
var selectedTheme = "";
var timerInterval;
var secondsLeft = 60;
var currentIndex = 0;
var displayedLetters = [];
var additionalLettersCount = 5; // Número de letras adicionais

function teclaHover() {
    const audio = new Audio("/Midia/sons/clickHover.wav");
    audio.volume = 0.5;
    audio.play();
}

function start() {
    const themeSelect = document.getElementById("theme");
    selectedTheme = themeSelect.value;
    remainingWords = [...themes[selectedTheme]];
    document.getElementById("selectedTheme").textContent = `Tema: ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}`;
    document.querySelector(".themeDisplay").style.display = "block";
    document.querySelector(".startContainer").style.display = "none";
    document.getElementById("countdown").style.display = "block";
    initializeGame();
    startTimer();
}

function initializeGame() {
    const sentenceBox = document.querySelector(".sentenceBox");
    const words = document.querySelector(".words");
    const hintContainer = document.querySelector(".hintContainer");

    if (remainingWords.length === 0) {
        alert("Parabéns! Você completou todas as palavras!");
        clearInterval(timerInterval);
        return;
    }

    word = remainingWords.splice(Math.floor(Math.random() * remainingWords.length), 1)[0];

    correct = new Array(word.length).fill('_');
    sentenceBox.innerHTML = "";
    hintUsed = false;
    currentIndex = 0;

    for (let i = 0; i < word.length; i++) {
        let span = document.createElement("span");
        span.id = "drop-" + i;
        if (word[i] === " ") {
            span.className = "hyphen";
            span.textContent = "-";
        } else {
            span.className = "dropzone";
            span.textContent = "_";
            span.onclick = () => removeLetter(i);
        }
        sentenceBox.appendChild(span);
    }

    sentenceBox.style.display = "flex";
    words.style.display = "flex";
    hintContainer.style.display = "block";

    generateAndDisplayLetters();
}

function generateAndDisplayLetters() {
    const wordsContainer = document.querySelector(".words .grid");
    wordsContainer.innerHTML = "";

    displayedLetters = [...word.split('')];
    for (let i = 0; i < additionalLettersCount; i++) {
        displayedLetters.push(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
    }

    displayedLetters = shuffleArray(displayedLetters);

    displayedLetters.forEach((letter, index) => {
        let div = document.createElement("div");
        div.className = "tecla";
        div.id = "letter-" + index;
        div.textContent = letter;
        div.onclick = () => handleClick(letter, index);
        wordsContainer.appendChild(div);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startTimer() {
    const countdown = document.getElementById("countdown");
    clearInterval(timerInterval);
    secondsLeft = 60;
    timerInterval = setInterval(() => {
        if (secondsLeft <= 0) {
            clearInterval(timerInterval);
            alert("O tempo acabou! Fim de jogo.");
        } else {
            secondsLeft--;
            countdown.textContent = `Tempo: ${secondsLeft}s`;
        }
    }, 1000);
}

function handleClick(data, index) {
    let nextEmptyIndex = findNextEmptyIndex();

    if (nextEmptyIndex !== -1) {
        const dropzone = document.getElementById("drop-" + nextEmptyIndex);
        if (dropzone) {
            dropzone.textContent = data;
            dropzone.classList.add('correct');
            dropzone.style.color = "white";
            correct[nextEmptyIndex] = data;
            document.getElementById("letter-" + index).style.visibility = "hidden"; // Remove visualmente a letra

            currentIndex = nextEmptyIndex + 1; // Atualiza currentIndex para o próximo índice vazio

            if (currentIndex === word.length) {
                checkWord();
            }
        }
    }
}

function findNextEmptyIndex() {
    for (let i = 0; i < word.length; i++) {
        if (correct[i] === '_') {
            return i;
        }
    }
    return -1; // Retorna -1 se não encontrar nenhum índice vazio
}

function removeLetter(index) {
    if (correct[index] !== '_') {
        const letter = correct[index];
        correct[index] = '_';
        document.getElementById("drop-" + index).textContent = "_";
        document.getElementById("drop-" + index).style.color = "white";
        document.getElementById("drop-" + index).classList.remove('correct');

        const letterElement = [...document.querySelectorAll('.tecla')].find(el => el.textContent === letter && el.style.visibility === "hidden");
        if (letterElement) {
            letterElement.style.visibility = "visible";
        }
        currentIndex = index;
    }
}

function checkWord() {
    const sentenceBox = document.querySelector(".sentenceBox");

    if (correct.includes('_')) {
        return; // Não verifica a palavra se houver espaços vazios
    }

    if (correct.join('') === word) {
        const audio = new Audio("/Midia/sons/finished.wav");
        audio.volume = 0.5;
        audio.play();
        sentenceBox.querySelectorAll('.dropzone').forEach(element => {
            element.style.backgroundColor = "#772CE8";
            element.style.color = "white";
        });

        setTimeout(() => {
            sentenceBox.innerHTML = "";
            sentenceBox.style.borderColor = "#999";
            correct = [];
            word = "";
            initializeGame();
        }, 1000);
    } else {
        const audio = new Audio("/Midia/sons/negativeSound.wav");
        audio.volume = 0.5;
        audio.play();
        
        // Adicionar classes para animação de erro
        sentenceBox.querySelectorAll('.dropzone').forEach(element => {
            element.classList.add('wrong');
        });

        setTimeout(() => {
            // Remover classes de erro após 500ms
            sentenceBox.querySelectorAll('.dropzone').forEach(element => {
                element.classList.remove('wrong');
            });

            // Limpar e restaurar o jogo como antes
            sentenceBox.querySelectorAll('.dropzone').forEach((element, index) => {
                element.textContent = "_";
                element.style.color = "white";
                element.classList.remove('correct');
                correct[index] = '_'; // Restaura o array correct
            });

            currentIndex = 0; // Reinicia currentIndex para zero

            // Restaura todas as letras ocultadas nas caixas de letras
            const wordsContainer = document.querySelector(".words .grid");
            wordsContainer.querySelectorAll('.tecla').forEach(letterElement => {
                if (letterElement.style.visibility === "hidden") {
                    letterElement.style.visibility = "visible";
                }
            });

        }, 500); // Reduzir o tempo para 500ms para uma animação mais rápida
    }
}

function useHint() {
    if (hintUsed) {
        alert("Você já usou a dica para esta palavra.");
        return;
    }

    const maxHints = Math.ceil(word.length / 3); // Defina quantas letras quer revelar (exemplo: um terço da palavra)
    const indicesToReveal = [];

    for (let i = 0; i < word.length; i++) {
        if (correct[i] === '_') {
            indicesToReveal.push(i);
        }
    }

    indicesToReveal.sort(() => Math.random() - 0.5);

    for (let i = 0; i < maxHints && i < indicesToReveal.length; i++) {
        const index = indicesToReveal[i];
        correct[index] = word[index];
        document.getElementById("drop-" + index).textContent = word[index];
        document.getElementById("drop-" + index).classList.add('correct');

        const letterElement = [...document.querySelectorAll('.tecla')].find(el => el.textContent === word[index] && el.style.visibility === "visible");
        if (letterElement) {
            letterElement.style.visibility = "hidden";
        }
    }

    hintUsed = true;
    checkWord(); // Verifica se a palavra está completa após usar a dica
}
