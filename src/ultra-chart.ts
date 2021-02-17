import * as d3 from 'd3';
import * as soda from '@traviswheelerlab/soda';

import {TrackChart, TrackChartRenderParams, ChartConfig} from "@traviswheelerlab/soda";
import {UltraAnnotation, UltraAnnotationSegment} from "./ultra-annotation";

export interface UltraTrackChartConfig extends ChartConfig {
    maxPeriod: number;
}

export interface UltraTrackChartRenderParams extends TrackChartRenderParams {
    maxY:       number;
    repeats:    UltraAnnotation[];
    groups:     UltraAnnotationSegment[];
    segments:   UltraAnnotationSegment[];
}

export class UltraTrackChart extends TrackChart<UltraTrackChartRenderParams> {
    periodColorScale: d3.ScaleSequential<string>;
    densityColorScale: d3.ScaleSequential<string>;
    classColorScale: d3.ScaleOrdinal<string, string>;

    constructor(config: UltraTrackChartConfig) {
        super(config);
        this.periodColorScale = d3.scaleSequential(d3.interpolateCividis)
            .domain([0, config.maxPeriod]);
        this.densityColorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, .1]);
        let repeatClasses = ['n', 'low_complexity', 'repetitive'];
        this.classColorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(repeatClasses);
    }

    public setMaxPeriod(max: number): void {
        this.periodColorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, max]);
    }

    protected inRender(params: UltraTrackChartRenderParams): void {
        this.renderRepeats(params.repeats);
        this.renderGroups(params.groups);
        this.renderSegments(params.segments);
        this.bindTooltips(params.repeats);
    }

    protected renderRepeats(repeats: UltraAnnotation[]) {
        const conf: soda.RectangleConfig<UltraAnnotation, UltraTrackChart> = {
            selector: 'repeats',
            strokeWidth: () => 1,
            strokeColor: (a, c) => c.classColorScale(a.repeatClass),
            fillColor: (a, c) => <string>c.periodColorScale(a.period),
            fillOpacity: () => 0.5,
        };
        soda.rectangleGlyph(this, repeats, conf);
    }

    protected renderGroups(groups: UltraAnnotationSegment[]) {
        const conf: soda.RectangleConfig<UltraAnnotationSegment, UltraTrackChart> = {
            selector: 'groups',
            strokeWidth: () => 1,
            strokeColor: () => 'black',
            fillColor: (a, c) => <string>c.densityColorScale(a.density),
            fillOpacity: () => 0.5,
        };
        soda.rectangleGlyph(this, groups, conf);
    }
    protected renderSegments(groups: UltraAnnotationSegment[]) {
        const conf: soda.RectangleConfig<UltraAnnotationSegment, UltraTrackChart> = {
            selector: 'segments',
            strokeWidth: () => 1,
            strokeColor: (a, c) => <string>c.densityColorScale(a.density),
            strokeOpacity: () => 0,
            fillColor: (a, c) => <string>c.densityColorScale(a.density),
            fillOpacity: () => 0.75,
        };
        soda.rectangleGlyph(this, groups, conf);
    }

    protected bindTooltips(repeats: UltraAnnotation[]) {
        for (const ann of repeats) {
            const conf: soda.TooltipConfig<UltraAnnotation, UltraTrackChart> = {
                ann: ann,
                text: (a) => `${a.seq}(${a.period}) | ${a.score} | ${a.x} - ${a.x + a.w}`,
            }
            soda.tooltip(this, conf);
        }
    }
}
