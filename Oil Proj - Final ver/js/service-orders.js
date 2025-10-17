// Service Orders Page
function loadServiceOrdersPage(container) {
    if (!container) container = document.getElementById("main-content");
    if (!container) {
        console.error("No container found for Service Orders page");
        return;
    }

    const content = `
        <div class="controls">
            <button class="upload-btn" onclick="document.getElementById('serviceOrdersFileInput').click()">
                📄 Upload Excel (Details + Orders)
            </button>
            <input type="file" id="serviceOrdersFileInput" accept=".xlsx,.xls,.csv" multiple
                   style="display:none" onchange="ServiceOrders.handleFileUpload(event)">
            
            <button class="create-btn" onclick="ServiceOrders.openCreateModal()">
                ➕ Create via Form
            </button>
            
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="serviceOrdersTableBody"></tbody>
            </table>
        </div>

        <!-- View Modal -->
        <div id="viewServiceOrderModal" class="modal">
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Service Order Details</h2>
                    <button class="close" onclick="ServiceOrders.closeViewModal()">×</button>
                </div>
                <div id="viewServiceOrderDetails" class="modal-body"></div>
                <div class="modal-footer">
                    <button class="btn-danger" id="deleteServiceOrderBtn">🗑 Delete</button>
                    <button class="btn-secondary" onclick="ServiceOrders.closeViewModal()">Close</button>
                </div>
            </div>
        </div>

        <!-- Create Form Modal -->
        <div id="createServiceOrderModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create New Service Order</h2>
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
        if (form) form.addEventListener("submit", this.handleSubmit.bind(this));
    },

    async fetchServiceOrders() {
        try {
            const [detailsRes, ordersRes] = await Promise.all([
                fetch("http://localhost:8000/get_all_service_order_details"),
                fetch("http://localhost:8000/get_all_service_orders")
            ]);

            if (!detailsRes.ok || !ordersRes.ok) throw new Error("Failed to fetch");
            const details = await detailsRes.json();
            const orders = await ordersRes.json();

            // Merge details and orders by service_order_id
            AppState.data.serviceOrders = details.data.map(d => ({
                ...d,
                items: orders.data.filter(o => o.service_order_id === d.service_order_id)
            }));

            this.populateTable(AppState.data.serviceOrders);
        } catch (err) {
            console.error("Error fetching service orders:", err);
            AppState.data.serviceOrders = [];
            this.populateTable([]);
        }
    },

    populateTable(data = AppState.data.serviceOrders) {
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
                <td>
                    <button class="btn-view" onclick="ServiceOrders.viewServiceOrder('${order.service_order_id}')">👁 View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    // View Details
    viewServiceOrder(serviceOrderId) {
        const order = AppState.data.serviceOrders.find(o => o.service_order_id === serviceOrderId);
        if (!order) return;

        const detailsHTML = `
            <h3>Order Information</h3>
            ${Object.entries(order)
                .filter(([k]) => k !== "items")
                .map(([key, value]) => `
                    <div class="detail-row">
                        <strong>${key.replace(/_/g, " ")}:</strong> ${value ?? ""}
                    </div>
                `).join("")}

            <h3>Items</h3>
            ${(order.items || [])
                .map(item => `
                    <div class="detail-row sub-item">
                        ${Object.entries(item)
                            .map(([k, v]) => `<strong>${k.replace(/_/g, " ")}:</strong> ${v}<br>`)
                            .join("")}
                    </div>
                `).join("")}
        `;

        const modalBody = document.getElementById("viewServiceOrderDetails");
        modalBody.innerHTML = detailsHTML;

        const deleteBtn = document.getElementById("deleteServiceOrderBtn");
        deleteBtn.onclick = () => this.deleteServiceOrder(serviceOrderId);

        document.getElementById("viewServiceOrderModal").style.display = "block";
    },

    closeViewModal() {
        document.getElementById("viewServiceOrderModal").style.display = "none";
        document.getElementById("viewServiceOrderDetails").innerHTML = "";
    },

    async deleteServiceOrder(serviceOrderId) {
        if (!confirm("Are you sure you want to delete this service order?")) return;
        try {
            const res = await fetch(`http://localhost:8000/delete_service_order/${serviceOrderId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete");
            showNotification("Service order deleted successfully!", "success");
            this.closeViewModal();
            await this.fetchServiceOrders();
        } catch (err) {
            console.error("Error deleting service order:", err);
            showNotification("Failed to delete service order", "error");
        }
    },

    // Excel Upload (No XLSX parsing — just send files)
    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length !== 2) {
            alert("Please select exactly 2 files (Service Order Details + Service Orders)");
            return;
        }

        const formData = new FormData();
        for (let f of files) formData.append("files", f);

        try {
            const res = await fetch("http://localhost:8000/post_all_service_orders", {
                method: "POST",
                body: formData
            });
            if (!res.ok) throw new Error("Upload failed");
            showNotification("Service orders uploaded successfully!", "success");
            await this.fetchServiceOrders();
        } catch (err) {
            console.error("Error uploading files:", err);
            showNotification("Failed to upload files", "error");
        }
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

        try {
            const res = await fetch("http://localhost:8000/post_one_service_order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to create order");
            showNotification("Service order created successfully!", "success");
            this.closeCreateModal();
            await this.fetchServiceOrders();
        } catch (err) {
            console.error("Error creating order:", err);
            showNotification("Failed to create order", "error");
        }
    },

    openCreateModal() {
        document.getElementById("createServiceOrderModal").style.display = "block";
    },

    closeCreateModal() {
        document.getElementById("createServiceOrderModal").style.display = "none";
        document.getElementById("createServiceOrderForm").reset();
    }
};

// ✅ Expose globally
window.loadServiceOrdersPage = loadServiceOrdersPage;
window.ServiceOrders = ServiceOrders;
