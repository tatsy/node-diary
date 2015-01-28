/*
 * JavaScript for controlling page interface
 * This code depends on jQuery
 */

$(function() {
    $('#article-year').hide();
    $('#year-number').click(function(e) {
        $('+div#article-year', this).slideToggle();
    });

    $('#article-month').hide();
    $('#month-number').click(function(e) {
        $('+div#article-month', this).slideToggle();
    });
});
