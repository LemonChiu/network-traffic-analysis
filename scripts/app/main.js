fetchData();

var intervalId;
var counter = 2;
var renderLinks = [];

function main() {
    initialize();
    updateNodes();
    updateChords();
    intervalId = setInterval(onInterval, 1);

    buildPies();
    buildTreemap();
    buildTimeline();
}

function onInterval() {
    if (contribution.length === 0) {
        clearInterval(intervalId);
    } else {
        // renderLinks=[];
        for (var i = 0; i < counter; i++) {
            if (contribution.length > 0) {
                renderLinks.push(contribution.pop());
            }
        }

        counter = 30;
        updateLinks(renderLinks);
    }
}
