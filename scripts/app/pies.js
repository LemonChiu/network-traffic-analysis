function buildPies(){
    d3.csv("data/pies.csv", function(flows) {
        var pieMargin = 10,
            pieRadius = 70,
            pieColors = d3.scale.category20();

        var pie = d3.layout.pie()
            .value(function(d) { return + d.count; })
            .sort(function(a, b) { return b.count - a.count; });

        var arc = d3.svg.arc()
            .innerRadius(pieRadius / 2)
            .outerRadius(pieRadius);

        var communicationMode = d3.nest()
            .key(function(d) { return d.origin; })
            .entries(flows);

        var piesSvg = d3.select("#pie-svg-div").selectAll("div")
            .data(communicationMode)
            .enter().append("div")
            .style("display", "inline")
            .append("svg:svg")
            .attr("width", (pieRadius + pieMargin * 2) * 2)
            .attr("height", (pieRadius + pieMargin * 2) * 2)
            .append("svg:g")
            .attr("transform", "translate(" + (pieRadius + pieMargin) + "," + (pieRadius + pieMargin + 10) + ")");

        var pieGroup = piesSvg.selectAll("g")
            .data(function(d) { return pie(d.values); })
            .enter().append("svg:g");

        pieGroup.append("svg:path")
            .attr("d", arc)
            .style("fill", function(d) { return pieColors(d.data.protocol); })
            .append("svg:title")
            .text(function(d) { return d.data.protocol + ": " + d.data.count; });

        pieGroup.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")"; })
            .text(function(d) { return d.data.protocol; });

        piesSvg.append("svg:text")
            .attr("dy", pieRadius + 14)
            .attr("text-anchor", "middle")
            .text(function(d) { return d.key; })
            .style("font-size", "13px");

        function angle(d) {
            var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
            return a > 90 ? a - 180 : a;
        }
    });
}

function showPies() {
    d3.select("#pie-svg-div").selectAll("div")
        .style("opacity", 1);
}

function hidePies() {
    d3.select("#pie-svg-div").selectAll("div")
        .style("opacity", 0);
}
