let nomeUsuario;

let idIntervalStatus, idIntervalMens;

let mensagens = [];

axios.defaults.headers.common['Authorization'] = '8by0RNLlOTsRTYl7Fv9cTbvp';

function erroEnviarMensagem(erro){
    if ( erro.response.status === 400){
        alert('Sua mensagem não foi enviada pois seu usuário foi desconectado, tente conectar novamente!');
        window.location.reload();
    }else{
        alert('Ocorreu um erro interno no servidor, tente novamente mais tarde!');
    }
}

function enviarMensagem(){
    
    const campoMensagem = document.querySelector('.input-mensagem');

    const objMensagem = {
        from: nomeUsuario,
        to: "Todos",
        text: campoMensagem.value,
        type: "message"
    }

    const promise = axios.post('https://mock-api.driven.com.br/api/vm/uol/messages', objMensagem);
    promise.then( buscarMensagens );
    promise.catch( erroEnviarMensagem );

    campoMensagem.value = '';
    campoMensagem.focus();

}

function renderizarMensagens(){

    const elementoUl = document.querySelector('.mensagens-container');
    elementoUl.innerHTML = '';

    let template;

    console.log(mensagens);

    const arrayElementos = mensagens.map( function(mensagem){
        if ( mensagem.type === 'message'){
            return `
                <li class="conversa-publica">
                    <span class="horario">${mensagem.time}</span>
                        <strong>${mensagem.from}</strong>
                            <span> para </span>
                        <strong>${mensagem.to}: </strong>
                    <span>${mensagem.text}</span>
                </li>
            `;
        }else if ( mensagem.type === 'status'){
            return `
                <li class="entrada-saida">
                    <span class="horario">${mensagem.time}</span>
                    <strong>${mensagem.from}</strong>          
                    <span>${mensagem.text}</span>            
                </li>            
            `;
        }
    }); 

    arrayElementos.forEach( function (li){
        elementoUl.innerHTML += li;
    });

    const ultimaMensagem = document.querySelector('.mensagens-container li:last-child');
    ultimaMensagem.scrollIntoView();
}

function sucessoBuscarMensagens(resposta){
    console.log(resposta.data);
    
    mensagens = resposta.data;

    renderizarMensagens();
}

function erroBuscarMensagens(erro){
    console.log(erro);
}

function buscarMensagens(){
    const promise = axios.get('https://mock-api.driven.com.br/api/vm/uol/messages');
    promise.then( sucessoBuscarMensagens );
    promise.catch( erroBuscarMensagens );    
}

/*function sucessoStatus(resposta){
    console.log('Mantendo conectado');
}*/

function erroManterConectado(erro){
    alert('Erro ao permanecer o seu usuário conectado, tente acessar o chat mais tarde');
    clearInterval( idIntervalStatus );
    clearInterval( idIntervalMens );
}

function manterConectado(){
    const promise = axios.post('https://mock-api.driven.com.br/api/vm/uol/status', {name: nomeUsuario});
    //promise.then( sucessoStatus );
    promise.catch( erroManterConectado );
}

function entrarNoChat(){
    
    nomeUsuario = prompt('Digite seu nome');

    while( nomeUsuario === "" || nomeUsuario === undefined || nomeUsuario === null){
        alert('Nome de usuário inválido! Digite novamente um nome de usuário');
        nomeUsuario = prompt('Digite seu nome');
    }

    const objUsuario = {
        name: nomeUsuario
      };

    const promise = axios.post('https://mock-api.driven.com.br/api/vm/uol/participants', objUsuario);
    
    promise.then( resposta => {
        idIntervalStatus = setInterval( manterConectado , 5000);
        idIntervalMens = setInterval( buscarMensagens, 3000);
    });

    promise.catch( function(erro){
        if ( erro.response.status === 400){
            alert('Já existe um usuário online com esse nome, tente outro nome!');
            window.location.reload();
        }else{
            alert('Ocorreu um erro interno no servidor, tente novamente mais tarde!');
        }
    }); //HOF

}
entrarNoChat();

