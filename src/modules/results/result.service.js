const Result = require("./result.model");

exports.createResult = (data) => Result.create(data);

exports.getAllResults = () => Result.find().sort("-createdAt").lean();

exports.getResultById = (id) => Result.findById(id).lean();

exports.updateResult = (id, data) =>
  Result.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

exports.deleteResult = (id) => Result.findByIdAndDelete(id).lean();