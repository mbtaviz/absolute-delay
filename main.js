(function () {
  "use strict";
  var margin = {top: 10, right: 10, bottom: 10, left: 80},
      tinyMargin = {top: 0, right: 0, bottom: 0, left: 0},
      outerWidth = 800,
      outerHeight = 7 * 24 * 20,
      scrollBoxHeight = 400,
      tinyOuterWidth = 40,
      legendHeight = 20,
      tinyOuterHeight = scrollBoxHeight,
      width = outerWidth - margin.left - margin.right,
      height = outerHeight - margin.top - margin.bottom,
      tinyWidth = tinyOuterWidth - tinyMargin.left - tinyMargin.right,
      tinyHeight = tinyOuterHeight - tinyMargin.top - tinyMargin.bottom,
      names = {};

  d3.keys(LINES).forEach(function (line) {
    d3.values(LINES[line]).forEach(function (d) {
      names[d.id + '|' + line] = d.name;
    });
  });

  var legendSvg = d3.select("#legend").append("svg")
      .attr("width", outerWidth)
      .attr("height", legendHeight)
    .append('g')
      .attr('class', 'line-gs')
      .attr("transform", 'translate(' + margin.left + ',' + (legendHeight-1) + ')');

  var svg = d3.select("#chart").append("svg")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
    .append('g')
      .attr('class', 'line-gs')
      .attr("transform", 'translate(' + margin.left + ',' + margin.top + ')');

  var grid = svg.append('g').attr('class', 'grid').attr('transform', 'translate(0,-11)');

  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .direction('e')
      .offset([0, 10])
      .html(function(d) { return names[d]; });

  svg.call(tip);

  var tinySvg = d3.select('#tiny').append('svg')
      .attr('class', 'tiny')
      .attr('width', tinyOuterWidth)
      .attr('height', tinyOuterHeight)
    .append('g')
      .attr('transform', 'translate(' + tinyMargin.left + ', ' + tinyMargin.top + ')');

  var loading = window.drawLoading({
    width: outerWidth,
    height: scrollBoxHeight * 0.9,
    parent: d3.select("#chart svg"),
    total: 2589771
  });

  d3.json('median-delays.json', function (medians) {
    d3.json('historical.json')
    .on('progress', loading.progress)
    .get(function(error, data) {
      loading.finish();
      // data is:
      // [
      //   {
      //     time: <unix timestamp in ms of this bucket>,
      //     lines: [
      //       {
      //         line: "red",
      //         byPair: {
      //           "fromid|toid": <average # seconds between these two stops during this period>,
      //           ...
      //         }
      //       },
      //       {
      //         line: "blue",
      //         byPair: { ... }
      //       },
      //       {
      //         line: "orange",
      //         byPair: { ... }
      //       }
      //     ]
      //   },
      //   ...
      // ]

      // draw vertical axis
      var timeRange = d3.extent(data, function (d) { return d.time; });
      var tinyyScale = d3.time.scale()
        .domain(timeRange)
        .range([0, tinyHeight])
        .clamp(true);
      var yScale = d3.time.scale()
        .domain(timeRange)
        .range([10, height])
        .clamp(true);
      var hourAxis = d3.svg.axis()
        .tickFormat(d3.time.format("%-I:%M %p"))
        .ticks(d3.time.hour, 1)
        .scale(yScale)
        .orient("left");
      svg.append('g')
        .attr('class', 'y axis')
        .call(hourAxis);
      var dayAxis = d3.svg.axis()
        .tickFormat(d3.time.format("%A"))
        .ticks(d3.time.day, 1)
        .scale(yScale)
        .orient("left");
      svg.append('g')
        .attr('class', 'day axis')
        .attr('transform', 'translate(0,-10)')
        .call(dayAxis);

      // determine max times per line (take both dirs into account)
      // draw horizontal axis
      var xScale = d3.scale.linear()
          .range([10, width]);
      var xScales = {};
      var tinyxScale = d3.scale.linear()
          .range([0, tinyWidth]);
      var tinyxScales = {};
      var xAxis = {};
      var xGrid = {};
      function setupScale(line) {
        xScales[line] = d3.time.scale();
        tinyxScales[line] = d3.time.scale();
        xAxis[line] = d3.svg.axis()
          .tickFormat(function (d) { return Math.round(d / 1000 / 60) + "m"; })
          .ticks(d3.time.minute, 10)
          .scale(xScales[line])
          .orient("top");
        xGrid[line] = d3.svg.axis()
          .tickFormat(d3.functor(''))
          .ticks(d3.time.minute, 10)
          .scale(xScales[line])
          .tickSize(-height - 11)
          .orient("top");
        legendSvg.append('g').attr('class', 'line ' + line);
        grid.append('g').attr('class', 'line ' + line);
      }
      ['red', 'blue', 'orange'].forEach(setupScale);

      // fill in data lines
      // need array of timestamp/relative delay pairs
      var base = {
        red: 'place-alfcl',
        blue: 'place-wondl',
        orange: 'place-ogmnl'
      };

      draw();

      function draw() {
        // for each timestamp, calculate relative offsets from base
        var stations = {};
        var mins = {red:0,orange:0,blue:0};
        var maxes = {red:0,orange:0,blue:0};
        data.forEach(function (datum) {
          var time = datum.time;
          datum.lines.forEach(function (line) {
            var color = line.line;
            var startingNode = LINES[color][base[color]];
            stations[startingNode.id + '|' + color] = stations[startingNode.id + '|' + color] || [];
            stations[startingNode.id + '|' + color].push([time, 0]);
            var byPair = line.byPair;
            traverse(null, startingNode, 'next', 1000, 0, visit);
            traverse(null, startingNode, 'prev', -1000, 0, visit);
            function visit(previousValue, multiplier, prevId, nextId) {
              var key = nextId + "|" + color;
              var delay = byPair[prevId + "|" + nextId];
              var next = delay ? previousValue + delay * multiplier : NaN;
              (stations[key] = stations[key] || []).push([time, next]);
              if (!isNaN(next)) {
                if (next < mins[color]) { mins[color] = next; }
                if (next > maxes[color]) { maxes[color] = next; }
              }
              return next;
            }
          });
        });
        // put into list of timestamp/relative offset (+/-sec) pairs for each stop
        var ranges = {
          red: maxes.red - mins.red,
          blue: maxes.blue - mins.blue,
          orange: maxes.orange - mins.orange
        };
        var starts = {
          red: 0,
          blue: ranges.red + 10 * 60 * 1000,
          orange: ranges.red + ranges.blue + 20 * 60 * 1000
        };
        var totalTime = d3.sum(d3.values(ranges)) + 20 * 60 * 1000;
        xScale.domain([0, totalTime]);
        tinyxScale.domain([0, totalTime]);
        var lineFuncs = {};
        var tinyLineFuncs = {};
        function adjustScale(color) {
          xScales[color]
            .domain([mins[color], maxes[color]])
            .range([starts[color], starts[color] + ranges[color]].map(xScale));
          tinyxScales[color]
            .domain([mins[color], maxes[color]])
            .range([starts[color], starts[color] + ranges[color]].map(tinyxScale));
          legendSvg.selectAll('.' + color).transition().duration(1000).call(xAxis[color]);
          grid.selectAll('.' + color).transition().duration(1000).call(xGrid[color]);

          lineFuncs[color] = d3.svg.line()
              .x(function (d) { return xScales[color](d[1]); })
              .y(function (d) { return yScale(d[0]); })
              .defined(function (d) { return !isNaN(d[1]); });

          tinyLineFuncs[color] = d3.svg.line()
              .x(function (d) { return tinyxScales[color](d[1]); })
              .y(function (d) { return tinyyScale(d[0]); })
              .defined(function (d) { return !isNaN(d[1]); });
        }
        ['red', 'blue', 'orange'].forEach(adjustScale);

        function updateSvg(svg, lineFuncs, interactive) {
          var stationPaths = svg.selectAll('path.station')
              .data(d3.keys(stations), function (d) { return d; });

          stationPaths
              .transition().duration(1000)
              .attr('d', function (d) { return lineFuncs[color(d)](stations[d]); });

          var newOnes = stationPaths
              .enter()
            .append('path')
              .attr('class', function (d) {
                return 'station ' + color(d);
              })
              .attr('d', function (d) { return lineFuncs[color(d)](stations[d]); })

          if (interactive) {
            newOnes
              .on('click.mouseout', mouseout)
              .on('mouseover', mouseover)
              .on('mousemove', mouseover)
              .on('mouseout', mouseout)
              .on('click', function (d) {
                base[color(d)] = d.replace(/\|(red|orange|blue)/, '');
                draw();
              });
          }
        }

        updateSvg(svg, lineFuncs, true);
        updateSvg(tinySvg, tinyLineFuncs, false);
      }

      function mouseover(d) {
        var pos = d3.mouse(d3.select('html').node());
        var relPos = d3.mouse(svg.node());
        var line = color(d);
        var difference = xScales[line].invert(relPos[0]);
        var time = yScale.invert(relPos[1]);
        d3.selectAll('path.station.' + color(d))
          .classed('active', function (other) { return other === d; })
          .classed('dimmed', function (other) { return other !== d; });
        tip.show(d);
        tip.style('top', (pos[1] - 20) + 'px');
        tip.style('left', (pos[0] + 15) + 'px');
        tip.html([
          moment(time).format('dddd h:mma'),
          '<span class="bolder">' + Math.abs(Math.round(difference / 60 / 1000)) + 'm</span> from ' + names[base[line] + '|' + line] + ' to ' + names[d]
        ].join("<br>"));
      }

      function mouseout(d) {
        tip.hide(d);
        d3.selectAll('path.station')
          .classed('active', false)
          .classed('dimmed', false);
      }

      d3.select('#chart').on('scroll', setScrollBox);
      d3.select('#tiny').on('click', setScroll);

      var scrollToTinyScale = d3.scale.linear()
          .domain([0, outerHeight])
          .range([0, tinyOuterHeight]);

      var scroll = tinySvg.append('rect')
          .attr('class', 'scroll')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', tinyOuterWidth)
          .attr('height', scrollToTinyScale(tinyOuterHeight));

      function setScrollBox() {
        var top = d3.select("#chart").node().scrollTop;
        scroll.attr('y', scrollToTinyScale(top));
      }

      function setScroll() {
        var pos = d3.mouse(tinySvg.node());
        var y = pos[1];
        var scrollPos = Math.max(scrollToTinyScale.invert(y) - tinyOuterHeight / 2, 0);
        d3.select("#chart").node().scrollTop = scrollPos;
        d3.event.stopPropagation();
      }

      setScrollBox();

      function color(str) {
        return str.replace(/.*\|/g, '');
      }

      function traverse(last, node, attr, multiplier, value, callback) {
        node[attr].forEach(function (next) {
          var newValue = callback(value, multiplier, node.id, next.id);
          traverse(node, next, attr, multiplier, newValue, callback);
        });
        var otherAttr = attr === 'prev' ? 'next' : 'prev';
        if (node[otherAttr].length > 1) {
          node[otherAttr].forEach(function (next) {
            if (next === last || last === null) { return; } // don't revisit same node twice
            var newValue = callback(value, multiplier, node.id, next.id);
            traverse(node, next, otherAttr, multiplier, newValue, callback);
          });
        }
      }


      // LAST
      // - on click change base, call draw
      // - lightweight interactivity
      // - stretching-map-glyph
    });
  });
}());