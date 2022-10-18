const express= require("express");
const fs=require("fs");
const sharp=require("sharp");
const {Client}=require("pg");
const ejs=require("ejs");
const sass=require("sass");
const res = require("express/lib/response");
const { nextTick } = require("process");
const formidable= require('formidable');
const crypto= require('crypto');
const session= require('express-session');
const nodemailer = require('nodemailer');
const path = require('path');
const request=require('request');
const xmljs = require('xml-js');
const html_to_pdf = require('html-pdf-node');
const juice = require('juice');
const QRCode = require('qrcode');
const mongodb = require('mongodb');
const iplocate = require('node-iplocate');
var url = "mongodb://localhost:27017";

const helmet = require('helmet');

var app = express();

// initializari socket.io
const http = require('http');
const socket = require('socket.io');
const server = new http.createServer(app);  
var  io = socket(server)
io = io.listen(server);//asculta pe acelasi port ca si serverul


var client=new Client({user: "bianca", password: "bianca17", database: "postgres", host: "localhost", port: 5432});
client.connect();


const obGlobal={
    obImagini:null, 
    obErori:null, 
    emailServer:"designdobal@gmail.com", 
    portAplicatie:8080, 
    sirAlphaNum:"", 
    protocol:null, 
    numeDomeniu:null,
    clientMongo:mongodb.MongoClient,
    bdMongo:null
};

obGlobal.clientMongo.connect(url, function(err, bd){
    if(err)
        console.log(err);
    else{
        obGlobal.bdMongo = bd.db("Proiect_web");
    }
});

foldere=["temp", "poze_uploadate"];
for (let folder of foldere){
    let calefolder = path.join(__dirname, folder);
    if (!fs.existsSync(calefolder)){
        fs.mkdirSync(calefolder);
    }
}

app.use(helmet.frameguard()); //pentru a nu se deschide pag site-ului in frame-uri
app.use(["/produse_cos","/cumpara"],express.json({limit:'2mb'}));
app.use(["/contact"], express.urlencoded({extended:true}));

app.use(session({
//se creaza prop session a requestului, pot folosi req.session
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune

    resave: true,

    saveUninitialized: false

  }));

  async function trimiteMail(email, subiect, mesajText, mesajHtml, atasamente=[]){
    var transp= nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth:{//date login
            user:obGlobal.emailServer,
            pass:"yarwtarvhrwrufgs"
        },
        tls:{
            rejectUnauthorized:false
        }
    });

    //genereaza html
    await transp.sendMail({
        from:obGlobal.emailServer,
        to:email,
        subject:subiect,//"Te-ai inregistrat cu succes",
        text:mesajText, //"Username-ul tau este "+username
        html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
        attachments: atasamente
    })
    console.log("trimis mail");
}

async function trimiteMailParola(email, subiect, mesajText, mesajHtml, atasamente=[])
{
    var transp= nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth:{//date login 
            user:obGlobal.emailServer,
            pass:"yarwtarvhrwrufgs"
        },
        tls:{
            rejectUnauthorized:false
        }
    });
    //genereaza html
    await transp.sendMail({
        from:obGlobal.emailServer,
        to:email,
        subject:subiect,//"Te-ai inregistrat cu succes",
        text:mesajText, //"Username-ul tau este "+username
        html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
        attachments: atasamente
    })
    console.log("trimis mail");

}


if(process.env.SITE_ONLINE){
    obGlobal.protocol="https://";
    obGlobal.numeDomeniu="boiling-bayou-33265.herokuapp.com";
    var client= new Client({
        database:"d2e05hh0qjlq26",
        user:"akcuizwcqbwcpk",
        password:"1b03367eefc825c4238f8420778bd299feeea48813be5ff9837e33baeacc472b",
        host:"ec2-34-194-158-176.compute-1.amazonaws.com",
        port:5432,
        ssl: {
            rejectUnauthorized: false
          }
    });
}

else{
    obGlobal.protocol="http://";
    obGlobal.numeDomeniu="localhost:"+obGlobal.portAplicatie
    var client= new Client({database:"postgres",
        user:"bianca",
        password:"bianca17",
        host:"localhost",
        port:5432});

}

client.connect()

app.set("view engine","ejs");

app.use("/Resurse", express.static(__dirname+"/Resurse"))
app.use("/poze_uploadate", express.static(__dirname+"/poze_uploadate"))

