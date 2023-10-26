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
        const mensaje = new Mensaje(this.usuario.Uid, this.usuario.Nombre, this.input.value);
        docRef.set(mensaje.getDictionary());
        this.input.value = "";
    }

    initiateMessageService(usr) {
        this.instance = firebase.firestore();
        this.usuario = usr;
        const query = this.instance.collection("mensajes").orderBy("fecha");
        query.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const nuevoMensaje = new Mensaje(change.doc.data());

                let esta = false;
                for (let i = 0; i < this.mensajes.length; i++) {
                    if (this.mensajes[i].name === change.doc.id) {
                        esta = true;
                    }
                }
                if (!esta) {
                    const go = this.plantillaMensaje.cloneNode(true);
                    this.messagesContainer.appendChild(go);
                    go.querySelector(".message").textContent = nuevoMensaje.MensajeP;
                    if (nuevoMensaje.SenderId === this.usuario.Uid) {
                        go.querySelector(".message-container").style.textAlign = "right";
                        go.querySelector(".message-bubble").style.backgroundImage = `url(${this.messageRight})`;
                    } else {
                        go.querySelector(".message-container").style.textAlign = "left";
                        go.querySelector(".message-bubble").style.backgroundImage = `url(${this.messageLeft})`;
                    }
                    go.id = change.doc.id;
                    this.mensajes.push(go);
                }
            });

            if (this.mensajes.length > 8) {
               // this.messagesContainer.style.maxHeight = `${(this.mensajes.length - 8) * 150}px`;
            }
        });
    }
}

class Mensaje {
    constructor(doc) {
        this.senderID = doc.uid || '';
        this.nombre = doc.nombre || '';
        this.mensaje = doc.mensaje || '';
        this.fecha = doc.fecha || Date.now();
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
