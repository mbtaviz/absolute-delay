window.drawLoading = function(args) {
  var width = args.width;
  var height = args.height;
  var total = args.total;
  var parent = args.parent || d3.select('body').append('svg').attr('width', width).attr('height', height);

  var twoPi = 2 * Math.PI,
      progress = 0,
      formatPercent = d3.format(".0%");

  var arc = d3.svg.arc()
      .startAngle(0)
      .innerRadius(0.75 * height / 2)
      .outerRadius(height / 2);

  var loadingSvg = parent.append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var meter = loadingSvg.append("g")
      .attr("class", "progress-meter");

  meter.append("path")
      .attr("class", "background")
      .attr("d", arc.endAngle(twoPi));

  var foreground = meter.append("path")
      .attr("class", "foreground");

  var text = meter.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em");

  return {
    progress: function () {
      var i = d3.interpolate(progress, d3.event.loaded / total);
      d3.transition().tween("progress", function() {
        return function(t) {
          progress = i(t);
          foreground.attr("d", arc.endAngle(twoPi * progress));
          text.text(formatPercent(progress));
        };
      });
    },
    finish: function () {
      meter.transition().delay(250).attr("transform", "scale(0)");
    }
  };
};