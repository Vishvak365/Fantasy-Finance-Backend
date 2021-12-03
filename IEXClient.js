const axios = require("axios");
const client = axios.create({
  baseURL: "https://cloud.iexapis.com/stable",
  // baseURL: "http://localhost:8080",
});

module.exports = client;
