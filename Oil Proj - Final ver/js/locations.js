// Locations Page
function loadLocationsPage(container) {
    if (!container) container = document.getElementById("main-content");
    if (!container) {
        console.error("No container found for Locations page");
        return;
    }

    const content = `
        <div class="controls">
            <button class="upload-btn" onclick="document.getElementById('locationsFileInput').click()">
                📄 Upload Excel
            </button>
            <input type="file" id="locationsFileInput" accept=".xlsx,.xls,.csv"
                   style="display:none" onchange="Locations.handleFileUpload(event)">
            <input type="text" class="search-box" placeholder="Search locations..."
                   onkeyup="Locations.search(this.value)">
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Coordinates</th>
                        <th>Well Number</th>
                        <th>Next Location</th>
                        <th>Group</th>
                        <th>Driving Route</th>
                        <th>Network</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="locationsTableBody"></tbody>
            </table>
        </div>

        <!-- View Location Modal -->
        <div id="viewLocationModal" class="modal">
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Location Details</h2>
                    <button class="close" onclick="Locations.closeViewModal()">×</button>
                </div>
                <div id="viewLocationDetails" class="modal-body"></div>
                <div class="modal-footer">
                    <button class="btn-danger" id="deleteLocationBtn">🗑 Delete</button>
                    <button class="btn-secondary" onclick="Locations.closeViewModal()">Close</button>
                </div>
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
    },

    // 🧭 Fetch all locations from backend
    async fetchLocations() {
        try {
            const res = await fetch("http://localhost:8000/get_all_locations");
            if (!res.ok) throw new Error("Failed to fetch locations");
            const result = await res.json();

            AppState.data.locations = result.data || [];
            this.populateTable(AppState.data.locations);
        } catch (err) {
            console.error("Failed to fetch locations:", err);
            AppState.data.locations = [];
            this.populateTable([]);
        }
    },

    // 📋 Populate frontend table
    populateTable(data = AppState.data.locations) {
        const tbody = document.getElementById("locationsTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(loc => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${loc.location_id || ""}</td>
                <td>${loc.location_description || ""}</td>
                <td>${loc.coordinates || ""}</td>
                <td>${loc.well_number || ""}</td>
                <td>${loc.next_location || ""}</td>
                <td>${loc.group_type || ""}</td>
                <td>${loc.driving_route || ""}</td>
                <td>${loc.network || ""}</td>
                <td>
                    <button class="btn-view" onclick="Locations.viewLocation(${loc.location_id})">👁 View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    // 🔍 Search
    search(term) {
        const filtered = AppState.data.locations.filter(loc =>
            Object.values(loc).some(value =>
                value && value.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
        this.populateTable(filtered);
    },

    // 📂 Upload Excel directly to backend
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/post_all_locations", {
                method: "POST",
                body: formData
            });

            const result = await res.json();
            console.log("Upload result:", result);

            showNotification(result.message || "Locations uploaded successfully!", "success");
            await this.fetchLocations(); // Refresh table
        } catch (error) {
            console.error("Error uploading locations:", error);
            showNotification("Failed to upload locations file", "error");
        }
    },

    // 👁 View full details
    viewLocation(locationId) {
        const loc = AppState.data.locations.find(l => l.location_id == locationId);
        if (!loc) return;

        const details = Object.entries(loc)
            .map(([key, value]) => `
                <div class="detail-row">
                    <strong>${key.replace(/_/g, " ")}:</strong> ${value ?? ""}
                </div>
            `)
            .join("");

        const modalBody = document.getElementById("viewLocationDetails");
        if (modalBody) modalBody.innerHTML = details;

        const deleteBtn = document.getElementById("deleteLocationBtn");
        deleteBtn.onclick = () => this.deleteLocation(locationId);

        document.getElementById("viewLocationModal").style.display = "block";
    },

    closeViewModal() {
        document.getElementById("viewLocationModal").style.display = "none";
        document.getElementById("viewLocationDetails").innerHTML = "";
    },

    // 🗑 Delete record
    async deleteLocation(locationId) {
        if (!confirm("Are you sure you want to delete this location?")) return;

        try {
            const res = await fetch(`http://localhost:8000/delete_location/${locationId}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Failed to delete location");

            showNotification("Location deleted successfully!", "success");
            this.closeViewModal();
            await this.fetchLocations();
        } catch (err) {
            console.error("Error deleting location:", err);
            showNotification("Failed to delete location", "error");
        }
    }
};

// ✅ Expose globally
window.loadLocationsPage = loadLocationsPage;
window.Locations = Locations;
