const app = require("./index");
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
