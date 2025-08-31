// Locations Page
function loadLocationsPage() {
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
                            <select class="form-select" id="loc_group" required>
                                <option value="">Select Group</option>
                                <option value="A">Group A</option>
                                <option value="B">Group B</option>
                                <option value="C">Group C</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Network Status</label>
                            <select class="form-select" id="loc_network" required>
                                <option value="">Select Status</option>
                                <option value="Good">Good</option>
                                <option value="Bad">Bad</option>
                                <option value="No Signal">No Signal</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Driving Route</label>
                        <input type="text" class="form-input" id="loc_drivingRoute" placeholder="2.30hr m233km">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="Locations.closeCreateModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Location</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('dynamic-content').innerHTML = content;
    loadPageStyles('locations');
    Locations.init();
}

// Locations Module
const Locations = {
    init() {
        this.populateTable();
        const form = document.getElementById('createLocationForm');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    },

    populateTable(data = AppState.data.locations) {
        const tbody = document.getElementById('locationsTableBody');
        tbody.innerHTML = '';

        data.forEach(location => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${location.locationDescription}</td>
                <td><div class="coordinates">${location.location}</div></td>
                <td>${location.wellNo || 'NB'}</td>
                <td>${location.nextLocation || 'NB'}</td>
                <td><span class="group-badge group-${location.group.toLowerCase()}">${location.group}</span></td>
                <td><div class="driving-route">${location.drivingRoute}</div></td>
                <td><span class="network-status network-${location.network.toLowerCase()}">${location.network}</span></td>
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
        document.getElementById('createLocationModal').style.display = 'block';
    },

    closeCreateModal() {
        document.getElementById('createLocationModal').style.display = 'none';
        document.getElementById('createLocationForm').reset();
    },

    // Upload Excel handler
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            rows.forEach(row => {
                const newLocation = {
                    id: Date.now() + Math.random(),
                    locationDescription: row["Location Description"] || "",
                    location: row["Location"] || "",
                    wellNo: row["Well No"] || "NB",
                    nextLocation: row["Next Location"] || "NB",
                    group: row["Group"] || "A",
                    drivingRoute: row["Driving Route"] || "",
                    network: row["Network"] || "Good"
                };
                AppState.data.locations.push(newLocation);
            });

            this.populateTable();
            updateDashboardCounts();
            showNotification("Excel data imported successfully!", "success");
        };
        reader.readAsArrayBuffer(file);
    },

    handleSubmit(e) {
        e.preventDefault();
        
        const newLocation = {
            id: Date.now(),
            locationDescription: document.getElementById('loc_description').value,
            location: document.getElementById('loc_coordinates').value,
            wellNo: document.getElementById('loc_wellNo').value || 'NB',
            nextLocation: document.getElementById('loc_nextLocation').value || 'NB',
            group: document.getElementById('loc_group').value,
            drivingRoute: document.getElementById('loc_drivingRoute').value,
            network: document.getElementById('loc_network').value
        };

        AppState.data.locations.unshift(newLocation);
        this.populateTable();
        this.closeCreateModal();
        updateDashboardCounts();
        showNotification('Location created successfully!', 'success');
    }
};
