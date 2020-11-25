'use strict';
require('dotenv').config();
const express=require('express');
const superagent=require('superagent');
const cors=require('cors');
const app = express();

const methodOverride=require('method-override');
const { Client } = require('pg')
const client = new Client(process.env.DATABASE_URL)

const PORT= process.env.PORT
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

client.connect().then(()=>{
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  }).catch( error => console.log(`Could not connect to database\n${error}`));


  let allDig=[];
function Digimon(data){
    this.name=data.name;
    this.img=data.img;
    this.level=data.level;
    allDig.push(this);

}


app.get('/',home);
app.get('/home',search);
app.post('/home',showSearch);
app.post('/fav',addToFav);
app.get('/fav',showFav);
app.get('/fav/:id',handelDetails);
app.put('/fav/:id',handelUpdate);
app.delete('/fav/:id',handelDelete);


function search(req,res){
    res.render('search');
}
function showSearch(req,res){
    let url='https://digimon-api.herokuapp.com/api/digimon';
if(req.body.search[1]==='name'){
     url=`https://digimon-api.herokuapp.com/api/digimon/name/${req.body.search[0]}`;
}
    else if (req.body.search[1]==='level'){
   url=`https://digimon-api.herokuapp.com/api/digimon/level/${req.body.search[0]}`;
    }

    superagent.get(url).then(data =>{

        data.body.forEach(element =>{
            new Digimon(element);
        });
  res.render('results',{result: allDig});
    }).catch('error');
}

  

function home(req,res){
    const url='https://digimon-api.herokuapp.com/api/digimon';
    superagent.get(url).then(data =>{

        data.body.forEach(element =>{
            new Digimon(element);
        });
  res.render('home',{result: allDig});
    });
}
function addToFav(req,res){
const sql='insert into card (name,img,level) values($1,$2,$3);';
const values=[req.body.name,req.body.img,req.body.level];
client.query(sql,values).then(data =>{
    res.redirect('/fav');
})
}

function showFav(req,res){
    const sql='select * from card;';
    client.query(sql).then(data =>{
        res.render('favorite',{result:data.rows});
    });

}
function handelDetails(req,res){
    const sql= 'select * from card where id=$1;';
    const values=[req.params.id];
    client.query(sql,values).then(data=>{
        res.render('details',{element:data.rows[0]});
    });
}
function handelUpdate(req,res){
    const sql= 'update card set name=$1, level=$2 where id=$3;';
    const values=[req.body.name,req.body.level,req.params.id];
    client.query(sql,values).then(()=>{
    res.redirect(`/fav/${req.params.id}`);
    });
}
function handelDelete(req,res){
    const sql='delete from card where id=$1;';
    const values=[req.params.id];
    client.query(sql,values).then(()=>{
        res.redirect('/fav');
    })
}