
const API = {
    researchers: "/api/researchers",
    topics: "/api/topics",
    publications: "/api/publications",
    datasets: "/api/datasets",
    funding: "/api/funding"
};

const modules = [
 {
  key:"researchers", title:"Researchers", singular:"Researcher",
  fields:[
   {name:"name",label:"Full Name",required:true,placeholder:"Researcher name"},
   {name:"email",label:"Email",type:"email",required:true,placeholder:"name@example.com"},
   {name:"department",label:"Department",required:true,placeholder:"Computer Science"},
   {name:"expertise",label:"Expertise (comma separated)",placeholder:"AI, Machine Learning",array:true}
  ],
  columns:[["name","Name"],["email","Email"],["department","Department"],["expertise","Expertise"]]
 },
 {
  key:"topics",title:"Research Topics",singular:"Research Topic",
  fields:[
   {name:"title",label:"Topic Title",required:true,placeholder:"Artificial Intelligence"},
   {name:"description",label:"Description",required:true,textarea:true,placeholder:"Describe the research topic"},
   {name:"keywords",label:"Keywords (comma separated)",array:true,placeholder:"AI, automation"},
   {name:"researchers",label:"Related Researchers",select:"researchers",array:true}
  ],
  columns:[["title","Topic"],["description","Description"],["keywords","Keywords"],["researchers","Researchers"]]
 },
 {
  key:"publications",title:"Publications",singular:"Publication",
  fields:[
   {name:"title",label:"Publication Title",required:true,placeholder:"Enter publication title"},
   {name:"journal",label:"Journal / Conference",placeholder:"Journal name"},
   {name:"year",label:"Publication Year",type:"number",placeholder:"2026"},
   {name:"doi",label:"DOI",placeholder:"10.xxxx/example"},
   {name:"researchers",label:"Authors / Researchers",select:"researchers",array:true},
   {name:"topics",label:"Related Topics",select:"topics",array:true}
  ],
  columns:[["title","Title"],["journal","Journal"],["year","Year"],["researchers","Researchers"],["topics","Topics"]]
 },
 {
  key:"datasets",title:"Datasets",singular:"Dataset",
  fields:[
   {name:"name",label:"Dataset Name",required:true,placeholder:"Dataset name"},
   {name:"description",label:"Description",textarea:true,placeholder:"Brief dataset description"},
   {name:"source",label:"Source / Organization",placeholder:"Dataset source"},
   {name:"url",label:"Dataset URL",placeholder:"https://..."},
   {name:"researchers",label:"Contributing Researchers",select:"researchers",array:true},
   {name:"topics",label:"Related Topics",select:"topics",array:true}
  ],
  columns:[["name","Dataset"],["source","Source"],["url","URL"],["researchers","Researchers"],["topics","Topics"]]
 },
 {
  key:"funding",title:"Funding Projects",singular:"Funding Project",
  fields:[
   {name:"title",label:"Project Title",required:true,placeholder:"Project title"},
   {name:"agency",label:"Funding Agency",placeholder:"Agency / Organization"},
   {name:"amount",label:"Funding Amount",type:"number",placeholder:"Amount in INR"},
   {name:"status",label:"Status",selectOptions:["Proposed","Active","Completed"]},
   {name:"researchers",label:"Researchers",select:"researchers",array:true},
   {name:"topics",label:"Supported Topics",select:"topics",array:true}
  ],
  columns:[["title","Project"],["agency","Agency"],["amount","Amount"],["status","Status"],["researchers","Researchers"],["topics","Topics"]]
 }
];

const cache = {};

const byId = id => document.getElementById(id);

const esc = value =>
 String(value ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
 }[c]));

function titleCase(s) {
 return s.charAt(0).toUpperCase() + s.slice(1);
}

// API CONNECTION

const API_BASE_URL = window.location.hostname.endsWith("github.io")
    ? "https://research-knowledge-graph.onrender.com"
    : "";

