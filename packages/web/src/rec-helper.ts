import { Frequency } from "scan-helper";

export type RecMetadata = {
    nextDrawDate: string,
    alreadyRecTo: string[],
    lastRec?: RecResult,
};

export type RecResult = {
    account: string,
    ranking: Frequency[],
};

export type CheckResult = {
    account: string,
    ifDrawable: boolean,
    lastRec?: RecResult,
    metadataLoc?: string,
    rankingLoc?: string,
};

export const getCorrelation = (
    ranking1: Frequency[],
    ranking2: Frequency[])
    : number => {
    return Math.random();
};