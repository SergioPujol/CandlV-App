export enum DecisionType {
    ExitLong = 'Exit Long',
    ExitShort = 'Exit Short',
    StartLong = 'Start Long',
    StartShort = 'Start Short'
}

export interface Decision { 
    decision: string, 
    percentage?: string, 
    actualPrice: string 
}