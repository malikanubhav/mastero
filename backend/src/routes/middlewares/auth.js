import { verifyToken } from "../../utils/jwt.js";
export const auth = (req, res, next) => {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    try {
        req.user = verifyToken(token);
        return next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
};
