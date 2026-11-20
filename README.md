# Research Knowledge Graph – Intelligent Research Discovery System

Full-stack college project using HTML, CSS, JavaScript, Node.js, Express, MongoDB Atlas, and Cytoscape.js.

## Features
- Dashboard statistics for researchers, topics, publications, datasets, and funding projects.
- CRUD (create, read, update, delete) for all five research entity types.
- Connect publications, datasets, and funding projects to researchers and topics.
- Interactive knowledge graph visualization showing entities and relationships.
- Rule-based semantic insights for shared topics, expertise, datasets, and funding connections.
- Search/filter for records in each module.

## Setup
1. Install Node.js.
2. Extract this ZIP and open the extracted folder in VS Code.
3. In `backend`, copy `.env.example` to `.env`.
4. Edit `backend/.env` and set your own MongoDB Atlas connection string:

   `MONGO_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/research_knowledge_graph?retryWrites=true&w=majority`

   Replace placeholders with your Atlas credentials. Never share or commit your real `.env` file.
5. Open the terminal in the project root and run:

   ```powershell
   npm.cmd install
   npm.cmd start
   ```
6. Visit http://localhost:5000

## Project folders
- `frontend/`: user interface, CRUD interactions, graph and insights
- `backend/models/`: MongoDB schemas
- `backend/routes/`: REST API routes
- `backend/server.js`: Express server and database connection

## Semantic reasoning
The Insights page applies transparent rule-based reasoning:
- researchers with overlapping expertise are suggested as potential collaborators;
- researchers linked to the same topic are identified;
- topics connected through shared researchers are highlighted;
- datasets and publications linked to a topic are shown as supporting research resources;
- funding projects linked to topics and researchers are surfaced as related support.

These are explainable project rules, not an external AI/LLM model.

## Important
MongoDB creates the database and collections when the first records are inserted. The ZIP does not contain your private MongoDB credentials, existing database records, or `node_modules`; install dependencies and configure `.env` after extracting.
