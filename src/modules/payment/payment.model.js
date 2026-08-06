const mongoose = require("mongoose");

const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "waived"];

// Round money to 2 decimal places to avoid floating point issues
const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const paymentSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "studentId is required."],
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "groupId is required."],
      index: true,
    },
    cycleStart: {
      type: Date,
      required: [true, "cycleStart is required."],
    },
    cycleEnd: {
      type: Date,
      required: [true, "cycleEnd is required."],
    },
    amountDue: {
      type: Number,
      required: [true, "amountDue is required."],
      min: [0, "amountDue cannot be negative."],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, "amountPaid cannot be negative."],
    },
    remaining: {
      type: Number,
      default: 0,
      min: [0, "remaining cannot be negative."],
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "unpaid",
      index: true,
    },
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    waivedReason: {
      type: String,
      trim: true,
      maxlength: [500, "waivedReason cannot exceed 500 characters."],
      default: null,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One payment per student per group per cycle
paymentSchema.index(
  { studentId: 1, groupId: 1, cycleStart: 1, cycleEnd: 1 },
  { unique: true }
);

// Auto-calculate remaining + status before validation
paymentSchema.pre("validate", function derivePaymentBalance() {
  if (this.cycleStart && this.cycleEnd && this.cycleEnd <= this.cycleStart) {
    this.invalidate("cycleEnd", "cycleEnd must be later than cycleStart.");
  }

  if (this.amountDue === undefined || this.amountPaid === undefined) {
    return;
  }

  const amountDue = roundCurrency(this.amountDue);
  const amountPaid = roundCurrency(this.amountPaid);
  this.amountDue = amountDue;
  this.amountPaid = amountPaid;

  if (amountPaid > amountDue) {
    this.invalidate("amountPaid", "amountPaid cannot be greater than amountDue.");
    return;
  }

  if (this.status === "waived") {
    if (!this.waivedBy) {
      this.invalidate("waivedBy", "waivedBy is required for a waived payment.");
    }
    if (!this.waivedReason) {
      this.invalidate("waivedReason", "waivedReason is required for a waived payment.");
    }
    this.remaining = 0;
    return;
  }

  this.remaining = roundCurrency(amountDue - amountPaid);
  this.waivedBy = null;
  this.waivedReason = null;

  if (amountDue === 0 || this.remaining === 0) {
    this.status = "paid";
  } else if (amountPaid === 0) {
    this.status = "unpaid";
  } else {
    this.status = "partial";
  }
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

module.exports = Payment;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;