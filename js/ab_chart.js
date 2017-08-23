// Define dimensions for the svg canvas
var width = 1000;
var height = 450;
var margin = {"top": 100, "bottom": 100, "left" : 100, "right": 50};


var draw_ab_graph = function(data, pct_base) {
  if ($("#significance_1")) {
    $("g").first().remove();
  }
  var concat_data = data.significance_1.data.concat(data.significance_5.data).concat(data.significance_10.data);
  var svg = d3.select("svg#ab_chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var yScale = d3.scaleLinear()
    .domain(d3.extent(concat_data, function(d) { return d.sample_size }))
    .range([height, 0]);

  var xScale = d3.scaleLinear()
    .domain(d3.extent(concat_data, function(d) { return d.variant_cr }))
    .range([0, width - margin.left]);

  var xAxis = d3.axisBottom(xScale)
    .tickArguments([10, d3.format("%")]);

  // Draw the x axis
  // Wrap the text on the labels
  svg.append("g")
       .attr("class", "xAxis")
       .attr("transform", "translate(0, " + (height) + ")")
       .call(xAxis)
       .append("text")
       .attr("id", "xTitle")
       .attr("y", margin.bottom / 2)
       .attr("x", (width - margin.left) / 2)
       .style("text-anchor", "middle")
       .text("Variant Conversion Rate");

  var yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format("3.2s"));

  // call the yAxis function and then add the yTitle
  svg.append("g")
       .attr("class", "yAxis")
       .call(yAxis)
       .append("text")
       .attr("id", "yTitle")
       .attr("transform", "rotate(-90)")
       .attr("y", -margin.top * 2 / 3)
       .attr("x", - (height) / 2)
       .style("text-anchor", "middle")
       .text("Required Sample Size");

    // Add the grid lines by drawing a faint line across the graph, starting at each tick mark
  svg.selectAll(".yAxis .tick")
    .append("line")
    .attr("class", "gridline")
    .attr("x1", 0)
    .attr("x2", width - margin.left);

  //svg.select(".yAxis path").attr("d", "M0,0H0V450H-6");

  var line = d3.line()
    .x(function(d) { return xScale(d.variant_cr); })
    .y(function(d) { return yScale(d.sample_size); });

  svg.append("path")
    .attr("d", line(data.significance_1.data))
    .attr("id", "significance_1");
  svg.append("path")
    .attr("d", line(data.significance_5.data))
    .attr("id", "significance_5");
  svg.append("path")
    .attr("d", line(data.significance_10.data))
    .attr("id", "significance_10");

  var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  var trackers = focus.selectAll("circle.trackers")
    .data([1, 5, 10])
    .enter()
    .append("circle")
    .attr("class", "trackers")
    .attr("r", 4)
    .attr("cx", -2)
    .attr("cy", -2)
    .attr("id", function(d) {
      return "significance_tracker_" + d;
    });

  var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + 0 + ", " + -margin.top / 2 + ")");

  legend.append("text")
    .attr("id", "expected_effect_legend")
    .text("Variant Conversion Rate:")
    .style("font-weight", "bold");

  legend.append("text")
    .text("Sample Size (Base/Variant):")
    .attr("y", "25px")
    .style("font-weight", "bold");



  var legend_el = legend.selectAll("g.legend_el")
    .data(["1% Significance", "5% Significance", "10% Significance"])
    .enter()
    .append("g")
    .attr("class", "legend_el")
    .attr("id", function(d, i) {

      var level = 1;
      if(i > 0) {
        level = i * 5;
      }
      return "significance_legend_" + level;
    })
    .attr("transform", function(d, i) {
      return "translate(" + width * (i + 2) / 6 + ", 0)";
    })

  legend_el.append("circle")
    .attr("r", 10)
    .attr("cy", -5)
    .attr("cx", -15);

  legend_el.append("text")
    .text(function(d) {
      return d;
    })

  var required_sample = legend_el.append("text")
    .text("0")
    .style("font-weight", "bold")
    .attr("y", "25px")

  bisect_data = d3.bisector(function(d) { return d.variant_cr; }).left;

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width - margin.left)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);


  function mousemove() {
    var d_array = {};
    for(var key in data) {
      var d = data[key];
      var x0 = xScale.invert(d3.mouse(this)[0]),
          i = bisect_data(d.data, x0, 1),
          d0 = d.data[i - 1],
          d1 = d.data[i],
          el = x0 - d0.variant_cr > d1.variant_cr - x0 ? d1 : d0;
          d_array[key] = el;
    }
    // var d_array = $.map(data, function(d, i) {
    //   var x0 = xScale.invert(d3.mouse(that)[0]),
    //       i = bisect_data(d.data, x0, 1),
    //       d0 = d.data[i - 1],
    //       d1 = d.data[i],
    //       el = x0 - d0.variant_cr > d1.variant_cr - x0 ? d1 : d0;
    //       return {"name": keys(data)[i], "el": el};
    // })
    var patt = /.*_([0-9]+)/;
    trackers.attr("transform", function(d, i) {
      var id = d3.select(this).attr("id").match(patt)[1];
      return "translate(" + xScale(d_array["significance_" + id].variant_cr) + "," + yScale(d_array["significance_" + id].sample_size) + ")";
    });
    d3.select("#expected_effect_legend").text("Variant Conversion Rate: " + d3.format(".2%")(d_array["significance_1"].variant_cr));
    required_sample.text(function(d, i) {
      var id = d3.select(this.parentNode).attr("id").match(patt)[1];
      return d3.format("4.3s")(d_array["significance_" + id].sample_size * pct_base) + "/" + d3.format("4.3s")(d_array["significance_" + id].sample_size * (1 - pct_base));
    });
  }

}
