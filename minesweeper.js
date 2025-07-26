// minesweeper.js
// Lógica del juego Buscaminas

document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('minesweeper-grid');
    const messageElement = document.getElementById('message');
    const restartButton = document.getElementById('restart-button');

    // Configuración del tablero
    const ROWS = 10;
    const COLS = 10;
    const MINES = 15; // Número de minas

    let board = []; // Representación lógica del tablero
    let gameEnded = false; // Estado del juego (ganado/perdido)
    let cellsOpened = 0; // Contador de celdas abiertas para la condición de victoria

    // Inicializa el juego: crea el tablero, coloca minas y renderiza la cuadrícula
    function initializeGame() {
        gameEnded = false;
        cellsOpened = 0;
        messageElement.textContent = ''; // Limpiar mensajes anteriores
        gridElement.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`; // Configurar columnas CSS

        // Crear un tablero vacío con celdas no minadas, no abiertas y no marcadas
        board = Array(ROWS).fill(0).map(() => Array(COLS).fill({
            isMine: false,
            isOpened: false,
            isFlagged: false,
            minesAround: 0 // Número de minas adyacentes
        }));

        placeMines(); // Colocar las minas en el tablero
        calculateMinesAround(); // Calcular el número de minas alrededor de cada celda
        renderGrid(); // Dibujar el tablero en el HTML
    }

    // Coloca las minas aleatoriamente en el tablero
    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < MINES) {
            const row = Math.floor(Math.random() * ROWS);
            const col = Math.floor(Math.random() * COLS);

            // Si la celda no es ya una mina, coloca una
            if (!board[row][col].isMine) {
                board[row][col] = { ...board[row][col], isMine: true };
                minesPlaced++;
            }
        }
    }

    // Calcula el número de minas adyacentes para cada celda no minada
    function calculateMinesAround() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!board[r][c].isMine) { // Solo si la celda no es una mina
                    let count = 0;
                    // Recorre las 8 celdas adyacentes (incluyendo diagonales)
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            const newR = r + i;
                            const newC = c + j;

                            // Comprueba que la celda adyacente esté dentro de los límites del tablero
                            if (newR >= 0 && newR < ROWS && newC >= 0 && newC < COLS) {
                                // Si la celda adyacente es una mina, incrementa el contador
                                if (board[newR][newC].isMine) {
                                    count++;
                                }
                            }
                        }
                    }
                    // Asigna el contador de minas adyacentes a la celda
                    board[r][c] = { ...board[r][c], minesAround: count };
                }
            }
        }
    }

    // Renderiza (dibuja) la cuadrícula del juego en el HTML
    function renderGrid() {
        gridElement.innerHTML = ''; // Limpia el contenido actual de la cuadrícula

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell'); // Añade la clase base para estilos
                cellDiv.dataset.row = r; // Guarda la fila en un atributo de datos
                cellDiv.dataset.col = c; // Guarda la columna en un atributo de datos

                const cell = board[r][c]; // Obtiene el estado lógico de la celda

                if (cell.isOpened) {
                    cellDiv.classList.add('opened'); // Celda abierta
                    if (cell.isMine) {
                        cellDiv.classList.add('mine'); // Si es una mina, se marca en rojo
                        cellDiv.textContent = '💣'; // Emoji de bomba
                    } else if (cell.minesAround > 0) {
                        // Si no es una mina y tiene minas alrededor, muestra el número
                        cellDiv.textContent = cell.minesAround;
                        cellDiv.classList.add(`number-${cell.minesAround}`); // Clase para colorear el número
                    }
                } else if (cell.isFlagged) {
                    cellDiv.classList.add('flagged'); // Celda marcada con bandera
                    cellDiv.textContent = '🚩'; // Emoji de bandera
                }

                // Evento para abrir la celda al hacer clic izquierdo
                cellDiv.addEventListener('click', () => openCell(r, c));
                // Evento para colocar/quitar bandera al hacer clic derecho
                cellDiv.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); // Prevenir el menú contextual del navegador
                    toggleFlag(r, c);
                });

                gridElement.appendChild(cellDiv); // Añade la celda a la cuadrícula
            }
        }
    }

    // Abre una celda al hacer clic izquierdo
    function openCell(row, col) {
        // Ignora el clic si el juego ha terminado, la celda ya está abierta o está marcada con bandera
        if (gameEnded || board[row][col].isOpened || board[row][col].isFlagged) {
            return;
        }

        board[row][col] = { ...board[row][col], isOpened: true }; // Marca la celda como abierta
        cellsOpened++; // Incrementa el contador de celdas abiertas

        if (board[row][col].isMine) {
            // Si la celda es una mina, el juego termina
            revealAllMines(); // Muestra todas las minas
            messageElement.textContent = '¡Boom! Game Over. 💥';
            messageElement.style.color = 'red';
            gameEnded = true;
            return;
        }

        if (board[row][col].minesAround === 0) {
            // Si la celda no tiene minas alrededor, abre las celdas adyacentes recursivamente
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newR = row + i;
                    const newC = col + j;

                    // Abre solo celdas válidas y no abiertas
                    if (newR >= 0 && newR < ROWS && newC >= 0 && newC < COLS && !board[newR][newC].isOpened) {
                        openCell(newR, newC); // Llamada recursiva
                    }
                }
            }
        }

        renderGrid(); // Vuelve a dibujar la cuadrícula para reflejar los cambios
        checkWin(); // Comprueba si el jugador ha ganado
    }

    // Coloca o quita una bandera en una celda al hacer clic derecho
    function toggleFlag(row, col) {
        // Ignora el clic si el juego ha terminado o la celda ya está abierta
        if (gameEnded || board[row][col].isOpened) {
            return;
        }

        board[row][col] = { ...board[row][col], isFlagged: !board[row][col].isFlagged }; // Alterna el estado de la bandera
        renderGrid(); // Vuelve a dibujar la cuadrícula
        checkWin(); // Comprueba si el jugador ha ganado (si todas las minas están marcadas)
    }

    // Revela todas las minas al perder el juego
    function revealAllMines() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c].isMine) {
                    board[r][c] = { ...board[r][c], isOpened: true }; // Abre todas las celdas con minas
                }
            }
        }
        renderGrid(); // Vuelve a dibujar la cuadrícula
    }

    // Comprueba si el jugador ha ganado el juego
    function checkWin() {
        // El jugador gana si todas las celdas NO minadas han sido abiertas
        if (cellsOpened === (ROWS * COLS) - MINES) {
            messageElement.textContent = '¡Felicidades! ¡Has ganado! 🎉';
            messageElement.style.color = 'green';
            gameEnded = true;
            revealAllMines(); // Opcional: mostrar las minas restantes al ganar
        }
    }

    // Event listener para el botón de reiniciar
    restartButton.addEventListener('click', initializeGame);

    // Iniciar el juego cuando el DOM esté completamente cargado
    initializeGame();
});
