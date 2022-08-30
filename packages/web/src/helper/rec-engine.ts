import { Frequency } from "./ranking-scanner";

export type RecResult = {
    account: string,
    ranking: Frequency[],
};

export type CheckResult = {
    account: string,
    ifDrawable: boolean,
    ranking: Frequency[],
    lastestRec?: RecResult,
};

export const getCorrelation = (
    ranking1: Frequency[],
    ranking2: Frequency[])
    : number => {
    const map1 = new Map<string, number>(ranking1.map(fre => [fre.address, fre.frequency]));
    const map2 = new Map<string, number>(ranking2.map(fre => [fre.address, fre.frequency]));
    const multiList = [...map1.entries()].map(([addr, freq]) => freq * (map2.get(addr)??0));
    const multiSum = multiList.reduce((p, c) => p + c, 0);
    return multiSum;
};