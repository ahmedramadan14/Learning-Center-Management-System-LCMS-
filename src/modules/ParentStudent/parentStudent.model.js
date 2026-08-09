const mongoose = require("mongoose");

const parentStudentSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

parentStudentSchema.index(
  { parent: 1, student: 1 },
  { unique: true }
);

const ParentStudent =
  mongoose.models.ParentStudent ||
  mongoose.model("ParentStudent", parentStudentSchema);

module.exports = ParentStudent;