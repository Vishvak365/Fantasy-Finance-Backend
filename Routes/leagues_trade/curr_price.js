const IEXClient = require("../../IEXClient");


/**
 * 
 * @param {*} stockName Stock ticker name of stock
 * @returns Curr stock price
 * @example const currStockPrice = await getCurrPrice('tsla');
 */
async function getCurrPrice(stockName) {
  if (!stockName) {
    return undefined;
  }
  try {
    const data = await IEXClient.get(`/tops?token=pk_5c3f7e028b3f41eb81e40b491969248d&symbols=${stockName}`);
    return data.data[0].lastSalePrice;
  } catch (exception) {
    console.log("Unable to get stock price information from IEX", exception);
    return undefined;
  }
}

module.exports = getCurrPrice;
