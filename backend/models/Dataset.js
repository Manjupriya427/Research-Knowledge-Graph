const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  source: { type: String, default: "" },
  url: { type: String, default: "" },
  researchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Researcher" }],
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "ResearchTopic" }]
}, { timestamps: true });
module.exports = mongoose.model("Dataset", schema);
