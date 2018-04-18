const fs = require('fs');
const path = require('path');

//Expresss Setup
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

//Knex Setup
const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];
const knex = require('knex')(config);

//Bcrypt Setup
let bcrypt = require('bcrypt');
const saltRounds = 10;

//jwt setup
const jwt = require('jsonwebtoken');
let jwtSecret = process.env.jwtSecret;
if(jwtSecret === undefined) {
  console.log("Need a jwtSecret environment variable to continue.");
  knex.destroy();
  process.exit();
}

//Validation Setup
var validator = require("email-validator");

//Email Setup
const nodemailer = require('nodemailer');

const sendLink = (email, link) => {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.email,
      pass: process.env.emailpass
    }
  });

  var mailOptions = {
    from: process.env.email,
    to: email,
    subject: "Account confirmation",
    html: '<a href="' + link + '">Click here to confirm account.</a>'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    };
  });
}

const makeid = () => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 255; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

//GUID
let GUID = (callback) => {
  id = makeid();
  knex('guid').insert({'id':id}).then(result=>{
    knex('guid').where('id', id).first().then(row=>{
      return callback(row.id);
    });
  }).catch(error => {
    console.log("GUID error occured");
    console.log(error);
    //If the problem was duplicate random generated id, try again.
    if(error.hasOwnProperty('Error') && error['Error'].includes("Duplicate entry")) {
      GUID(callback);
    }
    else {
      console.log(error);
    }
  });
}

//Verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token || token == "null")
    return res.status(403).send({ error: 'No token provided.' });
  jwt.verify(token, jwtSecret, (err, decoded)=>{
    if (err) {
      console.log("Invalid token");
      console.log(token);
      return res.status(500).send({ error: 'Failed to authenticate token.' });
    }
    else {
      req.userID = decoded.id;
      knex('users').where('id', req.userID).first().then(user=>{
        if(user === undefined) {
          console.log("User no longer exists.");
          return res.status(400).json({error:"User no longer exists."});
        }
        else if(user.confirmed === '0') {
          console.log("User has not been confirmed.");
          return res.status(400).json({error:"User has not been confirmed."});
        }
        else {
          next(token);
        }
      });
    }
  });
}

const validateCredentials = (req) => {
  console.log(req.body.email);
  console.log(req.body.password);
  if(!req.body.email || req.body.email.trim().length === 0 || !validator.validate(req.body.email.trim())) {
    return "Invalid email";
  }
  if(!req.body.password || req.body.password.trim().length < 1) {
    return "Invalid password";
  }
  return undefined;
}

//USER ENDPOINTS
//Register
app.post("/api/register", (req,res)=>{
  var credentialResult = validateCredentials(req);
  if(credentialResult !== undefined) {
    console.log(credentialResult);
    return res.status(400).json({error:credentialResult});
  }
  console.log("Credentials usable");

  //Credentials
  var email = req.body.email.trim();
  var password = req.body.password;
  console.log("Normalized credentials");

  //Check user existance
  knex('users').where('email', email).first().then(user=>{
    console.log("Completed database retrieval");
    console.log(user);

    //If there is no such user, create one.
    if(user === undefined) {
      console.log("Confirmed user does not exist. Creating.");

      bcrypt.hash(password, saltRounds).then(hash=>{
        console.log("Completed password hash.");

        GUID((id)=>{
          console.log("Inserting user")
          knex('users').insert({'id':id, 'email':email, 'hash':hash, 'confirmed':false}).returning('id').then(result=>{
            return knex('users').where('id', id).first();
          }).then(user=>{
            console.log("Got inserted user.");
            console.log("Sending.");
            let token = jwt.sign({id:user.id}, jwtSecret, {expiresIn:300});
            var link = req.protocol + '://' + req.get('host') + "/api/confirm/" + token;
            sendLink(email, link);
            res.status(200).json({ error:"Check your email. Confirmation link expires in 5 minutes. Register again for a new email, but don't worry: nobody can register your email after you confirm." });
          }).catch(error=>{
            console.log(error);
            res.status(400).json({ error:"Could not register user" });
          });
        });

      });
    }

    //Else if unconfirmed, send new confirmation token
    else if(user.confirmed === '0') {
      bcrypt.hash(password, saltRounds).then(hash=>{
        console.log("Completed password hash.");
        console.log("Sending.");
        let token = jwt.sign({id:user.id}, jwtSecret, {expiresIn:300});
        var link = req.protocol + '://' + req.get('host') + "/api/confirm/" + token;
        sendLink(email, link);
        res.status(200).json({ error:"Check your email. Confirmation link expires in 5 minutes. Register again for a new email, but don't worry: nobody can register your email after you confirm." });
      });
    }

    //Otherwise can't register
    else {
      console.log("User already exists and is confirmed.");
      res.status(400).json({error:"User already exists and is confirmed."});
    }

  });
});

