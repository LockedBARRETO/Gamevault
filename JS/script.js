// =========================
// VERIFICAR LOGIN
// =========================

const usuarioLogado = localStorage.getItem("usuarioLogado");

if (!usuarioLogado && !window.location.pathname.includes("login.html")) {
    window.location.href = "login.html";
}

// =========================
// PRODUTOS (catálogo)
// =========================

const jogosPadrao = [
    { id: 1, nome: "Minecraft", preco: 89.90, estoque: 5, genero: "Sandbox", imagem: "img/minecraft.jpg" },
    { id: 2, nome: "Terraria", preco: 19.90, estoque: 8, genero: "Aventura", imagem: "img/terraria.jpg" },
    { id: 3, nome: "Hollow Knight-PS4", preco: 46.99, estoque: 4, genero: "Metroidvania", imagem: "img/hollow-knight.jpg" },
    { id: 4, nome: "Stardew Valley", preco: 24.99, estoque: 6, genero: "Simulação", imagem: "img/stardew-valley.jpg" }
];

let jogos = JSON.parse(localStorage.getItem("catalogoJogos"));

if (!jogos) {

    jogos = jogosPadrao;

    // Migração: se já existia estoque salvo do sistema antigo, aplica por cima
    const estoqueAntigo = JSON.parse(localStorage.getItem("estoqueJogos"));

    if (estoqueAntigo) {
        jogos.forEach(jogo => {
            if (estoqueAntigo[jogo.id] !== undefined) {
                jogo.estoque = estoqueAntigo[jogo.id];
            }
        });
    }
}

function salvarCatalogo() {
    localStorage.setItem("catalogoJogos", JSON.stringify(jogos));
}

salvarCatalogo();

// =========================
// RENDERIZAR CATÁLOGO (index.html)
// =========================

function renderizarCatalogo() {

    const container = document.querySelector(".jogos");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    jogos.forEach(jogo => {

        const card = document.createElement("article");
        card.classList.add("card-jogo");
        card.dataset.id = jogo.id;

        const precoFormatado =
            "R$ " + jogo.preco.toFixed(2).replace(".", ",");

        card.innerHTML = `
            <img src="${jogo.imagem}" alt="Capa do ${jogo.nome}">
            <h3>${jogo.nome}</h3>
            <p class="genero">${jogo.genero}</p>
            <p class="preco">${precoFormatado}</p>
            <p class="estoque">
                ${jogo.estoque > 0 ? "Estoque: " + jogo.estoque + " unidades" : "Esgotado"}
            </p>
            <button ${jogo.estoque <= 0 ? "disabled" : ""}>
                ${jogo.estoque <= 0 ? "Esgotado" : "Adicionar ao carrinho"}
            </button>
        `;

        card.querySelector("button").addEventListener("click", function() {
            adicionarAoCarrinho(jogo.id);
            renderizarCatalogo();
        });

        container.appendChild(card);
    });
}

// =========================
// CADASTRAR NOVO JOGO (ADMIN)
// =========================

function proximoIdDisponivel() {
    return jogos.length > 0
        ? Math.max(...jogos.map(j => j.id)) + 1
        : 1;
}

function cadastrarJogo(nome, genero, preco, estoque, imagem) {

    if (usuarioLogado !== "admin") {
        alert("Apenas o administrador pode cadastrar jogos.");
        return;
    }

    if (!nome || !genero || isNaN(preco) || isNaN(estoque)) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    const novoJogo = {
        id: proximoIdDisponivel(),
        nome: nome,
        genero: genero,
        preco: preco,
        estoque: estoque,
        imagem: imagem || "img/sem-capa.jpg"
    };

    jogos.push(novoJogo);
    salvarCatalogo();

    alert(nome + " foi cadastrado com sucesso!");

    renderizarTabelaEstoque();
    renderizarCatalogo();
}

const formNovoJogo = document.querySelector("#form-novo-jogo");
const containerFormCadastro = document.querySelector("#form-cadastro-jogo");

if (containerFormCadastro && usuarioLogado === "admin") {
    containerFormCadastro.style.display = "block";
}

if (formNovoJogo) {

    formNovoJogo.addEventListener("submit", function(event) {

        event.preventDefault();

        const nome = document.querySelector("#novo-nome").value;
        const genero = document.querySelector("#novo-genero").value;
        const preco = parseFloat(document.querySelector("#novo-preco").value);
        const estoque = parseInt(document.querySelector("#novo-estoque").value, 10);
        const imagem = document.querySelector("#novo-imagem").value;

        cadastrarJogo(nome, genero, preco, estoque, imagem);

        formNovoJogo.reset();
    });
}