app.use("/*", function(req, res, next){
    res.locals.propGenerala="Ceva care se afiseaza pe toate pag";  //select
    res.locals.utilizator=req.session.utilizator;
    res.locals.mesajLogin=req.session.mesajLogin;
    req.session.mesajLogin=null;
    next();
});

function getIp(req){//pentru Heroku
    var ip = req.headers["x-forwarded-for"];//ip-ul userului pentru care este forwardat mesajul
    if (ip){
        let vect=ip.split(",");
        return vect[vect.length-1];
    }
    else if (req.ip){
        return req.ip;
    }
    else{
     return req.connection.remoteAddress;
    }
}

app.get("/*", function(req, res, next){
    let id_utiliz=req.session.utilizator ? req.session.utilizator.id : null;
    var queryInsert = `insert into accesari(ip, user_id, pagina) values('${getIp(req)}', ${id_utiliz}, '${req.url}')`;
    client.query(queryInsert, function(err, rezQuery){
        if(err) {
            console.log(err);
        }
    });
    next();
});


//req- obiect de tip request
//res- raspunsul

app.get(["/", "/index", "/home"], function(req, res){
    console.log(obImagini);
    client.query("select * from mobila", function(err, rezQuery){
        // if(err)
        //     console.log(err);
        // else
            // console.log(rezQuery);
            res.render("pagini/index", { imagini:obImagini.imagini, produse: rezQuery.rows});
    })
})


//-------------------------------------------------admin-------------------------------------------------------
app.get("/useri", function(req, res){
    if(req.session.utilizator && req.session.utilizator.rol=="admin"){
        client.query("select * from utilizatori", function(err, rezQuery){
            console.log(err);
            res.render("pagini/useri", {useri:rezQuery.rows, utilizator:req.session.utilizator});
         });
    }
    else{
        randeazaEroare(res, 403);
        // res.status(403).render('pagini/eroare',{mesaj:"Nu aveti acces!", utilizator:req.session.utilizator});
    }
});

//----------------------------------------STERGE UTILIZATOR de catre ADMIN-----------------------------------------
//post e din method din user.ejs
app.post("/sterge_utiliz", function(req, res){
    if(req.session.utilizator && req.session.utilizator.rol=="admin"){
        var formular =  new formidable.IncomingForm()
        formular.parse(req, function(err, campuriText, campuriFisier){
        //id_utiliz este "name" din input form "sterge"
        client.query(`delete from utilizatori where id='${campuriText.id_utiliz}'`, function(err, rezQuery){
            console.log(err);
            //if err = ... eroare la baza de date....
            // res.render("pagini/useri", {useri:rezQuery.rows});
            res.redirect("/useri");
            trimiteMail(campuriText.email, "Anunț!", "Text", `<h1>Bună, </h1>${campuriText.username}.Ne pare sincer rău, dar contul dvs de pe site-ul Dobal Design a fost șters de către administrator. Pentru nelămuriri, contactați-ne pe adresa de mail. O zi frumoasă!`);

         });
        });
    };
})

//-------------------------------------------ȘTERGERE CONT DE CĂTRE USER------------------------------------
//post e din method din user.ejs
app.post("/stergere", function(req, res){
    if(req.session.utilizator){
        var formular =  new formidable.IncomingForm()
        formular.parse(req, function(err, campuriText, campuriFisier){
            client.query(`delete from utilizatori where id='${campuriText.id_utiliz}'`, function(err, rezQuery){
                console.log(err);
                res.redirect("/index");
                trimiteMail(campuriText.email, "La revedere!", "Text", `<h1>La revedere, </h1>${campuriText.username}.Ne pare sincer rău că ne despărțin în acest moment, dar noi, echipa Dobal Design, suntem optimiști că ne vom reîntâlni într-un viitor nu foarte îndepărtat. Călătoria noastră împreună nu se termină tocmai acum!`);

        });
    });
};
});


//----------------------------------------ȘTERGERE DIN BAZA DE DATE "ACCESARI"--------------------------------
function stergeAccesariVechi(){
    var queryDelete="delete from accesari where now()-data_accesare >= interval '10 minutes' ";
    client.query(queryDelete, function(err, rezQuery){
        console.log(err);
    });
}
 
stergeAccesariVechi();
setInterval(stergeAccesariVechi, 10*60*1000)


