var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();

var todos =[];
var todNextId=1;


app.use(bodyParser.json());

app.get('/todos',function(req,res){
  var queryParams = req.query;
  // if(queryParams.hasOwnProperty('completed')){
  //   var filteredTodos = db.todo.findAll({
  //     where:{
  //       completed:queryParams.completed
  //     }
  //   });
  // }
  //
  // if(queryParams.hasOwnProperty('q') && queryParams.q.trim().length>0){
  //
  // }
  //   filteredTodos= _.filter(filteredTodos,function(todo){
  //       return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase())>-1;
  //   });
  // }


  if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
    filteredTodos = _.where(filteredTodos,{completed:true});
    }

  else if (queryParams.hasOwnProperty('completed')
    && queryParams.completed === 'false'){
    filteredTodos = _.where(filteredTodos,{completed:false});


  }

  if(queryParams.hasOwnProperty('q') && queryParams.q.trim().length>0){
    filteredTodos= _.filter(filteredTodos,function(todo){
        return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase())>-1;
    });
  }
  res.json(filteredTodos);


});

app.get('/todos/:id',function(req,res){

  var todoId = parseInt(req.params.id,10);

  var matchedTodo = _.findWhere(todos,{id:todoId});

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
  db.todo.create(body).then(function(resolveData){
    console.log("todo created - "+resolveData.description);
    res.json(resolveData);
  },fuction(e){
    console.log(e);
    res.status(400).json(e)):
  }).catch(function(e){
    console.log(e);
  });

});

app.delete('/todos/:id',function(req,res){
  var todoId = parseInt(req.params.id,10);
  var matchedTodo = _.findWhere(todos,{id:todoId});
  if(matchedTodo){
    todos = _.without(todos,matchedTodo);
    console.log("Delete todo with id "+todoId);
    res.json(todos);
  }
  else{
    res.status(404).json({"error":"no todo found with that id"});
  }
})

app.put('/todos/:id',function(req,res){
  var body = req.body;
  body = _.pick(body,'description','completed');
  var validAttributes={};
  if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
    validAttributes.completed = body.completed;
  }else if(body.hasOwnProperty('completed')){
    res.status(400).send();
  };

  if(body.hasOwnProperty('description') && body.description.trim().length>0){
    validAttributes.description = body.description;
  }else if(body.hasOwnProperty('description')){
    res.status(400).send();
  };

  var todoId = parseInt(req.params.id,10);

  var matchedTodo = _.findWhere(todos,{id:todoId});
  if(matchedTodo){
    _.extend(matchedTodo,validAttributes);
    res.json(matchedTodo);
  }else{
    res.status(404).json({"error":"no todo found with that id"});
  }

})

db.sequelize.sync().then(function(){
  app.listen(PORT,function(){
    console.log('Express listening on Port '+PORT+'!');
  });
});
