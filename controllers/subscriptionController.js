import paystack from "../config/paystack.js";
import User from "../models/user.model.js";

const getPlanDetails = (plan) => {
  if (plan === "monthly") {
    return {
      plan,
      planCode: process.env.PAYSTACK_MONTHLY_PLAN_CODE,
      amount: 800000,
    };
  }

  if (plan === "quarterly") {
    return {
      plan,
      planCode: process.env.PAYSTACK_QUARTERLY_PLAN_CODE,
      amount: 1500000,
    };
  }

  return null;
};

export const initializeSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!["monthly", "quarterly"].includes(plan)) {
      return res.status(400).json({
        message: "Invalid subscription plan.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        message: "Only sellers can subscribe to a seller plan.",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message: "Your seller account has not been approved yet.",
      });
    }

    const planDetails = getPlanDetails(plan);

    if (!planDetails?.planCode) {
      return res.status(500).json({
        message: "Paystack plan is not configured.",
      });
    }
    
    const response = await paystack.post(
      "/transaction/initialize",
      {
        email: user.email,
        amount: planDetails.amount,
        currency: "NGN",
        plan: planDetails.planCode,
        metadata: {
          userId: user._id.toString(),
          plan,
        },
        callback_url: `${process.env.CLIENT_URL}/subscription/verify`,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Subscription payment initialized.",
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    });
  } catch (error) {
    
    return res.status(500).json({
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to initialize subscription payment.",
    });
  }
};

export const verifySubscription = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        message: "Payment reference is required.",
      });
    }

    const response = await paystack.get(
      `/transaction/verify/${reference}`,
    );

    const payment = response.data.data;

    if (payment.status !== "success") {
      return res.status(400).json({
        message: "Payment was not successful.",
      });
    }

    const userId = payment.metadata?.userId;
    const selectedPlan = payment.metadata?.plan;

    if (!userId || !selectedPlan) {
      return res.status(400).json({
        message: "Invalid subscription payment metadata.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        message: "Only sellers can have a subscription.",
      });
    }

    const now = new Date();

    const expiresAt = new Date(now);

    if (selectedPlan === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    if (selectedPlan === "quarterly") {
      expiresAt.setMonth(expiresAt.getMonth() + 3);
    }

    const propertyLimit = selectedPlan === "monthly" ? 10 : 10;

    user.subscription = {
      ...user.subscription,
      plan: selectedPlan,
      status: "active",
      propertyLimit,
      paystackCustomerCode:
        payment.customer?.customer_code || null,
      paystackPlanCode:
        payment.plan_object?.plan_code ||
        payment.plan ||
        null,
        
      startDate: now,
      nextPaymentDate: expiresAt,
      expiresAt,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Subscription activated successfully.",
      subscription: user.subscription,
    });
  } catch (error) {
    console.error(
      "Verify subscription error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message:
        error.response?.data?.message ||
        "Unable to verify subscription payment.",
    });
  }
};