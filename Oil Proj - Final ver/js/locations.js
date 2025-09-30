// Locations Page
function loadLocationsPage(container) {
    if (!container) container = document.getElementById("main-content");
    if (!container) {
        console.error("No container found for Locations page");
        return;
    }

    const content = `
        <div class="controls">
            <button class="create-btn" onclick="Locations.openCreateModal()">➕ Create New</button>
            <button class="upload-btn" onclick="document.getElementById('locationsFileInput').click()">📄 Upload Excel</button>
            <input type="file" id="locationsFileInput" accept=".xlsx,.xls,.csv" style="display:none" onchange="Locations.handleFileUpload(event)">
            <input type="text" class="search-box" placeholder="Search locations..." onkeyup="Locations.search(this.value)">
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Coordinates</th>
                        <th>Well No</th>
                        <th>Next Location</th>
                        <th>Group</th>
                        <th>Driving Route</th>
                        <th>Network</th>
                    </tr>
                </thead>
                <tbody id="locationsTableBody"></tbody>
            </table>
        </div>

        <!-- Create Location Modal -->
        <div id="createLocationModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create New Location</h2>
                    <button class="close" onclick="Locations.closeCreateModal()">×</button>
                </div>
                <form id="createLocationForm">
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" class="form-input" id="loc_description" required>
                    </div>
                    <div class="form-group">
                        <label>Coordinates</label>
                        <input type="text" class="form-input" id="loc_coordinates" required>
                    </div>
                    <div class="form-group">
                        <label>Well Number</label>
                        <input type="text" class="form-input" id="loc_well_number">
                    </div>
                    <div class="form-group">
                        <label>Next Location</label>
                        <input type="text" class="form-input" id="loc_next_location">
                    </div>
                    <div class="form-group">
                        <label>Group</label>
                        <input type="text" class="form-input" id="loc_group_type">
                    </div>
                    <div class="form-group">
                        <label>Driving Route</label>
                        <input type="text" class="form-input" id="loc_driving_route">
                    </div>
                    <div class="form-group">
                        <label>Network</label>
                        <input type="text" class="form-input" id="loc_network">
                    </div>

                    <!-- Optional fields -->
                    <input type="hidden" id="loc_meal_preparation">
                    <input type="hidden" id="loc_minimal_interaction">
                    <input type="hidden" id="loc_area">
                    <input type="hidden" id="loc_survey_location">
                    <input type="hidden" id="loc_job">
                    <input type="hidden" id="loc_weather">

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="Locations.closeCreateModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create</button>
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
        if (form) form.addEventListener("submit", this.handleSubmit.bind(this));
    },

    async fetchLocations() {
        try {
            const res = await fetch("http://localhost:5000/get_all_locations");
            if (!res.ok) throw new Error("Failed to fetch locations");
            const data = await res.json();
            AppState.data.locations = data;
            this.populateTable(data);
        } catch (err) {
            console.error("Failed to fetch locations:", err);
            AppState.data.locations = [];
            this.populateTable([]);
        }
    },

    populateTable(data = AppState.data.locations) {
        const tbody = document.getElementById("locationsTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(loc => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${loc.location_id}</td>
                <td>${loc.location_description}</td>
                <td>${loc.coordinates}</td>
                <td>${loc.well_number || ""}</td>
                <td>${loc.next_location || ""}</td>
                <td>${loc.group_type || ""}</td>
                <td>${loc.driving_route || ""}</td>
                <td>${loc.network || ""}</td>
            `;
            tbody.appendChild(row);
        });
    },

    search(term) {
        const filtered = AppState.data.locations.filter(loc =>
            Object.values(loc).some(val =>
                val && val.toString().toLowerCase().includes(term.toLowerCase())
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

    async handleSubmit(e) {
        e.preventDefault();
        const newLoc = {
            location_description: document.getElementById("loc_description").value,
            coordinates: document.getElementById("loc_coordinates").value,
            well_number: document.getElementById("loc_well_number").value,
            next_location: document.getElementById("loc_next_location").value,
            group_type: document.getElementById("loc_group_type").value,
            driving_route: document.getElementById("loc_driving_route").value,
            network: document.getElementById("loc_network").value,
            meal_preparation: document.getElementById("loc_meal_preparation").value,
            minimal_interaction: document.getElementById("loc_minimal_interaction").value,
            area: document.getElementById("loc_area").value,
            survey_location: document.getElementById("loc_survey_location").value,
            job: document.getElementById("loc_job").value,
            weather: document.getElementById("loc_weather").value
        };

        try {
            await fetch("http://localhost:5000/post_location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLoc)
            });

            AppState.data.locations.unshift(newLoc);
            this.populateTable(AppState.data.locations);
            this.closeCreateModal();
            showNotification("Location created successfully!", "success");
        } catch (err) {
            console.error("Error saving location:", err);
            showNotification("Failed to save location!", "error");
        }
    }
};
