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

        <!-- Create Vehicle Modal -->
        <div id="createLogisticsModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create New Vehicle</h2>
                    <button class="close" onclick="LogisticsModule.closeCreateModal()">×</button>
                </div>
                <form id="createLogisticsForm">
                    <div class="form-group">
                        <label>Vehicle ID</label>
                        <input type="text" class="form-input" id="log_vehicleId" required>
                    </div>
                    <div class="form-group">
                        <label>Driver Name</label>
                        <input type="text" class="form-input" id="log_driverName" required>
                    </div>
                    <div class="form-group">
                        <label>License Plate</label>
                        <input type="text" class="form-input" id="log_licensePlate" required>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select class="form-select" id="log_status" required>
                            <option value="">Select</option>
                            <option value="Active">Active</option>
                            <option value="In Maintenance">In Maintenance</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" class="form-input" id="log_location" required>
                    </div>
                    <div class="form-group">
                        <label>Booking Status</label>
                        <select class="form-select" id="log_booking" required>
                            <option value="Available">Available</option>
                            <option value="Booked">Booked</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="LogisticsModule.closeCreateModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create</button>
                    </div>
                </form>
            </div>
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
        const form = document.getElementById("createLogisticsForm");
        if (form) form.addEventListener("submit", this.handleSubmit.bind(this));
    },

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

    search(term) {
        const filtered = AppState.data.vehicles.filter(v =>
            Object.values(v).some(value =>
                value && value.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
        this.populateTable(filtered);
    },

    openCreateModal() {
        document.getElementById("createLogisticsModal").style.display = "block";
    },

    closeCreateModal() {
        document.getElementById("createLogisticsModal").style.display = "none";
        document.getElementById("createLogisticsForm").reset();
    },

    async postVehicle(vehicle) {
        try {
            const res = await fetch("http://localhost:8000/post_vehicle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(vehicle)
            });
            return await res.json();
        } catch (err) {
            console.error("Error posting vehicle:", err);
        }
    },

    async handleSubmit(e) {
        e.preventDefault();

        const newVehicle = {
            vehicle_id: document.getElementById("log_vehicleId").value,
            driver_name: document.getElementById("log_driverName").value,
            license_plate: document.getElementById("log_licensePlate").value,
            status: document.getElementById("log_status").value,
            location: document.getElementById("log_location").value,
            booking_status: document.getElementById("log_booking").value,
            current_mileage: 0,
            fuel_efficiency: 90,
            utilization_rate: 80
        };

        await this.postVehicle(newVehicle);
        await this.fetchVehicles();
        this.closeCreateModal();
        showNotification("Vehicle created successfully!", "success");
    },

    // 👁 View full vehicle details
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
