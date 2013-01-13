var request = require('superagent');
var classes = require('classes');
var dataset = require('dataset');

/*global window */

module.exports = resort;

function removeAllChildren(node) {
  while (node.hasChildNodes()) {
      node.removeChild(node.lastChild);
  }
}

function renderStatus(node, status) {
  removeAllChildren(node);
  node.innerHTML = Object.keys(status).map(function(name) {
    var klass = "status ls-" + status[name];
    return '<li class="lift">'
      + '<span class="name">' + name + '</span>'
      + '<span class="' + klass + '">'
      + '</span></li>';
  }).join('');
}

function renderStats(node, stats) {
  removeAllChildren(node);
  node.innerHTML = Object.keys(stats).map(function(stat) {
    var klass = "ls-" + stat;
    return '<li><span class="' + klass + '">'
      + '&nbsp;' + stats[stat] + '&nbsp;'
      + '</span><span>' + stat + '</span></li>';
  }).join('');
}

function resort(node) {
  var interval = 70 * 1000; // 70 seconds
  var refreshStart = 0;

  function render(resort) {
    dataset(node, 'timestamp', resort.timestamp);
    renderStatus(node.querySelector('.lifts'), resort.status);
    renderStats(node.querySelector('.summary'), resort.stats);
  }

  function updateTimeToRefresh(millis) {
    var ttr = node.querySelector('.time-to-refresh');
    ttr.innerHTML = (millis / 1000).toFixed();
  }

  function refresh() {
    var id = dataset(node, 'resort'),
      now,
      timestamp,
      since;

    if (!classes(node).has('open')) {
      // skip closed resorts
      return;
    }
    if (refreshStart > 0) {
      // refresh still in progress
      return;
    }
    timestamp = dataset(node, 'timestamp');
    now = Date.now();
    since = now - timestamp;
    if (since > interval) {
      updateTimeToRefresh(0);
      refreshStart = now;
      request.get('/api/resort/' + id, function(res) {
        var remainingTime = 2000 - (Date.now() - refreshStart);
        // make sure that refresh lasts at least 2 seconds - othwerwise people don't see it
        if (remainingTime < 0) {
          remainingTime = 0;
        }
        render(res.body);
        window.setTimeout(function() {
          updateTimeToRefresh(interval);
          refreshStart = 0;
        }, remainingTime);
      });
    } else {
      updateTimeToRefresh(interval - since);
    }
  }

  return {
    refresh: refresh
  };
}
