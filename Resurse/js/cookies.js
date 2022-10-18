

window.addEventListener("DOMContentLoaded", function(){
    checkBanner();
})

function setCookie(nume, val, timpExp, path = "/"){     //timpExp e dat in milisecunde
    d = new Date();
    d.setTime(d.getTime() + timpExp);
    document.cookie = `${nume}=${val}; expires = ${d.toUTCString()} path = ${path}` //nu dispar cookie urile de mai devreme
}

function getCookie(nume){
    v_cookie = document.cookie.split(";");
    for(let c of v_cookie){
        c.trim()    //sterge spatiile
        if (c.startsWith(nume+"="))
            return c.substring(nume.length + 1);
    }
}
function deleteCookie(nume){
    setCookie(nume, "", 0);
}
//delete all cookies -» merg prin vectorul de cookies si apelam fct de mai sus dupa ce facem trim si split

//functie de verificare a faptului ca exista cookie ul "acceptat banner"
//caz in care ascundem bannerul. Altfel, daca nu exista cookie ul
//afisam bannerul si setam o functie la click prin care adaugam cookiee ul ( care va expira dupa 5 secunde)
function checkBanner(){
    let val_cookie = getCookie("acceptat_banner");
    if(val_cookie){
        document.getElementById("banner").style.display = "none";
    }
    else{
        document.getElementById("banner").style.display = "block";
        document.getElementById("ok_cookies").onclick = function(){
            setCookie("acceptat_banner", "true", 5000);
            document.getElementById("banner").style.display = "none";
        }
    }
}
// function aparitieBanner(){
//     document.getElementById("banner").style.animationName = "aparitie";
//     document.getElementById("banner").style.animationDuration = "5s";
//     document.getElementById("banner").style.animationTimingFunction = "linear";
// }


