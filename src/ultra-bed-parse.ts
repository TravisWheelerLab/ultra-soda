import {AnnotationGroup, AnnotationGroupConfig, GmodBed} from "@traviswheelerlab/soda";
import {UltraAnnConfig, UltraAnnotation} from "./ultra-annotation";

let id = 0;
let groupId = 0;

export function UltraBedParseHigh (bedObj: GmodBed): AnnotationGroup<UltraAnnotation> {
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
            x: bedObj.chromStart + bedObj.blockStarts[i],
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

    let groupConf: AnnotationGroupConfig<UltraAnnotation> = {
        id: `group.${groupId++}`,
        group: groupAnn,
        x: bedObj.chromStart,
        w: bedObj.chromEnd - bedObj.chromStart,
        y: 0,
        h: 0,
    }

    return new AnnotationGroup(groupConf);
}

// export function UltraBedParseLow (bedObj: GmodBed): UltraAnnotation {
//
// }
