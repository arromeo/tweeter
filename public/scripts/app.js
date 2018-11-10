function renderTweets(tweets, $container) {
  $container.empty();
  tweets.forEach((tweet) => {
      $.ajax({
        url: '/user/likes',
        type: 'GET',
        dataType: 'text',
        data: `tweet_id=${tweet._id}`,
        success: (function(response) {

          let res = JSON.parse(response);

          let likeClass = res.liked === true ? ' user-liked' : '';

          let time = relativeTimeString(Math.floor((Date.now() - tweet.created_at)));
          $container.prepend($('<article>', {'class': 'tweet'})
            .append($('<header>')
                .append($('<img>', {'class': 'avatar fades', 'src': tweet.user.avatars.small}))
                .append($('<h2>', {'class': 'displayname fades'}).text(tweet.user.name))
                .append($('<span>', {'class': 'handle fades'}).text(tweet.user.handle)))
              .append($('<div>', {'class': 'tweet-body'})
                .append($('<p>').text(tweet.content.text)))
              .append($('<footer>')
                .append($('<p>').text(time))
                .append($('<div>', {'class': 'icon-container'})
                  .append($('<span>', {'class': 'flag', 'data-tweetid': tweet._id})
                    .append($('<i>', {'class': 'far fa-flag'})))
                  .append($('<span>', {'class': 'retweet', 'data-tweetid': tweet._id})
                    .append($('<i>', {'class': 'fas fa-retweet'})))
                  .append($('<span>', {'class': 'favorite', 'data-tweetid': tweet._id})
                    .append($('<i>', {'class': `far fa-heart${likeClass}`, 'data-likes': tweet.content.likes, 'data-liked': res.liked })
                    .append($('<span>', {'class': 'fa-layers-text fa-inverse', 'data-fa-transoform':'shrink-11.5 rotate--30'})
                      .css({'font-weight': 900, 'color':'cadetblue'}).text(tweet.content.likes)))))));
        }),
      });
  });
}


// Creates a relative time string.

function relativeTimeString(time) {
  let number, unit;
  if (time > 31540000000) {
    number = Math.round(time / 31540000000);
    unit = (number === 1) ? "year" : "years";
    return `${number} ${unit} ago`
  } else if (time > 2592000000) {
    number = Math.round(time / 2592000000);
    unit = (number === 1) ? "month" : "months";
    return `${number} ${unit} ago`
  } else if (time > 86400000) {
    number = Math.round(time / 86400000);
    unit = (number === 1) ? "day" : "days";
    return `${number} ${unit} ago`
  } else if (time > 3600000) {
    number = Math.round(time / 3600000);
    unit = (number === 1) ? "hour" : "hours"
    return `${number} ${unit} ago`
  } else if (time > 60000) {
    number = Math.round(time / 60000);
    unit = (number === 1) ? "minute" : "minutes"
    return `${number} ${unit} ago`
  } else {
    return 'seconds ago'
  }
}

// Button factory to populate the top bar.

function renderButtons(types, $container) {
  $container.empty();
  types.forEach((type) => {
    let display = type.charAt(0).toUpperCase() + type.slice(1);
    if (type == 'compose') {
      $container.append($('<button>', {'id': `${type}-button`, 'type': 'submit'})
      .text(`${display}`));
      $('#compose-button').html('<i class="far fa-edit"></i>Compose');
    } else {
      $container.append($('<button>', {'id': `${type}-button`, 'type': 'submit'})
        .text(`${display}`));
    }
  });
}

$(document).ready(function() {
  $tweetContainer = $('div.tweet-container');
  $buttonContainer = $('.button-panel');

  $('.button-panel').on('click', '#login-button', function(event) {
    event.preventDefault();
    $('.registration-container').slideUp('slow');
    $('.login-container').slideToggle('slow');
  });

  $('.button-panel').on('click', '#register-button', function(event) {
    event.preventDefault();
    $('.login-container').slideUp('slow');
    $('.registration-container').slideToggle('slow');
  });

  $('.button-panel').on('click', '#compose-button', function(event) {
    event.preventDefault();
    $('.new-tweet').slideToggle('slow');
    $('textarea[name=text]').focus();
  });

  $('.button-panel').on('click', '#logout-button', function(event) {
    event.preventDefault();
    $.ajax({
      url: '/logout',
      type: 'POST',
      success: (function(response) {
      }),
    })
    renderButtons(['login', 'register'], $buttonContainer);
  });

  $('.tweet-container').on('click', '.flag', function(event) {
    tweetId = $(event.currentTarget).data('tweetid');
    $.ajax({
      url: `/tweet/${tweetId}`,
      type: 'POST',
      success: (function(response) {
        console.log(response.message);
      }),
    });
  });

  $('.tweet-container').on('click', '.retweet', function(event) {

  });

  $('.tweet-container').on('click', '.favorite', function(event) {
    let value = Number($(event.target).attr('data-likes'));

    if ($(event.target).attr('data-liked') === "true") {
      $(event.target).attr('data-liked', "false");
      value--;
      $(event.target).attr('data-likes', value.toString());
      $(event.target).removeClass('user-liked').text(value);
    } else {
      $(event.target).attr('data-liked', "true");
      value++;
      $(event.target).attr('data-likes', value.toString());
      $(event.target).addClass('user-liked').text(value);
    }

    tweetId = $(event.currentTarget).attr('data-tweetid');
    $.ajax({
      url: `/tweet/${tweetId}`,
      type: 'POST',
      success: (function(response) {
      })
    });
  });

  $('.login-form').submit(function(event) {
    event.preventDefault();
    let username = $(this)[0][0].value;
    let password = $(this)[0][1].value;
    if (username.length !== 0 && password.length !== 0) {
      $.ajax({
        url: '/login',
        type: 'POST',
        data: $(this).serialize(),
        success: (function(response) {
          if(response.err) {
            $('.login-error')
              .text(response.err)
              .slideDown('slow');
          } else {
            $('.login-container').slideUp('slow');
            $('.login-form input').val('');
            renderButtons(['compose', 'logout'], $buttonContainer);
          }
        }),
      });
    } else {
      $('.login-error')
        .text('Please fill in all fields')
        .slideDown('slow');
    }
  });

  $('.registration-form').submit(function(event) {
    event.preventDefault();
    let confirmPassword = $(this)[0][3].value;
    const user = {
      username: $(this)[0][1].value,
      email: $(this)[0][1].value,
      password: $(this)[0][2].value,
    }
    if (user.username.length === 0 ||
      user.email.length === 0 ||
      user.password.length === 0 ||
      confirmPassword.length === 0) {
        $('.registration-error')
          .text('Please fill all fields')
          .slideDown('slow');
      } else if (user.password == confirmPassword) {
        $.ajax({
          url: '/register',
          type: 'POST',
          data: $(this).serialize(),
          success: (function(response) {
            if(response.err) {
              $('.registration-error')
                .text(response.err)
                .slideDown('slow');
            } else {
              $('.registration-container').slideUp('slow');
              $('.registration-form input').val('');
              renderButtons(['compose', 'logout'], $buttonContainer);
            }
          })
        });
      } else {
        $('.registration-error')
          .text('Passwords do not match')
          .slideDown('slow');
      }
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
        url: "http://localhost:8080/tweet",
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
        renderTweets(data.tweets , $tweetContainer);

        if (data.isLoggedIn === true) {
          renderButtons(['compose', 'logout'], $buttonContainer);
        } else {
          renderButtons(['login', 'register'], $buttonContainer);
        }
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