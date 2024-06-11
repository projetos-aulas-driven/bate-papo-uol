const MY_UUID = "8cd3fdc8-500a-4436-a113-570253dc7acd";
const BACK_END_API = "https://mock-api.driven.com.br/api/v6/uol"; // uuid sempre no final
const TIME_TO_PING_SERVER = 5000;
const TIME_TO_SYNC_MESSAGES = 3000;

let username;
let idIntervalPing;
let idIntervalSync;

function enterChat() {
  enterUsername();
  const promise = axios.post(`${BACK_END_API}/participants/${MY_UUID}`, { name: username });
  promise.then(data => {
    console.log("Você está connectado ao servidor!")
    idIntervalPing = setInterval(pingServer, TIME_TO_PING_SERVER);
    idIntervalSync = setInterval(syncMessages, TIME_TO_SYNC_MESSAGES);
  })
  promise.catch(err => {
    const status = err.response.status;
    if (status === 400) {
      alert('Já existe um usuário online com esse nome, tente outro nome!');
      window.location.reload();
    } else {
      alert('Ocorreu um erro interno no servidor, tente novamente mais tarde!');
    }
  });
}

function enterUsername() {
  username = prompt("Qual é o seu lindo(a) nome?");
  if (!username) {
    alert('Nome de usuário inválido! Digite novamente um nome de usuário');
    enterUsername();
  }
}

function pingServer() {
  const promise = axios.post(`${BACK_END_API}/status/${MY_UUID}`, { name: username });
  promise.then(data => console.log("Servidor sincronizado."));
  promise.catch(err => {
    console.log(err.response.data);
    alert("Ocorreu um erro ao sincronizar com o servidor!");
  });
}

function syncMessages() {
  const promise = axios.get(`${BACK_END_API}/messages/${MY_UUID}`);
  promise.then(({ data: messages }) => {
    console.log(messages);
  });
  promise.catch(err => {
    console.log(err.response.data);
    alert("Ocorreu um erro ao sincronizar com o servidor!");
  });
}

function getParticipants() {
  const promise = axios.get(`${BACK_END_API}/participants/${MY_UUID}`);
  promise.then(({ data: participants }) => {
    console.log(participants);
  });
  promise.catch(err => {
    console.log(err.response.data);
    alert("Ocorreu um erro ao sincronizar com o servidor!");
  });
}

function sendMessage() {
  const message = {
    from: username,
    to: "nome do destinatário (Todos se não for um específico)",
    text: "mensagem digitada",
    type: "message" // ou "private_message"
  };

  const promise = axios.post(`${BACK_END_API}/messages/${MY_UUID}`, message);
  promise.then(response => syncMessages());
  promise.catch(err => {
    if (err.response.status === 400) {
      alert('Sua mensagem não foi enviada pois seu usuário foi desconectado, tente conectar novamente!');
      window.location.reload();
    } else {
      alert('Ocorreu um erro interno no servidor, tente novamente mais tarde!');
    }
  });

}

enterChat();