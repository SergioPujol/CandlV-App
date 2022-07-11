import { Candle } from "./Candle"
import { EMA } from './types'

class EMAClass {

    private listValues: Array<{ EMA: number, date: number }>;
    private quantityValues: number;

    constructor(listValues: Array<{ EMA: number, date: number }>) {
        this.listValues = listValues
        this.quantityValues = listValues.length
    }

    getLast2Points() {
        return this.listValues.slice(-2)
    }
}

export { EMAClass }