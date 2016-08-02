function buildChords() {
    var  matrix = [];
    labels = [];
    chords = [];

    for (var i = 0; i < groups.length; i++) {
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

    indexByName = [];
    nameByIndex = [];
    var n = 0;

    // Compute a unique index for each group name
    groups.forEach(function(d) {
        d = d.GROUP_ID;
        if (!(d in indexByName)) {
            nameByIndex[n] = d;
            indexByName[d] = n++;
        }
    });

    groups.forEach(function(d) {
        var source = indexByName[d.GROUP_ID],
            row = matrix[source];
        if (!row) {
            row = matrix[source] = [];
            for (var i = -1; ++i < n;) {
                row[i] = 0;
            }
        }
        row[indexByName[d.GROUP_ID]] = Number(d.Amount);
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
}
