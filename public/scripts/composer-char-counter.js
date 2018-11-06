$(document).ready(function() {
  $('.new-tweet textarea').on('keyup', function(){
    const counter = $('.new-tweet .counter');
    let currentCount = 140 - Number($(this).val().length);
    if (currentCount < 0) {
      counter.addClass('overflow');
    } else {
      counter.removeClass('overflow');
    }
    counter.text(currentCount);
  });
});