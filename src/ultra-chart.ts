import * as d3 from 'd3';
import * as soda from '@traviswheelerlab/soda';

import {TrackChart, TrackChartRenderParams, ChartConfig, isCompactAnn} from "@traviswheelerlab/soda";
import {UltraAnnotation} from "./ultra-annotation";

export interface UltraTrackChartRenderParams extends TrackChartRenderParams {
    maxY:       number;
    repeats:    UltraAnnotation[];
}

export class UltraTrackChart extends TrackChart<UltraTrackChartRenderParams> {
    periodColorScale: d3.ScaleSequential<string>;
    classColorScale: d3.ScaleOrdinal<string, string>;

    constructor(config: ChartConfig) {
        super(config);
        this.periodColorScale = d3.scaleSequential(d3.interpolateCividis)
            .domain([0, 100]);
        let repeatClasses = ['n', 'low_complexity', 'repetitive'];
        this.classColorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(repeatClasses);
    }

    public setMaxPeriod(max: number): void {
        this.periodColorScale = d3.scaleSequential(d3.interpolateCividis)
            .domain([0, max]);
    }

    protected inRender(params: UltraTrackChartRenderParams): void {
        this.renderRepeats(params.repeats);
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

    protected bindTooltips(repeats: UltraAnnotation[]) {
        console.log("suh");
        for (const ann of repeats) {
            const conf: soda.TooltipConfig<UltraAnnotation, UltraTrackChart> = {
                ann: ann,
                text: (a) => `[${a.id}](${a.period})<${a.score}>: ${a.x} - ${a.x + a.w}`,
            }
            soda.tooltip(this, conf);
        }
    }
}
