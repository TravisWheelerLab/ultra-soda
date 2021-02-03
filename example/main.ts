import * as soda from '@traviswheelerlab/soda'
import {UltraTrackChart} from 'ultra-soda'
import {ZoomController, ResizeController, Chart, AxisChart} from '@traviswheelerlab/soda'
import {UltraTrackChartRenderParams} from "../src/ultra-chart";
import {UltraAnnConfig, UltraAnnotation} from "../src/ultra-annotation";

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

function submitQuery() {
    const bed = (<HTMLInputElement>document.getElementById('bed')).value;
    const chr = (<HTMLInputElement>document.getElementById('chromosome')).value;
    const start = parseInt((<HTMLInputElement>document.getElementById('start')).value);
    const end = parseInt((<HTMLInputElement>document.getElementById('end')).value);
    setUrl(chr, `${start}`, `${end}`);
    fetch(`https://sodaviz.cs.umt.edu/ULTRAData/range?start=${start}&end=${end}`)
        .then((data) => data.text())
        .then((res) => render(res));
}

function render(data: string): void {
    // let ann = soda.bed6Parse(data);
    let nRE = new RegExp(/\(\w*\)n/);
    let lowRE = new RegExp(/low_complexity\(\w*\)/);
    let repRE = new RegExp(/repetitive\(\w*\)/);
    let id = 0;
    let ann = soda.customBedParse<UltraAnnotation>(data, (bedObj) => {
        let repeatClass: string;
        if (bedObj.name.search(nRE) > -1) {
            repeatClass = 'n';
        }
        else if (bedObj.name.search(lowRE) > -1) {
            repeatClass = 'low_complexity';
        }
        else if (bedObj.name.search(repRE) > -1) {
            repeatClass = 'repetitive';
        }
        else {
            repeatClass = '';
        }
        let conf: UltraAnnConfig = {
            id: `BED6.${id++}`,
            x: bedObj.chromStart,
            w: bedObj.chromEnd - bedObj.chromStart,
            y: 0,
            h: 0,
            score: bedObj.score,
            repeatClass: repeatClass,
        }
        return new UltraAnnotation(conf);
    });

    let n = soda.intervalGraphLayout(ann);
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
}

function zoomJump(): void {
    const start = parseInt((<HTMLInputElement>document.getElementById('jump-start')).value);
    const end = parseInt((<HTMLInputElement>document.getElementById('jump-end')).value);

    zoomController.zoomToRange(start, end);
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

const submitButton = document.getElementById('submit-query')!;
if (submitButton !== undefined) {
    submitButton.addEventListener('click', submitQuery);
}
else {
    throw("Can't find submit button");
}

checkUrl();
