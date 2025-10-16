// Logistics Page (mapped to Vehicles backend)
function loadLogisticsPage(container) {
    if (!container) container = document.getElementById("main-content");
    if (!container) {
        console.error("No container found for Logistics page");
        return;
    }

    const content = `
        <div class="controls">
            <button class="upload-btn" onclick="document.getElementById('logisticsFileInput').click()">
                📄 Upload Excel
            </button>
            <input type="file" id="logisticsFileInput" accept=".xlsx,.xls,.csv"
                   style="display:none" onchange="LogisticsModule.handleFileUpload(event)">
            <input type="text" class="search-box" placeholder="Search vehicles..."
                   onkeyup="LogisticsModule.search(this.value)">
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Vehicle ID</th>
                        <th>Driver Name</th>
                        <th>License Plate</th>
                        <th>Status</th>
                        <th>Location</th>
                        <th>Booking</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="logisticsTableBody"></tbody>
            </table>
        </div>

        <!-- View Vehicle Modal -->
        <div id="viewVehicleModal" class="modal">
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Vehicle Details</h2>
                    <button class="close" onclick="LogisticsModule.closeViewModal()">×</button>
                </div>
                <div id="viewVehicleDetails" class="modal-body"></div>
                <div class="modal-footer">
                    <button class="btn-danger" id="deleteVehicleBtn">🗑 Delete</button>
                    <button class="btn-secondary" onclick="LogisticsModule.closeViewModal()">Close</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = content;
    LogisticsModule.init();
}

// Logistics Module
const LogisticsModule = {
    async init() {
        await this.fetchVehicles();
    },

    // 🔄 Fetch vehicles from backend
    async fetchVehicles() {
        try {
            const res = await fetch("http://localhost:8000/get_all_vehicles");
            if (!res.ok) throw new Error("Failed to fetch vehicles");
            const result = await res.json();

            AppState.data.vehicles = result.data || [];
            this.populateTable(AppState.data.vehicles);
        } catch (err) {
            console.error("Failed to fetch vehicles:", err);
            AppState.data.vehicles = [];
            this.populateTable([]);
        }
    },

    // 🧾 Populate vehicle table
    populateTable(data = AppState.data.vehicles) {
        const tbody = document.getElementById("logisticsTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(vehicle => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${vehicle.vehicle_id || ""}</td>
                <td>${vehicle.driver_name || ""}</td>
                <td>${vehicle.license_plate || ""}</td>
                <td>${vehicle.status || ""}</td>
                <td>${vehicle.location || ""}</td>
                <td>${vehicle.booking_status || ""}</td>
                <td>
                    <button class="btn-view" onclick="LogisticsModule.viewVehicle('${vehicle.vehicle_id}')">👁 View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    // 🔍 Search vehicles
    search(term) {
        const filtered = AppState.data.vehicles.filter(v =>
            Object.values(v).some(value =>
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
            const res = await fetch("http://localhost:8000/post_all_vehicles", {
                method: "POST",
                body: formData
            });

            const result = await res.json();
            console.log("Upload result:", result);

            showNotification(result.message || "Vehicles uploaded successfully!", "success");
            await this.fetchVehicles(); // Refresh data
        } catch (error) {
            console.error("Error uploading vehicles:", error);
            showNotification("Failed to upload vehicles file", "error");
        }
    },

    // 👁 View vehicle details
    viewVehicle(vehicleId) {
        const vehicle = AppState.data.vehicles.find(v => v.vehicle_id == vehicleId);
        if (!vehicle) return;

        const details = Object.entries(vehicle)
            .map(([key, value]) => `
                <div class="detail-row">
                    <strong>${key.replace(/_/g, " ")}:</strong> ${value ?? ""}
                </div>
            `)
            .join("");

        const modalBody = document.getElementById("viewVehicleDetails");
        if (modalBody) modalBody.innerHTML = details;

        const deleteBtn = document.getElementById("deleteVehicleBtn");
        deleteBtn.onclick = () => this.deleteVehicle(vehicleId);

        document.getElementById("viewVehicleModal").style.display = "block";
    },

    closeViewModal() {
        document.getElementById("viewVehicleModal").style.display = "none";
        document.getElementById("viewVehicleDetails").innerHTML = "";
    },

    // 🗑 Delete vehicle
    async deleteVehicle(vehicleId) {
        if (!confirm("Are you sure you want to delete this vehicle?")) return;

        try {
            const res = await fetch(`http://localhost:8000/delete_vehicle/${vehicleId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete vehicle");

            showNotification("Vehicle deleted successfully!", "success");
            this.closeViewModal();
            await this.fetchVehicles();
        } catch (err) {
            console.error("Error deleting vehicle:", err);
            showNotification("Failed to delete vehicle", "error");
        }
    }
};

// ✅ Expose globally
window.loadLogisticsPage = loadLogisticsPage;
window.LogisticsModule = LogisticsModule;
