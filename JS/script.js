// =========================
// VERIFICAR LOGIN
// =========================

const usuarioLogado = localStorage.getItem("usuarioLogado");

if (!usuarioLogado && !window.location.pathname.includes("login.html")) {
    window.location.href = "login.html";
}

// =========================
// PRODUTOS
// =========================

const jogos = [
    {
        id: 1,
        nome: "Minecraft",
        preco: 89.90,
        estoque: 5,
        genero: "Sandbox",
        imagem: "img/minecraft.jpg"
    },

    {
        id: 2,
        nome: "Terraria",
        preco: 19.90,
        estoque: 8,
        genero: "Aventura",
        imagem: "img/terraria.jpg"
    },

    {
        id: 3,
        nome: "Hollow Knight-PS4",
        preco: 46.99,
        estoque: 4,
        genero: "Metroidvania",
        imagem: "img/hollow-knight.jpg"
    },

    {
        id: 4,
        nome: "Stardew Valley",
        preco: 24.99,
        estoque: 6,
        genero: "Simulação",
        imagem: "img/stardew-valley.jpg"
    }
];


// =========================
// CARRINHO
// =========================

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];


// Salva o carrinho no navegador
function salvarCarrinho() {
    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );
}


// =========================
// ADICIONAR AO CARRINHO
// =========================

function adicionarAoCarrinho(id) {

    const jogo = jogos.find(jogo => jogo.id === id);

    if (!jogo) {
        return;
    }

    const itemExistente = carrinho.find(
        item => item.id === id
    );

    if (itemExistente) {

        if (itemExistente.quantidade < jogo.estoque) {
            itemExistente.quantidade++;
        } else {
            alert("Quantidade máxima disponível em estoque.");
            return;
        }

    } else {

        carrinho.push({
            id: jogo.id,
            nome: jogo.nome,
            preco: jogo.preco,
            imagem: jogo.imagem,
            quantidade: 1
        });
    }

    salvarCarrinho();

    alert(jogo.nome + " foi adicionado ao carrinho!");
}


// =========================
// EXIBIR CARRINHO
// =========================

function mostrarCarrinho() {

    const container = document.querySelector(".itens-carrinho");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (carrinho.length === 0) {

        container.innerHTML = `
            <p>Seu carrinho está vazio.</p>`;

        atualizarTotal();
        return;
    }


    carrinho.forEach(item => {

        const produto = document.createElement("article");

        produto.classList.add("item-carrinho");

        produto.innerHTML = `
            <img
                src="${item.imagem}"
                alt="Capa do ${item.nome}"
            >

            <div class="informacoes-item">

                <h3>${item.nome}</h3>

                <p>
                    R$ ${item.preco.toFixed(2).replace(".", ",")}
                </p>

                <div class="quantidade">

                    <button onclick="alterarQuantidade(${item.id}, -1)">
                        -
                    </button>

                    <span>${item.quantidade}</span>

                    <button onclick="alterarQuantidade(${item.id}, 1)">
                        +
                    </button>

                </div>

            </div>

            <button
                class="remover"
                onclick="removerDoCarrinho(${item.id})"
            >
                Remover
            </button>
        `;

        container.appendChild(produto);
    });

    atualizarTotal();
}


// =========================
// ALTERAR QUANTIDADE
// =========================

function alterarQuantidade(id, valor) {

    const item = carrinho.find(
        item => item.id === id
    );

    const jogo = jogos.find(
        jogo => jogo.id === id
    );

    if (!item || !jogo) {
        return;
    }

    item.quantidade += valor;


    // Impede quantidade menor que 1
    if (item.quantidade <= 0) {

        removerDoCarrinho(id);
        return;
    }


    // Impede comprar mais que o estoque
    if (item.quantidade > jogo.estoque) {

        item.quantidade = jogo.estoque;

        alert("Não há mais unidades disponíveis.");
    }

    salvarCarrinho();

    mostrarCarrinho();
}


// =========================
// REMOVER DO CARRINHO
// =========================

function removerDoCarrinho(id) {

    carrinho = carrinho.filter(
        item => item.id !== id
    );

    salvarCarrinho();

    mostrarCarrinho();
}


// =========================
// CALCULAR TOTAL
// =========================

function atualizarTotal() {

    const totalElemento = document.querySelector(".total strong");
    const subtotalElemento = document.querySelector(".resumo .subtotal");

    if (!totalElemento) {
        return;
    }

    let total = 0;

    carrinho.forEach(item => {

        total += item.preco * item.quantidade;

    });


    const valorFormatado =
        "R$ " + total.toFixed(2).replace(".", ",");


    totalElemento.textContent = valorFormatado;

    if (subtotalElemento) {
        subtotalElemento.textContent = valorFormatado;
    }
}


// =========================
// FINALIZAR COMPRA
// =========================

function finalizarCompra() {

    if (carrinho.length === 0) {

        alert("Seu carrinho está vazio.");

        return;
    }


    carrinho.forEach(item => {

        const jogo = jogos.find(
            jogo => jogo.id === item.id
        );

        if (jogo) {

            jogo.estoque -= item.quantidade;

        }
    });


    carrinho = [];

    salvarCarrinho();

    alert("Compra realizada com sucesso!");

    mostrarCarrinho();
}


// =========================
// LOGIN
// =========================

const formularioLogin =
    document.querySelector("#form-login");

if (formularioLogin) {

    formularioLogin.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const usuario =
                document.querySelector("#usuario").value;

            const senha =
                document.querySelector("#senha").value;

            if (usuario === "admin" && senha === "1234") {

                localStorage.setItem(
                    "usuarioLogado",
                    usuario
                );

                alert("Login realizado com sucesso!");

                window.location.href = "index.html";

            } else {

                alert("Usuário ou senha incorretos.");

            }

        }
    );
}



// =========================
// BOTÕES DO CATÁLOGO
// =========================

const botoes =
    document.querySelectorAll(".card-jogo button");


botoes.forEach((botao, indice) => {

    botao.addEventListener(
        "click",
        function() {

            adicionarAoCarrinho(indice + 1);

        }
    );

});


// =========================
// BOTÃO VER JOGOS
// =========================

const botaoVerJogos =
    document.querySelector(".banner button");


if (botaoVerJogos) {

    botaoVerJogos.addEventListener(
        "click",
        function() {

            document
                .querySelector(".catalogo")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


// =========================
// BOTÃO FINALIZAR COMPRA
// =========================

const botaoFinalizar =
    document.querySelector(".finalizar");


if (botaoFinalizar) {

    botaoFinalizar.addEventListener(
        "click",
        finalizarCompra
    );

}


// =========================
// INICIALIZAÇÃO
// =========================

mostrarCarrinho();
atualizarTotal();

// =========================
// MENU DE LOGIN / LOGOUT
// =========================

const linkLogin = document.querySelector("#link-login");

if (linkLogin && usuarioLogado) {

    linkLogin.textContent = "Sair";
    linkLogin.href = "#";

    linkLogin.addEventListener("click", function(event) {

        event.preventDefault();

        localStorage.removeItem("usuarioLogado");

        window.location.href = "login.html";

    });
}

