export enum DecisionType {
    ExitLong = 'Exit Long',
    ExitShort = 'Exit Short',
    StartLong = 'Start Long',
    StartShort = 'Start Short'
}

export interface Decision {
    type: 'enter' | 'exit',
    decision: string, 
    percentage?: string, 
    price: string,
    date: number
}