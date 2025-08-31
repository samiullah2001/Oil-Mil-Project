// Logistics Page
function loadLogisticsPage() {
    const content = `
        <div class="controls">
            <button class="create-btn" onclick="LogisticsModule.openCreateModal()">
                ➕ Create New
            </button>
            <button class="upload-btn" onclick="document.getElementById('logisticsFileInput').click()">
                📄 Upload Excel
            </button>
            <input type="file" id="logisticsFileInput" accept=".xlsx,.xls,.csv" style="display:none" onchange="LogisticsModule.handleFileUpload(event)">
            <input type="text" class="search-box" placeholder="Search logistics..." onkeyup="LogisticsModule.search(this.value)">
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>SHO</th>
                        <th>VENDOR NAME</th>
                        <th>DELIVER FROM</th>
                        <th>DELIVER TO</th>
                        <th>COMPANY NAME</th>
                        <th>STATUS</th>
                    </tr>
                </thead>
                <tbody id="logisticsTableBody">
                </tbody>
            </table>
        </div>

        <!-- Create Logistics Modal -->
        <div id="createLogisticsModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Create New Logistics Entry</h2>
                    <button class="close" onclick="LogisticsModule.closeCreateModal()">×</button>
                </div>
                <form id="createLogisticsForm">
                    <div class="form-group">
                        <label class="form-label">SHO</label>
                        <input type="text" class="form-input" id="log_sho" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Vendor Name</label>
                        <input type="text" class="form-input" id="log_vendorName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Deliver From</label>
                        <input type="text" class="form-input" id="log_deliverFrom" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Deliver To</label>
                        <input type="text" class="form-input" id="log_deliverTo" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Company Name</label>
                        <input type="text" class="form-input" id="log_companyName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="log_status" required>
                            <option value="">Select Status</option>
                            <option value="On Process">On Process</option>
                            <option value="Completed">Completed</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delayed">Delayed</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="LogisticsModule.closeCreateModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Entry</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('dynamic-content').innerHTML = content;
    loadPageStyles('logistics');
    LogisticsModule.init();
}

// Logistics Module
const LogisticsModule = {
    init() {
        this.populateTable();
        const form = document.getElementById('createLogisticsForm');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    },

    populateTable(data = AppState.data.logistics) {
        const tbody = document.getElementById('logisticsTableBody');
        tbody.innerHTML = '';

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.sho}</td>
                <td>${item.vendorName}</td>
                <td>${item.deliverFrom}</td>
                <td>${item.deliverTo}</td>
                <td>${item.companyName}</td>
                <td><span class="status-badge ${this.getStatusClass(item.status)}">${item.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    },

    getStatusClass(status) {
        const statusMap = {
            'completed': 'status-completed',
            'on process': 'status-on-process',
            'in transit': 'status-in-transit',
            'delayed': 'status-delayed'
        };
        return statusMap[status.toLowerCase()] || 'status-on-process';
    },

    search(term) {
        const filtered = AppState.data.logistics.filter(item =>
            Object.values(item).some(value =>
                value && value.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
        this.populateTable(filtered);
    },

    openCreateModal() {
        document.getElementById('createLogisticsModal').style.display = 'block';
        const nextSHO = String(AppState.data.logistics.length + 1).padStart(5, '0');
        document.getElementById('log_sho').value = nextSHO;
    },

    closeCreateModal() {
        document.getElementById('createLogisticsModal').style.display = 'none';
        document.getElementById('createLogisticsForm').reset();
    },

    // Upload Excel
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
                const newLogistics = {
                    id: Date.now() + Math.random(),
                    sho: row.SHO || "",
                    vendorName: row["Vendor Name"] || "",
                    deliverFrom: row["Deliver From"] || "",
                    deliverTo: row["Deliver To"] || "",
                    companyName: row["Company Name"] || "",
                    status: row.Status || "On Process"
                };
                AppState.data.logistics.push(newLogistics);
            });

            this.populateTable();
            updateDashboardCounts();
            showNotification("Excel data imported successfully!", "success");
        };
        reader.readAsArrayBuffer(file);
    },

    handleSubmit(e) {
        e.preventDefault();
        
        const newLogistics = {
            id: Date.now(),
            sho: document.getElementById('log_sho').value,
            vendorName: document.getElementById('log_vendorName').value,
            deliverFrom: document.getElementById('log_deliverFrom').value,
            deliverTo: document.getElementById('log_deliverTo').value,
            companyName: document.getElementById('log_companyName').value,
            status: document.getElementById('log_status').value
        };

        AppState.data.logistics.unshift(newLogistics);
        this.populateTable();
        this.closeCreateModal();
        updateDashboardCounts();
        showNotification('Logistics entry created successfully!', 'success');
    }
};
