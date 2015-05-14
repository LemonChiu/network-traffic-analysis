
/**
 *
 * DATA SOURCE:  http://www.fec.gov/data/index.jsp/
 *
 */

/**
 * Daisy Chain Data Fetches to ensure all data is loaded prior to updates (async calls)
 */

// var dataDispatch=d3.dispatch("end");
var dataCalls=[];
var numCalls=0;

function fetchData() {
    dataCalls=[];
//    dataDispatch.on("end",onDataFetched)
    addStream("data/Candidates_House.csv", onFetchCandidatesHouse);
    addStream("data/Candidates_Senate.csv", onFetchCandidatesSenate);
    addStream("data/Contributions_House.csv", onFetchContributionsHouse);
    addStream("data/Contributions_Senate.csv", onFetchContributionsSenate);
    addStream("data/Pacs_House.csv", onFetchPacsHouse);
    addStream("data/Pacs_Senate.csv", onFetchPacsSenate);
    startFetch();
}


function onFetchCandidatesSenate(csv) {

     for (var i=0; i < csv.length; i++) {
        var r=csv[i];
         r.value=Number(r.Amount);
        cns[r.CAND_ID]=r;

            senate.push(r);
            if (r.PTY=="REP") {
                s_reps.push(r);
                total_sReps+= r.value;
            }
            else if (r.PTY=="DEM") {
                s_dems.push(r)
                total_sDems+= r.value;
            }
            else {
                s_others.push(r);
                total_sOthers+= r.value;
            }

     }

    log("onFetchCandidatesSenate()");
    endFetch();
}

function onFetchCandidatesHouse(csv) {
    for (var i=0; i < csv.length; i++) {
        var r=csv[i];
        r.value=Number(r.Amount);
        cns[r.CAND_ID]=r;
        house.push(r);
        if (r.PTY=="REP") {
            h_reps.push(r);
            total_hReps+= r.value;
        }
        else if (r.PTY=="DEM") {
            h_dems.push(r)
            total_hDems+= r.value;
        }
        else {
            h_others.push(r);
            total_hOthers+= r.value;
        }
    }
    log("onFetchCandidatesHouse()");
    endFetch();
}

function onFetchContributionsSenate(csv) {

    var i=0;
    csv.forEach(function (d) {
        d.Key="S"+(i++);
        contributions.push(d);
        c_senate.push(d);
    });

    log("onFetchContributionsSenate()");
    endFetch();

}

function onFetchContributionsHouse(csv) {
    var i=0;
    csv.forEach(function (d) {
        d.Key="H"+(i++);
        contributions.push(d);
        c_house.push(d);
    });

    log("onFetchContributionsHouse()");
    endFetch();

}

function onFetchPacsHouse(csv) {

    pacsHouse=csv;
    for (var i=0; i < pacsHouse.length; i++) {
        pacsById["house_" + pacsHouse[i].CMTE_ID]=pacsHouse[i];
    }

    log("onFetchPacsHouse()");
    endFetch();


}

function onFetchPacsSenate(csv) {

    pacsSenate=csv;
    for (var i=0; i < pacsSenate.length; i++) {
        pacsById["senate_" + pacsSenate[i].CMTE_ID]=pacsSenate[i];
    }

    log("onFetchPacsSenate()");
    endFetch();

}


function addStream(file,func) {
    var o={};
    o.file=file;
    o.function=func;
    dataCalls.push(o);
}

function startFetch() {
    numCalls=dataCalls.length;
    dataCalls.forEach(function (d) {
        d3.csv(d.file, d.function);
    })
}

function endFetch() {
    numCalls--;
    if (numCalls==0) {
       // dataDispatch.end();
        main();
    }
}