import * as soda from "@traviswheelerlab/soda";
import {UltraTrackChart, UltraTrackChartRenderParams} from "./ultra-chart";
import {UltraAnnotation, UltraAnnotationSegment} from "./ultra-annotation";
import {UltraBed6Parse, UltraBed12Parse} from "./ultra-bed-parse";

export interface UltraQuery extends soda.BufferedQueryParameters {
    chr: string,
}

export function queryBuilder(prevQuery: UltraQuery, view: soda.ViewRange): UltraQuery {
    return {
        start: Math.ceil(view.start),
        end: Math.ceil(view.end),
        buffStart: Math.ceil(view.start - view.width),
        buffEnd: Math.ceil(view.end + view.width),
        chr: prevQuery.chr,
    }
}

export async function renderRepeats(chart: UltraTrackChart, query: UltraQuery, bed: string): Promise<void> {
    let response = await fetch(`https://sodaviz.cs.umt.edu/ULTRAData/${bed}/${query.chr}/range?start=${query.buffStart}&end=${query.buffEnd}`)
        .then((data) => data.text())
        .then((res: string) => res);

    let obj: soda.GmodBed[] = JSON.parse(response);
    let groups: soda.AnnotationGroup<UltraAnnotation>[] = obj.map((o) => UltraBed12Parse(o));
    let n = soda.intervalGraphLayout(groups);

    let ann: UltraAnnotation[] = [];
    for (const group of groups) {
        ann = ann.concat(group.group);
    }
    let renderParams: UltraTrackChartRenderParams = {
        repeats: ann,
        groups: [],
        segments: [],
        maxY: n + 1,
        queryStart: query.start,
        queryEnd: query.end,
    }
    chart.render(renderParams);
}

export async function renderGroups(chart: UltraTrackChart, query: UltraQuery, bed: string): Promise<void> {
    let response = await fetch(`https://sodaviz.cs.umt.edu/ULTRAData/${bed}/${query.chr}/range?start=${query.buffStart}&end=${query.buffEnd}`)
        .then((data) => data.text())
        .then((res: string) => res);

    let obj: soda.GmodBed[] = JSON.parse(response);
    let groups: UltraAnnotationSegment[] = obj.map((o) => UltraBed6Parse(o));
    let n = soda.intervalGraphLayout(groups);

    let renderParams: UltraTrackChartRenderParams = {
        repeats: [],
        groups: groups,
        segments: [],
        maxY: n + 1,
        queryStart: query.start,
        queryEnd: query.end,
    }
    chart.render(renderParams);
}

export async function renderSegments(chart: UltraTrackChart, query: UltraQuery, bed: string): Promise<void> {
    let response = await fetch(`https://sodaviz.cs.umt.edu/ULTRAData/${bed}/${query.chr}/range?start=${query.buffStart}&end=${query.buffEnd}`)
        .then((data) => data.text())
        .then((res: string) => res);

    let obj: soda.GmodBed[] = JSON.parse(response);
    let segments: UltraAnnotationSegment[] = obj.map((o) => UltraBed6Parse(o));

    let renderParams: UltraTrackChartRenderParams = {
        repeats: [],
        groups: [],
        segments: segments,
        maxY: 1,
        queryStart: query.start,
        queryEnd: query.end,
    }
    chart.render(renderParams);
}
