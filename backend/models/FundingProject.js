const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  agency: { type: String, default: "" },
  amount: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["Proposed", "Active", "Completed"], default: "Proposed" },
  researchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Researcher" }],
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "ResearchTopic" }]
}, { timestamps: true });
module.exports = mongoose.model("FundingProject", schema);
