import * as d3 from 'd3';
import * as soda from '@traviswheelerlab/soda';

import {TrackChart, TrackChartRenderParams, ChartConfig, isCompactAnn} from "@traviswheelerlab/soda";
import {UltraAnnotation} from "./ultra-annotation";

export interface UltraTrackChartRenderParams extends TrackChartRenderParams {
    maxY:       number;
    repeats:    UltraAnnotation[];
}

export class UltraTrackChart extends TrackChart<UltraTrackChartRenderParams> {
    scoreColorScale: d3.ScaleSequential<string>;
    classColorScale: d3.ScaleOrdinal<string, string>;

    constructor(config: ChartConfig) {
        super(config);
        this.scoreColorScale = d3.scaleSequential(d3.interpolateGreys)
            .domain([0, 30000]);
        let repeatClasses = ['n', 'low_complexity', 'repetitive'];
        this.classColorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(repeatClasses);
    }

    protected inRender(params: UltraTrackChartRenderParams): void {
        this.renderRepeats(params.repeats);
    }

    protected renderRepeats(repeats: UltraAnnotation[]) {
        console.log(repeats);
        const conf: soda.RectangleConfig<UltraAnnotation, UltraTrackChart> = {
            selector: 'repeats',
            strokeColor: (a, c) => c.classColorScale(a.repeatClass),
            fillColor: (a, c) => <string>c.scoreColorScale(a.score),
        };
        soda.rectangleGlyph(this, repeats, conf);
    }
}
