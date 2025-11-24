const cardContainer = document.querySelector('.card-conteiner');
const caixaBusca = document.getElementById('caixa-busca');
const botaoBusca = document.getElementById('botao-busca');

let habitos = [];

async function carregarHabitos() {
    try {
        const response = await fetch('data.json');
        habitos = await response.json();
        exibirCards(habitos);
    } catch (error) {
        console.error('Erro ao carregar os hábitos:', error);
    }
}

function exibirCards(habitosParaExibir) {
    cardContainer.innerHTML = '';
    habitosParaExibir.forEach((habito, index) => {
        const card = document.createElement('article');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${habito.imagem}" alt="Imagem representando ${habito.nome}">
            <div class="card-content">
                <h2>${habito.nome}</h2>
                <p>${habito.descricão}</p>
                <a href="${habito.link}" target="_blank">Saiba mais</a>
                <div class="quiz-container">
                    <button class="quiz-btn">Faça sua autoavaliação</button>
                    <div class="quiz-content" style="display: none;"></div>
                </div>
            </div>
        `;
        cardContainer.appendChild(card);

        const quizBtn = card.querySelector('.quiz-btn');
        const quizContent = card.querySelector('.quiz-content');

        quizBtn.addEventListener('click', () => {
            quizBtn.style.display = 'none';
            quizContent.style.display = 'block';
            montarQuiz(quizContent, habito.quiz, index);
        });
    });
}

function montarQuiz(container, quizData, habitoIndex) {
    let quizHTML = `<form class="quiz-form">`;
    quizData.forEach((pergunta, perguntaIndex) => {
        quizHTML += `
            <fieldset>
                <legend>${perguntaIndex + 1}. ${pergunta.pergunta}</legend>
                ${pergunta.opcoes.map((opcao, opcaoIndex) => `
                    <div>
                        <input type="radio" id="habito${habitoIndex}-pergunta${perguntaIndex}-opcao${opcaoIndex}" name="pergunta${perguntaIndex}" value="${opcaoIndex}" required>
                        <label for="habito${habitoIndex}-pergunta${perguntaIndex}-opcao${opcaoIndex}">${opcao.texto}</label>
                    </div>
                `).join('')}
            </fieldset>
        `;
    });
    quizHTML += `<button type="submit" class="submit-quiz-btn">Ver minha avaliação</button></form>`;
    quizHTML += `<div class="quiz-feedback"></div>`;
    container.innerHTML = quizHTML;

    const quizForm = container.querySelector('.quiz-form');
    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        avaliarQuiz(quizForm, quizData);
    });
}

function avaliarQuiz(form, quizData) {
    const formData = new FormData(form);
    let pontuacaoUsuario = 0;
    let pontuacaoMaxima = 0;

    quizData.forEach((pergunta, index) => {
        const respostaUsuario = formData.get(`pergunta${index}`);
        if (respostaUsuario !== null) {
            const indexResposta = parseInt(respostaUsuario);
            pontuacaoUsuario += pergunta.opcoes[indexResposta].pontos;
        }
        // Calcula a pontuação máxima possível para este quiz
        pontuacaoMaxima += Math.max(...pergunta.opcoes.map(opt => opt.pontos));
    });

    const feedbackContainer = form.nextElementSibling;
    exibirFeedback(feedbackContainer, pontuacaoUsuario, pontuacaoMaxima);
    form.style.display = 'none'; // Esconde o formulário após finalizar
}

function exibirFeedback(container, pontuacaoUsuario, pontuacaoMaxima) {
    let mensagem = '';
    // Usamos 0.1 para evitar divisão por zero se não houver perguntas
    const porcentagem = (pontuacaoUsuario / (pontuacaoMaxima || 0.1)) * 100;

    if (porcentagem >= 80) {
        mensagem = `<h3>Parabéns! Seus hábitos são excelentes.</h3><p>Você está no caminho certo, continue assim!</p>`;
    } else if (porcentagem >= 40) {
        mensagem = `<h3>Você está no caminho!</h3><p>Continue se dedicando para aprimorar ainda mais esse hábito. Use o link "Saiba mais" para pegar algumas dicas.</p>`;
    } else {
        mensagem = `<h3>Parece que você precisa melhorar esse hábito.</h3><p>Não se preocupe, o primeiro passo é o reconhecimento. Explore o conteúdo no link "Saiba mais" para descobrir como começar a transformar essa área da sua vida.</p>`;
    }
    container.innerHTML = mensagem;
}

function buscarHabito() {
    const termoBusca = caixaBusca.value.toLowerCase();
    const habitosFiltrados = habitos.filter(habito =>
        habito.nome.toLowerCase().includes(termoBusca) ||
        habito.descricão.toLowerCase().includes(termoBusca)
    );
    exibirCards(habitosFiltrados);
}

botaoBusca.addEventListener('click', buscarHabito);
caixaBusca.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        buscarHabito();
    }
});

carregarHabitos();