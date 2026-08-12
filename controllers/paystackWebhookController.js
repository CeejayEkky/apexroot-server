import crypto from "crypto";
import User from "../models/user.model.js";

export const handlePaystackWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).json({
        success: false,
        message: "Invalid webhook signature.",
      });
    }

    const event = req.body;

    console.log("Paystack webhook:", event.event);

    if (event.event === "charge.success") {
      const metadata = event.data?.metadata;

      const userId = metadata?.userId;
      const plan = metadata?.plan;

      if (!userId || !plan) {
        return res.sendStatus(200);
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.sendStatus(200);
      }

      const now = new Date();
      const expiresAt = new Date(now);

      if (plan === "monthly") {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      if (plan === "quarterly") {
        expiresAt.setMonth(expiresAt.getMonth() + 3);
      }

      user.subscription = {
        ...user.subscription,
        plan,
        status: "active",
        propertyLimit: plan === "monthly" ? 10 : plan === "quarterly" ? 30 : user.subscription?.propertyLimit || 4,

        paystackCustomerCode:
          event.data.customer?.customer_code ||
          user.subscription?.paystackCustomerCode ||
          null,

        paystackSubscriptionCode:
          event.data.subscription_code ||
          user.subscription?.paystackSubscriptionCode ||
          null,

        paystackPlanCode:
          event.data.plan_object?.plan_code ||
          user.subscription?.paystackPlanCode ||
          null,

        startDate: now,
        nextPaymentDate: expiresAt,
        expiresAt,
      };

      await user.save();

      console.log(
        `Subscription renewed for ${user.email} - ${plan}`
      );
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return res.sendStatus(500);
  }
};