// =========================
// RENDERIZAR TABELA DE ESTOQUE
// =========================

function renderizarTabelaEstoque() {

    const corpo = document.querySelector("#corpo-estoque");

    if (!corpo) {
        return;
    }

    const ehAdmin = usuarioLogado === "admin";

    const colunaAcoes = document.querySelector("#coluna-acoes");
    if (colunaAcoes) {
        colunaAcoes.style.display = ehAdmin ? "table-cell" : "none";
    }

    corpo.innerHTML = "";

    jogos.forEach(jogo => {

        const linha = document.createElement("tr");

        const precoFormatado =
            "R$ " + jogo.preco.toFixed(2).replace(".", ",");

        const status = jogo.estoque > 0 ? "Disponível" : "Esgotado";

        linha.innerHTML = `
            <td>${jogo.nome}</td>
            <td>${jogo.genero}</td>
            <td>${precoFormatado}</td>
            <td>${jogo.estoque}</td>
            <td>${status}</td>
            ${ehAdmin ? `
                <td>
                    <div class="acao-estoque">
                        <input
                            type="number"
                            min="1"
                            value="1"
                            id="quantidade-${jogo.id}"
                            class="input-quantidade-estoque"
                        >
                        <button onclick="aumentarEstoque(${jogo.id})">
                            Adicionar
                        </button>
                    </div>
                </td>
            ` : ""}
        `;

        corpo.appendChild(linha);
    });
}


// =========================
// AUMENTAR ESTOQUE (ADMIN)
// =========================

function aumentarEstoque(id) {

    if (usuarioLogado !== "admin") {
        alert("Apenas o administrador pode alterar o estoque.");
        return;
    }

    const jogo = jogos.find(jogo => jogo.id === id);

    if (!jogo) {
        return;
    }

    const input = document.querySelector("#quantidade-" + id);
    const quantidade = parseInt(input.value, 10);

    if (!quantidade || quantidade <= 0) {
        alert("Digite uma quantidade válida.");
        return;
    }

    jogo.estoque += quantidade;

    salvarCatalogo();

    alert(quantidade + " unidades de " + jogo.nome + " adicionadas ao estoque.");

    renderizarTabelaEstoque();
}

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
    if (!jogo) return;

    const itemExistente = carrinho.find(item => item.id === id);
    const quantidadeAtual = itemExistente ? itemExistente.quantidade : 0;

    if (quantidadeAtual >= jogo.estoque) {
        alert("Quantidade máxima disponível em estoque.");
        return;
    }

    if (itemExistente) {
        itemExistente.quantidade++;
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
// RESUMO NA TELA DE PAGAMENTO
// =========================

function mostrarResumoPagamento() {

    const container = document.querySelector(".itens-resumo-pagamento");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    carrinho.forEach(item => {

        const linha = document.createElement("p");

        linha.innerHTML = `
            ${item.nome} x${item.quantidade}
            <strong>R$ ${(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</strong>
        `;

        container.appendChild(linha);
    });
}


// =========================
// CONFIRMAR PEDIDO (formulário de pagamento)
// =========================

const formPagamento =
    document.querySelector("#form-pagamento");


if (formPagamento) {

    formPagamento.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio.");
                window.location.href = "index.html";
                return;
            }

            const nome = document.querySelector("#nome").value;
            const rua = document.querySelector("#rua").value;
            const numero = document.querySelector("#numero").value;
            const bairro = document.querySelector("#bairro").value;
            const cidade = document.querySelector("#cidade").value;
            const estado = document.querySelector("#estado").value;
            const cep = document.querySelector("#cep").value;

            finalizarCompra();

            alert(
                "Pedido confirmado, " + nome + "!\n\n" +
                "Endereço de entrega:\n" +
                rua + ", " + numero + " - " + bairro + "\n" +
                cidade + " - " + estado + "\n" +
                "CEP: " + cep
            );

            window.location.href = "index.html";
        }
    );

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
        const jogo = jogos.find(jogo => jogo.id === item.id);
        if (jogo) {
            jogo.estoque -= item.quantidade;
        }
    });

    salvarCatalogo()

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
        function() {

            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio.");
                return;
            }

            window.location.href = "pagamento.html";
        }
    );

}


// =========================
// INICIALIZAÇÃO
// =========================

mostrarCarrinho();
atualizarTotal();
renderizarCatalogo()
mostrarResumoPagamento();
renderizarTabelaEstoque();


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

