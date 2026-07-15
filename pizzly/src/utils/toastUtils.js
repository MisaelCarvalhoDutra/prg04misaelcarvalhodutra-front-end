import { toast } from "react-toastify";

let servidorOffline = false;

//exibe apenas um aviso enquanto o servidor permanecer indisponível.
export function toastServidorOffline() {

  if (servidorOffline) {
    return;
  }

  servidorOffline = true;

  toast.error("Não foi possível conectar ao servidor.");
}

//Informa que o servidor voltou a responder
//Libera um novo toast caso ele caia novamente
export function servidorOnline() {
  servidorOffline = false;
}