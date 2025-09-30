// Service Orders Page
function loadServiceOrdersPage(container) {
    if (!container) container = document.getElementById("main-content");
    if (!container) {
        console.error("No container found for Service Orders page");
        return;
    }

    const content = `
        <div class="controls">
            <button class="create-btn" onclick="ServiceOrders.openCreateModal()">
                ➕ Create New
            </button>
            <button class="upload-btn" onclick="document.getElementById('serviceOrdersFileInput').click()">
                📄 Upload Excel (Details + Orders)
            </button>
            <input type="file" id="serviceOrdersFileInput" accept=".xlsx,.xls" multiple
                   style="display:none" onchange="ServiceOrders.handleFileUpload(event)">
            <input type="text" class="search-box" placeholder="Search orders..." 
                   onkeyup="ServiceOrders.search(this.value)">
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Service Order ID</th>
                        <th>Vendor Name</th>
                        <th>Rig Code</th>
                        <th>Well Name</th>
                        <th>Required Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Items Count</th>
                    </tr>
                </thead>
                <tbody id="serviceOrdersTableBody"></tbody>
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
                        <label>Service Order ID</label>
                        <input type="text" class="form-input" id="so_id" required>
                    </div>
                    <div class="form-group">
                        <label>Rig Code</label>
                        <input type="text" class="form-input" id="so_rigCode" required>
                    </div>
                    <div class="form-group">
                        <label>Well Name</label>
                        <input type="text" class="form-input" id="so_wellName" required>
                    </div>
                    <div class="form-group">
                        <label>Vendor Name</label>
                        <input type="text" class="form-input" id="so_vendorName" required>
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select id="so_priority" class="form-select" required>
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Required Date</label>
                        <input type="date" class="form-input" id="so_requiredDate" required>
                    </div>
                    <div class="form-group">
                        <label>Comments</label>
                        <textarea class="form-input" id="so_comments"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="ServiceOrders.closeCreateModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Order</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    container.innerHTML = `<h2>Service Orders</h2>` + content;
    ServiceOrders.init();
}

// Service Orders Module
const ServiceOrders = {
    async init() {
        await this.fetchServiceOrders();
        const form = document.getElementById("createServiceOrderForm");
        if (form) {
            form.addEventListener("submit", this.handleSubmit.bind(this));
        }
    },

    async fetchServiceOrders() {
        try {
            const [detailsRes, ordersRes] = await Promise.all([
                fetch("http://localhost:5000/get_all_service_order_details"),
                fetch("http://localhost:5000/get_all_service_orders"),
            ]);
            if (!detailsRes.ok || !ordersRes.ok) throw new Error("Failed to fetch");
            const details = await detailsRes.json();
            const orders = await ordersRes.json();

            // Merge service_order_details with items from service_orders
            AppState.data.serviceOrders = details.map(d => ({
                ...d,
                items: orders.filter(o => o.service_order_id === d.service_order_id)
            }));

            this.populateTable(AppState.data.serviceOrders);
        } catch (err) {
            console.error("Error fetching service orders:", err);
            AppState.data.serviceOrders = [];
            this.populateTable([]);
        }
    },

    async postOneServiceOrder(payload) {
        return await fetch("http://localhost:5000/post_one_service_order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    },

    populateTable(data) {
        const tbody = document.getElementById("serviceOrdersTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.service_order_id}</td>
                <td>${order.vendor_name}</td>
                <td>${order.rig_code}</td>
                <td>${order.well_name}</td>
                <td>${order.required_date}</td>
                <td>${order.priority}</td>
                <td><span class="status-badge">${order.status || "Pending"}</span></td>
                <td>${order.items?.length || 0}</td>
            `;
            tbody.appendChild(row);
        });
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
        document.getElementById("createServiceOrderModal").style.display = "block";
    },

    closeCreateModal() {
        document.getElementById("createServiceOrderModal").style.display = "none";
        document.getElementById("createServiceOrderForm").reset();
    },

    async handleSubmit(e) {
        e.preventDefault();

        const payload = {
            service_order_id: document.getElementById("so_id").value,
            rig_code: document.getElementById("so_rigCode").value,
            well_name: document.getElementById("so_wellName").value,
            rig_short_name: document.getElementById("so_rigCode").value.substring(0, 3),
            required_date: document.getElementById("so_requiredDate").value,
            required_time: "09:00",
            priority: document.getElementById("so_priority").value,
            requestor: "Current User",
            submission_date: new Date().toISOString().split("T")[0],
            submission_time: new Date().toLocaleTimeString(),
            year: new Date().getFullYear(),
            vendor: "DefaultVendor",
            vendor_name: document.getElementById("so_vendorName").value,
            comments: document.getElementById("so_comments").value,
            items: [
                {
                    service_description: "Sample service",
                    service_category: "Logistics",
                    quantity: 10,
                    uom: "EA"
                }
            ]
        };

        await this.postOneServiceOrder(payload);
        await this.fetchServiceOrders();
        this.closeCreateModal();
        showNotification("Service order created successfully!", "success");
    }
};
