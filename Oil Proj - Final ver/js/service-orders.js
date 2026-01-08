// ==============================
// SERVICE ORDERS PAGE
// ==============================
function loadServiceOrdersPage(container) {
    if (!container) container = document.getElementById("main-content");
    if (!container) {
        console.error("No container found for Service Orders page");
        return;
    }
    const content = `
        <style>
            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px 20px;
                margin-top: 10px;
            }
            .form-grid label {
                font-weight: 500;
                color: #333;
                margin-top: 8px;
            }
            .form-grid input,
            .form-grid select,
            .form-grid textarea {
                width: 100%;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 14px;
            }
            .form-grid textarea {
                resize: vertical;
            }
            .form-actions {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            .btn-primary, .btn-secondary, .btn-danger {
                padding: 8px 14px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            }
            .btn-primary { background-color: #4a6cf7; color: #fff; }
            .btn-secondary { background-color: #ddd; color: #333; }
            .btn-danger { background-color: #d9534f; color: white; }
            .btn-primary:hover { background-color: #3558e6; }
            .btn-danger:hover { background-color: #c9302c; }
            .controls {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
                align-items: center;
            }
            .search-box {
                margin-left: auto;
                padding: 6px 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
            }
            .table-container {
                margin-top: 10px;
                overflow-x: auto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background: #f5f5f5;
            }
            .item-row {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr auto;
                gap: 10px;
                margin-bottom: 8px;
                align-items: center;
            }
            .modal-content.large {
                max-width: 850px;
                width: 95%;
            }
            .modal h3 {
                margin-top: 0;
                font-size: 18px;
                color: #333;
            }
            .modal-header h2 {
                margin: 0;
            }
            .details-section {
                margin-bottom: 20px;
            }
            .detail-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 10px;
            }
            .modal-subtable {
                width: 100%;
                margin-top: 10px;
                border-collapse: collapse;
            }
            .modal-subtable th,
            .modal-subtable td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            .modal-subtable th {
                background-color: #f5f5f5;
            }
        </style>
        <div class="controls">
            <button class="upload-btn" onclick="document.getElementById('serviceOrdersFileInput').click()">
                📄 Upload Excel (Details + Orders)
            </button>
            <input type="file" id="serviceOrdersFileInput" accept=".xlsx,.xls,.csv" multiple
                   style="display:none" onchange="ServiceOrders.handleFileUpload(event)">
            
            <button class="create-btn btn-primary" onclick="ServiceOrders.openCreateModal()">
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
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Create New Service Order</h2>
                    <button class="close" onclick="ServiceOrders.closeCreateModal()">×</button>
                </div>
                
                <form id="createServiceOrderForm">
                    <!-- STEP 1 -->
                    <div id="step1">
                        <h3>Step 1: Order Details</h3>
                        <div class="form-grid">
                            <label>Service Order ID</label>
                            <input type="text" id="so_id" required>
                            
                            <label>Rig Code</label>
                            <input type="text" id="so_rigCode" required>
                            
                            <label>Well Name</label>
                            <input type="text" id="so_wellName" required>
                            
                            <label>Rig Short Name</label>
                            <input type="text" id="so_rigShortName" placeholder="Auto-filled from Rig Code">
                            
                            <label>Required Date</label>
                            <input type="date" id="so_requiredDate" required>
                            
                            <label>Required Time</label>
                            <input type="time" id="so_requiredTime" required value="09:00">
                            
                            <label>Priority</label>
                            <select id="so_priority" required>
                                <option>Low</option>
                                <option selected>Normal</option>
                                <option>High</option>
                            </select>
                            
                            <label>Requestor</label>
                            <input type="text" id="so_requestor" placeholder="Requestor name" value="Current User">
                            
                            <label>Vendor Code</label>
                            <input type="text" id="so_vendor" placeholder="Vendor code">
                            
                            <label>Vendor Name</label>
                            <input type="text" id="so_vendorName" placeholder="Vendor full name" required>
                            
                            <label>Comments</label>
                            <textarea id="so_comments" placeholder="Optional comments"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="ServiceOrders.closeCreateModal()">Cancel</button>
                            <button type="button" class="btn-primary" id="nextStepBtn">Next ➜</button>
                        </div>
                    </div>
                    
                    <!-- STEP 2 -->
                    <div id="step2" style="display:none;">
                        <h3>Step 2: Service Items</h3>
                        <div id="itemsContainer"></div>
                        <button type="button" id="addItemBtn" class="btn-secondary">+ Add Item</button>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="prevStepBtn">← Back</button>
                            <button type="submit" class="btn-primary">Submit Order</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    container.innerHTML = `<h2>Service Orders</h2>` + content;
    ServiceOrders.init();
}

// ==============================
// SERVICE ORDERS MODULE
// ==============================
const ServiceOrders = {
    async init() {
        await this.fetchServiceOrders();
        this.setupFormNavigation();
        this.setupAddItemButton();
        this.setupRigCodeAutoFill();
        const form = document.getElementById("createServiceOrderForm");
        if (form) form.addEventListener("submit", this.handleSubmit.bind(this));
    },

    // 📦 Fetch combined data (details + orders)
    async fetchServiceOrders() {
        try {
            const [detailsRes, ordersRes] = await Promise.all([
                fetch("http://localhost:8000/get_all_service_order_details"),
                fetch("http://localhost:8000/get_all_service_orders")
            ]);
            
            if (!detailsRes.ok || !ordersRes.ok) throw new Error("Failed to fetch");
            
            const details = await detailsRes.json();
            const orders = await ordersRes.json();
            
            // Merge details and orders
            AppState.data.serviceOrders = (details.data || []).map(d => ({
                ...d,
                items: (orders.data || []).filter(o => o.service_order_id === d.service_order_id)
            }));
            
            this.populateTable(AppState.data.serviceOrders);
        } catch (err) {
            console.error("Error fetching service orders:", err);
            AppState.data.serviceOrders = [];
            this.populateTable([]);
        }
    },

    // 🧾 Populate table
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
                    <button class="btn-secondary" onclick="ServiceOrders.viewServiceOrder('${order.service_order_id}')">👁 View</button>
                    <button class="btn-danger" onclick="ServiceOrders.deleteServiceOrder('${order.service_order_id}')">🗑 Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    // 👁 View service order modal
    viewServiceOrder(serviceOrderId) {
        const order = AppState.data.serviceOrders.find(o => o.service_order_id === serviceOrderId);
        if (!order) return;

        const headerDetails = `
            <div class="details-section">
                <h3>📋 Order Details</h3>
                <div class="detail-grid">
                    <div><strong>Service Order ID:</strong> ${order.service_order_id}</div>
                    <div><strong>Vendor Name:</strong> ${order.vendor_name}</div>
                    <div><strong>Rig Code:</strong> ${order.rig_code}</div>
                    <div><strong>Well Name:</strong> ${order.well_name}</div>
                    <div><strong>Required Date:</strong> ${order.required_date}</div>
                    <div><strong>Priority:</strong> ${order.priority}</div>
                    <div><strong>Requestor:</strong> ${order.requestor || "-"}</div>
                    <div><strong>Submission Date:</strong> ${order.submission_date || "-"}</div>
                    <div><strong>Year:</strong> ${order.year || "-"}</div>
                    <div><strong>Comments:</strong> ${order.comments || "-"}</div>
                </div>
            </div>
        `;

        const itemsTable = order.items?.length
            ? `
            <div class="details-section">
                <h3>📦 Ordered Items</h3>
                <table class="modal-subtable">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>UOM</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items
                            .map(
                                item => `
                            <tr>
                                <td>${item.service_description}</td>
                                <td>${item.service_category}</td>
                                <td>${item.quantity}</td>
                                <td>${item.uom}</td>
                            </tr>`
                            )
                            .join("")}
                    </tbody>
                </table>
            </div>`
            : `<p>No service items found for this order.</p>`;

        const modalBody = document.getElementById("viewServiceOrderDetails");
        if (modalBody) modalBody.innerHTML = headerDetails + itemsTable;

        const deleteBtn = document.getElementById("deleteServiceOrderBtn");
        deleteBtn.onclick = () => this.deleteServiceOrder(serviceOrderId);

        document.getElementById("viewServiceOrderModal").style.display = "block";
    },

    closeViewModal() {
        document.getElementById("viewServiceOrderModal").style.display = "none";
        document.getElementById("viewServiceOrderDetails").innerHTML = "";
    },

    // 🗑 Delete service order
    async deleteServiceOrder(serviceOrderId) {
        if (!confirm("Are you sure you want to delete this service order?")) return;
        
        try {
            const res = await fetch(`http://localhost:8000/delete_service_order?service_order_id=${encodeURIComponent(serviceOrderId)}`, {
                method: "DELETE",
            });
            
            if (!res.ok) throw new Error("Failed to delete service order");
            
            const data = await res.json();
            showNotification(data.message || "Service order deleted successfully!", "success");
            this.closeViewModal();
            await this.fetchServiceOrders();
        } catch (err) {
            console.error("Error deleting service order:", err);
            showNotification("Failed to delete service order", "error");
        }
    },

    // 📂 Upload 2 Excel files (details first, then orders)
    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length !== 2) {
            alert("Please select exactly 2 files: (1) Service Order Details, (2) Service Orders");
            return;
        }

        try {
            const detailsFile = [...files].find(f => f.name.toLowerCase().includes("detail"));
            const ordersFile = [...files].find(f => !f.name.toLowerCase().includes("detail"));

            if (!detailsFile || !ordersFile) {
                alert("Please ensure filenames contain 'detail' for details file.");
                return;
            }

            // Upload details first
            const detailsForm = new FormData();
            detailsForm.append("file", detailsFile);
            const detailsRes = await fetch("http://localhost:8000/post_all_service_order_details", {
                method: "POST",
                body: detailsForm
            });

            if (!detailsRes.ok) throw new Error("Failed to upload Service Order Details");

            // Upload orders second
            const ordersForm = new FormData();
            ordersForm.append("file", ordersFile);
            const ordersRes = await fetch("http://localhost:8000/post_all_service_orders", {
                method: "POST",
                body: ordersForm
            });

            if (!ordersRes.ok) throw new Error("Failed to upload Service Orders");

            showNotification("Both Service Order files uploaded successfully!", "success");
            await this.fetchServiceOrders();
        } catch (err) {
            console.error("Error uploading Service Order files:", err);
            showNotification("Failed to upload Service Order files", "error");
        }
    },

    // 📝 Open create modal
    openCreateModal() {
        const modal = document.getElementById("createServiceOrderModal");
        if (modal) {
            modal.style.display = "block";
            modal.classList.add("active");
            document.getElementById("step1").style.display = "block";
            document.getElementById("step2").style.display = "none";
            const form = document.getElementById("createServiceOrderForm");
            if (form) form.reset();
            document.getElementById("itemsContainer").innerHTML = "";
            // Set default time
            document.getElementById("so_requiredTime").value = "09:00";
            document.getElementById("so_requestor").value = "Current User";
        }
    },

    closeCreateModal() {
        const modal = document.getElementById("createServiceOrderModal");
        if (modal) {
            modal.style.display = "none";
            modal.classList.remove("active");
        }
    },

    // 🔄 Form navigation setup
    setupFormNavigation() {
        document.getElementById("nextStepBtn").onclick = (e) => {
            e.preventDefault();
            document.getElementById("step1").style.display = "none";
            document.getElementById("step2").style.display = "block";
        };
        document.getElementById("prevStepBtn").onclick = (e) => {
            e.preventDefault();
            document.getElementById("step2").style.display = "none";
            document.getElementById("step1").style.display = "block";
        };
    },

    // ➕ Setup add item button
    setupAddItemButton() {
        document.getElementById("addItemBtn").onclick = () => {
            const div = document.createElement("div");
            div.className = "item-row";
            div.innerHTML = `
                <input type="text" placeholder="Description" class="item-description" required>
                <select class="item-category">
                    <option>Employee</option>
                    <option>Logistics</option>
                    <option>Inventory</option>
                </select>
                <input type="number" placeholder="Qty" class="item-quantity" min="1" required>
                <select class="item-uom">
                    <option>EA</option>
                    <option>BOX</option>
                    <option>PAL</option>
                    <option>CTN</option>
                </select>
                <button type="button" class="btn-danger removeItemBtn">✖</button>
            `;
            div.querySelector(".removeItemBtn").onclick = () => div.remove();
            document.getElementById("itemsContainer").appendChild(div);
        };
    },

    // 🔧 Auto-fill rig short name from rig code
    setupRigCodeAutoFill() {
        const rigCodeInput = document.getElementById("so_rigCode");
        const rigShortNameInput = document.getElementById("so_rigShortName");
        if (rigCodeInput && rigShortNameInput) {
            rigCodeInput.addEventListener("input", (e) => {
                const value = e.target.value;
                rigShortNameInput.value = value.substring(0, 3).toUpperCase();
            });
        }
    },

    // 📤 Submit form
    async handleSubmit(e) {
        e.preventDefault();
        
        const items = [...document.querySelectorAll(".item-row")].map(row => ({
            service_description: row.querySelector(".item-description").value,
            service_category: row.querySelector(".item-category").value,
            quantity: parseInt(row.querySelector(".item-quantity").value),
            uom: row.querySelector(".item-uom").value
        }));

        const payload = {
            service_order_id: document.getElementById("so_id").value,
            rig_code: document.getElementById("so_rigCode").value,
            well_name: document.getElementById("so_wellName").value,
            rig_short_name: document.getElementById("so_rigShortName").value || document.getElementById("so_rigCode").value.substring(0, 3),
            required_date: document.getElementById("so_requiredDate").value,
            required_time: document.getElementById("so_requiredTime").value,
            priority: document.getElementById("so_priority").value,
            requestor: document.getElementById("so_requestor").value,
            submission_date: new Date().toISOString().split("T")[0],
            submission_time: new Date().toLocaleTimeString(),
            year: new Date().getFullYear(),
            vendor: document.getElementById("so_vendor").value,
            vendor_name: document.getElementById("so_vendorName").value,
            comments: document.getElementById("so_comments").value,
            items: items  // Changed from 'details' to 'items' to match API
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

    // 🔍 Search functionality
    search(term) {
        const filtered = AppState.data.serviceOrders.filter(order =>
            Object.values(order).some(v =>
                v && v.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
        this.populateTable(filtered);
    }
};

// ✅ Expose globally
window.loadServiceOrdersPage = loadServiceOrdersPage;
window.ServiceOrders = ServiceOrders;