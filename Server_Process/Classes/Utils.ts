import { Candle } from "./Candle";

class Utils {

    getCandlesForChart(dataset: Array<Candle>): any { // open close lowest highest
        let data: any = []
        dataset.forEach((candle: Candle) => {
            data.push([candle.getCloseTime(),parseFloat(candle.getOpen()),parseFloat(candle.getClose()),parseFloat(candle.getLow()),parseFloat(candle.getHigh())])
        })
        return this.splitData(data)
    }

    splitData(rawData: any[]) {
        const categoryData: any = [];
        const values: any = [];
        for (var i = 0; i < rawData.length; i++) {
            let date = new Date(rawData[i].splice(0, 1)[0])
          categoryData.push(date.toLocaleString());
          values.push(rawData[i]);
        }
        return {
          categoryData: categoryData,
          values: values
        };
      }

    logInfo(text: string) {
        const date = new Date();
        console.log(`\x1b[34m${date.toLocaleString()}\x1b[0m - \x1b[33m${text}\x1b[0m`);
    }

    logSuccess(text: string) {
        const date = new Date();
        console.log(`\x1b[34m${date.toLocaleString()}\x1b[0m - \x1b[32m${text}\x1b[0m`);
    }

    logEnterExit(text: string) {
        const date = new Date();
        console.log(`\x1b[34m${date.toLocaleString()}\x1b[0m - \x1b[35m${text}\x1b[0m`);
    }

    logFailure(text: string) {
        const date = new Date();
        console.log(`\x1b[34m${date.toLocaleString()}\x1b[0m - \x1b[31m${text}\x1b[0m`);
    }

    getPeriods(from: number, to: number, intervalMins: number) {
        let secsDifference = to - from;
        return (secsDifference/60)/intervalMins;
    }

}

export { Utils }