/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */
const data = [
  {
    "user": {
      "name": "Newton",
      "avatars": {
        "small":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_50.png",
        "regular": "https://vanillicon.com/788e533873e80d2002fa14e1412b4188.png",
        "large":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_200.png"
      },
      "handle": "@SirIsaac"
    },
    "content": {
      "text": "If I have seen further it is by standing on the shoulders of giants"
    },
    "created_at": 1461116232227
  },
  {
    "user": {
      "name": "Descartes",
      "avatars": {
        "small":   "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc_50.png",
        "regular": "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc.png",
        "large":   "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc_200.png"
      },
      "handle": "@rd" },
    "content": {
      "text": "Je pense , donc je suis"
    },
    "created_at": 1461113959088
  },
  {
    "user": {
      "name": "Johann von Goethe",
      "avatars": {
        "small":   "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1_50.png",
        "regular": "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1.png",
        "large":   "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1_200.png"
      },
      "handle": "@johann49"
    },
    "content": {
      "text": "Es ist nichts schrecklicher als eine tätige Unwissenheit."
    },
    "created_at": 1461113796368
  }
];

function renderTweets(tweets, $container) {
  tweets.forEach((tweet) => {
      let daysSinceTweet = Math.ceil((Date.now() - tweet.created_at) / 86400000);
      $container.append($('<article>', {'class': 'tweet'})
        .append($('<header>')
            .append($('<img>', {'class': 'avatar fades', 'src': tweet.user.avatars.small}))
            .append($('<h2>', {'class': 'displayname fades'}).text(tweet.user.name))
            .append($('<span>', {'class': 'handle fades'}).text(tweet.user.handle)))
          .append($('<div>', {'class': 'tweet-body'})
            .append($('<p>').text(tweet.content.text)))
          .append($('<footer>')
            .append($('<p>').text(`${daysSinceTweet} days ago`))
            .append($('<div>', {'class': 'icon-container'})
              .append($('<i>', {'class': 'far fa-flag'}))
              .append($('<i>', {'class': 'fas fa-retweet'}))
              .append($('<i>', {'class': 'far fa-heart'})))));
  });
}

$(document).ready(function() {
  $tweetContainer = $('div.tweet-container');
  renderTweets(data, $tweetContainer);
});