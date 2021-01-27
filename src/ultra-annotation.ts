import {Annotation, AnnotationConfig} from '@traviswheelerlab/soda';

export interface UltraAnnConfig extends AnnotationConfig {
    score: number,
    repeatClass: string,
}

export class UltraAnnotation extends Annotation {
    score: number;
    repeatClass: string;
    constructor(config: UltraAnnConfig) {
        super(config);
        this.score = config.score;
        this.repeatClass = config.repeatClass;
    }
}
