import User from "../models/user.model.js";
import Property from "../models/propty.model.js";

export const checkPropertyLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can create properties.",
      });
    }

    const propertyLimit = user.subscription?.propertyLimit ?? 4;

    const propertyCount = await Property.countDocuments({
      seller: user._id,
    });

    if (propertyCount >= propertyLimit) {
      return res.status(403).json({
        success: false,
        message: `You have reached your property limit of ${propertyLimit}.`,
        propertyLimit,
        currentPropertyCount: propertyCount,
        limitReached: true,
      });
    }

    next();
  } catch (error) {
    console.error("Property limit middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify property limit.",
    });
  }
};