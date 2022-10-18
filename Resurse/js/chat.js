
socketUrl = "../../";  
       
        //const socket = io(socketUrl,{reconnect: true});  
        socket = io();
        socket.on("mesaj_nou", function(size, nume, mesaj) {  
        
            var chat=document.getElementById("mesaje_chat");
            const d = new Date();
            let hh = d.getHours();
            let mm = d.getMinutes();
            let ss = d.getSeconds();
            chat.innerHTML+=`<p> ${hh}:${mm}:${ss} <u><i>${nume}</i></u> : <span style='font-size:${size}px;'> ${mesaj} </span></p> `;

            //ca sa scrolleze la final
            chat.scrollTop=chat.scrollHeight;

            //schimbarea valorilor din infoRange
            document.getElementById("size").onchange = function(){
            document.getElementById("infoRange").innerHTML = " (" + this.value + ")"
        }
        });
        

        function trimite(){
            var size=document.getElementById("size").value;
            var nume=document.getElementById("nume").value;
            var mesaj=document.getElementById("mesaj").value;

            var http = new XMLHttpRequest();
            var url = '/chat'; 
            var params = `size=${size}&nume=${nume}&mesaj=${mesaj}`;
            http.open('POST', url, true);
            
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            http.send(params);
    } 