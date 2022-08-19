import { Frequency } from "scan-helper";

export type RecMetadata = {
    nextDrawDate: string,
    alreadyRecTo: string[],
};

export type PersonalRanking = {
    account: string,
    ranking: Frequency[],
}

export const getCorrelation = (
    ranking1: Frequency[],
    ranking2: Frequency[])
    : number => {
    return Math.random();
}