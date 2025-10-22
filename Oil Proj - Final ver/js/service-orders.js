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
                            <input type="text" id="so_rigShortName">

                            <label>Required Date</label>
                            <input type="date" id="so_requiredDate" required>

                            <label>Required Time</label>
                            <input type="time" id="so_requiredTime" required value="09:00">

                            <label>Priority</label>
                            <select id="so_priority" required>
                                <option>Low</option>
                                <option>Normal</option>
                                <option>High</option>
                            </select>

                            <label>Requestor</label>
                            <input type="text" id="so_requestor" placeholder="Requestor name">

                            <label>Vendor Code</label>
                            <input type="text" id="so_vendor" placeholder="Vendor code">

                            <label>Vendor Name</label>
                            <input type="text" id="so_vendorName" placeholder="Vendor full name">

                            <label>Comments</label>
                            <textarea id="so_comments" placeholder="Optional"></textarea>
                        </div>

                        <div class="form-actions">
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
                    <button class="btn-secondary" onclick="ServiceOrders.viewServiceOrder('${order.service_order_id}')">👁 View</button>
                    <button class="btn-danger" onclick="ServiceOrders.deleteServiceOrder('${order.service_order_id}')">🗑 Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

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
        }
    },

    closeCreateModal() {
        const modal = document.getElementById("createServiceOrderModal");
        if (modal) {
            modal.style.display = "none";
            modal.classList.remove("active");
        }
    },

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
            rig_short_name: document.getElementById("so_rigShortName").value,
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
            details: items
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
    }
};

window.loadServiceOrdersPage = loadServiceOrdersPage;
window.ServiceOrders = ServiceOrders;
