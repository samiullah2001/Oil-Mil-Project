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
                        <th>SHO</th>
                        <th>VENDOR NAME</th>
                        <th>RIG</th>
                        <th>DATE</th>
                        <th>PRIORITY</th>
                        <th>STATUS</th>
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
                        <label class="form-label">Rig Code</label>
                        <input type="text" class="form-input" id="so_rigCode" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Well Name</label>
                        <input type="text" class="form-input" id="so_wellName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Vendor</label>
                        <input type="text" class="form-input" id="so_vendor" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Vendor Name</label>
                        <input type="text" class="form-input" id="so_vendorName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Priority</label>
                        <select id="so_priority" class="form-select" required>
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Required Date</label>
                        <input type="date" class="form-input" id="so_requiredDate" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Comments</label>
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
    dummyData: [
        {
            sho: "SO1001",
            vendor_name: "ABC Drilling",
            rig_code: "RIG-01",
            required_date: "2025-09-01",
            priority: "High",
            status: "Pending",
        },
        {
            sho: "SO1002",
            vendor_name: "XYZ Oilfield Services",
            rig_code: "RIG-02",
            required_date: "2025-09-05",
            priority: "Normal",
            status: "In Progress",
        },
        {
            sho: "SO1003",
            vendor_name: "PetroTech Ltd.",
            rig_code: "RIG-03",
            required_date: "2025-09-10",
            priority: "Low",
            status: "Completed",
        },
    ],

    async init() {
        // ✅ show dummy data first
        AppState.data.serviceOrders = [...this.dummyData];
        this.populateTable(AppState.data.serviceOrders);
        updateDashboardCounts();

        // then try backend
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

            // Merge details + orders by SHO
            AppState.data.serviceOrders = details.map(d => ({
                ...d,
                items: orders.filter(o => o.sho === d.sho)
            }));

            this.populateTable(AppState.data.serviceOrders);
            updateDashboardCounts();
            console.log("✅ Service orders loaded from backend");
        } catch (err) {
            console.warn("⚠️ Using dummy service orders (backend unavailable)");
            showNotification("Using dummy service orders (backend not reachable)", "warning");
        }
    },

    async postServiceOrderDetails(details) {
        try {
            await fetch("http://localhost:5000/post_all_service_order_details", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(details),
            });
        } catch (err) {
            console.error("Failed to post details:", err);
        }
    },

    async postServiceOrders(orders) {
        try {
            await fetch("http://localhost:5000/post_all_service_orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orders),
            });
        } catch (err) {
            console.error("Failed to post orders:", err);
        }
    },

    async postOneServiceOrder(payload) {
        try {
            const res = await fetch("http://localhost:5000/post_one_service_order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            return await res.json();
        } catch (err) {
            console.error("Failed to create order:", err);
            return null;
        }
    },

    populateTable(data) {
        const tbody = document.getElementById("serviceOrdersTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.sho || ""}</td>
                <td>${order.vendor_name || ""}</td>
                <td>${order.rig_code || ""}</td>
                <td>${order.required_date || ""}</td>
                <td>${order.priority || ""}</td>
                <td><span class="status-badge">${order.status || "Pending"}</span></td>
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

    // ✅ Upload Excel (two sheets)
    handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length < 2) {
            alert("Please upload both Service Order Details and Service Orders sheets");
            return;
        }

        const promises = Array.from(files).map(file =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: "array" });
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const rows = XLSX.utils.sheet_to_json(sheet);
                        resolve({ name: file.name, rows });
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.readAsArrayBuffer(file);
            })
        );

        Promise.all(promises).then(async (results) => {
            const detailsFile = results.find(f => f.name.toLowerCase().includes("detail"));
            const ordersFile = results.find(f => f.name.toLowerCase().includes("order"));

            if (!detailsFile || !ordersFile) {
                alert("Both Details and Orders files must be uploaded");
                return;
            }

            await this.postServiceOrderDetails(detailsFile.rows);
            await this.postServiceOrders(ordersFile.rows);
            await this.fetchServiceOrders();
            showNotification("Service Orders imported successfully!", "success");
        }).catch(err => {
            console.error("Error processing Excel files:", err);
            showNotification("Failed to import service orders", "error");
        });
    },

    // ✅ Create one order manually
    async handleSubmit(e) {
        e.preventDefault();

        const payload = {
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
            vendor: document.getElementById("so_vendor").value,
            vendor_name: document.getElementById("so_vendorName").value,
            comments: document.getElementById("so_comments").value,
            status: "Pending",
            details: []
        };

        const saved = await this.postOneServiceOrder(payload);
        if (saved?.newOrder) {
            AppState.data.serviceOrders.unshift(saved.newOrder);
        } else {
            // fallback to local dummy push
            AppState.data.serviceOrders.unshift(payload);
        }

        this.populateTable(AppState.data.serviceOrders);
        this.closeCreateModal();
        updateDashboardCounts();
        showNotification("Service order created successfully!", "success");
    }
};
