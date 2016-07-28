function buildChords() {
    var  matrix = [];
    labels = [];
    chords = [];

    for (var i = 0; i < pacs.length; i++) {
        var l = {};
        l.index = i;
        l.label = "null";
        l.angle = 0;
        labels.push(l);

        var c = {}
        c.label = "null";
        c.source = {};
        c.target = {};
        chords.push(c);
    }

    buf_indexByName = indexByName;

    indexByName = [];
    nameByIndex = [];
    n = 0;

    var totalPacAmount=0;

    // Compute a unique index for each package name
    pacs.forEach(function(d) {
        d = d.CMTE_ID;
        if (!(d in indexByName)) {
            nameByIndex[n] = d;
            indexByName[d] = n++;
        }
    });

    pacs.forEach(function(d) {
        var source = indexByName[d.CMTE_ID],
            row = matrix[source];
        if (!row) {
            row = matrix[source] = [];
            for (var i = -1; ++i < n;) row[i] = 0;
        }
        row[indexByName[d.CMTE_ID]] = Number(d.Amount);
        totalPacAmount += Number(d.Amount);
    });

    chord.matrix(matrix);

    chords = chord.chords();

    var i = 0;
    chords.forEach(function (d) {
        d.label = nameByIndex[i];
        d.angle = (d.source.startAngle + d.source.endAngle) / 2
        var o = {};
        o.startAngle = d.source.startAngle;
        o.endAngle = d.source.endAngle;
        o.index = d.source.index;
        o.value = d.source.value;
        o.currentAngle = d.source.startAngle;
        o.currentLinkAngle = d.source.startAngle;
        o.Amount = d.source.value;
        o.source = d.source;
        o.relatedLinks = [];
        chordsById[d.label]= o;
        i++;
    });

    function getFirstIndex(index,indexes) {
        for (var i = 0; i < chordCount; i++) {
            var found = false;
            for (var y = index; y < indexes.length; y++) {
                if (i == indexes[y]) {
                    found=true;
                }
            }
            if (found == false) {
                return i;
                //  break;
            }
        }
    }

    function getLabelIndex(name) {
        for (var i=0; i < chordCount; i++) {
            if (buffer[i].label == name) {
                return i;
            }
        }
        return -1;
    }
}
