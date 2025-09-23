// Logistics Page
function loadLogisticsPage(container) {
    if (!container) {
        container = document.getElementById("main-content");
    }
    if (!container) {
        console.error("No container found for Logistics page");
        return;
    }

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
                <tbody id="logisticsTableBody"></tbody>
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

    container.innerHTML = content;
    LogisticsModule.init();
}

// Logistics Module
const LogisticsModule = {
    dummyData: [
        {
            sho: "00001",
            vendorName: "Vendor A",
            deliverFrom: "Karachi",
            deliverTo: "Lahore",
            companyName: "FastTrans Logistics",
            status: "On Process",
        },
        {
            sho: "00002",
            vendorName: "Vendor B",
            deliverFrom: "Islamabad",
            deliverTo: "Multan",
            companyName: "QuickMove Pvt Ltd",
            status: "Completed",
        },
        {
            sho: "00003",
            vendorName: "Vendor C",
            deliverFrom: "Quetta",
            deliverTo: "Peshawar",
            companyName: "SafeLine Transport",
            status: "In Transit",
        }
    ],

    async init() {
        // ✅ show dummy first
        AppState.data.logistics = [...this.dummyData];
        this.populateTable(AppState.data.logistics);
        updateDashboardCounts();

        // then try backend fetch
        await this.fetchLogistics();

        const form = document.getElementById("createLogisticsForm");
        if (form) {
            form.addEventListener("submit", this.handleSubmit.bind(this));
        }
    },

    async fetchLogistics() {
        try {
            const res = await fetch("http://localhost:5000/get_all_logistics");
            if (!res.ok) throw new Error("Failed to fetch logistics");
            const data = await res.json();
            AppState.data.logistics = data;
            this.populateTable(data);
            updateDashboardCounts();
            console.log("✅ Logistics loaded from backend");
        } catch (err) {
            console.warn("⚠️ Using dummy logistics data (backend unavailable)");
            showNotification("Using dummy logistics data (backend not reachable)", "warning");
        }
    },

    populateTable(data = AppState.data.logistics) {
        const tbody = document.getElementById("logisticsTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach((item) => {
            const row = document.createElement("tr");
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
            "completed": "status-completed",
            "on process": "status-on-process",
            "in transit": "status-in-transit",
            "delayed": "status-delayed",
        };
        return statusMap[status?.toLowerCase()] || "status-on-process";
    },

    search(term) {
        const filtered = AppState.data.logistics.filter((item) =>
            Object.values(item).some(
                (value) =>
                    value &&
                    value.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
        this.populateTable(filtered);
    },

    openCreateModal() {
        document.getElementById("createLogisticsModal").style.display = "block";
        const nextSHO = String(AppState.data.logistics.length + 1).padStart(5, "0");
        document.getElementById("log_sho").value = nextSHO;
    },

    closeCreateModal() {
        document.getElementById("createLogisticsModal").style.display = "none";
        document.getElementById("createLogisticsForm").reset();
    },

    // Upload Excel
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
                    const newLogistics = {
                        sho: row.SHO || "",
                        vendorName: row["Vendor Name"] || "",
                        deliverFrom: row["Deliver From"] || "",
                        deliverTo: row["Deliver To"] || "",
                        companyName: row["Company Name"] || "",
                        status: row.Status || "On Process",
                    };
                    await this.saveLogisticsToServer(newLogistics);
                }

                await this.fetchLogistics();
                updateDashboardCounts();
                showNotification("Excel data imported successfully!", "success");
            } catch (err) {
                console.error("Excel import failed:", err);
                showNotification("Excel import failed", "error");
            }
        };
        reader.readAsArrayBuffer(file);
    },

    async saveLogisticsToServer(newLogistics) {
        try {
            const res = await fetch("http://localhost:5000/post_logistics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLogistics),
            });
            if (!res.ok) throw new Error("Failed to save logistics");
            return await res.json();
        } catch (err) {
            console.error("Error posting logistics:", err);
            showNotification("Failed to save logistics entry", "error");
        }
    },

    async handleSubmit(e) {
        e.preventDefault();

        const newLogistics = {
            sho: document.getElementById("log_sho").value,
            vendorName: document.getElementById("log_vendorName").value,
            deliverFrom: document.getElementById("log_deliverFrom").value,
            deliverTo: document.getElementById("log_deliverTo").value,
            companyName: document.getElementById("log_companyName").value,
            status: document.getElementById("log_status").value,
        };

        const saved = await this.saveLogisticsToServer(newLogistics);
        if (saved?.newLogistics) {
            AppState.data.logistics.unshift(saved.newLogistics);
        } else {
            // fallback: push locally
            AppState.data.logistics.unshift(newLogistics);
        }

        this.populateTable(AppState.data.logistics);
        this.closeCreateModal();
        updateDashboardCounts();
        showNotification("Logistics entry created successfully!", "success");
    },
};
