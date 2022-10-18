//onload - se executa cand se incarca pagina
window.onload= function(){
    var formular=document.getElementById("form_inreg");
    if(formular){
    // onsubmit- cand se acceseaza butonul de submit
    formular.onsubmit= function(){
            if(document.getElementById("parl").value!=document.getElementById("rparl").value){
                //vom adauga un div ca la suma pt alerta
                alert("Nu ati introdus acelasi sir pentru campurile \"parola\" si \"reintroducere parola\".");
                return false;
            }

            return true;
        }
    }
 }