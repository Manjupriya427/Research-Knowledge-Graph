const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
app.use(cors({
  origin: [
    "https://manjupriya427.github.io",
    "https://research-knowledge-graph.onrender.com",
    "http://localhost:5000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/api/status", (req, res) => res.json({ message: "Research Knowledge Graph API is running" }));

const resources = ["researchers", "topics", "publications", "datasets", "funding"];
resources.forEach(resource => {
  app.use(`/api/${resource}`, require(`./routes/${resource}`));
});

app.get("/api/graph", async (req, res) => {
  try {
    const [Researcher, Topic, Publication, Dataset, Funding] = [
      require("./models/Researcher"), require("./models/ResearchTopic"),
      require("./models/Publication"), require("./models/Dataset"), require("./models/FundingProject")
    ];
    const [researchers, topics, publications, datasets, funding] = await Promise.all([
      Researcher.find(), Topic.find(), Publication.find(), Dataset.find(), Funding.find()
    ]);
    const nodes = [];
    const edges = [];
    const addNode = (id, label, type) => nodes.push({ data: { id: String(id), label, type } });
    researchers.forEach(x => addNode(x._id, x.name, "researcher"));
    topics.forEach(x => addNode(x._id, x.title, "topic"));
    publications.forEach(x => addNode(x._id, x.title, "publication"));
    datasets.forEach(x => addNode(x._id, x.name, "dataset"));
    funding.forEach(x => addNode(x._id, x.title, "funding"));
    const link = (from, to, label) => {
      if (from && to) edges.push({ data: { id: `${from}-${to}-${label}`, source: String(from), target: String(to), label } });
    };
    topics.forEach(x => (x.researchers || []).forEach(id => link(id, x._id, "works on")));
    publications.forEach(x => {
      (x.researchers || []).forEach(id => link(id, x._id, "authored"));
      (x.topics || []).forEach(id => link(x._id, id, "about"));
    });
    datasets.forEach(x => {
      (x.researchers || []).forEach(id => link(id, x._id, "created"));
      (x.topics || []).forEach(id => link(x._id, id, "supports"));
    });
    funding.forEach(x => {
      (x.researchers || []).forEach(id => link(id, x._id, "funds"));
      (x.topics || []).forEach(id => link(x._id, id, "supports"));
    });
    res.json({ nodes, edges });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get("/api/insights", async (req, res) => {
  try {
    const Researcher = require("./models/Researcher");
    const Topic = require("./models/ResearchTopic");
    const Publication = require("./models/Publication");
    const Dataset = require("./models/Dataset");
    const Funding = require("./models/FundingProject");
    const [researchers, topics, publications, datasets, funding] = await Promise.all([
      Researcher.find(), Topic.find().populate("researchers", "name expertise"),
      Publication.find().populate("researchers topics", "name title"),
      Dataset.find().populate("researchers topics", "name title"),
      Funding.find().populate("researchers topics", "name title")
    ]);
    const insights = [];
    for (let i = 0; i < researchers.length; i++) for (let j = i + 1; j < researchers.length; j++) {
      const common = (researchers[i].expertise || []).filter(a =>
        (researchers[j].expertise || []).some(b => b.toLowerCase() === a.toLowerCase()));
      if (common.length) insights.push({
        type: "Potential collaboration",
        title: `${researchers[i].name} and ${researchers[j].name}`,
        detail: `Shared expertise: ${common.join(", ")}. They may be suitable research collaborators.`
      });
    }
    topics.forEach(topic => {
      if ((topic.researchers || []).length > 1) insights.push({
        type: "Research community", title: topic.title,
        detail: `${topic.researchers.map(r => r.name).join(", ")} are connected to this topic.`
      });
    });
    const linkedResources = [
      ...publications.map(x => ({ title: x.title, kind: "Publication", topics: x.topics || [] })),
      ...datasets.map(x => ({ title: x.name, kind: "Dataset", topics: x.topics || [] })),
      ...funding.map(x => ({ title: x.title, kind: "Funding project", topics: x.topics || [] }))
    ];
    linkedResources.forEach(item => item.topics.forEach(topic => insights.push({
      type: "Connected research resource", title: `${item.kind}: ${item.title}`,
      detail: `This ${item.kind.toLowerCase()} is linked to the research topic "${topic.title}".`
    })));
    if (!insights.length) insights.push({
      type: "Getting started", title: "Add connected research data",
      detail: "Add researchers, topics, publications, datasets, and funding projects to generate relationship-based insights."
    });
    res.json(insights);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

const PORT = process.env.PORT || 5000;
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing. Create backend/.env using .env.example.");
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(error => {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  });
