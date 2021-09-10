const axios = require("axios");
const client = axios.create({
  baseURL: "https://api.iextrading.com/1.0",
  // baseURL: "http://localhost:8080",
});

module.exports = client;
