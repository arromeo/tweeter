"use strict";

// Basic express setup:

const PORT          = 8080;
const path          = require("path");
const express       = require("express");
const bodyParser    = require("body-parser");
const bcrypt        = require("bcryptjs");
const app           = express();
const cookieSession = require("cookie-session");
const mongo         = require("mongodb");
const md5           = require("md5");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieSession({
  name: 'session',
  keys: ['test1', 'test2']
}));

const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb://localhost:27017/tweeter';
const db = MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) {
    console.error(`Failed to connect: ${MONGODB_URI}`);
    throw err;
  }
  const DataHelpers = require("./lib/data-helpers.js")(db);
  const tweetsRoutes = require("./routes/tweets")(DataHelpers);
  // Mount the tweets routes at the "/tweets" path prefix:
  app.use("/tweets", tweetsRoutes);

  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/routes/login.html'));
  });

  app.post('/login', (req, res) => {
    db.collection('users').find({username: req.body.username}).toArray((err, usernameResult) => {
      
      if (usernameResult.length === 0) {
        res.json({'err': 'Username or login incorrect.'});
      } else {
        if (bcrypt.compareSync(req.body.password, usernameResult[0].password)) {
          req.session.user_id = usernameResult[0]._id;
          res.json({'err': null, 'message': 'successful login'});
        } else {
          res.json({'err': 'Username or login incorrect.'});
        }
      }
    });
  });

  app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.json({'message': 'successful logout'});
  });

  app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname + '/routes/register.html'));
  });

  app.post('/register', (req, res) => {
    
    // Check username to see if it exists.
    db.collection('users').find({username: req.body.username}).toArray((err, usernameResult) => {
      if (err) {
        return callback(err);
      }

      if (usernameResult.length === 0) {
        // Check email to see if it exists.
        db.collection('users').find({email: req.body.email}).toArray((err, emailResult) => {
          if (err) {
            return callback(err);
          }
  
          if(emailResult.length === 0) {
            // Register new user.
            const avatarUrlPrefix = `https://vanillicon.com/${md5(req.body.username)}`;

            let user = {
              username: req.body.username,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, 10),
              displayName: req.body.username,
              avatar: {
                small:   `${avatarUrlPrefix}_50.png`,
                regular: `${avatarUrlPrefix}.png`,
                large:   `${avatarUrlPrefix}_200.png`,
              },
              liked: [],
            };
            db.collection('users').insertOne(user);
            db.collection('users').find({username: user.username}).toArray((err, emailResult) => {
              if (err) {
                return callback(err);
              }
              req.session.user_id = emailResult[0]._id;
              res.json({'err': null, 'message': 'success'});
            });
          } else {
            res.json({'err': 'Email already registered.'});
          }
        });
      } else {
        res.json({'err': 'Username already registered.'});
      }
    });
  });

  app.post('/tweet', (req, res) => {
    if (req.session.user_id !== null) {
      let o_id = mongo.ObjectID(req.session.user_id);
      db.collection('users').find({_id: o_id}).toArray((err, userResult) => {
        let user = userResult[0];
        let newTweet = {
          user: {
            "name": user.displayName,
            "avatars": {
              "small": user.avatar.small,
              "regular": user.avatar.regular,
              "large": user.avatar.large,
            },
            "handle": user.username,
          },
          "content": {
            "text": req.body.text,
            "likes": 0,
          },
          "created_at": Date.now(),
        }
        db.collection('tweets').insert(newTweet);
        res.json({'message': 'successful post'});
      });
    } else {
      res.json({'message': 'not logged in'});
    }
  });

  app.post('/tweet/:tweet_id', (req, res) => {
    if (req.session.user_id !== null) {
      let o_id = mongo.ObjectID(req.session.user_id);
      let tweet_id = mongo.ObjectID(req.params.tweet_id);
      db.collection('users').find({_id: o_id}).toArray((err, userResult) => {
        if (err) {
          return callback(err);
        }
        if(userResult.length === 1) {
          let user = userResult[0];
          if (user.liked.includes(req.params.tweet_id)) {
            let removeIndex = user.liked.indexOf(req.params.tweet_id);

            user.liked.splice(removeIndex, 1);
            db.collection('users').update({'_id': o_id}, {'$pull': {'liked': req.params.tweet_id}});
            db.collection('tweets').update({'_id': tweet_id}, {'$inc': {'content.likes' : -1}});
          } else {
            db.collection('users').update({'_id': o_id}, {'$push': {'liked': req.params.tweet_id}});
            db.collection('tweets').update({'_id': tweet_id}, {'$inc': {'content.likes' : 1 }});
          }
          res.json({'err': null, 'message': 'successful fav/unfav'});
        } else {
          res.json({'err': 'invalid user'});
        }
      });
    } else {
      res.json({'err': 'not logged in'});
    }
  });

  app.get('/user/likes', (req, res) => {
    if (req.session.user_id !== null) {
      let o_id = mongo.ObjectID(req.session.user_id);
      db.collection('users').find({'_id': o_id}).toArray((err, user) => {
        if (err) {
          return callback(err);
        }
        if(user.length === 1) {
          if (user[0].liked.includes(req.query.tweet_id)) {
            res.json({'liked': true});
          } else {
            res.json({'liked': false});
          }
        } else {
          res.json({'liked': false});
        }
      });
     } else {
       res.json({'err': 'not logged in'});
     }
  });

  app.listen(PORT, () => {
    console.log("Example app listening on port " + PORT);
  });
  
});
