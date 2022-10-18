/*window.alert(1);
raspuns=window.prompt("Expresie matematica?","de exemplu, 1+2");
window.alert(eval(raspuns));
ras_utiliz=window.confirm("E corect raspunsul?");
if (ras_utiliz) alert("Da")
else alert("Nu");*/


window.onload=function(){
    var p=document.getElementById("p1");
    p.title="o descriere";
    p.innerHTML="Un paragraf si mai <b>frumos</b>";
    p.style.border="1px solid blue";
    p.style.backgroundColor="pink";
    var buton=document.getElementById("btn");

    buton.onclick=function(){
        var inp= document.getElementById("inp");
        p.innerHTML+=" "+inp.value;
    }
    
    var bfiltru=document.getElementById("filtreaza");
    bfiltru.onclick= function(){
        var val_inp= document.getElementById("inp").value;
        var paragrafe= document.getElementsByClassName("a");
        for (let p of paragrafe){
            p.style.display="none";
            if (p.innerHTML.includes(val_inp))
                p.style.display="block";

        }
    }
}


