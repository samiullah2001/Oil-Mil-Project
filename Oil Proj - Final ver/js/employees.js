// Employees Page
function loadEmployeesPage() {
    const content = `
        <div class="controls">
            <button class="add-employee-btn" onclick="Employees.openCreateModal()">
                ➕ Add New Employee
            </button>
            <input type="text" class="search-box" placeholder="Search employees..." onkeyup="Employees.search(this.value)">
        </div>

        <div class="employee-grid" id="employeeGrid">
            <!-- Employee cards will be populated here -->
        </div>

        <!-- Employee Modal -->
        <div id="employeeModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" id="employeeModalTitle">Add New Employee</h2>
                    <button class="close" onclick="Employees.closeCreateModal()">×</button>
                </div>
                <form id="employeeForm">
                    <!-- Image Upload Section -->
                    <div class="image-upload-section">
                        <div class="image-preview-container">
                            <div class="default-image-preview" id="imagePreview">👤</div>
                            <button type="button" class="upload-overlay" onclick="Employees.triggerFileUpload()">📷</button>
                        </div>
                        <input type="file" id="imageInput" class="file-input-hidden" accept="image/*" onchange="Employees.handleImageUpload(event)">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">First Name *</label>
                            <input type="text" class="form-input" id="emp_firstName" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Last Name *</label>
                            <input type="text" class="form-input" id="emp_lastName" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Employee ID *</label>
                            <input type="text" class="form-input" id="emp_employeeId" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Department *</label>
                            <select class="form-select" id="emp_department" required>
                                <option value="">Select Department</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Operations">Operations</option>
                                <option value="Logistics">Logistics</option>
                                <option value="Finance">Finance</option>
                                <option value="HR">Human Resources</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Position *</label>
                            <input type="text" class="form-input" id="emp_position" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Salary ($) *</label>
                            <input type="number" class="form-input" id="emp_salary" required>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="Employees.closeCreateModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Add Employee</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('dynamic-content').innerHTML = content;
    loadPageStyles('employees');
    Employees.init();
}

// Employees Module
const Employees = {
    gradients: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ],

    init() {
        this.populateGrid();
        document.getElementById('employeeForm').addEventListener('submit', this.handleSubmit.bind(this));
    },

    populateGrid(data = AppState.data.employees) {
        const grid = document.getElementById('employeeGrid');
        grid.innerHTML = '';

        data.forEach((employee, index) => {
            const card = document.createElement('div');
            card.className = 'employee-card';
            card.style.background = this.gradients[index % this.gradients.length];
            
            const fullName = `${employee.firstName} ${employee.lastName}`;
            const avatarInitials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`;
            
            card.innerHTML = `
                <div class="card-header">
                    <div class="default-avatar">${avatarInitials}</div>
                    <div class="salary-badge">$${employee.salary.toLocaleString()}</div>
                </div>
                <div class="employee-info">
                    <div class="employee-name">${fullName}</div>
                    <div class="employee-position">${employee.position}</div>
                    <div class="employee-department">${employee.department}</div>
                </div>
            `;
            
            grid.appendChild(card);
        });
    },

    search(term) {
        const filtered = AppState.data.employees.filter(employee =>
            Object.values(employee).some(value =>
                value && value.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
        this.populateGrid(filtered);
    },

    openCreateModal() {
        document.getElementById('employeeModal').style.display = 'block';
        const nextId = String(AppState.data.employees.length + 1).padStart(3, '0');
        document.getElementById('emp_employeeId').value = `EMP${nextId}`;
    },

    closeCreateModal() {
        document.getElementById('employeeModal').style.display = 'none';
        document.getElementById('employeeForm').reset();
        this.resetImagePreview();
    },

    triggerFileUpload() {
        document.getElementById('imageInput').click();
    },

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            };
            reader.readAsDataURL(file);
        }
    },

    resetImagePreview() {
        document.getElementById('imagePreview').innerHTML = '👤';
    },

    handleSubmit(e) {
        e.preventDefault();
        
        const newEmployee = {
            id: Date.now(),
            employeeId: document.getElementById('emp_employeeId').value,
            firstName: document.getElementById('emp_firstName').value,
            lastName: document.getElementById('emp_lastName').value,
            position: document.getElementById('emp_position').value,
            department: document.getElementById('emp_department').value,
            salary: parseInt(document.getElementById('emp_salary').value),
            email: `${document.getElementById('emp_firstName').value.toLowerCase()}.${document.getElementById('emp_lastName').value.toLowerCase()}@logistics.com`,
            phone: "+1234567890",
            employmentStatus: "Active",
            imageUrl: null
        };

        AppState.data.employees.unshift(newEmployee);
        this.populateGrid();
        this.closeCreateModal();
        updateDashboardCounts();
        showNotification('Employee added successfully!', 'success');
    }
};