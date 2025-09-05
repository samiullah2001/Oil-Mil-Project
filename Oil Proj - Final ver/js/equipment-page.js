/**
 * Equipment Page Module
 */

class EquipmentPage {
    constructor() {
        this.currentView = 'list';
        this.selectedItems = [];
        this.equipmentData = [
            {
                sku: '10000',
                name: '9 5/8" Rotary hand sifter',
                totalQuantity: 20,
                availableQuantity: 8,
                inUsed: 12,
                status: 'ready',
                components: [
                    { name: 'Slip Body', quantity: 4, unit: 'Unit/Pcs' },
                    { name: 'Slip Segments', quantity: 4, unit: 'Unit/Pcs' },
                    { name: 'Insert Teeth / Dies', quantity: 7, unit: 'Unit/Pcs' },
                    { name: 'Handles', quantity: 4, unit: 'Unit/Pcs' }
                ]
            }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('Equipment Page Module initialized');
    }

    setupEventListeners() {
        // navigation
        document.addEventListener('equipmentPageRequested', () => {
            this.loadEquipmentPage();
        });

        // UI interactions
        document.addEventListener('click', (e) => {
            // Add New Item button
            if (e.target.id === 'addNewItemBtn') {
                console.log("Add New Item clicked ✅");
                this.showAddItemModal();
            }

            // Close modals
            if (e.target.id === 'closeDetailsModal' || e.target.id === 'cancelDetailsBtn') {
                this.closeModal('equipmentDetailsModal');
            }
            if (e.target.id === 'closeAddModal' || e.target.id === 'cancelAddBtn') {
                this.closeModal('addItemModal');
            }

            // Save
            if (e.target.id === 'saveAddBtn') {
                this.handleAddItem();
            }
            if (e.target.id === 'saveDetailsBtn') {
                this.handleSaveDetails();
            }

            // Equipment details button
            if (e.target.closest('.equipment-detail-btn')) {
                const sku = e.target.closest('[data-sku]').dataset.sku;
                this.showEquipmentDetails(sku);
            }
        });

        // Status change
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('status-badge')) {
                this.handleStatusChange(e);
            }
        });
    }

    loadEquipmentPage() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = this.createEquipmentHTML();
        this.initializeEquipmentTable();
    }

    createEquipmentHTML() {
        return `
            <div class="equipment-page">
                <div class="equipment-header">
                    <div class="page-title">
                        <h1>Equipment</h1>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="addNewItemBtn">
                            <i class="icon-plus">➕</i>
                            Add New Item
                        </button>
                    </div>
                </div>

                <div class="equipment-table-container">
                    <table class="equipment-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>ITEM NAME</th>
                                <th>TOTAL QUANTITY</th>
                                <th>AVAILABLE QUANTITY</th>
                                <th>IN USED</th>
                                <th>STATUS</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="equipmentTableBody"></tbody>
                    </table>
                </div>

                <!-- Equipment Details Modal -->
                <div class="modal" id="equipmentDetailsModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Equipment Details</h2>
                            <button class="close-btn" id="closeDetailsModal">&times;</button>
                        </div>
                        <div class="modal-body" id="equipmentDetailsContent"></div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" id="cancelDetailsBtn">Cancel</button>
                            <button class="btn btn-primary" id="saveDetailsBtn">Save</button>
                        </div>
                    </div>
                </div>

                <!-- Add New Item Modal -->
                <div class="modal" id="addItemModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Add New Equipment Item</h2>
                            <button class="close-btn" id="closeAddModal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="addItemForm" class="equipment-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="newItemSku">SKU *</label>
                                        <input type="text" id="newItemSku" name="sku" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="newItemName">Item Name *</label>
                                        <input type="text" id="newItemName" name="name" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="newItemQuantity">Total Quantity *</label>
                                        <input type="number" id="newItemQuantity" name="totalQuantity" min="0" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="newItemStatus">Status *</label>
                                        <select id="newItemStatus" name="status" required>
                                            <option value="ready">Ready</option>
                                            <option value="under_inspection">Under Inspection</option>
                                            <option value="damage">Damage</option>
                                            <option value="in_use">In Use</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" id="cancelAddBtn">Cancel</button>
                            <button class="btn btn-primary" id="saveAddBtn">Add Item</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initializeEquipmentTable() {
        const tbody = document.getElementById('equipmentTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.equipmentData.map(item => this.createEquipmentRow(item)).join('');
    }

    createEquipmentRow(item) {
        const statusClass = item.status.replace('_', '-');
        const statusText = item.status.replace('_', ' ');
        
        return `
            <tr data-sku="${item.sku}">
                <td class="equipment-sku">${item.sku}</td>
                <td class="equipment-name">${item.name}</td>
                <td>${item.totalQuantity}</td>
                <td>${item.availableQuantity}</td>
                <td>${item.inUsed}</td>
                <td>
                    <select class="status-badge ${statusClass}" data-sku="${item.sku}">
                        <option value="ready" ${item.status === 'ready' ? 'selected' : ''}>Ready</option>
                        <option value="under_inspection" ${item.status === 'under_inspection' ? 'selected' : ''}>Under Inspection</option>
                        <option value="damage" ${item.status === 'damage' ? 'selected' : ''}>Damage</option>
                        <option value="in_use" ${item.status === 'in_use' ? 'selected' : ''}>In Use</option>
                    </select>
                </td>
                <td>
                    <div class="equipment-actions">
                        <button class="action-btn info equipment-detail-btn" title="View Details">ℹ️</button>
                    </div>
                </td>
            </tr>
        `;
    }

    // ✅ Fixed modal handling
    showAddItemModal() {
        const form = document.getElementById('addItemForm');
        if (form) form.reset();
        this.showModal('addItemModal');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex'; // force visible
            modal.classList.add('active');
        } else {
            console.error("Modal not found:", modalId);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    }

    handleAddItem() {
        const form = document.getElementById('addItemForm');
        const formData = new FormData(form);
        
        const newItem = {
            sku: formData.get('sku'),
            name: formData.get('name'),
            totalQuantity: parseInt(formData.get('totalQuantity')),
            availableQuantity: parseInt(formData.get('totalQuantity')),
            inUsed: 0,
            status: formData.get('status')
        };

        if (!newItem.sku || !newItem.name || !newItem.totalQuantity) {
            alert('Please fill all required fields');
            return;
        }

        if (this.equipmentData.find(item => item.sku === newItem.sku)) {
            alert('SKU already exists');
            return;
        }

        this.equipmentData.push(newItem);
        this.initializeEquipmentTable();
        this.closeModal('addItemModal');
    }

    handleSaveDetails() {
        alert("Details saved (demo only)");
        this.closeModal('equipmentDetailsModal');
    }

    handleStatusChange(e) {
        const sku = e.target.dataset.sku;
        const newStatus = e.target.value;

        const itemIndex = this.equipmentData.findIndex(item => item.sku === sku);
        if (itemIndex !== -1) {
            this.equipmentData[itemIndex].status = newStatus;
            e.target.className = `status-badge ${newStatus.replace('_', '-')}`;
        }
    }

    showEquipmentDetails(sku) {
        const item = this.equipmentData.find(eq => eq.sku === sku);
        if (!item) return;

        const content = document.getElementById('equipmentDetailsContent');
        content.innerHTML = `
            <p><strong>SKU:</strong> ${item.sku}</p>
            <p><strong>Item Name:</strong> ${item.name}</p>
            <p><strong>Status:</strong> ${item.status}</p>
        `;

        this.showModal('equipmentDetailsModal');
    }
}

// ✅ Singleton instance
const equipmentPage = new EquipmentPage();
window.EquipmentPage = equipmentPage;
