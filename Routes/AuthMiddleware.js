const firebase = require("../Firebase");
function validateUser(req, res, next) {
  const token = req.headers.authorization;
  if (!token || !token.includes("Bearer")) {
    res.status(401);
    res.json({
      message: "Please include Authorization header with 'bearer <token>'",
    });
    return;
  }
  firebase
    .auth()
    .verifyIdToken(token.split(" ")[1])
    .then((user) => {
      res.locals.uid = user.uid;
      next();
    })
    .catch(() => {
      res.status(401);
      res.json({ message: "Unauthorized" });
    });
}
module.exports = validateUser;
