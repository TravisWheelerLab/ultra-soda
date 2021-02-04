import * as soda from '@traviswheelerlab/soda'
import {
    ZoomController,
    ResizeController,
    Chart,
    AxisChart,
    AnnotationGroup,
} from '@traviswheelerlab/soda'
import {
    UltraTrackChart,
    UltraTrackChartRenderParams,
    UltraAnnConfig,
    UltraAnnotation,
    UltraBedParse
} from "ultra-soda";

let zoomController = new ZoomController();
let resizeController = new ResizeController();

window.onresize = () => resizeController.trigger();

let charts: Chart<any>[] = [];

const axis = new AxisChart({selector: '.axis'});
const ultraChart = new UltraTrackChart({selector: '.ultra-chart', binHeight: 24});

charts.push(axis);
charts.push(ultraChart);

zoomController.addComponent(axis);
zoomController.addComponent(ultraChart);

resizeController.addComponent(axis);
resizeController.addComponent(ultraChart);

initButtons();
checkUrl();

function reset() {
    (<HTMLInputElement>document.getElementById('bed')).value = '10';
    (<HTMLInputElement>document.getElementById('chromosome')).value = '';
    (<HTMLInputElement>document.getElementById('start')).value = '';
    (<HTMLInputElement>document.getElementById('end')).value = '';
    setUrl('10', '', '', '');
}

function submitQuery() {
    const bed = (<HTMLInputElement>document.getElementById('bed')).value;
    const chr = (<HTMLInputElement>document.getElementById('chromosome')).value;
    const start = parseInt((<HTMLInputElement>document.getElementById('start')).value);
    const end = parseInt((<HTMLInputElement>document.getElementById('end')).value);
    setUrl(bed, chr, `${start}`, `${end}`);
    if (bed == '10') {
        ultraChart.setMaxPeriod(10)
    }
    else if (bed == '100') {
        ultraChart.setMaxPeriod(100);
    }
    else if (bed == '500') {
        ultraChart.setMaxPeriod(500);
    }
    else if (bed == '4k') {
        ultraChart.setMaxPeriod(4000);
    }
    fetch(`https://sodaviz.cs.umt.edu/ULTRAData/${bed}/${chr}/range?start=${start}&end=${end}`)
        .then((data) => data.text())
        .then((res) => render(res));
}

function render(data: string): void {
    let groups = soda.customBedParse<AnnotationGroup<UltraAnnotation>>(data, UltraBedParse);
    let n = soda.intervalGraphLayout(groups);

    let ann: UltraAnnotation[] = [];
    for (const group of groups) {
        ann = ann.concat(group.group);
    }
    let first = ann.reduce((prev, curr) => prev.x < curr.x ? prev : curr);
    let last = ann.reduce((prev, curr) => (prev.x + prev.w) > (curr.x + curr.w) ? prev : curr);
    let renderParams: UltraTrackChartRenderParams = {
        repeats: ann,
        maxY: n + 1,
        queryStart: first.x,
        queryEnd: last.x + last.w,
    }
    axis.render(renderParams);
    ultraChart.render(renderParams);
    zoomController.zoomToRange(renderParams.queryStart, renderParams.queryEnd);
}

function setUrl(bed: string, chr: string, start: string, end: string): void {
    const params = new URLSearchParams(location.search);
    params.set('bed', bed);
    params.set('chromosome', chr);
    params.set('start', start);
    params.set('end', end);
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
}

function checkUrl(): void {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let bedSet = false;
    let chrSet = false;
    let startSet = false;
    let endSet = false;

    let bed = urlParams.get('bed');
    if (bed !== null) {
        let bedInput = <HTMLInputElement>document.getElementById('bed');
        if (bedInput !== undefined) {
            bedInput.value = bed;
            bedSet = true;
        }
        else {
            throw("Can't find bed input");
        }
    }

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

    if (bedSet && chrSet && startSet && endSet) {
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
}
