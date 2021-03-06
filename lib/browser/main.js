var Bacon = require('baconjs').Bacon;

var nav = require('./nav');

function selectNavbarItem(items, q) {
  items.removeClass('selected').filter('[data-query]').each(function() {
    if ($(this).attr('data-query') == q) {
      $(this).addClass('selected');
    }
  });
}

function combineAutocompletes(extraItems, tags) {
  var extra = {};
  extraItems.filter('[data-query]').each(function() {
    extra[$(this).attr('data-query')] = true;
  });
  return $.extend(extra, tags);
}

$(function() {
  var page = require('./page')($);
  var scrollify = require('./post-list').createScroller(
    page.$contentArea.find('.results-holder'),
    TAGS
  );
  var navItems = $('.nav ul li a');
  var queries = new Bacon.Bus();
  var searchQueries = new Bacon.Bus();
  var postDetails = new Bacon.Bus();

  nunjucks.configure(require('./nunjucks-options'));
  require('./player').setup($('.player').first(), PODCASTS);
  require('./search').setup($('#search'), searchQueries,
                            combineAutocompletes(navItems, TAGS));
  require('./post-detail').setup(page.$contentArea, postDetails);
  queries.skipDuplicates().onValue(function(q) {
    $('#search').typeahead('val', q || '');
    selectNavbarItem(navItems, q);
    scrollify(q);
  });
  nav.setup({post: window.POST}, queries, postDetails);

  searchQueries.onValue(function(q) {
    postDetails.push(null);
    nav.setCurrentURL('/', q);
  });
  queries.plug(searchQueries);

  if (/[\?&]?debug=on/.test(window.location.search))
    require('./debug-panel').setup();
});
