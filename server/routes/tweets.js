"use strict";

const express       = require('express');
const tweetsRoutes  = express.Router();

module.exports = function(DataHelpers) {

  // Endpoint to call the helper function that returns a list of tweets.
  tweetsRoutes.get("/", function(req, res) {

    let isLoggedIn = false;

    if (req.session.user_id === null) {
      isLoggedIn = false;
    } else {
      isLoggedIn = true;
    }

    DataHelpers.getTweets((err, tweets) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({'tweets': tweets, 'isLoggedIn': isLoggedIn});
      }
    });
  });

  tweetsRoutes.post('/', (req, res) => {
    if (req.session.user_id !== null) {
      DataHelpers.saveTweet(req.session.user_id, req.body.text, (err, result) => {
        if (err) {
          res.json({'message': err});
        } else {
          res.json({'message': result});
        }
      });
    } else {
      res.json({'message': 'not logged in'});
    }
  });

  tweetsRoutes.post('/:tweet_id', (req, res) => {
    if (req.session.user_id !== null) {
      DataHelpers.toggleTweetLike(req.session.user_id, req.params.tweet_id, (err, result) => {
        if (err) {
          res.json({'message': err});
        } else {
          res.json({'message': result});
        }
      });
    } else {
      res.json({'err': 'not logged in'});
    }
  });

  return tweetsRoutes;

}
