function renderTweets(tweets, $container) {
  $tweetContainer.empty();
  tweets.forEach((tweet) => {
      const daysSinceTweet = Math.floor((Date.now() - tweet.created_at) / 86400000);
      $container.prepend($('<article>', {'class': 'tweet'})
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
  let newTweetVisibile = false;

  $('#compose-button').on('click', function(event) {
    event.preventDefault();
    $('.new-tweet').slideToggle('slow');
    $('textarea[name=text]').focus();
  });

  $('.new-tweet form').submit(function(event) {
    event.preventDefault();
    let entry = $(this)[0][0].value;
    if (entry === '' || entry === null) {
      populateError('Form left blank');
    } else if (entry.length > 140) {
      populateError('Message too long');
    } else {
      clearError();
      $.ajax({
        url: "http://localhost:8080/tweets",
        type: "POST",
        data: $(this).serialize(),
        success: (function() {
          loadTweets();
          $('.new-tweet form textarea').val('');
          resetCharCounter();
        }),
      });
    }
  });

  function populateError(message) {
    $('.error-box p').text(message);
    $('.error-box').slideDown('slow');
  }

  function clearError() {
    $('.error-box p').text('');
    $('.error-box').slideUp('slow');
  }

  function loadTweets() {
    $.ajax({
      url: "http://localhost:8080/tweets",
      type: "GET",
      success: function(data) {
        renderTweets(data, $tweetContainer);
      },
    });
  }

  function resetCharCounter() {
    var e = jQuery.Event("keyup");
    e.which = 50;
    $('textarea').trigger(e);
  }

  loadTweets();
});