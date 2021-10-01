function isWithinMarketHours(marketHoursOnly) {
  let date = new Date();
  const hour = date.getHours();
  const min = date.getMinutes();
  const marketClosed = (hour <= 9 && min < 30) || hour >= 16;
  //!!!CHANGE - TESTING RN
  return true;
  if (marketHoursOnly) {
    if (!marketClosed) return true;
    else return false;
  } else {
    return true;
  }
}
function sufficientFunds(currUserCash, currStockPrice, quantity) {
  console.log(currUserCash, currStockPrice, quantity);
  return currUserCash >= quantity * currStockPrice;
}
module.exports = { isWithinMarketHours, sufficientFunds };
