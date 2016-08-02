function initialize() {
    renderLinks = [];
    serverNodes = [];
    groups = [];
    contribution = [];

    if (optionType === "visit") {
        var visitNode = {};
        visitNode.value = totalIPVisitCount;
        visitNode.children = ipVisit;
        nodes = bubble.nodes(visitNode);

        nodes.forEach (function (d) {
            if (d.depth === 1) {
                nodesById[d.CAND_ID] = d;
                d.relatedLinks = [];
                d.Amount = Number(d.Amount);
                d.currentAmount = d.Amount;
                serverNodes.push(d);
            }
        });

        groups = groupsVisit;
        countContributions.forEach(function (d) {
            contribution.push(d);
        });
    } else if (optionType === "flow") {
        var flowNode = {};
        flowNode.value = totalIPFlowSize;
        flowNode.children = ipFlow;
        nodes = bubble.nodes(flowNode);

        nodes.forEach (function (d) {
            if (d.depth === 1) {
                nodesById[d.CAND_ID] = d;
                d.relatedLinks = [];
                d.Amount = Number(d.Amount);
                d.currentAmount = d.Amount;
                serverNodes.push(d);
            }
        });

        groups = groupsFlow;
        flowContributions.forEach(function (d) {
            contribution.push(d);
        });
    }

    buildChords();

    contribution.forEach(function(d) {
        nodesById[d.CAND_ID].relatedLinks.push(d);
        chordsById[d.GROUP_ID].relatedLinks.push(d);
    })
}
