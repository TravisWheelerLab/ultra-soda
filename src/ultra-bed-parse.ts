import * as soda from '@traviswheelerlab/soda';
import {UltraAnnConfig, UltraAnnotation, UltraAnnotationSegment, UltraAnnSegConfig} from "./ultra-annotation";

let id = 0;
let groupId = 0;

export function UltraBed12Parse (bedObj: soda.GmodBed): soda.AnnotationGroup<UltraAnnotation> {
    const nRE = /(?<seq>[ACGT*]+)/;
    const lowRE = /low_complexity_\((?<period>\d+)\)/;
    const repRE = /repetitive\((?<period>\d+)\)/;

    id++;
    let subId = 0;
    const names: string[] = bedObj.name.split('/');
    if (names.length !== bedObj.blockCount) {
        throw(`Error in GmodBed object, ${bedObj}`);
    }
    let repeatClass = '';
    let period = 0;
    let groupAnn: UltraAnnotation[] = [];
    for (const [i, name] of names.entries()) {
        const nREMatch = nRE.exec(name);
        const lowREMatch = lowRE.exec(name);
        const repREMatch = repRE.exec(name);
        let seq = '';
        if (nREMatch) {
            repeatClass = 'n';
            period = nREMatch[0].length;
            seq = nREMatch[0];
        }
        else if (lowREMatch) {
            repeatClass = 'low_complexity';
            period = parseInt(lowREMatch[1]);
            seq = 'Low complexity';
        }
        else if (repREMatch) {
            repeatClass = 'repetitive';
            period = parseInt(repREMatch[1]);
            seq = 'Repetitive';
        }
        else {
            throw(`Failure to match any regex: ${name}`);
        }

        let conf: UltraAnnConfig = {
            id: `ULTRA.${id}.${subId++}`,
            // add 1 because bed coordinates are half open
            x: bedObj.chromStart + bedObj.blockStarts[i] + 1,
            w: bedObj.blockSizes[i],
            y: 0,
            h: 0,
            score: bedObj.score,
            period: period,
            repeatClass: repeatClass,
            seq: seq,
        }
        groupAnn.push(new UltraAnnotation(conf));
    }

    let groupConf: soda.AnnotationGroupConfig<UltraAnnotation> = {
        id: `group.${groupId++}`,
        group: groupAnn,
        // add 1 because bed coordinates are half open
        x: bedObj.chromStart + 1,
        w: bedObj.chromEnd - bedObj.chromStart,
        y: 0,
        h: 0,
    }

    return new soda.AnnotationGroup(groupConf);
}

export function UltraBed6Parse (bedObj: soda.GmodBed): UltraAnnotationSegment {
    const cntRe = /\d+\((?<cnt>\d+)\)/;
    const match = cntRe.exec(bedObj.name)
    let repeatCnt: number;
    if (match) {
        repeatCnt = parseInt(match[1]);
    } else {
        throw('RE failed');
    }

    id++;
    let conf: UltraAnnSegConfig = {
        id: `ULTRA.${id}`,
        // add 1 because bed coordinates are half open
        x: bedObj.chromStart + 1,
        w: bedObj.chromEnd - bedObj.chromStart,
        y: 0,
        h: 0,
        density: bedObj.score,
        repeatCnt: repeatCnt,
    }
    return new UltraAnnotationSegment(conf);
}
