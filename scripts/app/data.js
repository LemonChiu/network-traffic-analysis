var dataCalls = [];
var numCalls = 0;

function fetchData() {
    dataCalls = [];

    addStream("data/candidates_visit.csv", onFetchCandidatesCount);
    addStream("data/candidates_flow.csv", onFetchCandidatesFlow);
    addStream("data/contributions_visit.csv", onFetchContributionsCount);
    addStream("data/contributions_flow.csv", onFetchContributionsFlow);
    addStream("data/groups_visit.csv", onFetchGroupsVisit);
    addStream("data/groups_flow.csv", onFetchGroupsFlow);

    startFetch();
}

function onFetchCandidatesCount(csv) {
    for (var i = 0; i < csv.length; i++) {
        var row = csv[i];
        row.value = Number(row.Amount);
        candidates[row.CAND_ID] = row;

        ipVisit.push(row);
        totalIPVisitCount += row.value;
    }

    endFetch();
}

function onFetchCandidatesFlow(csv) {
    for (var i = 0; i < csv.length; i++) {
        var row = csv[i];
        row.value = Number(row.Amount);
        candidates[row.CAND_ID]=row;

        ipFlow.push(row);
        totalIPFlowSize += row.value;
    }

    endFetch();
}

function onFetchContributionsCount(csv) {
    var i = 0;
    csv.forEach(function(d) {
        d.Key = "C" + (i++);
        countContributions.push(d);
    });

    endFetch();
}

function onFetchContributionsFlow(csv) {
    var i = 0;
    csv.forEach(function(d) {
        d.Key = "F" + (i++);
        flowContributions.push(d);
    });

    endFetch();
}

function onFetchGroupsVisit(csv) {
    groupsVisit = csv;
    for (var i = 0; i < groupsVisit.length; i++) {
        groupsById["visit_" + groupsVisit[i].GROUP_ID] = groupsVisit[i];
    }

    endFetch();
}

function onFetchGroupsFlow(csv) {
    groupsFlow = csv;
    for (var i = 0; i < groupsFlow.length; i++) {
        groupsById["flow_" + groupsFlow[i].GROUP_ID] = groupsFlow[i];
    }

    endFetch();
}

function addStream(file, func) {
    var fileFunctionObject = {};
    fileFunctionObject.file = file;
    fileFunctionObject.function = func;
    dataCalls.push(fileFunctionObject);
}

function startFetch() {
    numCalls = dataCalls.length;
    dataCalls.forEach(function (d) {
        d3.csv(d.file, d.function);
    });
}

function endFetch() {
    numCalls--;
    if (numCalls === 0) {
        main();
    }
}
