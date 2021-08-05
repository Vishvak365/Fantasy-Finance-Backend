const dotenv = require("dotenv");
const firebase = require("firebase-admin");
dotenv.config();
const config = {
  type: "service_account",
  project_id: "fantasy-finance-f2b3d",
  private_key_id: "77b96c8aa0750d88c313610b4a61084a3dd68cb1",
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email:
    "firebase-adminsdk-gcbd8@fantasy-finance-f2b3d.iam.gserviceaccount.com",
  client_id: "107350279161697859201",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-gcbd8%40fantasy-finance-f2b3d.iam.gserviceaccount.com",
};

firebase.initializeApp({
  credential: firebase.credential.cert(config),
})

module.exports = firebase;
