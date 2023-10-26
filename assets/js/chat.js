class MessageManager {
    constructor() {
        this.plantillaMensaje = document.getElementById('message');
        this.messagesContainer = document.getElementById('messages-container');
        this.messageLeft = 'assets/sprites/text-box-left.png';
        this.messageRight = 'assets/sprites/text-box-right.png';
        this.mensajes = [];
        this.input = document.getElementById('message-input');
        this.instance = null;
        this.usuario = null;
    }

    onMessageSend() {
        if (this.input.value === "") {
            return;
        }
        const docRef = this.instance.collection("mensajes").doc();
        const mensaje = new Mensaje(this.usuario.uid, this.usuario.nombre, this.input.value);
        docRef.set(mensaje.getDictionary());
        this.input.value = "";
    }

    initiateMessageService(usr) {
        this.instance = firebase.firestore();
        this.usuario = usr;
        const query = this.instance.collection("mensajes").orderBy("fecha", 'desc');
        query.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const msj = change.doc.data();
                const nuevoMensaje = new Mensaje(msj.senderID, msj.nombre, msj.mensaje);

                let esta = false;
                for (let i = 0; i < this.mensajes.length; i++) {
                    if (this.mensajes[i].name === change.doc.id) {
                        esta = true;
                    }
                }
                if (!esta) {
                    const go = this.plantillaMensaje.cloneNode(true);
                    this.messagesContainer.appendChild(go);

                    // Crear un nuevo elemento div para mostrar el nombre del usuario
                    const userNameDiv = document.createElement('div');
                    userNameDiv.classList.add('message-user');
                    userNameDiv.textContent = nuevoMensaje.Nombre;

                    // Crear un nuevo elemento div para mostrar el nombre del usuario
                    const userTextDiv = document.createElement('div');
                    userTextDiv.classList.add('message-txt');
                    userTextDiv.textContent = nuevoMensaje.MensajeP;

                    // Añadir el nombre del usuario al contenedor de mensajes
                    go.querySelector(".message").appendChild(userNameDiv);
                    go.querySelector(".message").appendChild(userTextDiv);


                    if (nuevoMensaje.SenderId === this.usuario.uid) {
                        go.querySelector(".message-container").classList.add("end");
                    } else {
                        go.querySelector(".message-container").classList.add("start");
                    }
                    go.id = change.doc.id;
                    this.mensajes.push(go);
                    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
                }
            });
        });
    }
}

class Mensaje {
    constructor(uid, nombre, mensaje) {
        this.senderID = uid;
        this.nombre = nombre;
        this.mensaje = mensaje;
        this.fecha = Date.now();
    }

    get SenderId() {
        return this.senderID;
    }

    get MensajeP() {
        return this.mensaje;
    }

    get Nombre() {
        return this.nombre;
    }

    getDictionary() {
        return {
            senderID: this.senderID,
            nombre: this.nombre,
            mensaje: this.mensaje,
            fecha: this.fecha,
        };
    }

    toString() {
        return `${this.senderID} - ${this.nombre} - ${this.mensaje}`;
    }
}
