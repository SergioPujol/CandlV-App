const { Candle } = require('./Classes/Candle.ts')
const BinanceAPI = require('./Classes/BinanceAPI.ts')

const binanceAPI = new BinanceAPI()

async function flow() {
    const data = await binanceAPI.getKlines('BTCUSDT', '5m', '50')
    const candleList = data.map((list: []) => new Candle(list))
    console.log(candleList)
    /**
     * Flow:
     * 
     * - obtain info from API, call getKlines
     * - create Candle with data
     * 
     */
}

flow()