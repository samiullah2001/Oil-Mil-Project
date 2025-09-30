// Equipment Page (⚡️ mapped to Vehicles backend)
function loadEquipmentPage(container) {
    if (!container) {
        container = document.getElementById("main-content");
    }
    if (!container) {
        console.error("No container found for Equipment page");
        return;
    }

    const content = `
        <div class="controls">
            <button class="create-btn" onclick="EquipmentPage.openCreateModal()">
                ➕ Add Vehicle
            </button>
            <button class="upload-btn" onclick="document.getElementById('equipmentFileInput').click()">
                📄 Upload Excel
            </button>
            <input type="file" id="equipmentFileInput" accept=".xlsx,.xls,.csv" 
                   style="display:none" onchange="EquipmentPage.handleFileUpload(event)">
            <input type="text" class="search-box" placeholder="Search vehicles..." 
                   onkeyup="EquipmentPage.search(this.value)">
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>VEHICLE ID</th>
                        <th>NAME</th>
                        <th>LICENSE PLATE</th>
                        <th>DRIVER</th>
                        <th>STATUS</th>
                        <th>LOCATION</th>
                        <th>FUEL EFFICIENCY</th>
                        <th>UTILIZATION RATE</th>
                    </tr>
                </thead>
                <tbody id="equipmentTableBody"></tbody>
            </table>
        </div>

        <!-- Create Vehicle Modal -->
        <div id="createEquipmentModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Add Vehicle</h2>
                    <button class="close" onclick="EquipmentPage.closeCreateModal()">×</button>
                </div>
                <form id="createEquipmentForm">
                    <div class="form-group">
                        <label class="form-label">Vehicle ID</label>
                        <input type="text" class="form-input" id="veh_id" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Vehicle Name</label>
                        <input type="text" class="form-input" id="veh_name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">License Plate</label>
                        <input type="text" class="form-input" id="veh_plate" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Driver Name</label>
                        <input type="text" class="form-input" id="veh_driver" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="veh_status" required>
                            <option value="Active">Active</option>
                            <option value="In Maintenance">In Maintenance</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-input" id="veh_location" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fuel Efficiency (%)</label>
                        <input type="number" class="form-input" id="veh_fuel" min="0" max="100" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Utilization Rate (%)</label>
                        <input type="number" class="form-input" id="veh_util" min="0" max="100" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="EquipmentPage.closeCreateModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Vehicle</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    container.innerHTML = content;
    EquipmentPage.init();
}

// Equipment (Vehicles) Module
const EquipmentPage = {
    async init() {
        // Dummy fallback data
        AppState.data.equipment = [
            {
                vehicle_id: "V001",
                vehicle_name: "Truck A",
                license_plate: "ABC1234",
                driver_name: "John Doe",
                status: "Active",
                location: "Karachi",
                fuel_efficiency: 85,
                utilization_rate: 70
            },
            {
                vehicle_id: "V002",
                vehicle_name: "Van B",
                license_plate: "XYZ5678",
                driver_name: "Ali Khan",
                status: "In Maintenance",
                location: "Lahore",
                fuel_efficiency: 65,
                utilization_rate: 40
            }
        ];
        this.populateTable(AppState.data.equipment);

        // Fetch backend data
        await this.fetchEquipment();

        const form = document.getElementById("createEquipmentForm");
        if (form) {
            form.addEventListener("submit", this.handleSubmit.bind(this));
        }
    },

    async fetchEquipment() {
        try {
            const res = await fetch("http://localhost:5000/get_all_vehicles");
            if (!res.ok) throw new Error("Failed to fetch vehicles");
            const data = await res.json();
            AppState.data.equipment = data;
            this.populateTable(data);
        } catch (err) {
            console.error("Failed to fetch vehicles:", err);
            showNotification("Could not load vehicles", "error");
        }
    },

    async saveEquipmentToServer(vehicle) {
        try {
            const res = await fetch("http://localhost:5000/post_vehicle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(vehicle),
            });
            if (!res.ok) throw new Error("Failed to save vehicle");
            return await res.json();
        } catch (err) {
            console.error("Error posting vehicle:", err);
            showNotification("Failed to save vehicle", "error");
        }
    },

    populateTable(data = AppState.data.equipment) {
        const tbody = document.getElementById("equipmentTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(vehicle => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${vehicle.vehicle_id}</td>
                <td>${vehicle.vehicle_name}</td>
                <td>${vehicle.license_plate}</td>
                <td>${vehicle.driver_name}</td>
                <td>${vehicle.status}</td>
                <td>${vehicle.location}</td>
                <td>${vehicle.fuel_efficiency || 0}%</td>
                <td>${vehicle.utilization_rate || 0}%</td>
            `;
            tbody.appendChild(row);
        });
    },

    search(term) {
        const filtered = AppState.data.equipment.filter(vehicle =>
            Object.values(vehicle).some(value =>
                value && value.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
        this.populateTable(filtered);
    },

    openCreateModal() {
        document.getElementById("createEquipmentModal").style.display = "block";
    },

    closeCreateModal() {
        document.getElementById("createEquipmentModal").style.display = "none";
        document.getElementById("createEquipmentForm").reset();
    },

    async handleSubmit(e) {
        e.preventDefault();

        const newVehicle = {
            vehicle_id: document.getElementById("veh_id").value,
            vehicle_name: document.getElementById("veh_name").value,
            license_plate: document.getElementById("veh_plate").value,
            driver_name: document.getElementById("veh_driver").value,
            status: document.getElementById("veh_status").value,
            location: document.getElementById("veh_location").value,
            fuel_efficiency: parseInt(document.getElementById("veh_fuel").value, 10),
            utilization_rate: parseInt(document.getElementById("veh_util").value, 10),
        };

        const saved = await this.saveEquipmentToServer(newVehicle);
        if (saved) {
            AppState.data.equipment.unshift(newVehicle);
            this.populateTable(AppState.data.equipment);
            this.closeCreateModal();
            updateDashboardCounts();
            showNotification("Vehicle added successfully!", "success");
        }
    },

    // ✅ Bulk Import Vehicles from Excel/CSV
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);

                for (const row of rows) {
                    const newVehicle = {
                        vehicle_id: row["Vehicle ID"] || "",
                        vehicle_name: row["Vehicle Name"] || "",
                        license_plate: row["License Plate"] || "",
                        driver_name: row["Driver Name"] || "",
                        status: row["Status"] || "Active",
                        location: row["Location"] || "",
                        fuel_efficiency: row["Fuel Efficiency"] || 0,
                        utilization_rate: row["Utilization Rate"] || 0,
                    };
                    await this.saveEquipmentToServer(newVehicle);
                }

                await this.fetchEquipment();
                showNotification("Excel data imported successfully!", "success");
            } catch (err) {
                console.error("Error importing vehicles:", err);
                showNotification("Failed to import vehicles", "error");
            }
        };
        reader.readAsArrayBuffer(file);
    }
};

// Add at the bottom of equipment-page.js
window.EquipmentPage = {
    ...EquipmentPage,
    loadEquipmentPage
};