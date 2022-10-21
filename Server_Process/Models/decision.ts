export enum DecisionType {
    ExitLong = 'Exit Long',
    ExitShort = 'Exit Short',
    StartLong = 'Start Long',
    StartShort = 'Start Short',
    Hold = 'Hold'
}

export interface Decision {
    type: 'enter' | 'exit' | 'hold',
    decision: string, 
    percentage?: string, 
    price: string,
    date: number,
    state: 'None' | 'InLong' | 'InShort'
}