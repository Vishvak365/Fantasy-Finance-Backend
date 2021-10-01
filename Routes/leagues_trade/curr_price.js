const IEXClient = require("../../IEXClient");

async function getCurrPrice() {
  const data = await IEXClient.get("/tops?symbols=snap,tsla");
  return 1;
}
module.exports = getCurrPrice;
