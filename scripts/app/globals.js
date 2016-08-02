var chordWidth = 700;

var outerRadius = chordWidth / 2,
    innerRadius = outerRadius - 50,
    bubbleRadius = innerRadius - 50,
    linkRadius = innerRadius - 20,
    nodesTranslate = (outerRadius - innerRadius) + (innerRadius - bubbleRadius) + 20,
    chordsTranslate = (outerRadius + 20);

var visitCountButton = d3.select("#visit-count-button");
var flowSizeButton = d3.select("#flow-size-button");

var svg = d3.select("#chord-svg-div")
    .append("svg")
    .style("width", (outerRadius * 2) + "px")
    .style("height", (outerRadius * 2) + "px");

var chordsSvg = svg.append("g")
    .attr("class","chords")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")");

var linksSvg = svg.append("g")
    .attr("class","links")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")");

var nodesSvg = svg.append("g")
    .attr("class","nodes")
    .attr("transform", "translate(" + nodesTranslate + "," + nodesTranslate + ")");

var bubble = d3.layout.pack()
    .sort(null)
    .size([bubbleRadius * 2, bubbleRadius * 2])
    .padding(1.5);

var chord = d3.layout.chord()
    .padding(.05)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

var diagonal = d3.svg.diagonal.radial();

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 10);

var globalColor = d3.scale.category20c();

var toolTip = d3.select("#tool-tip");
var ipHeader = d3.select("#ip-header");
var serverHeader = d3.select("#server-header");
var totalValue = d3.select("#total-value");
var visitColor = "#FF4A4A";
var flowColor = "#25BFF7";
var otherColor = "#FFEDAB";

var optionType = "visit";

var candidates = [],
    groupsVisit = [],
    ipVisit = [],
    ipFlow = [],
    totalIPVisitCount = 0,
    totalIPFlowSize = 0,
    flowContributions = [],
    countContributions = [],
    contribution = [],
    groupsById = {},
    chordsById = {},
    nodesById = {},
    nodes = [],
    renderLinks = [],
    serverNodes = [],
    groups = [],
    linkGroup;

var formatNumber = d3.format(",.0f"),
    formatAmount = function(d) {
        if (optionType === "visit") {
            return formatNumber(d) + " visits";
        } else if (optionType === "flow") {
            return formatNumber(d) + " bytes";
        }
    };

var formatServerTotal = function(d) {
    if (d === "visit") {
        return "Total Visits: "
    } else if (d === "flow") {
        return "Total Flow: "
    }
};

var indexByName = [],
    nameByIndex = [],
    labels = [],
    chords = [];

var serversList = [];

function log(message) {
    console.log(message);
}

// Judge if is in the array
function contains(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

// Get the index of the element in an array
Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            return i;
        }
    }
    return -1;
};

// Delete an element in an array
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
