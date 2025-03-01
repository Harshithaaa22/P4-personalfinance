import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; 
        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }

        jwt.verify(token, process.env.SECRET_KEY.trim(), (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            req.user = decoded; // Attach user details to req.user
            next();
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};