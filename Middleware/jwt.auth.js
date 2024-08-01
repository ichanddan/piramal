import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unathorizatiod" });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode.userData;
    console.log(decode)
    console.log(decode.userData)
    next()
  } catch (error) {
    console.log(error);
    res.status(408).json({ error: "invalid token" });
  }
};



const genToken = (userData) => {
  return jwt.sign({ userData }, process.env.JWT_SECRET);
};

export { verifyToken, genToken };
