import { Chatroom } from "./chat.js";
import { ChatUI } from "./ui.js";

// DOM
let ul = document.getElementById("poruke-ul");
let sendBtn = document.getElementById("send");
let sendInput = document.getElementById("poruka");
let updateInput = document.getElementById("update");
let btnUpdate = document.getElementById("btnUpdate");
let imeSection = document.getElementById("noviUser");
let navUL = document.getElementById("navBtns");
let chatSection = document.getElementById("chat-section");
let prevButton;
let colorBtn = document.getElementById("colorBtn");
let changeColorInput = document.getElementById("color");

// Change background color
colorBtn.addEventListener("click", () => {
  let value = changeColorInput.value;
  setTimeout(() => {
    document.body.style.background = value;
  }, 500);
  localStorage.setItem("color", value);
});

// Loads username
let username;
if (localStorage.user) {
  username = localStorage.getItem("user");
} else {
  username = "anonymous";
  localStorage.setItem("user", username);
}

// Loads room
let room;
if (localStorage.room) {
  room = localStorage.getItem("room");
} else {
  room = "#general";
  localStorage.setItem("room", room);
}

// Sets current room list color and background color on load/reload
onload = (e) => {
  let color = document.getElementById(room);
  prevButton = color;
  let backgroundColor = localStorage.getItem("color");
  document.body.style.background = backgroundColor;
};

// Objects
let chatroom = new Chatroom(room, username);
let chatUI = new ChatUI(ul);

// Listens and makes changes
let makeChange = () => {
  chatroom.getChats((data) => {
    chatUI.templateLI(data);
    chatSection.scrollTo(0, chatSection.scrollHeight);
  });
};
makeChange();

// Inputs chat
sendBtn.addEventListener("click", () => {
  if (sendInput.value.trim().length == 0) return (sendInput.value = "");
  chatroom
    .addChat(sendInput.value)
    .then(() => {
      sendInput.value = "";
      chatSection.scrollTo(0, chatSection.scrollHeight);
    })
    .catch((err) => console.log(err));
});

// Changes username
btnUpdate.addEventListener("click", () => {
  chatroom.username = updateInput.value;
  updateInput.value = "";
  let ime = document.createElement("span");
  ime.textContent = chatroom.username;
  if (ime.textContent == localStorage.user || localStorage.user == "Anonymous")
    return;
  localStorage.setItem("user", chatroom.username);
  ime.id = "user-show";
  ime.textContent = `New User: ${chatroom.username}`;
  imeSection.appendChild(ime);
  window.scrollTo(0, document.body.scrollHeight);
  chatroom.updateUsername(chatroom.username);
  makeChange();
  setTimeout(() => {
    ime.remove();
  }, 3000);
  window.location.reload();
});

// Changes room
navUL.addEventListener("click", (e) => {
  if (e.target.tagName == "BUTTON") {
    let newRoom = e.target.textContent;
    chatroom.updateRoom(newRoom);
    chatUI.clearUL();
    localStorage.setItem("room", newRoom);
    makeChange();
  }
});

// Signify currently clicked button
navUL.addEventListener("click", (e) => {
  if (e.target.tagName == "BUTTON") {
    if (e.target == prevButton) return;
    e.target.style.opacity = "0.6";
    if (prevButton !== null) {
      prevButton.style.opacity = "1";
    }
    prevButton = e.target;
  }
});

// Delete message
chatSection.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") {
    let li = e.target.parentElement;
    let id = li.id;
    let user = li.firstElementChild.textContent.slice(0, -2);
    if (user == localStorage.user) {
      chatroom.chats
        .doc(id)
        .delete()
        .then(() => li.remove())
        .catch((err) => console.log(err));
    } else {
      li.remove();
      if (
        confirm("Do you want to delete the message from another user?") == true
      ) {
        chatroom.chats
          .doc(id)
          .delete()
          .then(() => console.log("message removed"))
          .catch((err) => console.log(err));
      }
      window.location.reload();
    }
  }
});
