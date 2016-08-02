var graphIndex = 0;
var nextGraphDuration = 50;
var linesGraph, horizonsGraph, stackedAreaGraph, groupedBarGraph, stackedBarGraph,
    transposeBarGraph, donutGraph, donutExplodeGraph;

function buildTimeline() {
    removeTimelineSVG();
    graphIndex = 0;
    if (serversList.length === 0) {
        d3.selectAll("#next-graph-btn").style("display", "none");
        return;
    }
    d3.selectAll("#next-graph-btn").style("display", "inline");

    var margin = [20, 30, 20, 20],
        timelineWidth = 550,
        timelineHeight = 220,
        verticalSpace = 10;

    var x,
        y,
        duration = 500,
        delay = 1000;

    var svg = d3.select("#timeline-svg-div").append("svg")
        .attr("width", timelineWidth + margin[1] + margin[3])
        .attr("height", timelineHeight + margin[0] + margin[2])
        .append("g")
        .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

    var stocks,
        symbols;

    // A line generator, for the dark stroke.
    var line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d.price);
        });

    var xAxis = d3.svg.axis()
        .scale(d3.time.scale().domain([new Date(2015,6,29,0,0), new Date(2015,6,30,0,0)])
        .range([0, timelineWidth - 60]))
        .orient("bottom")
        .ticks(8)
        .tickFormat(d3.time.format("%H:%M"));

    // A line generator, for the dark stroke.
    var axis = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
            return x(d.date);
        })
        .y(timelineHeight);

    // A area generator, for the dark stroke.
    var area = d3.svg.area()
        .interpolate("basis")
        .x(function (d) {
            return x(d.date);
        })
        .y1(function (d) {
            return y(d.price);
        });

    var xAxisSvg;

    d3.csv("data/timeline.csv", function (data) {
        var parse = d3.time.format("%H:%M").parse;
        var filteredData = data.filter(function(d)
        {
            if (contains(serversList, d.symbol)) {
                return d;
            }
        })

        // Nest stock values by symbol.
        symbols = d3.nest()
            .key(function (d) {
                return d.symbol;
            })
            .entries(stocks = filteredData);

        // Parse dates and numbers. We assume values are sorted by date.
        // Also compute the maximum price per symbol, needed for the y-domain.
        symbols.forEach(function (s) {
            s.values.forEach(function (d) {
                d.date = parse(d.date);
                d.price = +d.price;
            });
            s.maxPrice = d3.max(s.values, function (d) {
                return d.price;
            });
            s.sumPrice = d3.sum(s.values, function (d) {
                return d.price;
            });
        });

        // Sort by maximum price, descending.
        symbols.sort(function (a, b) {
            return b.maxPrice - a.maxPrice;
        });

        var g = svg.selectAll("g")
            .data(symbols)
            .enter().append("g")
            .attr("class", "symbol");

        xAxisSvg = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + timelineHeight  + ")")
            .call(xAxis)
            .style("display", "none");

        setTimeout(linesGraph, duration);
    });

    linesGraph = function lines() {
        xAxisSvg.style("display", "none");
        x = d3.time.scale().range([0, timelineWidth - 60]);
        y = d3.scale.linear().range([timelineHeight / serversList.length - verticalSpace, 0]);

        // Compute the minimum and maximum date across symbols.
        x.domain([
            d3.min(symbols, function (d) {
                return d.values[0].date;
            }),
            d3.max(symbols, function (d) {
                return d.values[d.values.length - 1].date;
            })
        ]);

        var g = svg.selectAll(".symbol")
            .attr("transform", function (d, i) {
                return "translate(0," + (i * timelineHeight / serversList.length) + ")";
            });

        g.each(function (d) {
            var e = d3.select(this);

            e.append("path")
                .attr("class", "line");

            e.append("circle")
                .attr("r", 5)
                .style("fill", function (d) {
                    return globalColor(d.key);
                })
                .style("stroke", "#000")
                .style("stroke-width", "1px");

            e.append("text")
                .attr("dx", "10")
                .attr("dy", "4")
                .text(d.key);
        });

        function draw(k) {
            g.each(function (d) {
                var e = d3.select(this);
                y.domain([0, d.maxPrice]);

                e.select("path")
                    .attr("d", function (d) {
                        return line(d.values.slice(0, k + 1));
                    });

                e.selectAll("circle, text")
                    .data(function (d) {
                        return [d.values[k], d.values[k]];
                    })
                    .attr("transform", function (d) {
                        return "translate(" + x(d.date) + "," + y(d.price) + ")";
                    });
            });
        }

        var k = 1, n = symbols[0].values.length;
        d3.timer(function () {
            draw(k);
            if ((k += 2) >= n - 1) {
                draw(n - 1);
                horizonsGraph();
                return true;
            }
        });
    }

    horizonsGraph = function horizons() {
        xAxisSvg.style("display", "block");
        svg.insert("defs", ".symbol")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", timelineWidth + margin[1] + margin[3])
            .attr("height", timelineHeight / serversList.length - verticalSpace);

        var color = d3.scale.ordinal()
            .range(["#c6dbef", "#9ecae1", "#6baed6"]);

        var g = svg.selectAll(".symbol")
            .attr("clip-path", "url(#clip)");

        area
            .y0(timelineHeight / serversList.length - verticalSpace);

        g.select("circle").transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + (timelineWidth - 60) + "," + (-timelineHeight / serversList.length - verticalSpace) + ")";
            })
            .remove();

        g.select("text").transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + (timelineWidth - 60) + "," + (timelineHeight / serversList.length - verticalSpace) + ")";
            })
            .attr("dy", "0");

        g.each(function (d) {
            y.domain([0, d.maxPrice]);

            d3.select(this).selectAll(".area")
                .data(d3.range(3))
                .enter().insert("path", ".line")
                .attr("class", "area")
                .attr("transform", function (d) {
                    return "translate(0," + (d * (timelineHeight / serversList.length - verticalSpace)) + ")";
                })
                .attr("d", area(d.values))
                .style("fill", function (d, i) {
                    return color(i);
                })
                .style("fill-opacity", 1e-6)
                .on("mouseover", function (d) { node_onMouseOver(d, "AREA"); })
                .on("mouseout", function (d) { node_onMouseOut(d, "AREA"); });;

            d3.select(this).selectAll(".line").transition()
                .duration(duration)
                .attr("d", line(d.values))
                .style("stroke-opacity", 1e-6);

            d3.select(this).selectAll(".area").transition()
                .duration(duration)
                .style("fill-opacity", 1)
                .attr("d", area(d.values))
                .each("end", function () {
                    d3.select(this).style("fill-opacity", null);
                });
        });

        setTimeout(areasGraph, 300);
    }

    areasGraph = function areas() {
        var g = svg.selectAll(".symbol");

        axis
            .y(timelineHeight / serversList.length - verticalSpace);

        g.select(".line")
            .attr("d", function (d) {
                return axis(d.values);
            });

        g.each(function (d) {
            y.domain([0, d.maxPrice]);

            d3.select(this).select(".line").transition()
                .duration(duration)
                .style("stroke-opacity", 1)
                .each("end", function () {
                    d3.select(this).style("stroke-opacity", null);
                });

            d3.select(this).selectAll(".area")
                .filter(function (d, i) {
                    return i;
                })
                .transition()
                .duration(duration)
                .style("fill-opacity", 1e-6)
                .attr("d", area(d.values))
                .remove();

            d3.select(this).selectAll(".area")
                .filter(function (d, i) {
                    return !i;
                })
                .transition()
                .duration(duration)
                .style("fill", globalColor(d.key))
                .attr("d", area(d.values));
        });

        svg.select("defs").transition()
            .duration(duration)
            .remove();

        g.transition()
            .duration(duration)
            .each("end", function () {
                d3.select(this).attr("clip-path", null);
            });

        //setTimeout(stackedAreaGraph, duration + delay);
    }

    stackedAreaGraph = function stackedArea() {
        var stack = d3.layout.stack()
            .values(function (d) {
                return d.values;
            })
            .x(function (d) {
                return d.date;
            })
            .y(function (d) {
                return d.price;
            })
            .out(function (d, y0, y) {
                d.price0 = y0;
            })
            .order("reverse");

        stack(symbols);

        y
            .domain([0, d3.max(symbols[0].values.map(function (d) {
                return d.price + d.price0;
            }))])
            .range([timelineHeight, 0]);

        area
            .y0(function (d) {
                return y(d.price0);
            })
            .y1(function (d) {
                return y(d.price0 + d.price);
            });

        var t = svg.selectAll(".symbol").transition()
            .duration(duration)
            .attr("transform", "translate(0,0)")
            .each("end", function () {
                d3.select(this).attr("transform", null);
            });

        t.select("path.area")
            .attr("d", function (d) {
                return area(d.values);
            });

        t.select("path.line")
            .style("stroke-opacity", 0);

        t.select("text")
            .attr("transform", function (d) {
                d = d.values[d.values.length - 1];
                return "translate(" + (timelineWidth - 60) + "," + y(d.price / 2 + d.price0) + ")";
            });

        //setTimeout(groupedBarGraph, duration + delay);
    }

    groupedBarGraph = function groupedBar() {
        x = d3.scale.ordinal()
            .domain(symbols[0].values.map(function (d) {
                return d.date;
            }))
            .rangeBands([0, timelineWidth - 60], .1);

        var x1 = d3.scale.ordinal()
            .domain(symbols.map(function (d) {
                return d.key;
            }))
            .rangeBands([0, x.rangeBand()]);

        var g = svg.selectAll(".symbol");

        var t = g.transition()
            .duration(duration);

        t.select(".line")
            .style("stroke-opacity", 1e-6)
            .remove();

        t.select(".area")
            .style("fill-opacity", 1e-6)
            .remove();

        g.each(function (p, j) {
            d3.select(this).selectAll("rect")
                .data(function (d) {
                    return d.values;
                })
                .enter().append("rect")
                .attr("x", function (d) {
                    return x(d.date) + x1(p.key);
                })
                .attr("y", function (d) {
                    return y(d.price);
                })
                .attr("width", x1.rangeBand())
                .attr("height", function (d) {
                    return timelineHeight - y(d.price);
                })
                .style("fill", globalColor(p.key))
                .style("fill-opacity", 1e-6)
                .transition()
                .duration(duration)
                .style("fill-opacity", 1);
        });

        //setTimeout(stackedBarGraph, duration + delay);
    }

    stackedBarGraph = function stackedBar() {
        x.rangeRoundBands([0, timelineWidth - 60], .1);

        var stack = d3.layout.stack()
            .values(function (d) {
                return d.values;
            })
            .x(function (d) {
                return d.date;
            })
            .y(function (d) {
                return d.price;
            })
            .out(function (d, y0, y) {
                d.price0 = y0;
            })
            .order("reverse");

        var g = svg.selectAll(".symbol");

        stack(symbols);

        y
            .domain([0, d3.max(symbols[0].values.map(function (d) {
                return d.price + d.price0;
            }))])
            .range([timelineHeight, 0]);

        var t = g.transition()
            .duration(duration / 2);

        t.select("text")
            .delay(symbols[0].values.length * 10)
            .attr("transform", function (d) {
                d = d.values[d.values.length - 1];
                return "translate(" + (timelineWidth - 60) + "," + y(d.price / 2 + d.price0) + ")";
            });

        t.selectAll("rect")
            .delay(function (d, i) {
                return i * 10;
            })
            .attr("y", function (d) {
                return y(d.price0 + d.price);
            })
            .attr("height", function (d) {
                return timelineHeight - y(d.price);
            })
            .each("end", function () {
                d3.select(this)
                    .style("stroke", "#fff")
                    .style("stroke-opacity", 1e-6)
                    .transition()
                    .duration(duration / 2)
                    .attr("x", function (d) {
                        return x(d.date);
                    })
                    .attr("width", x.rangeBand())
                    .style("stroke-opacity", 1);
            });

        //setTimeout(transposeBarGraph, duration + symbols[0].values.length * 10 + delay);
    }

    transposeBarGraph = function transposeBar() {
        xAxisSvg.style("display", "none");
        x
            .domain(symbols.map(function (d) {
                return d.key;
            }))
            .rangeRoundBands([0, timelineWidth], .2);

        y
            .domain([0, d3.max(symbols.map(function (d) {
                return d3.sum(d.values.map(function (d) {
                    return d.price;
                }));
            }))]);

        var stack = d3.layout.stack()
            .x(function (d, i) {
                return i;
            })
            .y(function (d) {
                return d.price;
            })
            .out(function (d, y0, y) {
                d.price0 = y0;
            });

        stack(d3.zip.apply(null, symbols.map(function (d) {
            return d.values;
        }))); // transpose!

        var g = svg.selectAll(".symbol");

        var t = g.transition()
            .duration(duration / 2);

        t.selectAll("rect")
            .delay(function (d, i) {
                return i * 10;
            })
            .attr("y", function (d) {
                return y(d.price0 + d.price) - 1;
            })
            .attr("height", function (d) {
                return timelineHeight - y(d.price) + 1;
            })
            .attr("x", function (d) {
                return x(d.symbol);
            })
            .attr("width", x.rangeBand())
            .style("stroke-opacity", 1e-6);

        t.select("text")
            .attr("x", 0)
            .attr("transform", function (d) {
                return "translate(" + (x(d.key) + x.rangeBand() / 2) + "," + timelineHeight + ")";
            })
            .attr("dy", "1.31em")
            .each("end", function () {
                d3.select(this).attr("x", null).attr("text-anchor", "middle");
            });

        svg.select("line").transition()
            .duration(duration)
            .attr("x2", timelineWidth);

        //setTimeout(donutGraph, duration + delay);
    }

    donutGraph = function donut() {
        var g = svg.selectAll(".symbol");

        g.selectAll("rect").remove();

        var pie = d3.layout.pie()
            .value(function (d) {
                return d.sumPrice;
            });

        var arc = d3.svg.arc();

        g.append("path")
            .style("fill", function (d) {
                return globalColor(d.key);
            })
            .data(function () {
                return pie(symbols);
            })
            .transition()
            .duration(duration)
            .tween("arc", arcTween);

        g.select("text").transition()
            .duration(duration)
            .attr("dy", ".31em");

        svg.select("line").transition()
            .duration(duration)
            .attr("y1", 2 * timelineHeight)
            .attr("y2", 2 * timelineHeight)
            .remove();

        function arcTween(d) {
            var path = d3.select(this),
                text = d3.select(this.parentNode.appendChild(this.previousSibling)),
                x0 = x(d.data.key),
                y0 = timelineHeight - y(d.data.sumPrice);

            return function (t) {
                var r = timelineHeight / 2 / Math.min(1, t + 1e-3),
                    a = Math.cos(t * Math.PI / 2),
                    xx = (-r + (a) * (x0 + x.rangeBand()) + (1 - a) * (timelineWidth + timelineHeight) / 2),
                    yy = ((a) * timelineHeight + (1 - a) * timelineHeight / 2),
                    f = {
                        innerRadius: r - x.rangeBand() / (2 - a),
                        outerRadius: r,
                        startAngle: a * (Math.PI / 2 - y0 / r) + (1 - a) * d.startAngle,
                        endAngle: a * (Math.PI / 2) + (1 - a) * d.endAngle
                    };

                path.attr("transform", "translate(" + xx + "," + yy + ")");
                path.attr("d", arc(f));
                text.attr("transform", "translate(" + arc.centroid(f) + ")translate(" + xx + "," + yy + ")rotate(" + ((f.startAngle + f.endAngle) / 2 + 3 * Math.PI / 2) * 180 / Math.PI + ")");
            };
        }

        //setTimeout(donutExplodeGraph, duration + delay);
    }

    donutExplodeGraph = function donutExplode() {
        var r0a = timelineHeight / 2 - x.rangeBand() / 2,
            r1a = timelineHeight / 2,
            r0b = 2 * timelineHeight - x.rangeBand() / 2,
            r1b = 2 * timelineHeight,
            arc = d3.svg.arc();

        svg.selectAll(".symbol path")
            .each(transitionExplode);

        function transitionExplode(d, i) {
            d.innerRadius = r0a;
            d.outerRadius = r1a;
            d3.select(this).transition()
                .duration(duration / 2)
                .tween("arc", tweenArc({
                    innerRadius: r0b,
                    outerRadius: r1b
                }));
        }

        function tweenArc(b) {
            return function (a) {
                var path = d3.select(this),
                    text = d3.select(this.nextSibling),
                    i = d3.interpolate(a, b);
                for (var key in b) a[key] = b[key]; // update data
                return function (t) {
                    var a = i(t);
                    path.attr("d", arc(a));
                    text.attr("transform", "translate(" + arc.centroid(a) + ")translate(" + timelineWidth / 2 + "," + timelineHeight / 2 + ")rotate(" + ((a.startAngle + a.endAngle) / 2 + 3 * Math.PI / 2) * 180 / Math.PI + ")");
                };
            }
        }

        setTimeout(function () {
            svg.selectAll("*").remove();
            svg.selectAll("g").data(symbols).enter().append("g").attr("class", "symbol");
            buildTimeline();
        }, duration);
    }
}

function hideTimeline() {
    removeTimelineSVG();
    d3.selectAll("#next-graph-btn").style("display", "none");
}

function nextGraph() {
    var timelineGraph = [stackedAreaGraph, groupedBarGraph, stackedBarGraph,
        transposeBarGraph, donutGraph, donutExplodeGraph];

    setTimeout(timelineGraph[graphIndex++], nextGraphDuration);
    if (graphIndex >= timelineGraph.length) {
        graphIndex = 0;
    }
}

function removeTimelineSVG() {
    d3.select("#timeline-svg-div").selectAll("svg").remove();
}
