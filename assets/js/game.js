class Usuario {
  constructor(uid, nombre, posX = 0, posY = 0, conectado = true, plataforma = "Web") {
    this.uid = uid;
    this.nombre = nombre;
    this.posX = posX;
    this.posY = posY;
    this.conectado = conectado;
    this.plataforma = plataforma;
  }

  getDictionary() {
    return {
      uid: this.uid,
      nombre: this.nombre,
      posX: this.posX,
      posY: this.posY,
      conectado: this.conectado,
      plataforma: this.plataforma
    };
  }
  /* 
      constructor(diccionario) {
          this.uid = diccionario.uid;
          this.nombre = diccionario.nombre;
          this.posX = diccionario.posX;
          this.posY = diccionario.posY;
          this.conectado = diccionario.conectado;
          this.plataforma = diccionario.plataforma;
      } */

  toString() {
    return this.uid + " - " + this.nombre;
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyCWT_-Yt3Ahj_qSYq8rcRzwwC9lNpqa-BY",
  authDomain: "utn-juego-presentacion-e176a.firebaseapp.com",
  projectId: "utn-juego-presentacion-e176a",
  storageBucket: "utn-juego-presentacion-e176a.appspot.com",
  messagingSenderId: "992063601641",
  appId: "1:992063601641:web:79d5cbfff23a2e871da978"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

let character = document.getElementById('character');
let plantillaUsuario = document.getElementById('plantillaUsuario');
let control = document.getElementById('control');
let usuarios = [];

let panel = document.getElementById('panel');
let input = document.getElementById('input');
let text = document.getElementById('text');
let usr;
let docRef;

function Awake() {
  usuarios = [];
}

function Entrar() {
  Iniciar();
}

async function Iniciar() {
  if (input.value === "") {
    return;
  }
  panel.style.display = "none";
  InitPad();
  docRef = db.collection("usuarios").doc(input.value);
  text.textContent = input.value;
  //Date.now()
  usr = new Usuario(input.value, input.value, 12, 20);
  character.style.left = usr.posX + "em";
  character.style.top = usr.posY + "em";
  await docRef.set(usr.getDictionary());

  const query = db.collection("usuarios");
  const unsubscribe = query.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        ManejarNuevoUsuario(change.doc.data());
      }
      if (change.type === "modified") {
        ManejarUsuarioModificado(change.doc.data());
      }
      if (change.type === "removed") {
        const usuarioEliminado = change.doc.data();
        usuarios = usuarios.filter((usuario) =>
          usuario.uid !== usuarioEliminado.uid
        );
        console.log(usuarioEliminado);
        ReproducirSonido(2);
      }
    });
  });
}

function InitPad() {
  control.style.display = "block";
  character.style.display = "block";
  control.addEventListener("click", function (event) {
    var rect = this.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    if (x >= 50 && x <= 100 && y >= 0 && y <= 50) {
      // Acción para la flecha hacia arriba
      console.log("Haz clic en la flecha hacia arriba");
      Move('up');
    } else if (x >= 0 && x <= 50 && y >= 50 && y <= 100) {
      // Acción para la flecha hacia la izquierda
      console.log("Haz clic en la flecha hacia la izquierda");
      Move('left');
    } else if (x >= 100 && x <= 150 && y >= 50 && y <= 100) {
      // Acción para la flecha hacia la derecha
      console.log("Haz clic en la flecha hacia la derecha");
      Move('right');
    } else if (x >= 50 && x <= 100 && y >= 100 && y <= 164) {
      // Acción para la flecha hacia abajo
      console.log("Haz clic en la flecha hacia abajo");
      Move('down');
    }
  });
}

function Move(direccion) {
  switch (direccion) {
    case 'up':
      if (usr.posY > 0) {
        usr.posY -= 0.5;
      }
      break;
    case 'right':
      if (usr.posX < 22) {
        usr.posX += 0.5;
      }
      break;
    case 'down':
      if (usr.posY < 50) {
        usr.posY += 0.5;
      }
      break;
    case 'left':
      if (usr.posX > 0) {
        usr.posX -= 0.5;
      }
      break;
  }
  docRef.update(usr.getDictionary());
  character.style.left = usr.posX + "em";
  character.style.top = usr.posY + "em";
}

function ReproducirSonido(key) {
  let url = '../assets/sounds/';
  switch (key) {
    case 1:
      url = url + 'connected.mp3';
      break;
    case 2:
      url = url + 'disconnected.mp3';
      break;
    default:
      break;
  }
  const audio = new Audio(url);
  audio.play();
}

// Función para desconectar al usuario antes de cerrar la ventana o cambiar de página
function Desconectar() {
  if (usr) {
    usr.conectado = false;
    docRef.update(usr.getDictionary());
    console.log("Usuario desconectado " + usr.uid);
  }
}

// Agregar un event listener para el evento beforeunload
window.addEventListener('beforeunload', Desconectar);

// ... (código anterior)

// Función para manejar un nuevo usuario añadido
function ManejarNuevoUsuario(nuevoUsuario) {
  if (usr.uid !== nuevoUsuario.uid) {
    console.log(nuevoUsuario);
    let esta = false;
    for (let i = 0; i < usuarios.length; i++) {
      if (usuarios[i].uid === nuevoUsuario.uid) {
        esta = true;
        if (nuevoUsuario.conectado) {
          usuarios[i].style.left = nuevoUsuario.posX + "em";
          usuarios[i].style.top = nuevoUsuario.posY + "em";
        } else {
          usuarios.splice(i, 1);
          document.getElementById(nuevoUsuario.uid).remove();
        }
      }
    }
    if (!esta && nuevoUsuario.conectado) {
      let go = plantillaUsuario.cloneNode(true);
      go.id = nuevoUsuario.uid;
      go.style.position = "absolute";
      go.style.display = "block";
      go.style.left = nuevoUsuario.posX + "em";
      go.style.top = nuevoUsuario.posY + "em";
      let txt = text.cloneNode(true);
      txt.textContent = nuevoUsuario.nombre;
      usuarios.push(go);
      go.appendChild(txt);
      document.body.appendChild(go);
    }
    ReproducirSonido(1);
  }
}

// Función para manejar un usuario modificado
function ManejarUsuarioModificado(usuarioModificado) {
  if (usr.uid !== usuarioModificado.uid) {
    if (usuarioModificado.conectado) {
      usuarios = usuarios.map((usuario) =>
        usuario.uid === usuarioModificado.uid ? usuarioModificado : usuario
      );
      const nuevaPosX = usuarioModificado.posX;
      const nuevaPosY = usuarioModificado.posY;
      const elementoMovible = document.getElementById(usuarioModificado.uid);
      if (elementoMovible) {
        elementoMovible.style.left = nuevaPosX + "em";
        elementoMovible.style.top = nuevaPosY + "em";
      } else {
        // Si no encontramos el elemento en el DOM, lo creamos y añadimos
        let go = plantillaUsuario.cloneNode(true);
        go.id = usuarioModificado.uid;
        go.style.position = "absolute";
        go.style.display = "block";
        go.style.left = nuevaPosX + "em";
        go.style.top = nuevaPosY + "em";
        let txt = text.cloneNode(true);
        txt.textContent = usuarioModificado.nombre;
        usuarios.push(go);
        go.appendChild(txt);
        document.body.appendChild(go);
      }
    } else {
      const elementoRemovido = document.getElementById(usuarioModificado.uid);
      if (elementoRemovido) {
        elementoRemovido.remove();
        ReproducirSonido(2);
      }
    }
  }
}

// ...

// En el callback de onSnapshot



// ... (código posterior)
