import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    phone: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
    },
    address: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "monthly", "quarterly"],
        default: "free",
      },

      status: {
        type: String,
        enum: ["inactive", "active", "non-renewing", "attention", "cancelled"],
        default: "inactive",
      },

      propertyLimit: {
        type: Number,
        default: 4,
      },

      paystackCustomerCode: {
        type: String,
        default: null,
      },

      paystackSubscriptionCode: {
        type: String,
        default: null,
      },

      paystackPlanCode: {
        type: String,
        default: null,
      },

      startDate: {
        type: Date,
        default: null,
      },

      nextPaymentDate: {
        type: Date,
        default: null,
      },

      expiresAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
