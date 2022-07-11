import { EMAClass } from "./EMA"
import { Candle } from "./Candle"

class ThreeEMA {

    calculateEMA(previousEmaValue: number, multiplicator: number, actualClosePrice: number) {
        return (actualClosePrice - previousEmaValue) * multiplicator + previousEmaValue
    }

    calculateSMA(dataset: Array<Candle>, n: number) {
        const listClosePriceValues = this.getNClosePrice(dataset, n)
        let sumCloseValues = listClosePriceValues.reduce((previousValue: number, currentValue: string) => previousValue + parseInt(currentValue), 0);
        return sumCloseValues/listClosePriceValues.length
    }

    getNClosePrice(dataset: Array<Candle>, n: number) {
        let listClosePrice: Array<string> = dataset.map(function(x: Candle) { return x.getClose(); });
        return listClosePrice.slice(-n)
    }

    calculateMultiplicator(nPeriod: number) {
        return 2/(nPeriod+1)
    }

    crossedEMAS(firstEMA: EMAClass, secondEMA: EMAClass) {
        const firstEMAPoints = firstEMA.getLast2Points()
        const secondEMAPoints = secondEMA.getLast2Points()
        if(((firstEMAPoints[0].EMA - secondEMAPoints[0].EMA > 0) && (firstEMAPoints[1].EMA - secondEMAPoints[1].EMA < 0)) || ((firstEMAPoints[0].EMA - secondEMAPoints[0].EMA < 0) && (firstEMAPoints[1].EMA - secondEMAPoints[1].EMA > 0))) return true
        return false
    }

    getCrossPoint(firstEMA: EMAClass, secondEMA: EMAClass) { // de momento unicamente hacerlo de 2 emas
        const firstEMAPoints = firstEMA.getLast2Points()
        const secondEMAPoints = secondEMA.getLast2Points()

        return this.calculateIntersection(firstEMAPoints[0].EMA, firstEMAPoints[1].EMA, secondEMAPoints[0].EMA, secondEMAPoints[1].EMA)
    }

    calculateIntersection(p1: number, p2: number, p3: number, p4: number) {

          var c2y = p3 - p4; // (y3 - y4)
          var c3y = p1 - p2; // (y1 - y2)
      
          // down part of intersection point formula
          var d  = 1 * c2y - c3y * -1;
      
          if (d == 0) {
            throw new Error('Number of intersection points is zero or infinity.');
        }
      
          // upper part of intersection point formula
          var u1 = 0 * p2 - p1 * 1; // (x1 * y2 - y1 * x2)
          var u4 = 1 * p4 - p3 * 0; // (x3 * y4 - y3 * x4)
      
          // intersection point formula
          var px = (u1 * -1 - 1 * u4) / d;
          var py = (u1 * c2y - c3y * u4) / d;
          
          var p = { x: px, y: py };
      
          return p;
    }

}

export { ThreeEMA }