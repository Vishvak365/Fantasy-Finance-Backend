const firebase = require("../../Firebase");
const leagues = firebase.firestore().collection("leagues");
const users = firebase.firestore().collection("users");
function isWithinMarketHours(marketHoursOnly) {
  let date = new Date();
  const hour = date.getHours();
  const min = date.getMinutes();
  const marketClosed = (hour <= 9 && min < 30) || hour >= 16;
  //!!!CHANGE - TESTING RN
  return true;
  // if (marketHoursOnly) {
  //   if (!marketClosed) return true;
  //   else return false;
  // } else {
  //   return true;
  // }
}
function sufficientFunds(currUserCash, currStockPrice, quantity) {
  // console.log(currUserCash, currStockPrice, quantity);
  return currUserCash >= quantity * currStockPrice;
}
// const getUserCash = async (leagueId, uid) => {
//   const data = await leagues.doc(leagueId).collection("members").doc(uid).get();
//   console.log(data.data());
//   return data.data().cash;
// };
const getLeagueData = async (leagueId) => {
  const data = await leagues.doc(leagueId).get();
  console.log(data.data());
  return data.data();
};
const getUser = async (leagueId, uid) => {
  const data = await leagues.doc(leagueId).collection("members").doc(uid).get();
  console.log(data.data());
  return data.data();
};
module.exports = {
  isWithinMarketHours,
  sufficientFunds,
  getUser,
  getLeagueData,
};
