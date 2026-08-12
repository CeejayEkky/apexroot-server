import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    // User from token no longer exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token no longer exists",
      });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by an admin",
      });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token invalid",
    });
  }
};

export const auth = (...roles) => {
    return ( req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access Denied. You do not have permission."
            })
        }

        next()
    }
}