console.log("Director proiect:",__dirname);

//---------------------------------------Utilizatori online-activi------------------------------------
app.get(["/", "/index", "/home","/login"], function(req, res){
    querySelect="select username, nume, prenume from utilizatori where id in (select distinct user_id from accesari where now()-data_accesare <= interval '5 minutes')"
    client.query(querySelect, function(err, rezQuery){
        useriOnline=[]
        if(err) console.log(err);
        else useriOnline= rezQuery.rows;
        res.render("pagini/index", {ip:getIp(req), useriOnline: useriOnline});
    });
   
})

//---------------------------------------Utilizatori online-inactivi------------------------------------
app.get(["/", "/index", "/home","/login"], function(req, res){
    querySelect="select username, nume, prenume from utilizatori where id in (select distinct user_id from accesari where now()-data_accesare <= interval '10 minutes' and now()-data_accesare > interval '5 minutes')"
    client.query(querySelect, function(err, rezQuery){
        useriOnline=[]
        if(err) console.log(err);
        else useriOnline= rezQuery.rows;
        res.render("pagini/index", {ip:getIp(req), useriOnline: rezQuery.rows});
    });
   
})




app.get("/produse", function(req, res){
    client.query("select * from unnest(enum_range(null::categ_mobila))", function(err, rezCateg){
        var cond_where=req.query.tip ? ` tip_produs='${req.query.tip}'` : " 1=1";
    
        client.query("select * from mobila where "+cond_where, function(err, rezQuery){
            console.log(err);
            console.log(rezQuery);
            res.render("pagini/produse", {produse: rezQuery.rows , optiuni:rezCateg.rows});
        });
    });
});

app.get("/produs/:id", function(req, res){
    console.log(req.params)
    var queryProdus=`select * from mobila where id= ${req.params.id}`;
    client.query(queryProdus, function(err, rezQuery){
        if(err){
            console.log(err);
            randeazaEroare(res,2);
        }
        else{
        console.log(rezQuery);
        res.render("pagini/produs", {prod: rezQuery.rows[0] });
        }
    });
});

//----------------------------Jucarii-CERINTA EXAMEN--------------------
app.get("/jucarii", function(req, res){
    querySelect=`select * from jucarii`;

    client.query(querySelect, function(err, rezQuery){
        console.log(err)
        console.log(rezQuery)
        res.render("pagini/jucarii", {jucarii:rezQuery.rows});
    });

});
//-----------------------------------------------------------

app.get("/eroare", function(req,res){
    randeazaEroare(res, 1, false, "Titlu custom");
});

app.get("/galerie", function(req, res){
    
          res.render("pagini/galerie.ejs", {ip:req.ip, imagini:obImagini.imagini});
     
  })


app.get("*/galerie-animata.css", function(req,res){
    var sirScss=fs.readFileSync(__dirname+"/Resurse/SCSS/galerie_animata.scss").toString("utf8");
    var numere=["4", "9", "16"];
    var indiceAleator=Math.floor(Math.random()*numere.length);
    var numereAleatoare=numere[indiceAleator];
    rezScss=ejs.render(sirScss, {numere:numereAleatoare});
    // console.log(rezScss);
    var caleScss=__dirname+"/temp/galerie_animata.scss"
    fs.writeFileSync(caleScss, rezScss);
    try{
        rezCompilare=sass.compile(caleScss, {sourceMap:true});
        var caleCss=__dirname+"/temp/galerie_animata.css";
        fs.writeFileSync(caleCss, rezCompilare.css);
        res.setHeader("Content-Type", "text/css");
        res.sendFile(caleCss);
    }
    catch (err){
        // console.log(err);
        res.send("Eroare");
    }

});




//-----------------------------------------------Cos virtual---------------------------------------------
app.post("/produse_cos", function(req, res){
    console.log(req.body);
    if(req.body.ids_prod.length != 0){
        let querySelect = `select nume, descriere, imagine, pret from mobila where id in (${req.body.ids_prod.join(",")})`
        client.query(querySelect, function(err, rezQuery){
            if(err){
                console.log(err);
                res.send("Eroare baza date");
            }
            res.send(rezQuery.rows);
        });
    }
    else{
        res.send([]);
    }
});

