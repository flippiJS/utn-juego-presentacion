class Usuario {
  constructor(uid, nombre, posX = 0, posY = 0, conectado = true, plataforma = "Unity") {
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
  DoSomethingFirebase();
  panel.style.display = "none";
}

async function DoSomethingFirebase() {
  if (input.value === "") {
    return;
  }
  panel.style.display = "none";
  docRef = db.collection("usuarios").doc(input.value);
  text.textContent = input.value;
  usr = new Usuario(input.value, input.value, 0, 0);
  await docRef.set(usr.getDictionary());

  const query = db.collection("usuarios");
  const unsubscribe = query.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const nuevoUsuario = change.doc.data();
        if (usr.uid !== nuevoUsuario.uid) {
          console.log(nuevoUsuario.toString());
          let esta = false;
          for (let i = 0; i < usuarios.length; i++) {
            if (usuarios[i].id === nuevoUsuario.uid) {
              esta = true;
              if (nuevoUsuario.conectado) {
                usuarios[i].style.left = nuevoUsuario.posX + "px";
                usuarios[i].style.top = nuevoUsuario.posY + "px";
              } else {
                usuarios.splice(i, 1);
                document.getElementById(nuevoUsuario.uid).remove();
              }
            }
          }
          if (!esta) {
            if (!nuevoUsuario.conectado) {
              return;
            }
            let go = plantillaUsuario.cloneNode(true);
            go.id = nuevoUsuario.uid;
            go.style.position = "absolute";
            go.style.left = nuevoUsuario.posX + "px";
            go.style.top = nuevoUsuario.posY + "px";
            usuarios.push(go);
            document.body.appendChild(go);
          }
        }
      }
      if (change.type === "modified") {
        const usuarioModificado = change.doc.data();
        usuarios = usuarios.map((usuario) =>
          usuario.id === usuarioModificado.uid ? usuarioModificado : usuario
        );
      }
      if (change.type === "removed") {
        const usuarioEliminado = change.doc.data();
        usuarios = usuarios.filter((usuario) =>
          usuario.id !== usuarioEliminado.uid
        );
      }
    });
  });
}

function Move(direccion) {
  switch (direccion) {
    case Direccion.Arriba:
      usr.posY += 0.5;
      break;
    case Direccion.Derecha:
      usr.posX += 0.5;
      break;
    case Direccion.Abajo:
      usr.posY -= 0.5;
      break;
    case Direccion.Izquierda:
      usr.posX -= 0.5;
      break;
  }
  docRef.update(usr.getDictionary());
  character.style.left = usr.posX + "px";
  character.style.top = usr.posY + "px";
}

// Resto del código

