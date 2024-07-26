document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#tetris');
    const width = 10;
    let timerId;
    let score = 0;
    const colors = ['orange', 'red', 'purple', 'green', 'blue'];

    // Criar a grade e preencher com divs
    function createBoard() {
        for (let i = 0; i < 200; i++) { // 200 divs para o tabuleiro
            let square = document.createElement('div');
            grid.appendChild(square);
        }
        for (let i = 0; i < 10; i++) { // 10 divs para a linha de base
            let square = document.createElement('div');
            square.classList.add('taken');
            grid.appendChild(square);
        }
    }
    createBoard();

    let squares = Array.from(grid.querySelectorAll('div'));
    const scoreDisplay = document.querySelector('#score span');
    let nextRandom = 0; // inicialização correta de nextRandom

    // Os Tetrominos e suas rotações
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];

    const theTetrominos = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;
    let random = Math.floor(Math.random() * theTetrominos.length);
    let current = theTetrominos[random][currentRotation];

    // Desenhar o Tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].style.backgroundColor = colors[random];
        });
    }

    // Desfazer o desenho do Tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].style.backgroundColor = '';
        });
    }

    // Fazer o Tetromino cair a cada segundo
    timerId = setInterval(moveDown, 1000);

    // Mover Tetromino para baixo
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // Congelar quando o Tetromino atinge o fundo da grade
    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetrominos.length);
            current = theTetrominos[random][currentRotation];
            currentPosition = 4;
            draw();
            addScore();
            gameOver();
        }
    }

    // Adicionar pontuação
    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerText = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].style.backgroundColor = '';
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    // Verificar o fim do jogo
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerText = 'Fim de jogo';
            clearInterval(timerId);
        }
    }

    document.addEventListener('keyup', control);
    function control(e) {
        if (e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 40) {
            moveDown();
        }
    }

    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) {
            currentRotation = 0;
        }
        current = theTetrominos[random][currentRotation];
        draw();
    }

    document.querySelector('#restart').addEventListener('click', () => {
        clearInterval(timerId);
        score = 0;
        scoreDisplay.innerText = score;
        nextRandom = 0;
        createBoard();
        random = Math.floor(Math.random() * theTetrominos.length);
        current = theTetrominos[random][currentRotation];
        currentPosition = 4;
        draw();
        timerId = setInterval(moveDown, 1000);
    });

    document.querySelector('#pause').addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            document.querySelector('#pause').innerText = 'Retomar';
        } else {
            timerId = setInterval(moveDown, 1000);
            document.querySelector('#pause').innerText = 'Pausar';
        }
    });

    document.querySelector('#reset-score').addEventListener('click', () => {
        score = 0;
        scoreDisplay.innerText = score;
    });
});