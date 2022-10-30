import { Candle } from "./Candle";
const axios = require('axios');

const getCandlesForChart = (dataset: Array<Candle>): any => { // open close lowest highest
    let data: any = []
    dataset.forEach((candle: Candle) => {
        data.push([candle.getCloseTime(),parseFloat(candle.getOpen()),parseFloat(candle.getClose()),parseFloat(candle.getLow()),parseFloat(candle.getHigh())])
    })
    return splitData(data)
}

const splitData = (rawData: any[]): any => {
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

const logInfo = (text: string): any => {
  const date = new Date();
  console.log(`\x1b[34m${date.toLocaleString()}\x1b[0m - \x1b[33m${text}\x1b[0m`);
}

const logSuccess = (text: string): any => {
  const date = new Date();
  console.log(`\x1b[34m${date.toLocaleString()}\x1b[0m - \x1b[32m${text}\x1b[0m`);
}

const logEnterExit = (text: string): any => {
  const date = new Date();
  console.log(`\x1b[34m${date.toLocaleString()}\x1b[0m - \x1b[35m${text}\x1b[0m`);
}

const logFailure = (text: string): any => {
  const date = new Date();
  console.log(`\x1b[34m${date.toLocaleString()}\x1b[0m - \x1b[31m${text}\x1b[0m`);
}

const getPeriods = (from: number, to: number, intervalMins: number): any => {
  let secsDifference = to - from;
  return (secsDifference/60)/intervalMins;
}

const sleep = async (ms:number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const appName = 'candlv-app-node'
const appVersion = '1.0.0'

const getRequestInstance = (config: any) => {
    return axios.create({
      ...config
    })
  }
  
const createRequest = (config: any) => {
    const { baseURL, apiKey, method, url, timeout } = config
    return getRequestInstance({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': apiKey,
        'User-Agent': `${appName}/${appVersion}`
      }
    }).request({
      method,
      url
    })
}

const removeEmptyValue = (obj: any) => {
    if (!(obj instanceof Object)) return {}
    Object.keys(obj).forEach(key => isEmptyValue(obj[key]) && delete obj[key])
    return obj
}

const isEmptyValue = (input: any) => {
    /**
     * Scope of empty value: falsy value (except for false and 0),
     * string with white space characters only, empty object, empty array
     */
    return (!input && input !== false && input !== 0) ||
      ((typeof input === 'string') && /^\s+$/.test(input)) ||
      (input instanceof Object && !Object.keys(input).length) ||
      (Array.isArray(input) && !input.length)
}

const buildQueryString = (params: any) => {
    if (!params) return ''
    return Object.entries(params)
      .map(stringifyKeyValuePair)
      .join('&')
}

const stringifyKeyValuePair = ([key, value]: any) => {
    const valueString = Array.isArray(value) ? `["${value.join('","')}"]` : value
    return `${key}=${encodeURIComponent(valueString)}`
}

const calculateEMA = (previousEmaValue: number, multiplicator: number, actualClosePrice: string) => {
  return (parseFloat(actualClosePrice) - previousEmaValue) * multiplicator + previousEmaValue
}

const calculateSMA = (dataset: Array<Candle>, n: number) => {
  const listClosePriceValues = getNClosePrice(dataset, n)
  let sumCloseValues = listClosePriceValues.reduce((previousValue: number, currentValue: string) => previousValue + parseInt(currentValue), 0);
  return sumCloseValues/listClosePriceValues.length
}

const getNClosePrice = (dataset: Array<Candle>, n: number) => {
  let listClosePrice: Array<string> = dataset.map(function(x: Candle) { return x.getClose(); });
  return listClosePrice.slice(-n)
}

const calculateMultiplicator = (nPeriod: number) => {
  return 2/(nPeriod+1)
}

export { 
  getCandlesForChart, 
  splitData, 
  logInfo, 
  logSuccess, 
  logEnterExit, 
  logFailure, 
  getPeriods, 
  sleep, 
  getRequestInstance, 
  createRequest, 
  removeEmptyValue, 
  buildQueryString, 
  calculateEMA, 
  calculateSMA, 
  getNClosePrice, 
  calculateMultiplicator 
}