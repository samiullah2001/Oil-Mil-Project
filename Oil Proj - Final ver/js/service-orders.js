// Service Orders Page
function loadServiceOrdersPage() {
    const content = `
        <div class="controls">
            <button class="create-btn" onclick="ServiceOrders.openCreateModal()">
                ➕ Create New
            </button>
            <button class="upload-btn" onclick="document.getElementById('serviceOrdersFileInput').click()">
                📄 Upload Excel/CSV
            </button>
            <input type="file" id="serviceOrdersFileInput" accept=".xlsx,.xls,.csv" style="display:none" onchange="ServiceOrders.handleFileUpload(event)">
            <input type="text" class="search-box" placeholder="Search orders..." onkeyup="ServiceOrders.search(this.value)">
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>SHO</th>
                        <th>VENDOR NAME</th>
                        <th>ADDRESS</th>
                        <th>DATE</th>
                        <th>TYPE</th>
                        <th>STATUS</th>
                    </tr>
                </thead>
                <tbody id="serviceOrdersTableBody">
                </tbody>
            </table>
        </div>

        <!-- Create Order Modal -->
        <div id="createServiceOrderModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Create New Service Order</h2>
                    <button class="close" onclick="ServiceOrders.closeCreateModal()">×</button>
                </div>
                <form id="createServiceOrderForm">
                    <div class="form-group">
                        <label class="form-label">SHO</label>
                        <input type="text" class="form-input" id="so_sho" readonly required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Vendor Name</label>
                        <input type="text" class="form-input" id="so_vendorName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Address</label>
                        <textarea class="form-input" id="so_address" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" class="form-input" id="so_orderDate" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select class="form-select" id="so_orderType" required>
                            <option value="">Select Type</option>
                            <option value="Oil & Gas">Oil & Gas</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Transport">Transport</option>
                            <option value="Warehouse">Warehouse</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="so_orderStatus" required>
                            <option value="">Select Status</option>
                            <option value="On Process">On Process</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="ServiceOrders.closeCreateModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Order</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('dynamic-content').innerHTML = content;
    loadPageStyles('service-orders');
    ServiceOrders.init();
}

// Service Orders Module
const ServiceOrders = {
    init() {
        this.populateTable();
        document.getElementById('createServiceOrderForm').addEventListener('submit', this.handleSubmit.bind(this));
    },

    populateTable(data = AppState.data.serviceOrders) {
        const tbody = document.getElementById('serviceOrdersTableBody');
        tbody.innerHTML = '';

        data.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.sho}</td>
                <td>${order.vendorName}</td>
                <td>${order.address}</td>
                <td>${order.date}</td>
                <td>${order.type}</td>
                <td><span class="status-badge ${this.getStatusClass(order.status)}">${order.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    },

    getStatusClass(status) {
        return status.toLowerCase() === 'completed' ? 'status-completed' : 'status-on-process';
    },

    search(term) {
        const filtered = AppState.data.serviceOrders.filter(order =>
            Object.values(order).some(value =>
                value && value.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
        this.populateTable(filtered);
    },

    openCreateModal() {
        document.getElementById('createServiceOrderModal').style.display = 'block';
        const nextSHO = String(AppState.data.serviceOrders.length + 1).padStart(5, '0');
        document.getElementById('so_sho').value = nextSHO;
    },

    closeCreateModal() {
        document.getElementById('createServiceOrderModal').style.display = 'none';
        document.getElementById('createServiceOrderForm').reset();
    },

    // NEW: handle file upload (Excel/CSV)
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        if (file.name.endsWith(".csv")) {
            reader.onload = (e) => {
                const text = e.target.result;
                const rows = text.split("\n").map(r => r.split(","));
                rows.slice(1).forEach(row => {
                    if (row.length > 1) {
                        AppState.data.serviceOrders.push({
                            id: Date.now(),
                            sho: row[0],
                            vendorName: row[1],
                            address: row[2],
                            date: row[3],
                            type: row[4],
                            status: row[5]
                        });
                    }
                });
                this.populateTable();
                showNotification("CSV imported successfully!", "success");
            };
            reader.readAsText(file);
        } else {
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                rows.slice(1).forEach(row => {
                    if (row.length > 1) {
                        AppState.data.serviceOrders.push({
                            id: Date.now(),
                            sho: row[0],
                            vendorName: row[1],
                            address: row[2],
                            date: row[3],
                            type: row[4],
                            status: row[5]
                        });
                    }
                });
                this.populateTable();
                showNotification("Excel imported successfully!", "success");
            };
            reader.readAsArrayBuffer(file);
        }
    },

    handleSubmit(e) {
        e.preventDefault();
        
        const newOrder = {
            id: Date.now(),
            sho: document.getElementById('so_sho').value,
            vendorName: document.getElementById('so_vendorName').value,
            address: document.getElementById('so_address').value,
            date: new Date(document.getElementById('so_orderDate').value).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            type: document.getElementById('so_orderType').value,
            status: document.getElementById('so_orderStatus').value
        };

        AppState.data.serviceOrders.unshift(newOrder);
        this.populateTable();
        this.closeCreateModal();
        updateDashboardCounts();
        showNotification('Service order created successfully!', 'success');
    }
};
