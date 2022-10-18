// function format_data_ad(){
//     const month = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
//     const weekday = ["Duminică","Luni","Marti","Miercuri","Joi","Vineri","Sâmbătă"];
//     var data = new Data(document.getElementsByClassName("val-data_adaugare"))
//     var data_n = data.getDay().toString() +"- "+ month[data.getMonth()]+ "-"+data.getFullYear().toString()+" ["+ weedkday[data.getDay()]+"] "
//     return data_n;
// }
// document.getElementsByClassName("val-data_adaugare").innerHTML = format_data_ad();

window.addEventListener("load", function(){
//     //bifare elemente din cosul virtual (localStorage) 
    iduriCos = localStorage.getItem("cos_virtual");
    if(iduriCos){
        iduriCos = iduriCos.split(",");
    }
    else{
        iduriCos = [];
    }
    for (let id_p of iduriCos){
        var ch = document.querySelector(`[value='${id_p}'].select-cos`);
        if(ch){
            ch.checked = true;
        }
    }

//document.querySelectorAll(".select-cos")    -> selectare dupa clasa
 
     //schimbarea valorilor din infoRange
    document.getElementById("inp-pret").onchange = function(){
        document.getElementById("infoRange").innerHTML = " (" + this.value + ")"
    }

    //--------------------------------filtrare-------------------------------------
    document.getElementById("filtrare").onclick=function(){

        var valNume = document.getElementById("inp-nume").value.toLowerCase();
        
        var butoaneRadio = document.getElementsByName("gr_rad");
        for(let rad of butoaneRadio){
            if(rad.checked){
                // cu var va fi văzut in toata functia, cu let doar in for-UL CURENT
                var valCuloare = rad.value;
                break;
            }
        }

        var valPret = document.getElementById("inp-pret").value;

        var valCategorie=document.getElementById("inp-categorie").value.toLowerCase();
	
		var lista = []; //array 
		for(let opt of document.getElementById("i_sel_multiplu").options){
			if(opt.selected)
				lista.push(opt.value);
		}

        //preluarea datelor din checkboxurile bifate
		var checkboxes=document.getElementsByClassName("gr_chck");		
		var lista_checkboxes = []
		for(let ch of checkboxes){
			if(ch.checked)
				lista_checkboxes.push(ch.value)
		}

        //preluare date din datalist
        var valInaltime = document.getElementById("i_datalist").value;

        //verificare input din textarea
        let filtru_cuv_cheie = document.getElementById("i_textarea").value.toUpperCase();

        //alert input invalid
        if(filtru_cuv_cheie.search(" ")!=-1)
            {alert("Introduceti un singur cuvant cheie!"); 
            return;}

        var articole = document.getElementsByClassName("produs");
        
        for( let art of articole){
            art.style.display = "none";

            //getElementsByName returnează o listă
            //[0] primul element din lista
            let numeArt = art.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            //cond1 returneaza true daca numele produsului incepe cu inputul introdus
            let cond1 = numeArt.startsWith(valNume);

            let culoareArt = art.getElementsByClassName("val-culoare")[0].innerHTML.toLowerCase();
            //cond2 returneaza true daca culoarea este "toate" sau se potriveste cu culoarea introdusa(culoareArt)
            let cond2 = (valCuloare=="toate") || (culoareArt == valCuloare);

            //parseIn-->int; parseFloat-->float
            let pretArt = parseFloat(art.getElementsByClassName("val-pret")[0].innerHTML);
            //cond3 este true daca valPret(inputul) <= pretul articolului
            let cond3 = (valPret <= pretArt);

            let categorieArt = art.getElementsByClassName("val-categorie")[0].innerHTML;
            //cond4 va fi true daca valCategorie este "toate" sau se potriveste cu categoria introdusa(categorieArt)
            let cond4 = (valCategorie == "toate") || (categorieArt == valCategorie);

            let modularArt = art.getElementsByClassName("val-modulara")[0].innerHTML;
            //cond5 ---->modular
            let cond5 = 1;
            for (let i of lista_checkboxes){
                var ok = 0;
                if (modularArt == i){
                    ok = 1;
                    break;
                }
                if(ok == 0){
                    cond5 = 0;
                    break;
                }
            }

            let materialArt = art.getElementsByClassName("val-material")[0].innerHTML.trim().toLowerCase();
            // cond6 ---->select multiplu
            let cond6 = 1;
            for (let i of lista){
                var ok = 0;
                for (let j of materialArt)
                    if(i != j){
                        ok = 1;
                        break;
                    }
                if(ok == 0){
                    cond6 = 0;
                    break;
                }
            }

            // let cond7 = (valInaltime >= dimensiuniArt);
            // let InaltimeArt=art.getElementsByClassName("val-dimensiune")[0].innerHTML;
            // var cond7 = (valInaltime >= InaltimeArt);


            let descriere= art.getElementsByClassName("val-descriere")[0].innerHTML;
            descriere = descriere.toUpperCase().split(" "); //sparg descrierea in cuvinte
            let cond8 = 0;  //cond8 -> cuvânt-cheie descriere
            for(let cuv of descriere)
                 if(filtru_cuv_cheie == cuv){
                        cond8 = 1; 
                        break;}

            let conditieFinala = cond1 && cond2 && cond3 && cond4 && cond5 && cond6  && cond8;
            if(conditieFinala)
                art.style.display="block";
        }
    }
 //---------------------------------------------------resetare-----------------------------------------------
    document.getElementById("resetare").onclick = function(){
        var articole = document.getElementsByClassName("produs");
        for(let art of articole){
            art.style.display="block";
        }
        document.getElementById("inp-nume").value="";               //text box denumire produs
        document.getElementById("i_rad4").checked=true;             //radio button; 
        document.getElementById("sel-toate").selected=true;         //select simplu; optiunea "toate"
        document.getElementById("inp-pret").value=0;
        document.getElementById("infoRange").innerHTML="(0)";
        document.getElementById("i_check1").checked=true;       //checkbox
        document.getElementById("i_check2").checked=true;       //checkbox
        document.getElementById("i_sel_multiplu").selected=true;
        document.getElementById("i_datalist").value="";
        // document.getElementsById("i_textarea").value="";
    }  

//-------------------------------------sortare----------------------------------------

function sorteaza(semn){
    var articole = document.getElementsByClassName("produs");
    var v_articole = Array.from(articole)
    v_articole.sort(function(a,b){
        var categ_a = a.getElementsByClassName("val-categorie")[0].innerHTML
        var categ_b = b.getElementsByClassName("val-categorie")[0].innerHTML
        if(categ_a!=categ_b)
            return semn*categ_a.localeCompare(categ_b);
        else{
            //sortare dupa pret
            var pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML)
            var pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML)
            return semn*(pret_a - pret_b);
        }
    })
    for (let art of v_articole){
        art.parentElement.appendChild(art);    //appendChild pune la final
    }
}

    document.getElementById("sortCresc").onclick=function(){
        sorteaza(1);
    }
    document.getElementById("sortDescresc").onclick=function(){
        sorteaza(-1);
    }


