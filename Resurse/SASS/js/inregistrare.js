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
            if(document.getElementById("inp-username").value==""){
                //vom adauga un div ca la suma pt alerta
                alert("Username necompletat");
                return false;
            }
            if(document.getElementById("parl").value==""){
                //vom adauga un div ca la suma pt alerta
                alert("Introduceți parola");
                return false;
            }
            if(document.getElementById("rparl").value==""){
                //vom adauga un div ca la suma pt alerta
                alert("Reintroduceți parola");
                return false;
            }
            if(document.getElementById("inp-email").value==""){
                //vom adauga un div ca la suma pt alerta
                alert("Reintroduceți parola");
                return false;
            }
            if(document.getElementById("inp-username").value.match(new RegExp("^[A-Za-z0-9]+$"))){
                //vom adauga un div ca la suma pt alerta
                alert("Username nu conține caracterele cerute ");
                return false;
            }
            return true;
        }
    }
 }

