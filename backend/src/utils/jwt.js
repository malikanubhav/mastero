import jwt from "jsonwebtoken";
import "dotenv/config";

const generateToken = (data)=>{
    return jwt.sign(data,process.env.JWT_SECRET);
}
const verifyToken = (token) =>{
    return jwt.verify(token, process.env.JWT_SECRET);
}

export { verifyToken, generateToken}