//Confirmation
app.get("/api/confirm/:token", (req,res)=>{

  var token = req.params.token;
  jwt.verify(token, jwtSecret, (err, decoded)=>{
    if(err) {
      console.log("A server error occured, and the request could not be processed.")
      return res.status(200).send("A server error occured, and the request could not be processed.");
    }
    else {
      knex('users').where('id', decoded.id).first().then(user=>{

        if(user === undefined) {
          console.log("User no longer exists.");
          return res.status(200).send("User no longer exists.");
        }
        else if(user.confirmed !== '0') {
          console.log("User was already confirmed.");
          return res.status(200).send("User was already confirmed.");
        }
        else {
          knex('users').where('id', user.id).update({'id':user.id, 'email':user.email, 'hash':user.hash, 'confirmed':true}).then(result=>{
            console.log("Confirmed user.");
            return knex('users').where('id', user.id).first();
          }).then(userb=>{
            if(userb === undefined) {
              console.log("Confirmation deleted the user. This should be impossible.");
              return res.status(200).send("SERIOUS ERROR. CHECK LOGS.");
            }
            else if(userb.confirmed === '0') {
              console.log("Failed to update confirmation.");
              return res.status(200).send("Failed to confirm user.");
            }
            else {
              console.log("Sending.");
              var loginurl = req.protocol + '://' + req.get('host');
              res.status(200).send("<html><head><title>Confirmed</title></head><body>User " + user.email + " confirmed. Redirecting. Or click <a href='" + loginurl + "'>here</a><script>window.setTimeout(()=>{window.location = '" + loginurl + "';}, 3000);</script></body></html>");
            }
          }).catch(error=>{
            console.log(error);
            return res.status(200).send("SERIOUS ERROR. CHECK LOGS.");
          });
        }
      });
    }
  });


});

//Login
app.post("/api/login", (req,res)=>{
  var credentialResult = validateCredentials(req);
  if(credentialResult !== undefined) {
    console.log(credentialResult);
    return res.status(400).json({error:credentialResult});
  }
  console.log("Credentials usable");

  //Credentials
  email = req.body.email.trim();
  password = req.body.password;
  console.log("Normalized credentials");

  //Check user existance
  knex('users').where('email', email).first().then(user=>{
    console.log("Completed database retrieval");
    console.log(user);

    //If there is no such user, create one.
    if(user === undefined) {
      console.log("User does not exist.");
      res.status(400).json({error:"User does not exist."});
    }

    //If the user has not been confirmed, don't log in.
    else if(user.confirmed === '0') {
      console.log("User was not confirmed.");
      res.status(400).json({error:"User was not confirmed."});
    }

    //Otherwise evaluate password
    else {
      console.log("Confirmed user exists.");
      bcrypt.compare(req.body.password, user.hash).then(isValid=>{
        console.log("Completed password check.");

        if(isValid) {
          console.log("Password valid.");

          let token = jwt.sign({id:user.id}, jwtSecret, {expiresIn:86400});
          console.log("Created token: " + token);
          console.log("Sending.");
          res.status(200).json({user:{id:user.id,email:user.email},token:token,existed:true});
        }
        else {
          console.log("Invalid password.");
          res.status(400).json({error:"Invalid password."});
        }
      });
    }
  });
});

