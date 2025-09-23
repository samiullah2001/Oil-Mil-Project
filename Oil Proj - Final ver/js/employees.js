// Employees Page
function loadEmployeesPage(container) {
    if (!container) {
        container = document.getElementById("main-content");
    }
    if (!container) {
        console.error("No container found for Employees page");
        return;
    }

    const content = `
        <div class="controls">
            <button class="create-btn" onclick="Employees.openCreateModal()">
                ➕ Create New
            </button>
            <button class="upload-btn" onclick="document.getElementById('employeesFileInput').click()">
                📄 Upload Excel
            </button>
            <input type="file" id="employeesFileInput" accept=".xlsx,.xls,.csv" 
                   style="display:none" onchange="Employees.handleFileUpload(event)">
            <input type="text" class="search-box" placeholder="Search employees..." 
                   onkeyup="Employees.search(this.value)">
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>EMPLOYEE ID</th>
                        <th>NAME</th>
                        <th>POSITION</th>
                        <th>DEPARTMENT</th>
                        <th>EMAIL</th>
                        <th>PHONE</th>
                    </tr>
                </thead>
                <tbody id="employeesTableBody"></tbody>
            </table>
        </div>

        <!-- Create Employee Modal -->
        <div id="createEmployeeModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Create New Employee</h2>
                    <button class="close" onclick="Employees.closeCreateModal()">×</button>
                </div>
                <form id="createEmployeeForm">
                    <div class="form-group">
                        <label class="form-label">Employee ID</label>
                        <input type="text" class="form-input" id="emp_id" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" id="emp_name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Position</label>
                        <input type="text" class="form-input" id="emp_position" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Department</label>
                        <input type="text" class="form-input" id="emp_department">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" id="emp_email">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="text" class="form-input" id="emp_phone">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="Employees.closeCreateModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Employee</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    container.innerHTML = content;
    Employees.init();
}

// Employees Module
const Employees = {
    dummyData: [
        {
            employeeId: "E001",
            name: "Ali Khan",
            position: "Field Engineer",
            department: "Operations",
            email: "ali.khan@example.com",
            phone: "03001234567",
        },
        {
            employeeId: "E002",
            name: "Sara Ahmed",
            position: "Logistics Manager",
            department: "Logistics",
            email: "sara.ahmed@example.com",
            phone: "03007654321",
        },
        {
            employeeId: "E003",
            name: "John Doe",
            position: "Technician",
            department: "Maintenance",
            email: "john.doe@example.com",
            phone: "03009876543",
        }
    ],

    async init() {
        // ✅ show dummy first
        AppState.data.employees = [...this.dummyData];
        this.populateTable(AppState.data.employees);
        updateDashboardCounts();

        // then try backend fetch
        await this.fetchEmployees();

        const form = document.getElementById("createEmployeeForm");
        if (form) {
            form.addEventListener("submit", this.handleSubmit.bind(this));
        }
    },

    async fetchEmployees() {
        try {
            const res = await fetch("http://localhost:5000/get_all_employees");
            if (!res.ok) throw new Error("Failed to fetch employees");
            const data = await res.json();
            AppState.data.employees = data;
            this.populateTable(data);
            updateDashboardCounts();
            console.log("✅ Employees loaded from backend");
        } catch (err) {
            console.warn("⚠️ Using dummy employees data (backend unavailable)");
            showNotification("Using dummy employees data (backend not reachable)", "warning");
        }
    },

    async postEmployee(employee) {
        try {
            const res = await fetch("http://localhost:5000/post_all_employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(employee),
            });
            if (!res.ok) throw new Error("Failed to post employee");
            const saved = await res.json();
            return saved;
        } catch (err) {
            console.error("Error posting employee:", err);
            showNotification("Failed to save employee to server, added locally", "warning");
        }
    },

    populateTable(data = AppState.data.employees) {
        const tbody = document.getElementById("employeesTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(emp => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${emp.employeeId}</td>
                <td>${emp.name}</td>
                <td>${emp.position}</td>
                <td>${emp.department || ""}</td>
                <td>${emp.email || ""}</td>
                <td>${emp.phone || ""}</td>
            `;
            tbody.appendChild(row);
        });
    },

    search(term) {
        const filtered = AppState.data.employees.filter(emp =>
            Object.values(emp).some(value =>
                value && value.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
        this.populateTable(filtered);
    },

    openCreateModal() {
        document.getElementById("createEmployeeModal").style.display = "block";
        const nextId = "E" + String(AppState.data.employees.length + 1).padStart(3, "0");
        document.getElementById("emp_id").value = nextId;
    },

    closeCreateModal() {
        document.getElementById("createEmployeeModal").style.display = "none";
        document.getElementById("createEmployeeForm").reset();
    },

    // Upload Excel/CSV
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
                    const newEmployee = {
                        employeeId: row["Employee ID"] || "",
                        name: row["Name"] || "",
                        position: row["Position"] || "",
                        department: row["Department"] || "",
                        email: row["Email"] || "",
                        phone: row["Phone"] || "",
                    };
                    await this.postEmployee(newEmployee);
                }

                await this.fetchEmployees();
                showNotification("Excel data imported successfully!", "success");
            } catch (err) {
                console.error("Error importing employees:", err);
                showNotification("Failed to import employees", "error");
            }
        };
        reader.readAsArrayBuffer(file);
    },

    async handleSubmit(e) {
        e.preventDefault();

        const newEmployee = {
            employeeId: document.getElementById("emp_id").value,
            name: document.getElementById("emp_name").value,
            position: document.getElementById("emp_position").value,
            department: document.getElementById("emp_department").value,
            email: document.getElementById("emp_email").value,
            phone: document.getElementById("emp_phone").value,
        };

        const saved = await this.postEmployee(newEmployee);
        if (saved?.newEmployee) {
            AppState.data.employees.unshift(saved.newEmployee);
        } else {
            AppState.data.employees.unshift(newEmployee); // fallback local
        }

        this.populateTable(AppState.data.employees);
        this.closeCreateModal();
        updateDashboardCounts();
        showNotification("Employee created successfully!", "success");
    }
};
