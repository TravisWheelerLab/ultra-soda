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
    console.log("heyoo");
    const start = parseInt((<HTMLInputElement>document.getElementById('start')).value);
    const end = parseInt((<HTMLInputElement>document.getElementById('end')).value);
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

function checkUrl(): void {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    // console.log(urlParams.get('chromosome'));
    // console.log(urlParams.get('start'));
    // console.log(urlParams.get('end'));

}

const submitButton = document.getElementById('submit-query')!;
console.log(submitButton);
if (submitButton !== undefined) {
    submitButton.addEventListener('click', submitQuery);
}
else {
    throw("Can't find submit button");
}
// checkUrl();
