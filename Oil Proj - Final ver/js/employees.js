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
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody id="employeesTableBody"></tbody>
            </table>
        </div>

        <!-- View Employee Modal -->
        <div id="viewEmployeeModal" class="modal">
            <div class="modal-content large">
                <div class="modal-header">
                    <h2 class="modal-title">Employee Details</h2>
                    <button class="close" onclick="Employees.closeViewModal()">×</button>
                </div>
                <div id="viewEmployeeDetails" class="modal-body"></div>
                <div class="modal-footer">
                    <button class="btn-danger" id="deleteEmployeeBtn">🗑 Delete</button>
                    <button class="btn-secondary" onclick="Employees.closeViewModal()">Close</button>
                </div>
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
    },

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
                <td>
                    <button class="btn-view" onclick="Employees.viewEmployee('${emp.employee_id}')">👁 View</button>
                </td>
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

    // 📂 Handle Excel Upload (direct FormData → backend)
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/post_all_employees", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            console.log("Upload result:", result);

            if (response.ok) {
                showNotification("Employees data uploaded successfully!", "success");
                await this.fetchEmployees(); // refresh the table
            } else {
                showNotification(`Upload failed: ${result.message || "Unknown error"}`, "error");
            }
        } catch (err) {
            console.error("Error uploading employees:", err);
            showNotification("Error uploading Excel file", "error");
        }
    },

    // 🔍 View employee details
    viewEmployee(employeeId) {
        const emp = AppState.data.employees.find(e => e.employee_id === employeeId);
        if (!emp) return;

        const details = Object.entries(emp)
            .map(([key, value]) => `
                <div class="detail-row">
                    <strong>${key.replace(/_/g, " ")}:</strong> ${value ?? ""}
                </div>
            `)
            .join("");

        const modalBody = document.getElementById("viewEmployeeDetails");
        if (modalBody) modalBody.innerHTML = details;

        const deleteBtn = document.getElementById("deleteEmployeeBtn");
        deleteBtn.onclick = () => this.deleteEmployee(employeeId);

        document.getElementById("viewEmployeeModal").style.display = "block";
    },

    closeViewModal() {
        document.getElementById("viewEmployeeModal").style.display = "none";
        document.getElementById("viewEmployeeDetails").innerHTML = "";
    },

    // 🗑 Delete employee
    async deleteEmployee(employeeId) {
        if (!confirm("Are you sure you want to delete this employee?")) return;

        try {
            const res = await fetch(`http://localhost:8000/delete_employee/${employeeId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete employee");

            showNotification("Employee deleted successfully!", "success");
            this.closeViewModal();
            await this.fetchEmployees();
        } catch (err) {
            console.error("Error deleting employee:", err);
            showNotification("Failed to delete employee", "error");
        }
    }
};

// ✅ Expose globally
window.loadEmployeesPage = loadEmployeesPage;
window.Employees = Employees;
