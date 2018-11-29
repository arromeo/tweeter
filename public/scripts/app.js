

$(document).ready(function() {
  let $tweetContainer = $('div.tweet-container');
  let $buttonContainer = $('.button-panel');
  // let isLoggedIn = unknown;

  function renderTweets(tweets, $container) {
    $container.empty();
    let $tweetObj = [];
    let tweetCount = tweets.length;

    tweets.forEach((tweet) => {
        $tweetObj.push({id: tweet._id, content: undefined});
        $.ajax({
          url: '/user/likes',
          type: 'GET',
          dataType: 'text',
          data: `tweet_id=${tweet._id}`,
          success: (function(response) {
  
            let res = JSON.parse(response);
            let likeClass = res.liked === true ? ' user-liked' : '';
            let time = relativeTimeString(Math.floor((Date.now() - tweet.created_at)));


            let result = ($('<article>', {'class': 'tweet'})
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

            $tweetObj.forEach((value, index) => {
              if (value.id === tweet._id) {
                $tweetObj[index].content = result;
              }
            });

            tweetCount--;
            if (tweetCount === 0) {
              $tweetObj.forEach((element) => {
                $container.prepend(element.content);
              });
            }
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

  /**
   *  BUTTON EVENTS
   */

   // Slide down the login pane and slide up registration pane.
  $('.button-panel').on('click', '#login-button', function(event) {
    event.preventDefault();
    $('.registration-container').slideUp('slow');
    $('.login-container').slideToggle('slow');
  });

  // Slide down the registration pane and slide up the login pane.
  $('.button-panel').on('click', '#register-button', function(event) {
    event.preventDefault();
    $('.login-container').slideUp('slow');
    $('.registration-container').slideToggle('slow');
  });

  // Slide down the new tweet form.
  $('.button-panel').on('click', '#compose-button', function(event) {
    event.preventDefault();
    $('.new-tweet').slideToggle('slow');
    $('textarea[name=text]').focus();
  });

  // Send a logout request to the server.
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
  });

  $('.tweet-container').on('click', '.retweet', function(event) {
  });

  $('.tweet-container').on('click', '.favorite', function(event) {
    // Retrieves the current number of likes and updates the front end based on
    // whether the tweet was already liked.
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

    // After updating the front end, the change is sent to the server.
    tweetId = $(event.currentTarget).attr('data-tweetid');
    $.ajax({
      url: `/tweets/${tweetId}`,
      type: 'POST',
      success: (function(response) {
      })
    });
  });

  // Run when user tries to login.
  $('.login-form').submit(function(event) {
    event.preventDefault();

    let username = $(this)[0][0].value; // Username from the form data.
    let password = $(this)[0][1].value; // Password from the form data.
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

  // Run when user tries to submit a registration form.
  $('.registration-form').submit(function(event) {
    event.preventDefault();
    let confirmPassword = $(this)[0][3].value; //Retyped password to confirm.
    const user = {
      username: $(this)[0][1].value, // Username from the form data.
      email: $(this)[0][1].value, // Email from the form data.
      password: $(this)[0][2].value, // Password from the form data.
    }

    // Checks if any fields are left blank before sending off to the server.
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

  // Run when the user attempts to submit a new tweet.
  $('.new-tweet form').submit(function(event) {
    event.preventDefault();
    let entry = $(this)[0][0].value; // Text of new tweet.

    // Make sure the tweet has content in it before sending it off to the
    // server.
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

  // Fills the new tweet error message.
  // TODO: Refactor this to be more descriptive. There are several types of
  //       error messages but this one has a very general title.
  function populateError(message) {
    $('.error-box p').text(message);
    $('.error-box').slideDown('slow');
  }

  // When the correct input is provided, clear the error text and collapse.
  function clearError() {
    $('.error-box p').text('');
    $('.error-box').slideUp('slow');
  }

  // Request a list of tweets to render from the server.
  function loadTweets() {
    $.ajax({
      url: "http://localhost:8080/tweets",
      type: "GET",
      success: function(data) {
        renderTweets(data.tweets , $tweetContainer);

        // If the user has an active cookie session, render correct buttons.
        if (data.isLoggedIn === true) {
          renderButtons(['compose', 'logout'], $buttonContainer);
        } else {
          renderButtons(['login', 'register'], $buttonContainer);
        }
      },
    });
  }

  // Simulates an empty key press to reset the character counter.  
  function resetCharCounter() {
    var e = jQuery.Event("keyup");
    e.which = 50;
    $('textarea').trigger(e);
  }

  loadTweets();
});