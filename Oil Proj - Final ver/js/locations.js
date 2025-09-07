// Locations Page
function loadLocationsPage(container) {
    if (!container) {
        container = document.getElementById("main-content");
    }
    if (!container) {
        console.error("No container found for Locations page");
        return;
    }

    const content = `
        <div class="controls">
            <button class="create-btn" onclick="Locations.openCreateModal()">
                ➕ Create New
            </button>
            <button class="upload-btn" onclick="document.getElementById('locationsFileInput').click()">
                📄 Upload Excel
            </button>
            <input type="file" id="locationsFileInput" accept=".xlsx,.xls,.csv" style="display:none" onchange="Locations.handleFileUpload(event)">
            <input type="text" class="search-box" placeholder="Search locations..." onkeyup="Locations.search(this.value)">
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>LOCATION DESCRIPTION</th>
                        <th>LOCATION</th>
                        <th>WELL NO</th>
                        <th>NEXT LOCATION</th>
                        <th>GROUP</th>
                        <th>DRIVING ROUTE</th>
                        <th>NETWORK</th>
                    </tr>
                </thead>
                <tbody id="locationsTableBody">
                </tbody>
            </table>
        </div>

        <!-- Create Location Modal -->
        <div id="createLocationModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Create New Location</h2>
                    <button class="close" onclick="Locations.closeCreateModal()">×</button>
                </div>
                <form id="createLocationForm">
                    <div class="form-group">
                        <label class="form-label">Location Description</label>
                        <input type="text" class="form-input" id="loc_description" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Coordinates</label>
                        <input type="text" class="form-input" id="loc_coordinates" placeholder="25.363472:1.40" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Well No</label>
                        <input type="text" class="form-input" id="loc_wellNo">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Next Location</label>
                        <input type="text" class="form-input" id="loc_nextLocation">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Group</label>
                            <input type="text" class="form-input" id="loc_group">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Network</label>
                            <input type="text" class="form-input" id="loc_network">
                        </div>
                    </div>

                    <!-- Hidden but still captured extra fields -->
                    <input type="hidden" id="loc_mealPreparation">
                    <input type="hidden" id="loc_minimalInteraction">
                    <input type="hidden" id="loc_area">
                    <input type="hidden" id="loc_surveyLocation">
                    <input type="hidden" id="loc_job">
                    <input type="hidden" id="loc_weather">

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="Locations.closeCreateModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Location</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    container.innerHTML = content;
    Locations.init();
}

// Locations Module
const Locations = {
    async init() {
        await this.fetchLocations();
        const form = document.getElementById("createLocationForm");
        if (form) {
            form.addEventListener("submit", this.handleSubmit.bind(this));
        }
    },

    async fetchLocations() {
        try {
            const res = await fetch("/get_all_locations");
            const data = await res.json();
            AppState.data.locations = data;
            this.populateTable(data);
        } catch (err) {
            console.error("Failed to fetch locations:", err);
        }
    },

    populateTable(data = AppState.data.locations) {
        const tbody = document.getElementById("locationsTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(location => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${location.locationDescription || ""}</td>
                <td>${location.location || ""}</td>
                <td>${location.wellNo || "NB"}</td>
                <td>${location.nextLocation || "NB"}</td>
                <td>${location.group || ""}</td>
                <td>${location.drivingRoute || ""}</td>
                <td>${location.network || ""}</td>
            `;
            tbody.appendChild(row);
        });
    },

    search(term) {
        const filtered = AppState.data.locations.filter(location =>
            Object.values(location).some(value =>
                value && value.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
        this.populateTable(filtered);
    },

    openCreateModal() {
        document.getElementById("createLocationModal").style.display = "block";
    },

    closeCreateModal() {
        document.getElementById("createLocationModal").style.display = "none";
        document.getElementById("createLocationForm").reset();
    },

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            for (let row of rows) {
                const newLocation = {
                    locationDescription: row["Location Description"] || "",
                    location: row["Location"] || "",
                    wellNo: row["Well No"] || "NB",
                    nextLocation: row["Next Location"] || "NB",
                    group: row["Group"] || "",
                    drivingRoute: row["Driving Route"] || "",
                    network: row["Network"] || "",
                    // hidden extra fields
                    mealPreparation: row["Meal Preparation"] || "",
                    minimalInteraction: row["Minimal Interaction"] || "",
                    area: row["Area"] || "",
                    surveyLocation: row["Survey Location"] || "",
                    job: row["Job"] || "",
                    weather: row["Weather"] || ""
                };

                // Save each row to backend
                await fetch("/post_location", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newLocation)
                });

                AppState.data.locations.push(newLocation);
            }

            this.populateTable();
            showNotification("Excel data imported successfully!", "success");
        };
        reader.readAsArrayBuffer(file);
    },

    async handleSubmit(e) {
        e.preventDefault();

        const newLocation = {
            locationDescription: document.getElementById("loc_description").value,
            location: document.getElementById("loc_coordinates").value,
            wellNo: document.getElementById("loc_wellNo").value || "NB",
            nextLocation: document.getElementById("loc_nextLocation").value || "NB",
            group: document.getElementById("loc_group").value,
            drivingRoute: document.getElementById("loc_drivingRoute").value,
            network: document.getElementById("loc_network").value,
            // hidden fields
            mealPreparation: document.getElementById("loc_mealPreparation").value,
            minimalInteraction: document.getElementById("loc_minimalInteraction").value,
            area: document.getElementById("loc_area").value,
            surveyLocation: document.getElementById("loc_surveyLocation").value,
            job: document.getElementById("loc_job").value,
            weather: document.getElementById("loc_weather").value
        };

        try {
            await fetch("/post_location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLocation)
            });

            AppState.data.locations.unshift(newLocation);
            this.populateTable();
            this.closeCreateModal();
            updateDashboardCounts();
            showNotification("Location created successfully!", "success");
        } catch (err) {
            console.error("Error saving location:", err);
            showNotification("Failed to save location!", "error");
        }
    }
};
