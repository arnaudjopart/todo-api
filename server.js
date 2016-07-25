var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();

var todos =[];
var todNextId=1;


app.use(bodyParser.json());

app.get('/todos',function(req,res){
  var query = req.query;
  var where ={};

  if(query.hasOwnProperty('completed') && query.completed === 'true'){
    where.completed = true;
  }
  if(query.hasOwnProperty('completed') && query.completed === 'false'){
    where.completed = false;
  }
  if(query.hasOwnProperty('q')){
    where.description ={$like:'%'+query.q+'%'};
  }

  db.todo.findAll({where:where}).then(function(todos){
    if(!!todos){
      res.json(todos);
    }else{
      res.status(404).send();
    }
  },function(e){
    res.status(400).json(e);
  }).catch(function(e){
    res.json(e);
  });

});

app.get('/todos/:id',function(req,res){

  var todoId = parseInt(req.params.id,10);

  db.todo.findById(todoId).then(function(todo){
    if(!!todo){
      res.json(todo);
    }else{
      res.status(404).send();
    }

  },function(e){
      res.status(400).json(e);
  });
})

var PORT = process.env.PORT||3000;

app.get('/',function(req,res){
  res.send('Todo API Root');
});

app.post('/todos',function(req,res){
  var body = req.body;
  db.todo.create(body).then(function(resolveData){
    console.log("todo created - "+resolveData.description);
    res.json(resolveData);
  },function(e){
    console.log(e);
    res.status(400).json(e);
  }).catch(function(e){
    console.log(e);
  });

});

app.delete('/todos/:id',function(req,res){
  var todoId = parseInt(req.params.id,10);
  db.todo.destroy({where:{'id':todoId}}).then(function(rowsDestoyed){
    if(rowsDestoyed===0){
      res.status(404).json({error:"No todo to destroy"});
    }else{
      res.send("Todo n° "+todoId+" is removed");
    }

  },function(e){
    res.status(400).json(e);
  });
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
