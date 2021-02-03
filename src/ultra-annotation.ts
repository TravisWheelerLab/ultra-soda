import {Annotation, AnnotationConfig} from '@traviswheelerlab/soda';

export interface UltraAnnConfig extends AnnotationConfig {
    score: number,
    period: number,
    repeatClass: string,
}

export class UltraAnnotation extends Annotation {
    score: number;
    period: number;
    repeatClass: string;

    constructor(config: UltraAnnConfig) {
        super(config);
        this.score = config.score;
        this.period = config.period;
        this.repeatClass = config.repeatClass;
    }
}