app.post("/cos_virtual", function(req, res){
    if(!req.session.utilizator){
        res.write("Nu puteți cumpăra dacă nu sunteți logat!");
        res.end();
        return;
    }
    client.query("select id, nume, pret, imagine from mobila where id in ("+req.body.ids_prod+")", function(err, rez){
        let rezFactura=ejs.render(fs.readFileSync("views/pagini/factura.ejs").toString("utf8"),{utilizator:req.session.utilizator,produse:rez.rows, protocol:obGlobal.protocol, domeniu:obGlobal.numeDomeniu});
        //console.log(rezFactura);
        let options = { format: 'A4', args: ['--no-sandbox', '--disable-extensions',  '--disable-setuid-sandbox'] };

        let file = { content: juice(rezFactura, {inlinePseudoElements:true}) };
       
        html_to_pdf.generatePdf(file, options).then(function(pdf) {
            if(!fs.existsSync("./temp"))
                fs.mkdirSync("./temp");
            var numefis="./temp/test"+(new Date()).getTime()+".pdf";
            fs.writeFileSync(numefis,pdf);
            let mText=`Stimate ${req.session.utilizator.username}, aveți atașată factura.`;
		    let mHtml=`<h1>Salut!</h1><p>${mText}</p>`;

            trimiteMail(req.session.utilizator.email,"Factura", mText, mHtml, [{ 
                                                    filename: 'factura.pdf',
                                                    content: fs.readFileSync(numefis)
                                                }]);
            res.write("Totul bine!");res.end();
            let factura= { data: new Date(), username: req.session.utilizator.username, produse:rez.rows };
            obGlobal.bdMongo.collection("facturi").insertOne(factura, function(err, res) {
                if (err) console.log(err);
                else{
                    console.log("Am inserat factura in mongodb");
                    //doar de debug:
                    obGlobal.bdMongo.collection("facturi").find({}).toArray(function(err, result) {
                        if (err) console.log(err);
                        else console.log(result);
                      });
                }
              });
        });
          
    });   
    });


//-----------------------------------------------utilizatori---------------------------------------------


intervaleAscii=[[48, 57], [65, 90], [97, 122]] //modificat intervale in functie de cerinta individuala
obGlobal.sirAlphaNum=""
for(let interval of intervaleAscii){
    for(let i=interval[0]; i<=interval[1]; i++){
        obGlobal.sirAlphaNum += String.fromCharCode(i);
    }
}

function genereazaToken(n){
    let token=""
    for( let i=0; i< n; i++)
        token += obGlobal.sirAlphaNum[Math.floor(Math.random() * obGlobal.sirAlphaNum.length)]
    return token;
}

parolaServer="tehniciweb";
//------------------------------------INREGISTRARE------------------------------------
app.post("/inreg", function(req,res){
    var formular= new formidable.IncomingForm()
    // parse -> cand sunt trimise date
    formular.parse(req, function(err, campuriText, campuriFisier){
        //validari pt campurile Text din inregistrare
        var eroare="";
        if(campuriText.username==""){
            eroare += "Username necompletat ";
        }
        if(campuriText.parola==""){
            eroare += "Introduceți parola ";
        }
        if(campuriText.rparola==""){
            eroare += "Reintroduceți parola ";
        }
        if(campuriText.email==""){
            eroare += "Email necompletat ";
        }
        //validare extra, lungimea username-ului > 2
        if(campuriText.username.length <= 2){
            eroare += "Username prea scurt ";
        }
        if(!campuriText.username.match(new RegExp("^[A-Za-z0-9]+$"))){
            eroare += "Username nu conține caracterele cerute ";
        }
        //validare extra, lungimea parolei > 3
        if(campuriText.parola.length <= 3){
            eroare += "Parola prea scurta ";
        }
        if(!eroare){
        queryUtiliz=`select username from utilizatori where username='${campuriText.username}'`;
        client.query(queryUtiliz, function(err, rezUtiliz){
            if(rezUtiliz.rows.length!=0){
                eroare += "Username-ul mai exista";
                res.render("pagini/inregistrare", {err: "Eroare:" + eroare});
            }
            else{
                var parolaCriptata=crypto.scryptSync(campuriText.parola, parolaServer, 64).toString('hex');
                var token=genereazaToken(100);
                var comandaInserare=`insert into utilizatori (username, nume, prenume, parola, email, job, cod) values ('${campuriText.username}','${campuriText.nume}', '${campuriText.prenume}', '${parolaCriptata}', '${campuriText.email}', '${campuriText.job}','${token}' ) `;
                client.query(comandaInserare, function(err, rezInserare){
                if (err){
                    console.log(err);
                    res.render("pagini/inregistrare", {err: "Eroare bază de date"});
                }
                else{
                    res.render("pagini/inregistrare", {raspuns:"Datele au fost introduse"});
                    let linkConfirmare =`${obGlobal.protocol}${obGlobal.numeDomeniu}/cod/${campuriText.username}/${token}`;
                    trimiteMail(campuriText.email, "Cont nou", "Text", `<h1>Bine ai venit în comunitatea Dobal Design!</h1><p style='color:green font-weight:bold'>Username-ul tau este ${campuriText.username}.</p><a href='${linkConfirmare}'>Link confirmare</a>`);
               
                }
            });
        }
    })
    }
    else
        res.render("pagini/inregistrare", {err:"Eroare:"+eroare});
    });

    formular.on("field", function(nume,val){  // 1
    //se executa cand se trimite un camp de tip text
        if(nume=="username")
            username=val;
    })
    formular.on("fileBegin", function(nume,fisier){ //2
    //cand incepe upload ul pe server
        caleUtiliz=path.join(__dirname, "poze_uploadate", username)
        if(!fs.existsSync(caleUtiliz))
            fs.mkdirSync(caleUtiliz);
        fisier.filepath=path.join(caleUtiliz, fisier.originalFilename);
        // originalFilename -> numele fisierului uploadat

    })
    formular.on("file", function(nume,fisier){//3
    //cand s-a terminat incarcarea
    });

});



