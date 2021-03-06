var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
//var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);
var app = express();

var todos =[];
var todNextId=1;


app.use(bodyParser.json());

app.get('/todos',middleware.requireAuthentication,function(req,res){
  var query = req.query;
  var where ={};
  where.userId = req.user.get('id');
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

app.get('/todos/:id',middleware.requireAuthentication,function(req,res){
  var where={};
  where.userId = req.user.get('id');
  where.id = parseInt(req.params.id,10);

  db.todo.findOne({where:where}).then(
    function(todo){
      if(!!todo){
        res.json(todo);
      }else{
        res.status(404).send();
      }

  },function(){
    res.status(404).send();
  });
})

var PORT = process.env.PORT||3000;

app.get('/',function(req,res){
  res.send('Todo API Root');
});

app.post('/todos',middleware.requireAuthentication,function(req,res){
  var body = req.body;
  db.todo.create(body).then(function(todo){

    req.user.addTodo(todo).then(function(){
      return todo;
    }).then(function(todo){
      res.json(todo.toJSON());
    });
  },function(e){
    console.log(e);
    res.status(400).json(e);
  }).catch(function(e){
    console.log(e);
  });
});

app.delete('/todos/:id',middleware.requireAuthentication,function(req,res){
  var where ={};
  where.userId = req.user.get('id');
  where.id = parseInt(req.params.id,10);

  db.todo.destroy({where:where}).then(function(rowsDestoyed){
    if(rowsDestoyed===0){
      res.status(404).json({error:"No todo to destroy"});
    }else{
      res.send("Todo n° "+where.id+" is removed");
    }

  },function(e){
    res.status(400).json(e);
  });
})

app.put('/todos/:id',middleware.requireAuthentication,function(req,res){
  var body = req.body;
  var todoId = parseInt(req.params.id,10);
  var where ={};

  where.userId = req.user.get('id');
  where.id = parseInt(req.params.id,10);

  body = _.pick(body,'description','completed');
  var validAttributes={};
  if(body.hasOwnProperty('completed')){
    validAttributes.completed = body.completed;
  }
  if(body.hasOwnProperty('description')){
    validAttributes.description = body.description;
  }else if(body.hasOwnProperty('description')){
    res.status(400).send();
  };

  db.todo.findOne({where:where}).then(
    function(todo){
      if(!!todo){
        return todo.update(validAttributes);
      }else{
        res.status(404).send();
      }
    },function(e){
      res.status(500).send();
    }).then(function(todo){
      res.json(todo.toJSON());
    },function(e){
      res.status(500).json(e);
    }).catch(function(e){

    });

});

app.post('/user/login',function(req,res){
  var body = req.body;

  body = _.pick(body,'email','password');
  var userInstance;

    db.user.authenticate(body).then(
      function(user){
        var token = user.generateToken('authentication');
        userInstance = user;
        return db.token.create({
          token:token
        });


      }).then(function(tokenInstance){
        res.header('Auth',tokenInstance).json(userInstance.toPublicJson());

      }).catch(function(e){
         res.status(401).json(e);}
       );



});

app.post('/user', function(req,res){
  var body = req.body;
  //db.user.beforeValidate(function(){});
  db.user.create(body).then(function(user){
    res.send(user.toPublicJson());
  },function(e){
    res.status(400).json(e);
  });
})

app.delete('/user/login',middleware.requireAuthentication, function(req, res){
  req.token.destroy().then(function(){
    res.status(204).send();
  }).catch(function(){
    res.status(401).send();
  })
});
db.sequelize.sync({force:true}).then(function(){
  app.listen(PORT,function(){
    console.log('Express listening on Port '+PORT+'!');
  });
});
