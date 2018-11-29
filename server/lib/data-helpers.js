"use strict";
const mongo = require('mongodb');
// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    // Saves a tweet to `db`
    saveTweet: function(user, tweetContent, callback) {
      let o_id = mongo.ObjectID(user);
      db.collection('users').find({_id: o_id}).toArray((err, userResult) => {
        if (err) {
          return callback(err);
        }

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
            "text": tweetContent,
            "likes": 0,
          },
          "created_at": Date.now(),
        }
        db.collection('tweets').insert(newTweet);
        callback(null, 'succcess');
      });
    },

    // Get all tweets in `db`, sorted by newest first
    getTweets: function(callback) {
      db.collection('tweets').find().toArray((err, tweets) => {
        if (err) {
          return callback(err);
        }
        callback(null, tweets);
      });
    },

    // Likes or unlikes tweet.
    toggleTweetLike: function(userId, tweetId, callback) {
      let o_id = mongo.ObjectID(userId);
      let tweet_id = mongo.ObjectID(tweetId);
      db.collection('users').find({_id: o_id}).toArray((err, userResult) => {
        if (err) {
          return callback(err);
        }
        if(userResult.length === 1) {
          let user = userResult[0];
          if (user.liked.includes(tweetId)) {
            let removeIndex = user.liked.indexOf(tweetId);

            user.liked.splice(removeIndex, 1);
            db.collection('users').update({'_id': o_id}, {'$pull': {'liked': tweetId}});
            db.collection('tweets').update({'_id': tweet_id}, {'$inc': {'content.likes' : -1}});
          } else {
            db.collection('users').update({'_id': o_id}, {'$push': {'liked': tweetId}});
            db.collection('tweets').update({'_id': tweet_id}, {'$inc': {'content.likes' : 1 }});
          }
          callback(null, 'success');
        } else {
          return callback(err);
        }
      });
    }
  };
}