//---------------------------------adaugare TOKEN in baza de date------------------------------------------
app.get("/cod/:username/:token", function(req, res){
    var comandaUpdate=`update utilizatori set confirmat_mail=true where username='${req.params.username}' and cod='${req.params.token}'`;
    client.query(comandaUpdate, function(err, rez){
        if(err){
            console.log(err);
            randeazaEroare(res, 2);}
        else{
            if(rez.rows.length==1)
                res.render("pagini/confirmare");
            else
                randeazaEroare(res, -1, "Mail neconfirmat", "Încercați din nou!");
        }
    })
})

//----------------------------Update profil----------------------------
app.post("/profil", function(req, res){
    console.log("profil");
    if(!req.session.utilizator){
        res.render("pagini/eroare_generala", {text:"Nu sunteti logat."});
        return;
    }
    var formular = new formidable.IncomingForm();

    formular.parse(req, function(err, campuriText, campuriFile){
        var criptareParola=crypto.scryptSync(campuriText.parola, parolaServer, 32).toString('hex');

        var queryUpdate = ` update utilizatori set nume='${campuriText.nume}', prenume='${campuriText.prenume}', email='${campuriText.email}', job='${campuriText.job}' where parola='${criptareParola}' `;
        console.log(queryUpdate)
        client.query(queryUpdate, function(err, rez){
            
            if(err){
                console.log(err);
                res.render("pagini/eroare_generala", {text:"Eroare baza de date. Incercati mai tarziu."});
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pagini/profil", {mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{
                //actualizare sesiune
                req.session.utilizator.nume=campuriText.nume;
                req.session.utilizator.prenume=campuriText.prenume;
                req.session.utilizator.email=campuriText.email;
                req.session.utilizator.job=campuriText.job;
           
            }
            
            res.render("pagini/profil", {text:"Update-ul s-a realizat cu succes."});
            trimiteMailParola(campuriText.email, "Actualizare cont", "Text", `<h1>Bună, </h1>${campuriText.username}.În urma actualizării datelor, numele tău este ${campuriText.nume}, prenumele este ${campuriText.prenume}, iar job-ul ${campuriText.job}`);

        });

    });
});
//--------------------------------------LOGIN---------------------------------------
app.post("/login", function(req,res){

    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier){
        console.log(campuriText);
        var parolaCriptata=crypto.scryptSync(campuriText.parola, parolaServer, 64).toString('hex');
        var querySelect=`select * from utilizatori where username= $1::text and parola= $2::text and confirmat_mail=true`;
        client.query(querySelect, [campuriText.username, parolaCriptata ], function(err, rezSelect){
            if (err){
                console.log(err);
                randeazaEroare(res, 2)
            }
            else{
                if(rezSelect.rows.length==1){
                    //daca am utilizatorul si a dat credentiale corecte
                    caleUser=path.join(__dirname, "poze_uploadate",rezSelect.rows[0].username)
                    let vect_fis=fs.readdirSync(caleUser);

                    req.session.utilizator={    //obiect
                        id:rezSelect.rows[0].id,
                        nume:rezSelect.rows[0].nume, //rows[0] pt prima inregistrare
                        prenume:rezSelect.rows[0].prenume,
                        username:rezSelect.rows[0].username,
                        email:rezSelect.rows[0].email,
                        job:rezSelect.rows[0].job,
                        rol:rezSelect.rows[0].rol,
                        poza:vect_fis.length>0 ? path.join("/poze_uploadate",rezSelect.rows[0].username,vect_fis[0]):null
                    }
                    res.redirect("/index");

                }

    
                else{
                    //randeazaEroare(res, -1, "Login esuat", "User sau parola gresita")
                    
                    req.session.mesajLogin="Login esuat"
                    res.redirect("/index")
                    // nu merge cu redirect ca mai trebuie recalculate niste lucruri, nu vrem sa rescriem toate proprietatile din locals
                }
            }
        })
    })
});

