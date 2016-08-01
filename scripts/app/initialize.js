function initialize() {
    totalContributions = 0;
    renderLinks = [];
    cands = [];
    pacs = [];
    contribution = [];

    if (optionType == "visit") {
        var root = {};

        var r = {};
        r.value = totalIPVisitCount;
        r.children = IPVisit;

        root.children = [r];

        nodes = bubble.nodes(root);

        var totalCandAmount = 0;
        nodes.forEach (function (d) {
            if (d.depth == 2) {
                nodesById[d.CAND_ID] = d;
                d.relatedLinks = [];
                d.Amount = Number(d.Amount);
                d.currentAmount = d.Amount;
                cands.push(d);
                totalCandAmount += d.Amount;
            }
        })

        pacs = groupsVisit;
        countContributions.forEach(function (d) {
            contribution.push(d);
        });
    } else if (optionType == "flow") {
        var root = {};
        var d = {};
        d.value = totalIPFlowSize;
        d.children = ipFlow;

        root.children = [d];

        nodes = bubble.nodes(root);

        var totalCandAmount = 0;
        nodes.forEach (function (d) {
            if (d.depth == 2) {
                nodesById[d.CAND_ID] = d;
                d.relatedLinks = [];
                d.Amount = Number(d.Amount);
                d.currentAmount = d.Amount;
                cands.push(d);
                totalCandAmount += d.Amount;
            }
        })

        pacs = groupsFlow;
        flowContributions.forEach(function (d) {
            contribution.push(d);
        });
    }

    buildChords();

    var totalContribution = 0;
    contribution.forEach(function(d) {
        nodesById[d.CAND_ID].relatedLinks.push(d);
        chordsById[d.GROUP_ID].relatedLinks.push(d);
        totalContribution += Number(d.TRANSACTION_AMT);
    })
}
