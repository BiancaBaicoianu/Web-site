window.addEventListener("load", function(){
 //cu addEventListener pot avea mai multe functii pe acelasi eveniment 
//(comparativ cu window.onload cand se suprascriu)
    let tema = localStorage.getItem("tema");

    if(tema == "dark") //adaug tema dark 
        document.body.classList.add("dark");
    else 
        document.body.classList.add("light");

    document.getElementById("schimbare-tema").onclick=function(){
        document.body.classList.toggle("dark"); //toggle => daca nu exista, il adauga 
        document.body.classList.toggle("light"); 

        if(document.body.classList.contains("dark"))
            localStorage.setItem("tema", "dark");
        else
            localStorage.setItem("tema", "light");
        
    }
});
// window.addEventListener("load", function(){


//     document.getElementById("schimbare-tema").onclick=function(){
//         var tema=localStorage.getItem("tema");
//         if(tema)
//             localStorage.removeItem("tema");
//         else
//             localStorage.setItem("tema","dark");

//         document.body.classList.toggle("dark");
        
//     }
// });