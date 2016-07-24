var express = require('express');
var app = express();

var todos =[{
  id:1,
  description:"Meet mom for lunch",
  completed:false
},{
  id:2,
  description:"Go to market",
  completed:false
},{
  id:3,
  description:"Go to theator",
  completed:true
}];

var index = 1;

app.get('/todos',function(req,res){
  res.json(todos);
});

app.get('/todos'+index,function(req,res){

});
var PORT = process.env.PORT||3000;

app.get('/',function(req,res){
  res.send('Todo API Root');
});

app.listen(PORT,function(){
  console.log('Express listening on Port '+PORT+'!');
})
