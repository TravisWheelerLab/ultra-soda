import * as soda from '@traviswheelerlab/soda';
import {Annotation} from "@traviswheelerlab/soda";

export interface UltraAnnConfig extends soda.AnnotationConfig {
    score: number,
    period: number,
    repeatClass: string,
    seq: string,
}

export class UltraAnnotation extends soda.Annotation {
    score: number;
    period: number;
    repeatClass: string;
    seq: string;

    constructor(config: UltraAnnConfig) {
        super(config);
        this.score = config.score;
        this.period = config.period;
        this.repeatClass = config.repeatClass;
        this.seq = config.seq;
    }
}

export interface UltraAnnSegConfig extends soda.AnnotationConfig {
    density: number,
    repeatCnt: number,
}

export class UltraAnnotationSegment extends Annotation {
    density: number;
    repeatCnt: number;

    constructor(config: UltraAnnSegConfig) {
        super(config);
        this.density = config.density;
        this.repeatCnt = config.repeatCnt;
    }
}
