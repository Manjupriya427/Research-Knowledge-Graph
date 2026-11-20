const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  keywords: { type: [String], default: [] },
  researchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Researcher" }]
}, { timestamps: true });
module.exports = mongoose.model("ResearchTopic", schema);