//Get email and id from token.
app.post("/api/session", (req, res)=>{
  verifyToken(req, res, (token)=>{
    knex('users').where('id', req.userID).first().then(user=>{
      console.log("Sending.");
      res.status(200).json({user:{id:user.id,email:user.email},token:token,existed:true});
    }).catch(error=>{
      console.log(error);
      res.status(400).json({error:"No user for the given token."});
    });
  })
});
//END USER ENDPOINTS

//DATA ENDPOINTS
//Create doc
app.post("/api/doc", (req, res)=>{
  console.log("Got doc creation request.");
  verifyToken(req, res, ()=>{
    knex('docs').where('userid', req.userID).where('title', req.body.title).first().then(doc=>{
      if(doc === undefined) {
        console.log("Doc " + req.body.title.trim() + " does not exist. Creating.");
        GUID(id=>{
          knex('docs').insert({id:id, userid:req.userID, title:req.body.title.trim(), text:req.body.text}).then(ids=>{
            res.status(200).json({});
          }).catch(error=>{
            console.log(error);
            res.status(400).json({error:"Could not add doc."});
          });
        });
      }
    });
  });
});

//Get doc
app.get("/api/doc/:docid", (req, res)=>{
  console.log("Getting doc.");
  verifyToken(req, res, ()=>{
    knex('docs').where('id', req.params.docid).first().then(doc=>{
      console.log("Got doc.");
      res.status(200).json(doc);
    }).catch(error=>{
      console.log(error);
      res.status(400).json({error:"Could not get doc."});
    });
  });
});

//Update doc
app.put("/api/doc/", (req, res)=>{
  verifyToken(req, res, ()=>{
    knex('docs').where('id', req.body.id).first().then(doc=>{
      if(doc === undefined) {
        console.log("No such document.");
        return res.status(400).json({error:"No such document."});
      }
      else if(doc.userid !== req.userID) {
        return res.status(403).json({error:"You do not have permission to edit the document."});
      }
      else {
        knex('docs').where('id', req.body.id).update({'id':doc.id, 'userid':doc.userid, 'title':doc.title, 'text':req.body.text }).then(result=>{
          return res.status(200).send();
        }).catch(error=>{
          return res.status(400).json({error:"Could not update document."});
        });
      }
    });
  });
});

app.delete("/api/doc/:id", (req, res)=>{
  console.log("Deleting: " + req.params.id);
  verifyToken(req, res, ()=>{
    knex('docs').where('id', req.params.id).first().then(doc=>{
      if(doc === undefined) {
        console.log("No such document.");
        return res.status(400).json({error:"No such document."});
      }
      else if(doc.userid !== req.userID) {
        return res.status(403).json({error:"You do not have permission to edit the document."});
      }
      else {
        knex('docs').where('id', req.params.id).delete().then(result=>{
          return res.status(200).send();
        }).catch(error=>{
          return res.status(400).json({error:"Could not delete document."});
        });
      }
    });
  });
});

//Get docs
app.get("/api/docs", (req, res)=>{
  verifyToken(req, res, ()=>{
    knex('docs').where('userid', req.userID).select('id', 'title').then(result=>{
      console.log("Sending docs");
      console.log(result);
      res.status(200).json(result);
    }).catch(error=>{
      console.log("ERROR!!!");
      console.log(error);
      res.status(400).json({error:"Problem getting docs."});
    });
  })
});


//END DATA ENDPOINTS

app.listen(3000, ()=>console.log('Listening on 3000'));