//------------------------------LOGOUT----------------------------------
app.get("/logout", function(req, res){
   
    x=req.session;
    x.destroy();
    res.locals.utilizator=null;
    res.render("pagini/logout");
})

app.get("/*.ejs", function(req, res){
    // res.status(403).render("pagini/403");
    randeazaEroare(res, 403, true);
})


app.get("/*", function(req, res){
    console.log(req.url)
    res.render("pagini"+req.url, function(err, rezRender){
        if (err){
            console.log(req.url)
            console.log(err)
            if(err.message.includes("Failed to lookup view")){
                // console.log(err);
                //randeazaEroare(404, true)
                randeazaEroare(res, 404, true);
                // res.status(404).render("pagini/404");
            }
            else{
                
                res.render("pagini/eroare_generala");
            }
        }
        else{
            // console.log(rezRender);
            res.send(rezRender);
        }
    });
   
    res.end();
})

//--------------------------------------------IMAGINI-----------------------------------------------------
function creeazaImagini(){
    var buf=fs.readFileSync(__dirname+"/Resurse/json/galerie.json").toString("utf8");

    obImagini=JSON.parse(buf);//global

    //console.log(obImagini);
    for (let imag of obImagini.imagini){
        let nume_imag, extensie;
        [nume_imag, extensie ]=imag.cale_fisier.split(".")// "abc.de".split(".") ---> ["abc","de"] imagine.png->imagine.webp
        let dim_mic=150
        
        imag.mic=`${obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp` //nume-150.webp // "a10" b=10 "a"+b `a${b}`
        //console.log(imag.mic);

        imag.mare=`${obImagini.cale_galerie}/${imag.cale_fisier}`;
        if (!fs.existsSync(imag.mic))
            sharp(__dirname+"/"+imag.mare).resize(dim_mic).toFile(__dirname+"/"+imag.mic);


        let dim_mediu=300;
        imag.mediu=`${obImagini.cale_galerie}/mediu/${nume_imag}-${dim_mediu}.png` 
        if (!fs.existsSync(imag.mediu))
            sharp(__dirname+"/"+imag.mare).resize(dim_mediu).toFile(__dirname+"/"+imag.mediu);
        
    }
}
creeazaImagini();

function creeazaErori(){
    var buf=fs.readFileSync(__dirname+"/Resurse/json/erori.json").toString("utf8");

    obErori=JSON.parse(buf);//global

    //console.log(obErori);
}

creeazaErori();

// if(eroare && eroare.status){
    function randeazaEroare(res, identificator, status, titlu, text, imagine){
        var eroare = obErori.erori.find(function(elem){return elem.identificator == identificator});
        if(status){
            res.status(identificator).render("pagini/eroare_generala", {titlu:eroare.titlu, text:eroare.text, imagine:obErori.cale_baza+"/"+eroare.imagine})
        }
        else{
            titlu = titlu || eroare && eroare.titlu;
            text = text || eroare && eroare.text;
            if(eroare)
                imagine = imagine || obErori.cale_baza+"/"+eroare.imagine;
            else
                imagine="Resurse/Imagini/erori/lupa.png";
    
            res.render("pagini/eroare_generala", {titlu:titlu, text:text, imagine:imagine})
        }
    
        
    }


