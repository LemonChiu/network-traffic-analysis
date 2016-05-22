function buildTreemap() {
    d3.select("#treemapSvgDiv").select("svg").remove();
    if (serversList.length == 0) {
        return;
    }
    d3.selectAll(".bar-option").style("display", "inline");

    var x = d3.scale.linear().range([0, treemapWidth]),
        y = d3.scale.linear().range([0, treemapHeight]),
        root,
        node;

    var treemap = d3.layout.treemap()
        .padding(2)
        .round(false)
        .size([treemapWidth, treemapHeight])
        .sticky(true)
        .value(function(d) { return d.size });

    var svgTreemap = d3.select("#treemapSvgDiv")
        .attr("class", "chart")
        .append("svg:svg")
        .attr("width", treemapWidth)
        .attr("height", treemapHeight)
        .append("svg:g")
        .attr("transform", "translate(.5,.5)");

    d3.json("data/treemap.json", function(error, jsonCount) {
        if (error) {
            throw error
        }

        node = root = jsonCount;
        var nodes = treemap.nodes(root)
            .filter(function(d) { return !d.children });

        var cell = svgTreemap.selectAll("g")
            .data(nodes)
            .enter().append("svg:g")
            .attr("class", "cell")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .on("click", function(d) { return zoom(node == d.parent ? root : d.parent); });

        cell.append("svg:rect")
            .attr("width", function(d) { return d.dx > 1 ? d.dx - 1 : 0; })
            .attr("height", function(d) { return d.dy > 1 ? d.dy - 1 : 0; })
            .style("fill", function(d) { return color(d.parent.name); })
            .style("fill-opacity", function(d) { return contains(serversList, d.name) ? 1 : 0.2 })
            .on("mouseover", function (d) { node_onMouseOver(d, "RECT"); })
            .on("mouseout", function (d) { node_onMouseOut(d, "RECT"); });

        cell.append("svg:text")
            .attr("x", function(d) { return d.dx / 2; })
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.name + ": " + d.parent.name; })
            .style("font-size", "14px")
            .style("opacity", function(d) {
                if (contains(serversList, d.name)) {
                    d.w = this.getComputedTextLength();
                    return d.dx > d.w ? 1 : 0.2;
                } else {
                    return 0;
                }
            })
            .style("cursor", "default");

        d3.select(window).on("click", function() { zoom(root); });

        d3.selectAll("input[type=\"radio\"]").on("change", function() {
            treemap.value(this.value == "size" ? size : count).nodes(root);
            zoom(node);
        });
    });

    // Flow size
    function size(d) {
        return d.size;
    }

    // Access count
    function count(d) {
        return d.count;
    }

    function zoom(d) {
        var kx = treemapWidth / d.dx, ky = treemapHeight / d.dy;
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);

        var t = svgTreemap.selectAll("g.cell").transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        t.select("rect")
            .attr("width", function(d) { return kx * d.dx > 1 ? kx * d.dx - 1 : 0; })
            .attr("height", function(d) { return ky * d.dy > 1? ky * d.dy - 1 : 0; })
            .style("fill-opacity", function(d) { return contains(serversList, d.name) ? 1 : 0.2 });

        t.select("text")
            .attr("x", function(d) { return kx * d.dx / 2; })
            .attr("y", function(d) { return ky * d.dy / 2; })
            .style("opacity", function(d) {
                if (contains(serversList, d.name)) {
                    d.w = this.getComputedTextLength();
                    return d.dx > d.w ? 1 : 0.2;
                } else {
                    return 0;
                }
            })
            .style("cursor", "default");

        node = d;
        d3.event.stopPropagation();
    }
    //log("buildTreemap()");
}

function hideTreemap() {
    d3.select("#treemapSvgDiv").select("svg").remove();
    d3.selectAll(".bar-option").style("display", "none");
}