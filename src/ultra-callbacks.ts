import {AnnotationGroup, QueryParameters, ViewRange} from "../../soda";
import * as soda from "../../soda";
import {UltraTrackChart, UltraTrackChartRenderParams} from "./ultra-chart";
import {UltraAnnotation} from "./ultra-annotation";
import {UltraBedParseHigh} from "./ultra-bed-parse";


export interface ChrQuery extends QueryParameters {
    chr: string,
}

export function queryBuilder(prevQuery: ChrQuery, view: ViewRange): ChrQuery {
    return {
        start: Math.ceil(view.start),
        end: Math.ceil(view.end),
        chr: prevQuery.chr,
    }
}

export function renderCallback(chart: UltraTrackChart,
                       bed: string,
                       query: ChrQuery,
                       renderCallback: (query: ChrQuery, res: string, chart: UltraTrackChart) => void): void {
    fetch(`https://sodaviz.cs.umt.edu/ULTRAData/${bed}/${query.chr}/range?start=${query.start}&end=${query.end}`)
        .then((data) => data.text())
        .then((res) => renderCallback(query, res, chart));
}

export function renderHighDetail(query: ChrQuery, response: string, chart: UltraTrackChart): void {
    let groups = soda.customBedParse<AnnotationGroup<UltraAnnotation>>(response, UltraBedParseHigh);
    let n = soda.intervalGraphLayout(groups);

    let ann: UltraAnnotation[] = [];
    for (const group of groups) {
        ann = ann.concat(group.group);
    }
    let renderParams: UltraTrackChartRenderParams = {
        repeats: ann,
        maxY: n + 1,
        queryStart: query.start,
        queryEnd: query.end,
    }
    chart.render(renderParams);
}

export function renderLowDetail(query: ChrQuery, response: string, chart: UltraTrackChart): void {
    let groups = soda.customBedParse<AnnotationGroup<UltraAnnotation>>(response, UltraBedParseHigh);
    let n = soda.intervalGraphLayout(groups);

    let ann: UltraAnnotation[] = [];
    for (const group of groups) {
        ann.push(new UltraAnnotation({
            x: group.x,
            w: group.w,
            y: group.y,
            h: 0,
            id: "",
            period: 0,
            repeatClass: "n",
            score: 0,
            seq: "",
        }))
    }
    let renderParams: UltraTrackChartRenderParams = {
        repeats: ann,
        maxY: n + 1,
        queryStart: query.start,
        queryEnd: query.end,
    }
    chart.render(renderParams);
}