//---------------------Resetare folder imagini qr-code ------------------------

// cale_qr="./resurse/imagini/qrcode";
// if (fs.existsSync(cale_qr))
//   fs.rmSync(cale_qr, {force:true, recursive:true});
// fs.mkdirSync(cale_qr);
// client.query("select id from prajituri", function(err, rez){
//     for(let prod of rez.rows){
//         let cale_prod=obGlobal.protocol+obGlobal.numeDomeniu+"/produs/"+prod.id;
//         //console.log(cale_prod);
//         QRCode.toFile(cale_qr+"/"+prod.id+".png",cale_prod);
//     }
// });


//------------------------------------------ Contact ----------------------------------------------------------
caleXMLMesaje="resurse/xml/contact.xml";
headerXML=`<?xml version="1.0" encoding="utf-8"?>`;
function creeazaXMlContactDacaNuExista(){
    if (!fs.existsSync(caleXMLMesaje)){
        let initXML={
            "declaration":{
                "attributes":{
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [
                {
                    "type": "element",
                    "name":"contact",
                    "elements": [
                        {
                            "type": "element",
                            "name":"mesaje",
                            "elements":[]                            
                        }
                    ]
                }
            ]
        }
        let sirXml=xmljs.js2xml(initXML,{compact:false, spaces:4});//obtin sirul xml (cu taguri)
        console.log(sirXml);
        fs.writeFileSync(caleXMLMesaje,sirXml);
        return false; //l-a creat
    }
    return true; //nu l-a creat acum
}


function parseazaMesaje(){
    let existaInainte=creeazaXMlContactDacaNuExista();
    let mesajeXml=[];
    let obJson;
    if (existaInainte){
        let sirXML=fs.readFileSync(caleXMLMesaje, 'utf8');
        obJson=xmljs.xml2js(sirXML,{compact:false, spaces:4});
        

        let elementMesaje=obJson.elements[0].elements.find(function(el){
                return el.name=="mesaje"
            });
        let vectElementeMesaj=elementMesaje.elements?elementMesaje.elements:[];// conditie ? val_true: val_false
        console.log("Mesaje: ",obJson.elements[0].elements.find(function(el){
            return el.name=="mesaje"
        }))
        let mesajeXml=vectElementeMesaj.filter(function(el){return el.name=="mesaj"});
        return [obJson, elementMesaje,mesajeXml];
    }
    return [obJson,[],[]];
}


app.get("/contact", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();

    res.render("pagini/contact",{ utilizator:req.session.utilizator, mesaje:mesajeXml})
});

app.post("/contact", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();
        
    let u= req.session.utilizator?req.session.utilizator.username:"anonim";
    let mesajNou={
        type:"element", 
        name:"mesaj", 
        attributes:{
            username:u, 
            data:new Date()
        },
        elements:[{type:"text", "text":req.body.mesaj}]
    };
    if(elementMesaje.elements)
        elementMesaje.elements.push(mesajNou);
    else 
        elementMesaje.elements=[mesajNou];
    console.log(elementMesaje.elements);
    let sirXml=xmljs.js2xml(obJson,{compact:false, spaces:4});
    console.log("XML: ",sirXml);
    fs.writeFileSync("resurse/xml/contact.xml",sirXml);
    
    res.render("pagini/contact",{ utilizator:req.session.utilizator, mesaje:elementMesaje.elements})
});

//----------------------chat utilizatori-----------------------------------------

io.on("connection", function (socket)  {  
    console.log("Conectare!");

    socket.on('disconnect', function() {conexiune_index=null;console.log('Deconectare')});
});

// pentru folosirea ejs-ului 
app.set('view engine', 'ejs');

app.use(express.static(__dirname));
app.use('/CSS', express.static('css'));

app.post('/chat', function(req, res) {

	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {

			//trimit catre restul de utilizatori mesajul primit
			io.sockets.emit('mesaj_nou', fields.size, fields.nume, fields.mesaj);
		//}
    res.send("ok");
    });
	
	
});


s_port=process.env.PORT || obGlobal.portAplicatie
server.listen(s_port)
console.log('Serverul a pornit pe portul '+ s_port);

// app.listen(s_port);
console.log("A pornit")