function node_onMouseOver(d, type) {
    if (type == "CAND") {
        if (d.depth < 2) {
            return;
        }
        toolTip.transition()
            .duration(200)
            .style("opacity", "0.7");

        header1.text("Possible Server");
        header.text(d.CAND_NAME);
        header2.text(formatServerTotal(d.OFFICE) + formatCurrency(Number(d.Amount)));
        toolTip.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 75) + "px")
            .style("height","100px");

        highlightLinks(d,true);
    } else if (type == "CONTRIBUTION") {
        /*
        Highlight chord stroke
         */
        toolTip.transition()
            .duration(200)
            .style("opacity", "0.7");

        header1.text("SIP: " + pacsById[office + "_" + d.CMTE_ID].CMTE_NM);
        header.text("DIP: " + d.CAND_NAME);
        header2.text(formatCurrency(Number(d.TRANSACTION_AMT)));
        toolTip.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 75) + "px")
            .style("height","100px");
        highlightLink(d,true);
    } else if (type == "PAC") {
        /*
        highlight all contributions and all candidates
         */
        toolTip.transition()
            .duration(200)
            .style("opacity", "0.7");

        header1.text("Source IP Address");
        header.text(pacsById[office + "_" + d.label].CMTE_NM);
        header2.text("Total: " + formatCurrency(pacsById[office + "_" + d.label].Amount));
        toolTip.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 75) + "px")
            .style("height","110px");
        highlightLinks(chordsById[d.label],true);
    } else if (type == "RECT") {
        toolTip.transition()
            .duration(200)
            .style("opacity", "0.7");
        if (contains(serversList, d.name)) {
            header1.text("SERVER");
        } else {
            header1.text("CLIENT");
        }
        header.text(d.name);
        header2.text("Size: " + formatNumber(d.size) + ". Count: " + formatNumber(d.count) + ". " );
        toolTip.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 75) + "px")
            .style("height","110px");
    } else if (type == "AREA") {
        if (d.key) {
        toolTip.transition()
            .duration(200)
            .style("opacity", "0.7");
        header1.text("Max Flow Size: " + formatNumber(d.maxPrice) + " bytes");
        header.text(d.key);
        header2.text("Total Flow Size: " + formatNumber(d.sumPrice) + " bytes");
        toolTip.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 75) + "px")
            .style("height","110px");
        }
    }
}

function node_onMouseOut(d,type) {
    if (type == "CAND") {
        highlightLinks(d,false);
    }
    else if (type == "CONTRIBUTION") {
        highlightLink(d, false);
    }
    else if (type == "PAC") {
        highlightLinks(chordsById[d.label],false);
    }

    toolTip.transition()
        .duration(500)    // it shall take 500ms
        .style("opacity", "0");
}

function serverClick(d) {
    //log(d);
    selectedServer = d.CAND_NAME;
    var nodeGroup = d3.select(document.getElementById("c_" + d.CAND_ID).parentNode);
    var circle = d3.select(document.getElementById("c_" + d.CAND_ID).previousSibling);
    if (contains(serversList, selectedServer)) { //Contains the node
        //Remove in the teamList;
        serversList.remove(selectedServer);
        nodeGroup.select("text").remove();
        circle.transition(150)
            .style("fill-opacity", 0.05)
            .style("fill", function(d) {
                return (d.PTY == "DEM") ? demColor : (d.PTY == "REP") ? repColor : otherColor;
            });
    } else { //Doesn't contain the node
        serversList.push(selectedServer)

        nodeGroup.append("text")
            .attr("class", "server-name")
            .attr("dx", "-25")
            .attr("dy", "0.35em")
            .text(function(d) { return d.CAND_NAME });

        circle.transition(150)
            .style("fill-opacity", 1)
            .style("fill", otherColor);
    }
}

function highlightLink(g, on) {
    var opacity = ((on == true) ? 0.9 : 0.1);

    // console.log("fadeHandler(" + opacity + ")");
    // highlightSvg.style("opacity",opacity);

    var link = d3.select(document.getElementById("l_" + g.Key));
    link.transition((on == true) ? 150 : 550)
        .style("fill-opacity", opacity)
        .style("stroke-opacity", opacity);

    var arc = d3.select(document.getElementById("a_" + g.Key));
    arc.transition()
        .style("fill-opacity",(on == true) ? opacity : 0.2);

    var circ = d3.select(document.getElementById("c_" + g.CAND_ID));
    circ.transition((on == true) ? 150 : 550)
        .style("opacity", ((on == true) ? 1 : 0.05));

    var text = d3.select(document.getElementById("t_" + g.CMTE_ID));
    text.transition((on == true) ? 0 : 550)
        .style("fill",(on == true) ? "#000" : "#777")
        .style("font-size",(on == true) ? "14px" : "8px")
        .style("stroke-width",((on == true) ? 2 : 0));
}

function highlightLinks(d, on) {
    d.relatedLinks.forEach(function(d) {
        highlightLink(d,on);
    })
}

senateButton.on("click", function(d) {
    //linkGroup.selectAll("g.links").remove();
    senateButton.attr("class", "selected");
    houseButton.attr("class", null);
    office = "senate";
    serversList = [];
    nodesSvg.selectAll("g.node").remove();
    linksSvg.selectAll("g.links").remove();
    hideTreemap();
    hideTimeline();
    clearInterval(intervalId);
    main();
});

houseButton.on("click", function (d) {
    //linkGroup.selectAll("g.links").remove();
    senateButton.attr("class", null);
    houseButton.attr("class","selected");
    office = "house";
    serversList = [];
    nodesSvg.selectAll("g.node").remove();;
    linksSvg.selectAll("g.links").remove();
    hideTreemap();
    hideTimeline();
    clearInterval(intervalId);
    main();
});