const mongoose = require("mongoose");

// Removed "waived" from statuses
const PAYMENT_STATUSES = ["unpaid", "partial", "paid"];

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

paymentSchema.index(
  { studentId: 1, groupId: 1, cycleStart: 1, cycleEnd: 1 },
  { unique: true }
);

// Auto-calculate remaining + status (without waived logic)
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

  this.remaining = roundCurrency(amountDue - amountPaid);

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