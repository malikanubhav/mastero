import { z } from "zod";
import { User } from "../../models/index.js";
import { hashPassword, checkPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";




const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: "Email already registered", field: "email" });
        }
        const hashed = await hashPassword(password);
        const user = await User.create({ name, email, password: hashed });

        const jwt = await generateToken({id:user.id, email: user.email, role:  user.role });
        return res.json({
            message: "User Registered Successfully",
            token: jwt,
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "server error" });
    }
}

const login = async (req, res) => {

    try {
        
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const ok = await checkPassword(password, user.password);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });

        const token = generateToken({ id: user.id, email: user.email, role:user.role});
        return res.status(200).json({
            message: "Logged in",
            token: token,
            user: {name:user.name, email : user.email, role:user.role},
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}


export { register, login }