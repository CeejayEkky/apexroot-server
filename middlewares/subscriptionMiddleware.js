import User from "../models/user.model.js";

export const requireActiveSubscription = async (req, res, next) => {
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
        message: "Only sellers can access this resource.",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your seller account has not been approved yet.",
      });
    }

    const subscription = user.subscription;

    if (
      !subscription ||
      subscription.status !== "active" ||
      !subscription.expiresAt
    ) {
      return res.status(403).json({
        success: false,
        message: "An active subscription is required.",
        subscriptionRequired: true,
      });
    }

    const now = new Date();

    if (new Date(subscription.expiresAt) <= now) {
      user.subscription.status = "expired";
      user.subscription.propertyLimit = 4;
      
      await user.save();

      return res.status(403).json({
        success: false,
        message: "Your subscription has expired.",
        subscriptionRequired: true,
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Subscription middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify subscription status.",
    });
  }
};