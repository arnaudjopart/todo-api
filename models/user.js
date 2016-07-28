var bcrypt = require('bcrypt');
//var bcrypt = require('bcryptjs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
module.exports=function(sequelize,DataTypes){
  var user = sequelize.define('user',{
    email:{
      type:DataTypes.STRING,
      allowNull:false,
      unique:true,
      validate:{
        isEmail:true
      }
    },
    salt:{
      type:DataTypes.STRING
    },
    password_hash:{
      type:DataTypes.STRING
    },
    password:{
      type:DataTypes.VIRTUAL,
      allowNull:false,
      validate:{
        len:[4,100]
      },
      set: function(value){
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(value,salt);

        this.setDataValue('password',value);
        this.setDataValue('salt',salt);
        this.setDataValue('password_hash',hashedPassword);

      }
    }
  },
  {
    hooks:{
      beforeValidate: function(user,options){
        if(typeof user.email === 'string'){
          user.email = user.email.toLowerCase();
          }

        }

    },
    classMethods:{
      authenticate: function(body){
        return new Promise(function(resolve,reject)
        {
          if(body.hasOwnProperty('email')&& body.hasOwnProperty('password')){
            user.findOne({where:{email:body.email}}).then(
              function(user){

                if(!!user){
                  var checkHachedPassword = bcrypt.hashSync(body.password,user.salt);

                  if(checkHachedPassword === user.password_hash){

                    resolve(user);

                  }else{
                    return reject({error:"wrong password"});
                  }
                }else{
                    return reject({error:"wrong login"});
                }

              },function(){

                  reject({error:"something went wrong"});
              });
            }
            else{
              reject({error:"email or password  missing"})
            }
        });
    },
    findByToken: function(token){
      return new Promise(function(resolve,reject){
        try{
          var decodedJWT = jwt.verify(token,'azerty');
          var bytes = cryptojs.AES.decrypt(decodedJWT.token,'abc123!@#');
          var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
          user.findById(tokenData.id).then(
            function(user){
              if(user){
                console.log(user);
                resolve(user);
              }else{
                reject();
              }
            }
            ,function(e){
              reject(e);
            });
        }catch(e){
          reject(e);
        }
      });
    }
  },
  instanceMethods:{
      toPublicJson:function(){
        var json = this.toJSON();
        return _.pick(json,'id','email','updatedAt','createdAt');
      },

      generateToken : function (type){
        console.log("hello");
        if (!_.isString(type)){
          return undefined;
        }
        try{
          var stringData = JSON.stringify({id:this.get('id'),type:type});
          //console.log(stringData);
          var encryptedData = cryptojs.AES.encrypt(stringData,'abc123!@#').toString();
          var token = jwt.sign({
            token:encryptedData
          }, 'azerty');
          console.log(token);
          return token;
        }catch(e){
          console.error(e);
          return undefined;
        }
      }
    }
  });
  return user;
};
