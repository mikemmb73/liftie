var init = require('domready');
var nodelist = require('nodelist');
var minimax = require('minimax');
var resort = require('resort');
var state = require('state');
var tag = require('tag');

/*global document window*/
init(function() {
  var resorts = nodelist(document.querySelectorAll('.resort')),
    opens = state(resorts, 'open'),
    starred = state(resorts, 'starred'),
    starredTag = tag(document.querySelector('.tags .starred')),
    refresh = resorts.map(function(r) {
      return resort(r);
    });
  resorts.forEach(function(r) {
    minimax(r, '.minimax').state('open').on(function(open) {
      if (open) {
        resort(r).refresh();
      }
      opens.update();
    });
    minimax(r, '.star').state('starred').on(function() {
      starredTag.update(starred.update().length);
    });
  });
  window.setInterval(function() {
    refresh.forEach(function(r) {
      r.refresh();
    });
  }, 5 * 1000);
  opens.update();
  starredTag.update(starred.load().length);
});