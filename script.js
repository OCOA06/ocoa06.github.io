document.addEventListener('DOMContentLoaded', () => {
    let board = null; 
    const game = new Chess();
    let moveCount = 1; 
    let userColor = 'w';
    const backgroundMusic = document.getElementById('background-music');

    // Sonidos personalizados
    const sfxDerrota = new Audio('audio/sfx - derrota.mp3');
    const sfxVictoria = new Audio('audio/sfx Victoria.mp3');
    const sfxAvanzar = new Audio('audio/sfx avanzar.mp3');
    const sfxComerPieza = new Audio('audio/sfx comer pieza.mp3');
    const sfxReinaComePieza = new Audio('audio/sfx Reina come pieza.mp3');
    const sfxMuerteReina = new Audio('audio/sfx muerte de reina.mp3');
    const sfxBoton = new Audio('audio/sfx-boton.mp3');
    const sfxCuandoAbre = new Audio('audio/sfx cuando abra el juego.mp3');

    const bgVolumeSlider = document.getElementById('bg-volume');
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    const sfxList = [sfxDerrota, sfxVictoria, sfxAvanzar, sfxComerPieza, sfxReinaComePieza, sfxMuerteReina, sfxBoton, sfxCuandoAbre];

    bgVolumeSlider.addEventListener('input', (e) => {
        backgroundMusic.volume = parseFloat(e.target.value);
    });
    sfxVolumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        sfxList.forEach(sfx => { sfx.volume = vol; });
    });
    backgroundMusic.volume = parseFloat(bgVolumeSlider.value);
    sfxList.forEach(sfx => { sfx.volume = parseFloat(sfxVolumeSlider.value); });

    // Reproducir sonido al abrir el juego
    sfxCuandoAbre.play();

    backgroundMusic.play().catch(error => {
        console.error('Error al reproducir música:', error);
    });

    const makeRandomMove = () => {
        const possibleMoves = game.moves();
        if (!game.game_over()) {
            const randomIdx = Math.floor(Math.random() * possibleMoves.length);
            const moveStr = possibleMoves[randomIdx];
            const move = game.move(moveStr, { verbose: true });
            if (move.captured === 'Q' || move.captured === 'q') {
                sfxMuerteReina.play();
            } else if (move.piece === 'q' && move.captured) {
                sfxReinaComePieza.play();
            } else if (move.captured) {
                sfxComerPieza.play();
            } else {
                sfxAvanzar.play();
            }
            board.position(game.fen());
            moveCount++;
            checkGameState();
        }
    };

    const onDragStart = (source, piece) => {
        return !game.game_over() && piece.search(userColor) === 0;
    };
    
    const onDrop = (source, target) => {
        const move = game.move({
            from: source,
            to: target,
            promotion: 'q',
        });
        if (move === null) return 'snapback';
        if (move.captured === 'Q' || move.captured === 'q') {
            sfxMuerteReina.play();
        } else if (move.piece === 'q' && move.captured) {
            sfxReinaComePieza.play();
        } else if (move.captured) {
            sfxComerPieza.play();
        } else {
            sfxAvanzar.play();
        }
        window.setTimeout(makeRandomMove, 250);
        moveCount++;
        checkGameState();
    };

    const onSnapEnd = () => {
        board.position(game.fen());
    };

    const boardConfig = {
        showNotation: true,
        draggable: true,
        position: 'start',
        onDragStart,
        onDrop,
        onSnapEnd,
        moveSpeed: 'fast',
        snapBackSpeed: 500,
        snapSpeed: 100,
    };

    board = Chessboard('board', boardConfig);

    document.querySelector('.play-again').addEventListener('click', () => {
        sfxBoton.play();
        game.reset();
        board.start();
        moveCount = 1;
        userColor = 'w';
    });

    document.querySelector('.flip-board').addEventListener('click', () => {
        sfxBoton.play();
        board.flip();
        makeRandomMove();
        userColor = userColor === 'w' ? 'b' : 'w';
    });

    document.addEventListener('click', () => {
        backgroundMusic.play().catch(error => {
            console.error('Error al reproducir música:', error);
        });
    }, { once: true });

    function checkGameState() {
        if (game.in_checkmate()) {
            if (game.turn() !== userColor) {
                sfxVictoria.play();
                setTimeout(() => { alert('Jaque mate. ¡Victoria!'); }, 100);
            } else {
                sfxDerrota.play();
                setTimeout(() => { alert('Jaque mate. ¡Derrota!'); }, 100);
            }
        }
    }
});