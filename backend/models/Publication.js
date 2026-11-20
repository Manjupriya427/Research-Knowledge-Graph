const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  journal: { type: String, default: "" },
  year: { type: Number, min: 1900, max: 2100 },
  doi: { type: String, default: "" },
  researchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Researcher" }],
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "ResearchTopic" }]
}, { timestamps: true });
module.exports = mongoose.model("Publication", schema);
