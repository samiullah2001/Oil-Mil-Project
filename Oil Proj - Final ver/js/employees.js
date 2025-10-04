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
                        <th>DEPARTMENT</th>
                        <th>JOB ROLE</th>
                        <th>STATUS</th>
                        <th>OVERALL SCORE</th>
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
                        <label class="form-label">Department</label>
                        <input type="text" class="form-input" id="emp_department" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Job Role</label>
                        <input type="text" class="form-input" id="emp_jobRole" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select id="emp_status" class="form-select" required>
                            <option value="">Select Status</option>
                            <option value="On Rig">On Rig</option>
                            <option value="Standby">Standby</option>
                            <option value="Rotational Leave">Rotational Leave</option>
                        </select>
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
    async init() {
        await this.fetchEmployees();
        const form = document.getElementById("createEmployeeForm");
        if (form) {
            form.addEventListener("submit", this.handleSubmit.bind(this));
        }
    },

    // ✅ Fetch employees from backend
    async fetchEmployees() {
        try {
            const res = await fetch("http://localhost:8000/get_all_employees");
            if (!res.ok) throw new Error("Failed to fetch employees");
            const result = await res.json();

            AppState.data.employees = result.data || [];
            this.populateTable(AppState.data.employees);
        } catch (err) {
            console.error("Failed to fetch employees:", err);
            AppState.data.employees = [];
            this.populateTable([]);
        }
    },

    // ✅ Populate table using backend field names
    populateTable(data = AppState.data.employees) {
        const tbody = document.getElementById("employeesTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        data.forEach(emp => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${emp.employee_id || ""}</td>
                <td>${emp.employee_name || ""}</td>
                <td>${emp.department || ""}</td>
                <td>${emp.job_role || ""}</td>
                <td>${emp.employee_status || ""}</td>
                <td>${emp.overall_score ?? "-"}</td>
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
    },

    closeCreateModal() {
        document.getElementById("createEmployeeModal").style.display = "none";
        document.getElementById("createEmployeeForm").reset();
    },

    // ✅ Post employee to backend
    async postEmployee(employee) {
        try {
            const res = await fetch("http://localhost:8000/post_employee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(employee)
            });
            return await res.json();
        } catch (err) {
            console.error("Error posting employee:", err);
        }
    },

    async handleSubmit(e) {
        e.preventDefault();

        const newEmployee = {
            employee_id: document.getElementById("emp_id").value,
            employee_name: document.getElementById("emp_name").value,
            department: document.getElementById("emp_department").value,
            job_role: document.getElementById("emp_jobRole").value,
            employee_status: document.getElementById("emp_status").value,
            job_completion_rate: 80,
            safety_compliance: 90,
            overall_score: 85
        };

        await this.postEmployee(newEmployee);
        await this.fetchEmployees();
        this.closeCreateModal();
        showNotification("Employee created successfully!", "success");
    }
};

// ✅ Expose globally
window.loadEmployeesPage = loadEmployeesPage;
