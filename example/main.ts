import * as soda from '@traviswheelerlab/soda'
import * as us from 'ultra-soda'

let trackRack = new soda.TrackRack<us.UltraQuery>({selector: '#charts', queryBuilder: us.queryBuilder, widthThresholds: [10000, 50000, 500000, 10000000]});
window.onresize = () => trackRack.resizeController.trigger();

const axis = new soda.AxisChart({height: 30});
const ultra10 = new us.UltraTrackChart({binHeight: 24, maxPeriod: 10});
const ultra100 = new us.UltraTrackChart({binHeight: 24, maxPeriod: 100});
const ultra500 = new us.UltraTrackChart({binHeight: 24, maxPeriod: 500});
const ultra4k = new us.UltraTrackChart({binHeight: 24, maxPeriod: 4000});

trackRack.add(axis,[
        (chart, query) => {
        const renderParams = {
            queryStart: query.start,
            queryEnd: query.end,
        }
        axis.render(renderParams);
    }
]);

trackRack.add(ultra10, [
    (chart, query) => us.renderRepeats(chart, query, '10'),
    (chart, query) => us.renderGroups(chart, query, '10groups100'),
    (chart, query) => us.renderGroups(chart, query, '10groups1k'),
    (chart, query) => us.renderSegments(chart, query, '10segs100k'),
    (chart, query) => us.renderSegments(chart, query, '10segs1m'),
    ],
    'BED: ultra10');

trackRack.add(ultra100, [
        (chart, query) => us.renderRepeats(chart, query, '100'),
        (chart, query) => us.renderGroups(chart, query, '100groups100'),
        (chart, query) => us.renderGroups(chart, query, '100groups1k'),
        (chart, query) => us.renderSegments(chart, query, '100segs100k'),
        (chart, query) => us.renderSegments(chart, query, '100segs1m'),
    ],
    'BED: ultra100');

trackRack.add(ultra500, [
        (chart, query) => us.renderRepeats(chart, query, '500'),
        (chart, query) => us.renderGroups(chart, query, '500groups100'),
        (chart, query) => us.renderGroups(chart, query, '500groups1k'),
        (chart, query) => us.renderSegments(chart, query, '500segs100k'),
        (chart, query) => us.renderSegments(chart, query, '500segs1m'),
    ],
    'BED: ultra500');

trackRack.add(ultra4k, [
        (chart, query) => us.renderRepeats(chart, query, '4k'),
        (chart, query) => us.renderGroups(chart, query, '4kgroups100'),
        (chart, query) => us.renderGroups(chart, query, '4kgroups1k'),
        (chart, query) => us.renderSegments(chart, query, '4ksegs100k'),
        (chart, query) => us.renderSegments(chart, query, '4ksegs1m'),
    ],
    'BED: ultra4k');

initButtons();
checkUrl();

function submitQuery() {
    const chr = (<HTMLInputElement>document.getElementById('chromosome')).value;
    const start = parseInt((<HTMLInputElement>document.getElementById('start')).value);
    const end = parseInt((<HTMLInputElement>document.getElementById('end')).value);
    setUrl(chr, `${start}`, `${end}`);
    let width = end - start;
    let query = {
        start: start,
        end: end,
        buffStart: start - width,
        buffEnd: end + width,
        chr: chr,
    }
    if (soda.queryOk(query)) {
        trackRack.initialRender(query);
    }
}

function setUrl(chr: string, start: string, end: string): void {
    const params = new URLSearchParams(location.search);
    params.set('chromosome', chr);
    params.set('start', start);
    params.set('end', end);
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
}

function checkUrl(): void {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let chrSet = false;
    let startSet = false;
    let endSet = false;

    let chromosome = urlParams.get('chromosome');
    if (chromosome !== null) {
        let chromInput = <HTMLInputElement>document.getElementById('chromosome');
        if (chromInput !== undefined) {
            chromInput.value = chromosome;
            chrSet = true;
        }
        else {
            throw("Can't find chromosome input");
        }
    }

    let start = urlParams.get('start');
    if (start !== null) {
        let startInput = <HTMLInputElement>document.getElementById('start');
        if (startInput !== undefined) {
            startInput.value = start;
            startSet = true;
        }
        else {
            throw("Can't find start input");
        }
    }

    let end = urlParams.get('end');
    if (end !== null) {
        let endInput = <HTMLInputElement>document.getElementById('end');
        if (endInput !== undefined) {
            endInput.value = end;
            endSet = true;
        }
        else {
            throw("Can't find end input");
        }
    }

    if (chrSet && startSet && endSet) {
        submitQuery();
    }
}

function initButtons(): void {
    const submitButton = document.getElementById('submit-query')!;
    if (submitButton !== undefined) {
        submitButton.addEventListener('click', submitQuery);
    } else {
        throw("Can't find submit button");
    }

    const resetButton = document.getElementById('reset')!;
    if (resetButton !== undefined) {
        resetButton.addEventListener('click', reset);
    } else {
        throw("Can't find reset button");
    }

    const exampleButton = document.getElementById('example')!;
    if (exampleButton !== undefined) {
        exampleButton.addEventListener('click', example);
    } else {
        throw("Can't find example button");
    }
}

function example() {
    (<HTMLInputElement>document.getElementById('chromosome')).value = 'chr1';
    (<HTMLInputElement>document.getElementById('start')).value = '1000000';
    (<HTMLInputElement>document.getElementById('end')).value = '1010000';
}

function reset() {
    (<HTMLInputElement>document.getElementById('chromosome')).value = 'chr1';
    (<HTMLInputElement>document.getElementById('start')).value = '';
    (<HTMLInputElement>document.getElementById('end')).value = '';
    setUrl('chr1', '', '');
}