//---------------------------calculul pretului minim/maxim al produselor afisate---------------------------------
    window.onkeydown=function(e){
        //verificam ca sunt apasate tastele c si Alt
        if(e.key=='c' && e.altKey){
            if(!document.getElementById("pmax")){
                let max_pret = 0
                let min_pret = 1000000
                var articole=document.getElementsByClassName("produs");
                for(let art of articole){

                    if(art.style.display!="none"){
                        if(parseInt(art.getElementsByClassName("val-pret")[0].innerHTML) > max_pret)
                            max_pret = parseInt(art.getElementsByClassName("val-pret")[0].innerHTML);
                        if(parseInt(art.getElementsByClassName("val-pret")[0].innerHTML) < min_pret)
                            min_pret = parseInt(art.getElementsByClassName("val-pret")[0].innerHTML);
                        }
                }
                var pMax=document.createElement("p1")
                var pMin=document.createElement("p2")
                pMax.id="pmax";
                pMin.id="pmin";
                pMax.innerHTML="<b>Prețul maxim al produselor afișate este : </b>"+max_pret+"<b> lei </b>"+"<br>";
            
                pMin.innerHTML="<b>Prețul minim al produselor afișate este : </b>"+min_pret+"<b> lei </b>";
                var sectiune=document.getElementById("produse");
                sectiune.parentElement.insertBefore(pMax, sectiune);
                sectiune.parentElement.insertBefore(pMin, sectiune);
                setTimeout(function(){

                    let p1=document.getElementById("pmax")
                    let p2=document.getElementById("pmin")
                    if (p1){
                        p1.remove()
                    }
                    if (p2){
                        p2.remove()
                    }

                }, 2000);

            }   
        }
    }


// ----------------------cos virtual-----------------------------
var checkboxuri = document.getElementsByClassName("select-cos");
for(let ch of checkboxuri){
    ch.onchange = function(){
        iduriCos = localStorage.getItem("cos_virtual");
            if(!iduriCos)
                iduriCos = []
            else{
                // iduriCos = "1,2,3,4"
                iduriCos = iduriCos.split(",");
            }
 //hint pentru cantitate "1|20,5|10,3|2" 20 produse cu id ul 1....
        if(this.checked){
            
            iduriCos.push(this.value);
        }
        else{
            var poz = iduriCos.indexOf(this.value)
            if(poz != -1)
                iduriCos.splice(poz, 1);
        } 
        localStorage.setItem("cos_virtual", iduriCos.join(",")) ;
    }
}
});
