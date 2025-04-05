const jwt = require("jsonwebtoken");

const jwtMiddleWare = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) res.status(401).json({ msg: "Token Not Found!" });
  
    const token = req.headers.authorization.split(" ")[1];
    if (!token) res.status(401).json({ msg: "Unauthorized" });
  
    try {
      const decode = jwt.verify(token, process.env.JWT_KEY);
      req.jwtPayload = decode;
      next();
    } catch (e) {
      console.log("jwt Erro: ", e);
      res.status(401).json({ error: "Invalid token!" });
    }
  };

  const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_KEY);
  };
  
  
  module.exports = { jwtMiddleWare, generateToken };