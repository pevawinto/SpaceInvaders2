let tileSize = 32; // Tamanho da célula no tabuleiro
let linhas = 16; // Número de linhas no tabuleiro
let colunas = 16; // Número de colunas no tabuleiro

let board;
let larguraTabuleiro = tileSize * colunas;
let alturaTabuleiro = tileSize * linhas;
let contexto;

// Nave
let larguraNave = tileSize * 2;
let alturaNave = tileSize;
let naveX = tileSize * colunas / 2 - tileSize;
let naveY = tileSize * linhas - tileSize * 2;

let nave = {
    x: naveX,
    y: naveY,
    largura: larguraNave,
    altura: alturaNave
}

let imagemNave;
let velocidadeNave = tileSize;

// Aliens
let arrayAliens = [];
let larguraAlien = tileSize * 2;
let alturaAlien = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let imagemAlien;

let linhasAlien = 2;
let colunasAlien = 3;
let contadorAliens = 0; // número de aliens para derrotar
let velocidadeAlienX = 1.5; // velocidade de movimento dos aliens

// Balas
let arrayBalas = [];
let velocidadeBalaY = -10; // velocidade de movimento das balas

// Pontuação
let pontuacao = 0;
let jogoEncerrado = false;

window.onload = function () {
    board = document.getElementById("board");
    board.width = larguraTabuleiro;
    board.height = alturaTabuleiro;
    contexto = board.getContext("2d");

    // Carrega imagem da nave
    imagemNave = new Image();
    imagemNave.src = "./img/ship.png";
    imagemNave.onload = function () {
        contexto.drawImage(imagemNave, nave.x, nave.y, nave.largura, nave.altura);
    }

    // Carrega imagem do alien e cria aliens
    imagemAlien = new Image();
    imagemAlien.src = "./img/alien.png";
    criarAliens();

    // Solicita quadro de animação e configura os ouvintes de eventos
    requestAnimationFrame(atualizar);
    document.addEventListener("keydown", moverNave);
    document.addEventListener("keyup", atirar);
}

// Desenha a imagem da nave
imagemNave.onload = function () {
    try {
        contexto.drawImage(imagemNave, nave.x, nave.y, nave.largura, nave.altura);
    } catch (error) {
        console.error("Erro ao desenhar a nave:", error);
        // Lidar com o erro, se necessário
    }
}

function atualizar() {
    requestAnimationFrame(atualizar);

    if (jogoEncerrado) {
        contexto.font = "30px courier";
        contexto.fillText("Fim de Jogo", board.width / 2 - 100, board.height / 2);
        contexto.font = "16px courier";
        contexto.fillText("Pressione F5 para reiniciar", board.width / 2 - 130, board.height / 2 + 30);

        return;
    }

    contexto.clearRect(0, 0, board.width, board.height);

    // Nave
    contexto.drawImage(imagemNave, nave.x, nave.y, nave.largura, nave.altura);

    // Aliens
    for (let i = 0; i < arrayAliens.length; i++) {
        let alien = arrayAliens[i];
        if (alien.vivo) {
            alien.x += velocidadeAlienX;

            // Se alien tocar na borda
            if (alien.x + alien.largura >= board.width || alien.x <= 0) {
                velocidadeAlienX *= -1;
                alien.x += velocidadeAlienX * 2;

                // Move todos os aliens para cima por uma linha
                for (let j = 0; j < arrayAliens.length; j++) {
                    arrayAliens[j].y += alturaAlien;
                }
            }
            contexto.drawImage(imagemAlien, alien.x, alien.y, alien.largura, alien.altura);

            if (alien.y >= nave.y) {
                jogoEncerrado = true;
            }
        }
    }

    // Balas
    for (let i = 0; i < arrayBalas.length; i++) {
        let bala = arrayBalas[i];
        bala.y += velocidadeBalaY;
        contexto.fillStyle = "white";
        contexto.fillRect(bala.x, bala.y, bala.largura, bala.altura);

        // Colisão da bala com aliens
        for (let j = 0; j < arrayAliens.length; j++) {
            let alien = arrayAliens[j];
            if (!bala.usada && alien.vivo && detectarColisao(bala, alien)) {
                bala.usada = true;
                alien.vivo = false;
                contadorAliens--;
                pontuacao += 100;
            }
        }
    }

    // Limpa balas
    while (arrayBalas.length > 0 && (arrayBalas[0].usada || arrayBalas[0].y < 0)) {
        arrayBalas.shift(); // Remove a primeira bala
    }

    // Próximo nível
    if (contadorAliens == 0) {
        colunasAlien = Math.min(colunasAlien + 1, colunas / 2 - 2); // Limita em 16/2 - 2 = 6
        linhasAlien = Math.min(linhasAlien + 1, linhas - 4); // Limita em 16 - 4 = 12
        velocidadeAlienX += 0.2; // Aumenta a velocidade dos aliens
        arrayAliens = [];
        arrayBalas = [];

        criarAliens();
    }

    // Pontuação
    contexto.fillStyle = "white";
    contexto.font = "16px courier";
    contexto.fillText(pontuacao, 5, 20);
}

function moverNave(e) {
    if (jogoEncerrado) {
        return;
    }

    if (e.code == "ArrowLeft" && nave.x - velocidadeNave >= 0) {
        nave.x -= velocidadeNave; // Move para a esquerda
    } else if (e.code == "ArrowRight" && nave.x + velocidadeNave + nave.largura <= board.width) {
        nave.x += velocidadeNave; // Move para a direita
    }
}

function criarAliens() {
    for (let c = 0; c < colunasAlien; c++) {
        for (let r = 0; r < linhasAlien; r++) {

            let alien = {
                img: imagemAlien,
                x: alienX + c * larguraAlien,
                y: alienY + r * alturaAlien,
                largura: larguraAlien,
                altura: alturaAlien,
                vivo: true
            }

            arrayAliens.push(alien);
        }
    }

    contadorAliens = arrayAliens.length;
}

function atirar(e) {
    if (jogoEncerrado) {
        return;
    }

    if (e.code == "Space") {
        // Atira
        let bala = {
            x: nave.x + larguraNave * 15 / 32,
            y: nave.y,
            largura: tileSize / 8,
            altura: tileSize / 2,
            usada: false
        }

        arrayBalas.push(bala);
    }
}

function detectarColisao(a, b) {
    return a.x < b.x + b.largura &&
        a.x + a.largura > b.x &&
        a.y < b.y + b.altura &&
        a.y + a.altura > b.y;
}