async function api(url, options = {}) {
    const fullUrl = url.startsWith("http")
        ? url
        : `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, options);

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

// BUILD MODULES
function buildModules() {
 const host = byId("module-sections");

 modules.forEach(m => {
  const section = document.createElement("section");
  section.id = m.key;
  section.className = "section";

  const fields = m.fields.map(f => {
   let control = "";

   if (f.select) {
    control = `<select id="${m.key}-${f.name}" multiple size="3"></select>`;
   } else if (f.selectOptions) {
    control = `<select id="${m.key}-${f.name}">${f.selectOptions.map(x => `<option>${esc(x)}</option>`).join("")}</select>`;
   } else if (f.textarea) {
    control = `<textarea id="${m.key}-${f.name}" rows="3" placeholder="${esc(f.placeholder || "")}"></textarea>`;
   } else {
    control = `<input id="${m.key}-${f.name}" type="${f.type || "text"}" ${f.required ? "required" : ""} placeholder="${esc(f.placeholder || "")}">`;
   }

   return `<label>${esc(f.label)}${control}</label>`;
  }).join("");

  const headers = m.columns.map(c => `<th>${esc(c[1])}</th>`).join("");

  section.innerHTML = `
   <div class="module-head">
    <p class="eyebrow">${m.key.toUpperCase()}</p>
    <h2>${m.title} Management</h2>
    <p class="muted">Create, view, update and delete ${m.title.toLowerCase()} records and connect related research entities.</p>
   </div>

   <div class="module-grid">
    <div class="panel">
     <h3 id="${m.key}-form-title">Add ${m.singular}</h3>

     <form id="${m.key}-form">
      <input type="hidden" id="${m.key}-id">

      ${fields}

      <div class="form-actions">
       <button type="submit" id="${m.key}-submit">Add ${m.singular}</button>
       <button type="button" class="secondary hidden" id="${m.key}-cancel">Cancel</button>
      </div>
     </form>

     <p class="message" id="${m.key}-message" aria-live="polite"></p>
    </div>

    <div class="panel table-panel">
     <div class="table-head">
      <h3>${m.title} List</h3>
      <input class="search" id="${m.key}-search" placeholder="Search records...">
      <span class="record-count" id="${m.key}-count">0 records</span>
     </div>

     <div class="table-wrap">
      <table>
       <thead>
        <tr>${headers}<th>Actions</th></tr>
       </thead>
       <tbody id="${m.key}-list"></tbody>
      </table>
     </div>
    </div>
   </div>
  `;

  host.appendChild(section);

  byId(`${m.key}-form`).addEventListener("submit", e => saveRecord(m, e));

  byId(`${m.key}-cancel`).addEventListener("click", () => resetForm(m));

  byId(`${m.key}-search`).addEventListener("input", () => renderTable(m));
 });
}

// GET DISPLAY LABEL
function getLabel(m, field, value) {
 if (Array.isArray(value)) {
  return value.map(x =>
   typeof x === "object" ? (x.name || x.title || "") : x
  ).join(", ") || "—";
 }

 if (value && typeof value === "object") {
  return value.name || value.title || "—";
 }

 return value === undefined || value === null || value === ""
  ? "—"
  : String(value);
}

// RELATION IDS
function relationIds(m, field) {
 return Array.from(
  byId(`${m.key}-${field.name}`).selectedOptions
 ).map(o => o.value);
}

// FORM DATA
function formPayload(m) {
 const data = {};

 m.fields.forEach(f => {
  const el = byId(`${m.key}-${f.name}`);

  if (f.array && !f.select) {
   data[f.name] = el.value.split(",").map(x => x.trim()).filter(Boolean);
  } else if (f.select) {
   data[f.name] = relationIds(m, f);
  } else if (f.type === "number") {
   data[f.name] = el.value === "" ? undefined : Number(el.value);
  } else {
   data[f.name] = el.value.trim();
  }
 });

 return data;
}

// ADD AND UPDATE RECORD
async function saveRecord(m, event) {
 event.preventDefault();

 const id = byId(`${m.key}-id`).value;

 try {
  await api(
   id ? `${API[m.key]}/${id}` : API[m.key],
   {
    method: id ? "PUT" : "POST",
    headers: {
     "Content-Type": "application/json"
    },
    body: JSON.stringify(formPayload(m))
   }
  );

  message(
   m.key,
   id
    ? `${m.singular} updated successfully.`
    : `${m.singular} added successfully.`,
   true
  );

  resetForm(m);
  await loadAll();

 } catch (e) {
  message(m.key, e.message, false);
 }
}

// SHOW MESSAGE
function message(key, text, ok) {
 const el = byId(`${key}-message`);
 el.textContent = text;
 el.style.color = ok ? "#16856c" : "#c34c46";
}

// RESET FORM
function resetForm(m) {
 byId(`${m.key}-form`).reset();
 byId(`${m.key}-id`).value = "";

 byId(`${m.key}-form-title`).textContent = `Add ${m.singular}`;
 byId(`${m.key}-submit`).textContent = `Add ${m.singular}`;

 byId(`${m.key}-cancel`).classList.add("hidden");
}

// EDIT RECORD
function editRecord(m, record) {
 byId(`${m.key}-id`).value = record._id;

 m.fields.forEach(f => {
  const el = byId(`${m.key}-${f.name}`);
  const value = record[f.name];

  if (f.select) {
   const ids = (value || []).map(x =>
    typeof x === "object" ? x._id : x
   );

   Array.from(el.options).forEach(o => {
    o.selected = ids.includes(o.value);
   });

  } else if (f.array) {
   el.value = (value || []).join(", ");

  } else {
   el.value = value ?? "";
  }
 });

 byId(`${m.key}-form-title`).textContent = `Edit ${m.singular}`;
 byId(`${m.key}-submit`).textContent = "Save Changes";

 byId(`${m.key}-cancel`).classList.remove("hidden");

 byId(m.key).scrollIntoView({ behavior: "smooth" });
}

// DELETE RECORD
async function deleteRecord(m, id) {
 if (!confirm(`Delete this ${m.singular.toLowerCase()}?`)) return;

 try {
  await api(`${API[m.key]}/${id}`, {
   method: "DELETE"
  });

  message(m.key, "Record deleted.", true);

  await loadAll();

 } catch (e) {
  message(m.key, e.message, false);
 }
}

// DISPLAY TABLE
function renderTable(m) {
 const list = byId(`${m.key}-list`);
 list.innerHTML = "";

 const q = byId(`${m.key}-search`).value.toLowerCase();

 const rows = (cache[m.key] || []).filter(r =>
  JSON.stringify(r).toLowerCase().includes(q)
 );

 byId(`${m.key}-count`).textContent = `${rows.length} records`;

 if (!rows.length) {
  list.innerHTML = `
   <tr>
    <td colspan="${m.columns.length + 1}" class="empty">
     No matching records found.
    </td>
   </tr>
  `;
  return;
 }

 rows.forEach(record => {
  const tr = document.createElement("tr");

  m.columns.forEach(([field]) => {
   const td = document.createElement("td");
   td.textContent = getLabel(m, field, record[field]);
   tr.appendChild(td);
  });

  const td = document.createElement("td");
  td.className = "actions";

  const edit = document.createElement("button");
  edit.textContent = "Edit";
  edit.className = "edit-btn";
  edit.onclick = () => editRecord(m, record);

  const del = document.createElement("button");
  del.textContent = "Delete";
  del.className = "delete-btn";
  del.onclick = () => deleteRecord(m, record._id);

  td.append(edit, del);
  tr.appendChild(td);
  list.appendChild(tr);
 });
}

// FILL RELATION DROPDOWNS
function fillRelationOptions() {
 modules.forEach(m =>
  m.fields.filter(f => f.select).forEach(f => {
   const source = cache[f.select] || [];
   const el = byId(`${m.key}-${f.name}`);

   const old = Array.from(el.selectedOptions).map(o => o.value);

   el.innerHTML = "";

   source.forEach(item => {
    const o = document.createElement("option");
    o.value = item._id;
    o.textContent = item.name || item.title;
    o.selected = old.includes(o.value);
    el.appendChild(o);
   });
  })
 );
}

// LOAD ALL DATA
async function loadAll() {
 await Promise.all(
  modules.map(async m => {
   cache[m.key] = await api(API[m.key]);
  })
 );

 fillRelationOptions();

 modules.forEach(m => renderTable(m));

 modules.forEach(m => {
  const el = byId(`count-${m.key}`);
  if (el) el.textContent = cache[m.key].length;
 });

 await Promise.all([
  loadGraph(),
  loadInsights()
 ]);
}

// LOAD KNOWLEDGE GRAPH

async function loadGraph() {
    try {
        const graph = await api("/api/graph");

        byId("graphMessage").textContent =
            `${graph.nodes.length} entities and ${graph.edges.length} relationships`;

        if (typeof cytoscape === "undefined") {
            byId("graphMessage").textContent +=
                ". Graph library did not load; check internet access.";
            return;
        }

        if (window.graphInstance) {
            window.graphInstance.destroy();
        }

        const cy = cytoscape({
            container: byId("cy"),

            elements: [
                ...graph.nodes,
                ...graph.edges
            ],

            style: [
                {
                    selector: "node",
                    style: {
                        "label": "data(label)",
                        "font-size": 11,
                        "font-weight": "bold",
                        "text-wrap": "wrap",
                        "text-max-width": 120,
                        "text-valign": "bottom",
                        "text-halign": "center",
                        "text-margin-y": 8,
                        "color": "#26384a",
                        "text-background-color": "#ffffff",
                        "text-background-opacity": 0.85,
                        "text-background-padding": 3,
                        "background-color": "#2864a5",
                        "width": 48,
                        "height": 48,
                        "border-width": 2,
                        "border-color": "#ffffff"
                    }
                },
                {
                    selector: 'node[type="researcher"]',
                    style: {
                        "background-color": "#2864a5",
                        "shape": "ellipse"
                    }
                },
                {
                    selector: 'node[type="topic"]',
                    style: {
                        "background-color": "#16856c",
                        "shape": "round-rectangle",
                        "width": 55,
                        "height": 45
                    }
                },
                {
                    selector: 'node[type="publication"]',
                    style: {
                        "background-color": "#c58b32",
                        "shape": "diamond"
                    }
                },
                {
                    selector: 'node[type="dataset"]',
                    style: {
                        "background-color": "#8a65b7",
                        "shape": "hexagon"
                    }
                },
                {
                    selector: 'node[type="funding"]',
                    style: {
                        "background-color": "#c35e69",
                        "shape": "tag"
                    }
                },
                {
                    selector: "edge",
                    style: {
                        "width": 2,
                        "line-color": "#9aabba",
                        "target-arrow-color": "#71869b",
                        "target-arrow-shape": "triangle",
                        "arrow-scale": 1,
                        "curve-style": "bezier",
                        "label": "data(label)",
                        "font-size": 8,
                        "color": "#526477",
                        "text-rotation": "autorotate",
                        "text-background-color": "#ffffff",
                        "text-background-opacity": 0.9,
                        "text-background-padding": 2
                    }
                },
                {
                    selector: ":selected",
                    style: {
                        "border-width": 4,
                        "border-color": "#172554"
                    }
                }
            ],

            layout: {
                name: "cose",
                animate: false,
                randomize: true,
                fit: true,
                padding: 80,
                nodeRepulsion: 30000,
                idealEdgeLength: 220,
                edgeElasticity: 100,
                nestingFactor: 1,
                gravity: 0.08,
                numIter: 2000,
                initialTemp: 1000,
                coolingFactor: 0.95,
                minTemp: 1,
                componentSpacing: 200,
                nodeDimensionsIncludeLabels: true,
                avoidOverlap: true
            }
        });

        window.graphInstance = cy;

        cy.fit(80);

        cy.on("tap", "node", evt => {
            const d = evt.target.data();

            byId("graphMessage").textContent =
                `${d.type}: ${d.label}`;
        });

    } catch (e) {
        byId("graphMessage").textContent =
            "Unable to load graph: " + e.message;
    }
}


// LOAD INTELLIGENT INSIGHTS
async function loadInsights() {
 try {
  const insights = await api("/api/insights");

  const host = byId("insightList");
  host.innerHTML = "";

  insights.forEach(item => {
   const card = document.createElement("article");
   card.className = "insight";

   card.innerHTML = `
    <small>${esc(item.type)}</small>
    <h3>${esc(item.title)}</h3>
    <p>${esc(item.detail)}</p>
   `;

   host.appendChild(card);
  });

 } catch (e) {
  byId("insightList").textContent =
   "Unable to load insights: " + e.message;
 }
}

// REFRESH GRAPH
byId("refreshGraph").addEventListener("click", loadGraph);

// SIDEBAR NAVIGATION
document.querySelectorAll(".nav").forEach(link => {
 link.addEventListener("click", () => {
  document.querySelectorAll(".nav").forEach(x =>
   x.classList.remove("active")
  );

  link.classList.add("active");
 });
});

// INITIALIZE APPLICATION
async function initialize() {
 buildModules();

 try {
  await api("/api/status");
  await loadAll();

  console.log("Research Knowledge Graph loaded successfully.");

 } catch (e) {
  console.error("Application connection error:", e);

  alert(
   "Could not load project data. Check backend server and MongoDB connection."
  );
 }
}

initialize();
