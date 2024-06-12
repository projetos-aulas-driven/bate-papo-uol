const MY_UUID = "8cd3fdc8-500a-4436-a113-570253dc7acd";
const BACK_END_API = "https://mock-api.driven.com.br/api/v6/uol"; // uuid sempre no final
const TIME_TO_PING_SERVER = 5000;
const TIME_TO_SYNC_MESSAGES = 3000;

let username;
let idIntervalPing;
let idIntervalSync;

let visibility = "message"; // "private_message"
let recipient = "Todos";

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
    renderMessages(messages);
  });
  promise.catch(err => {
    console.log(err.response.data);
    alert("Ocorreu um erro ao sincronizar com o servidor!");
  });
}

function renderMessages(messages) {
  const messagesElement = document.querySelector(".messages-container");
  messagesElement.innerHTML = "";

  messages.forEach(message => {
    const { type, time, from, to, text } = message;
    if (type === 'message') {
      messagesElement.innerHTML += `
            <li class="conversa-publica">
                <span class="horario">${time}</span>
                    <strong>${from}</strong>
                        <span> para </span>
                    <strong>${to}: </strong>
                <span>${text}</span>
            </li>
        `;
    } else if (type === 'status') {
      messagesElement.innerHTML += `
            <li class="entrada-saida">
                <span class="horario">${time}</span>
                <strong>${from}</strong>          
                <span>${text}</span>            
            </li>            
        `;
    } else if (type === "private_message") {
      if (to === username || to === "Todos" || from === username) {
        messagesElement.innerHTML += `
              <li class="conversa-privada">
                  <span class="horario">${time}</span>
                      <strong>${from}</strong>
                          <span> para </span>
                      <strong>${to}: </strong>
                  <span>${text}</span>
              </li>
          `;
      }
    }
  });

  const lastMessage = document.querySelector('.messages-container li:last-child');
  lastMessage.scrollIntoView();
}

function getParticipants() {
  const promise = axios.get(`${BACK_END_API}/participants/${MY_UUID}`);
  promise.then(({ data: participants }) => {
    const contactsDiv = document.querySelector(".contatos");

    contactsDiv.innerHTML =
      `<li onclick="changeRecipient(this)" class="selecionado">
        <ion-icon name="people-sharp"></ion-icon> 
        Todos 
        <ion-icon class="check" name="checkmark-outline">
      </li>`;
    participants.map(participant => {
      return `
        <li onclick="changeRecipient(this)">
          <ion-icon name="person-circle"></ion-icon> 
          ${participant.name}
          <ion-icon class="check" name="checkmark-outline">
        </li>`
    }).forEach(li => {
      contactsDiv.innerHTML += li;
    });
  });
  promise.catch(err => {
    console.log(err.response.data);
    alert("Ocorreu um erro ao sincronizar com o servidor!");
  });
}

function sendMessage() {
  const messageInputText = document.querySelector(".message-text");

  const message = {
    from: username,
    to: recipient,
    text: messageInputText.value,
    type: visibility
  };

  console.log(message);

  const promise = axios.post(`${BACK_END_API}/messages/${MY_UUID}`, message);
  promise.then(response => {
    syncMessages();
    messageInputText.value = "";
  });
  promise.catch(err => {
    if (err.response.status === 400) {
      alert('Sua mensagem não foi enviada pois seu usuário foi desconectado, tente conectar novamente!');
      window.location.reload();
    } else {
      alert('Ocorreu um erro interno no servidor, tente novamente mais tarde!');
    }
  });

}

function openSideMenu() {
  toogleMenu();
  getParticipants();

  // reseta a mensagem do footer
  recipient = "Todos";
  changeFooterMessageStatus();
}

function toogleMenu() {
  document.querySelector(".menu-fundo").classList.toggle("escondido");
  document.querySelector(".menu").classList.toggle("escondido");
}

function changeVisibility(element) {
  const previousVisibility = document.querySelector(".visibilidades .selecionado");
  if (previousVisibility !== null) {
    previousVisibility.classList.remove("selecionado");
  }

  const visibilityText = element.innerText;
  visibilityText === "Público" ?
    visibility = "message" : visibility = "private_message";

  element.classList.add("selecionado");
  changeFooterMessageStatus();
}

function changeRecipient(element) {
  const previousVisibility = document.querySelector(".contatos .selecionado");
  if (previousVisibility !== null) {
    previousVisibility.classList.remove("selecionado");
  }

  recipient = element.innerText;

  element.classList.add("selecionado");
  changeFooterMessageStatus();
}

function changeFooterMessageStatus() {
  const messageStatus = document.querySelector(".message-input .enviando");
  messageStatus.innerText =
    `Enviando para ${recipient} (${visibility === "message" ? "público" : "reservadamente"})`;
}

enterChat();