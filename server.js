var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();

var todos =[];
var todNextId=1;


app.use(bodyParser.json());

app.get('/todos',function(req,res){
  res.json(todos);
});

app.get('/todos/:id',function(req,res){
  var id = parseInt(req.params.id,10);

  var matchedTodo = _.findWhere(todos,id);

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

app.post('/todos',function(req,res){
  var body = req.body;
  body = _.pick(body,'description','completed');
  if(!_.isString(body.description)
    ||!_.isBoolean(body.completed)
    || body.description.trim().length===0){
    res.status(404).send();
  }
  else{
    body.id = todNextId++;
    console.log('New Todo added - description: '+body.description);
    todos.push(body);
    res.json(body);
  }


});
app.listen(PORT,function(){
  console.log('Express listening on Port '+PORT+'!');
})
