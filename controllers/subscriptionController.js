import paystack from "../config/paystack.js";
import User from "../models/user.model.js";

const getPlanDetails = (plan) => {
  if (plan === "monthly") {
    return {
      plan,
      amount: 8000,
      planCode: process.env.PAYSTACK_MONTHLY_PLAN_CODE,
    };
  }

  if (plan === "quarterly") {
    return {
      plan,
      amount: 15000,
      planCode: process.env.PAYSTACK_QUARTERLY_PLAN_CODE,
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

    console.log("========== PAYSTACK SUBSCRIPTION ==========");
    console.log("Selected plan:", plan);
    console.log("Paystack plan code:", planDetails.planCode);
    console.log("User email:", user.email);
    console.log("Paystack key exists:", !!process.env.PAYSTACK_SECRET_KEY);
    console.log("============================================");

    const response = await paystack.post("/transaction/initialize", {
      email: user.email,
      plan: planDetails.planCode,
      metadata: {
        userId: user._id.toString(),
        plan,
      },
      callback_url: `${process.env.CLIENT_URL}/subscription/verify`,
    });

    console.log("Paystack initialization successful.");

    return res.status(200).json({
      success: true,
      message: "Subscription payment initialized.",
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    });
  } catch (error) {
    console.error(
      "========== PAYSTACK ERROR =========="
    );

    console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      "Paystack response:",
      error.response?.data
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "===================================="
    );

    return res.status(500).json({
      message:
        error.response?.data?.message ||
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

    user.subscription = {
      ...user.subscription,
      plan: selectedPlan,
      status: "active",
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