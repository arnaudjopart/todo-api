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

app.get('/todos/:id',function(req,res){
  var id = parseInt(req.params.id,10);
  var matchedTodo;
  todos.forEach(function(todo){
    if (id === todo.id){
      matchedTodo = todo;
    }
  });
  if(matchedTodo){
    res.json(matchedTodo);
    console.log("todo found");
  }
  else{
    console.log("todo not found");
    res.status(404).send();
  }
});
var PORT = process.env.PORT||3000;

app.get('/',function(req,res){
  res.send('Todo API Root');
});

app.listen(PORT,function(){
  console.log('Express listening on Port '+PORT+'!');
})
