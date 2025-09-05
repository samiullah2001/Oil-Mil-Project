/**
 * Service Orders UI Controller
 * Handles all UI interactions for service orders including
 * form submissions, table updates, modal management, and equipment selection
 */

class ServiceOrdersUI {
    constructor() {
        this.currentOrder = null;
        this.currentView = 'list';
        this.filters = {};
        this.sortBy = 'createdAt';
        this.sortDirection = 'desc';
        this.selectedEquipment = [];
        this.init();
    }

    /**
     * Initialize the UI controller
     */
    init() {
        this.setupEventListeners();
        this.initializeUI();
        this.loadServiceOrders();
        console.log('Service Orders UI Controller initialized');
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        this.createServiceOrdersHTML();
        this.setupFormValidation();
        this.setupTableSorting();
        this.setupEquipmentSelection();
    }

    /**
     * Create the main service orders HTML structure
     */
    createServiceOrdersHTML() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="service-orders-container">
                <!-- Header Section -->
                <div class="header-section">
                    <div class="page-title">
                        <h1>Service Orders</h1>
                        <p class="subtitle">Manage and track all service requests</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-secondary" id="exportOrdersBtn">
                            <i class="icon-download"></i> Export
                        </button>
                        <button class="btn btn-secondary" id="importOrdersBtn">
                            <i class="icon-upload"></i> Import
                        </button>
                        <button class="btn btn-primary" id="addOrderBtn">
                            <i class="icon-plus"></i> Add New Order
                        </button>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="filters-section">
                    <div class="search-container">
                        <input type="text" id="searchOrders" placeholder="Search orders..." class="search-input">
                        <i class="icon-search"></i>
                    </div>
                    <div class="filters-container">
                        <select id="statusFilter" class="filter-select">
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select id="serviceTypeFilter" class="filter-select">
                            <option value="">All Service Types</option>
                            <option value="cleaning">Cleaning</option>
                            <option value="plumbing">Plumbing</option>
                            <option value="electrical">Electrical</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="repair">Repair</option>
                            <option value="installation">Installation</option>
                        </select>
                        <input type="date" id="dateFromFilter" class="filter-input" placeholder="From Date">
                        <input type="date" id="dateToFilter" class="filter-input" placeholder="To Date">
                        <button class="btn btn-secondary" id="clearFiltersBtn">Clear Filters</button>
                    </div>
                </div>

                <!-- Orders Table -->
                <div class="table-section">
                    <div class="table-container">
                        <table class="orders-table" id="ordersTable">
                            <thead>
                                <tr>
                                    <th class="sortable" data-sort="id">
                                        Order ID <i class="sort-icon"></i>
                                    </th>
                                    <th class="sortable" data-sort="customerName">
                                        Customer <i class="sort-icon"></i>
                                    </th>
                                    <th class="sortable" data-sort="serviceType">
                                        Service Type <i class="sort-icon"></i>
                                    </th>
                                    <th class="sortable" data-sort="scheduledDate">
                                        Scheduled Date <i class="sort-icon"></i>
                                    </th>
                                    <th class="sortable" data-sort="status">
                                        Status <i class="sort-icon"></i>
                                    </th>
                                    <th class="sortable" data-sort="providerName">
                                        Provider <i class="sort-icon"></i>
                                    </th>
                                    <th class="sortable" data-sort="cost">
                                        Cost <i class="sort-icon"></i>
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="ordersTableBody">
                                <!-- Orders will be populated here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="stats-section">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon pending"></div>
                            <div class="stat-content">
                                <h3 id="pendingCount">0</h3>
                                <p>Pending Orders</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon confirmed"></div>
                            <div class="stat-content">
                                <h3 id="confirmedCount">0</h3>
                                <p>Confirmed Orders</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon completed"></div>
                            <div class="stat-content">
                                <h3 id="completedCount">0</h3>
                                <p>Completed Orders</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon revenue"></div>
                            <div class="stat-content">
                                <h3 id="totalRevenue">$0</h3>
                                <p>Total Revenue</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add/Edit Order Modal -->
            <div class="modal" id="orderModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2 id="modalTitle">Add New Service Order</h2>
                        <button class="close-btn" id="closeModalBtn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="orderForm" class="order-form">
                            <!-- Customer Information -->
                            <div class="form-section">
                                <h3>Customer Information</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="customerName">Customer Name *</label>
                                        <input type="text" id="customerName" name="customerName" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="customerEmail">Email *</label>
                                        <input type="email" id="customerEmail" name="customerEmail" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="customerPhone">Phone *</label>
                                        <input type="tel" id="customerPhone" name="customerPhone" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="customerId">Customer ID</label>
                                        <input type="text" id="customerId" name="customerId">
                                    </div>
                                </div>
                            </div>

                            <!-- Service Information -->
                            <div class="form-section">
                                <h3>Service Information</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="serviceType">Service Type *</label>
                                        <select id="serviceType" name="serviceType" required>
                                            <option value="">Select Service Type</option>
                                            <option value="cleaning">Cleaning</option>
                                            <option value="plumbing">Plumbing</option>
                                            <option value="electrical">Electrical</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="repair">Repair</option>
                                            <option value="installation">Installation</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="estimatedDuration">Duration (minutes)</label>
                                        <input type="number" id="estimatedDuration" name="estimatedDuration" min="15" step="15" value="60">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="description">Service Description *</label>
                                    <textarea id="description" name="description" rows="3" required 
                                             placeholder="Detailed description of the service required..."></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="address">Service Address *</label>
                                    <textarea id="address" name="address" rows="2" required 
                                             placeholder="Complete address where service will be performed..."></textarea>
                                </div>
                            </div>

                            <!-- Scheduling -->
                            <div class="form-section">
                                <h3>Scheduling</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="scheduledDate">Scheduled Date *</label>
                                        <input type="date" id="scheduledDate" name="scheduledDate" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="scheduledTime">Scheduled Time *</label>
                                        <select id="scheduledTime" name="scheduledTime" required>
                                            <option value="">Select Time</option>
                                            <!-- Time slots will be populated by JavaScript -->
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Equipment Assignment -->
                            <div class="form-section" id="equipmentSection" style="display: none;">
                                <h3>Equipment Assignment</h3>
                                <div class="equipment-selection">
                                    <div class="available-equipment">
                                        <h4>Available Equipment</h4>
                                        <div id="availableEquipmentList" class="equipment-list">
                                            <!-- Available equipment will be populated here -->
                                        </div>
                                    </div>
                                    <div class="selected-equipment">
                                        <h4>Selected Equipment</h4>
                                        <div id="selectedEquipmentList" class="equipment-list">
                                            <!-- Selected equipment will be populated here -->
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Pricing and Notes -->
                            <div class="form-section">
                                <h3>Pricing and Additional Information</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="cost">Estimated Cost ($)</label>
                                        <input type="number" id="cost" name="cost" min="0" step="0.01">
                                    </div>
                                    <div class="form-group">
                                        <label for="providerId">Assign to Provider</label>
                                        <select id="providerId" name="providerId">
                                            <option value="">Select Provider</option>
                                            <!-- Providers will be populated by JavaScript -->
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="notes">Additional Notes</label>
                                    <textarea id="notes" name="notes" rows="3" 
                                             placeholder="Any additional notes or special instructions..."></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelOrderBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="saveOrderBtn">Save Order</button>
                    </div>
                </div>
            </div>

            <!-- Order Details Modal -->
            <div class="modal" id="orderDetailsModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Order Details</h2>
                        <button class="close-btn" id="closeDetailsBtn">&times;</button>
                    </div>
                    <div class="modal-body" id="orderDetailsContent">
                        <!-- Order details will be populated here -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="editOrderBtn">Edit Order</button>
                        <button type="button" class="btn btn-danger" id="cancelOrderDetailsBtn">Cancel Order</button>
                        <button type="button" class="btn btn-success" id="completeOrderBtn">Mark Complete</button>
                    </div>
                </div>
            </div>

            <!-- Equipment Assignment Modal -->
            <div class="modal" id="equipmentModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Assign Equipment</h2>
                        <button class="close-btn" id="closeEquipmentModalBtn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="equipment-assignment">
                            <table class="equipment-table">
                                <thead>
                                    <tr>
                                        <th>Equipment ID</th>
                                        <th>Equipment Description</th>
                                        <th>Available Qty</th>
                                        <th>Assign Qty</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="equipmentAssignmentTable">
                                    <!-- Equipment assignment rows will be populated here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelEquipmentBtn">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveEquipmentBtn">Save Assignment</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Modal controls
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addOrderBtn') {
                this.showAddOrderModal();
            } else if (e.target.id === 'closeModalBtn' || e.target.id === 'cancelOrderBtn') {
                this.hideModal('orderModal');
            } else if (e.target.id === 'closeDetailsBtn') {
                this.hideModal('orderDetailsModal');
            } else if (e.target.id === 'closeEquipmentModalBtn' || e.target.id === 'cancelEquipmentBtn') {
                this.hideModal('equipmentModal');
            } else if (e.target.id === 'saveOrderBtn') {
                this.handleOrderSubmit();
            } else if (e.target.id === 'editOrderBtn') {
                this.editCurrentOrder();
            } else if (e.target.id === 'cancelOrderDetailsBtn') {
                this.cancelCurrentOrder();
            } else if (e.target.id === 'completeOrderBtn') {
                this.completeCurrentOrder();
            } else if (e.target.id === 'saveEquipmentBtn') {
                this.saveEquipmentAssignment();
            } else if (e.target.id === 'exportOrdersBtn') {
                this.exportOrders();
            } else if (e.target.id === 'clearFiltersBtn') {
                this.clearFilters();
            }

            // Table row actions
            if (e.target.classList.contains('view-order-btn')) {
                const orderId = e.target.dataset.orderId;
                this.showOrderDetails(orderId);
            } else if (e.target.classList.contains('edit-order-btn')) {
                const orderId = e.target.dataset.orderId;
                this.editOrder(orderId);
            } else if (e.target.classList.contains('assign-equipment-btn')) {
                const orderId = e.target.dataset.orderId;
                this.showEquipmentAssignment(orderId);
            }

            // Equipment selection
            if (e.target.classList.contains('add-equipment-btn')) {
                const equipmentSku = e.target.dataset.equipmentSku;
                this.addEquipmentToSelection(equipmentSku);
            } else if (e.target.classList.contains('remove-equipment-btn')) {
                const equipmentSku = e.target.dataset.equipmentSku;
                this.removeEquipmentFromSelection(equipmentSku);
            }
        });

        // Form changes
        document.addEventListener('change', (e) => {
            if (e.target.id === 'serviceType') {
                this.handleServiceTypeChange(e.target.value);
            } else if (e.target.id === 'scheduledDate') {
                this.updateAvailableTimeSlots(e.target.value);
            } else if (e.target.id === 'estimatedDuration') {
                this.updateEstimatedCost();
            }

            // Filter changes
            if (e.target.id === 'statusFilter' || e.target.id === 'serviceTypeFilter' || 
                e.target.id === 'dateFromFilter' || e.target.id === 'dateToFilter') {
                this.applyFilters();
            }
        });

        // Search
        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchOrders') {
                this.handleSearch(e.target.value);
            }
        });

        // Table sorting
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sortable') || e.target.parentElement.classList.contains('sortable')) {
                const th = e.target.classList.contains('sortable') ? e.target : e.target.parentElement;
                const sortField = th.dataset.sort;
                this.handleSort(sortField);
            }
        });

        // Service Orders module events
        document.addEventListener('orderCreated', (e) => {
            this.handleOrderCreated(e.detail);
        });

        document.addEventListener('orderUpdated', (e) => {
            this.handleOrderUpdated(e.detail);
        });

        document.addEventListener('equipmentRecommendations', (e) => {
            this.showEquipmentRecommendations(e.detail);
        });
    }

    /**
     * Load and display service orders
     */
    loadServiceOrders() {
        if (!window.ServiceOrders) {
            console.error('Service Orders module not available');
            return;
        }

        const orders = window.ServiceOrders.getOrders(this.filters);
        this.displayOrders(orders);
        this.updateStatistics();
    }

    /**
     * Display orders in the table
     * @param {Array} orders - Orders to display
     */
    displayOrders(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-data">No service orders found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr class="order-row" data-order-id="${order.id}">
                <td class="order-id">#${order.id}</td>
                <td class="customer-name">
                    <div class="customer-info">
                        <span class="name">${order.customerName}</span>
                        <span class="email">${order.customerEmail}</span>
                    </div>
                </td>
                <td class="service-type">
                    <span class="service-badge ${order.serviceType}">${this.formatServiceType(order.serviceType)}</span>
                </td>
                <td class="scheduled-date">
                    <div class="date-time">
                        <span class="date">${this.formatDate(order.scheduledDate)}</span>
                        <span class="time">${order.scheduledTime}</span>
                    </div>
                </td>
                <td class="status">
                    <span class="status-badge ${order.status}">${this.formatStatus(order.status)}</span>
                </td>
                <td class="provider">
                    ${order.providerName ? `
                        <div class="provider-info">
                            <span class="name">${order.providerName}</span>
                        </div>
                    ` : '<span class="unassigned">Not assigned</span>'}
                </td>
                <td class="cost">${order.cost.toFixed(2)}</td>
                <td class="actions">
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline view-order-btn" data-order-id="${order.id}" title="View Details">
                            <i class="icon-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline edit-order-btn" data-order-id="${order.id}" title="Edit Order">
                            <i class="icon-edit"></i>
                        </button>
                        ${this.shouldShowEquipmentButton(order) ? `
                            <button class="btn btn-sm btn-outline assign-equipment-btn" data-order-id="${order.id}" title="Assign Equipment">
                                <i class="icon-tool"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Show add order modal
     */
    showAddOrderModal() {
        this.currentOrder = null;
        document.getElementById('modalTitle').textContent = 'Add New Service Order';
        document.getElementById('orderForm').reset();
        this.populateTimeSlots();
        this.populateProviders();
        this.showModal('orderModal');
    }

    /**
     * Show order details modal
     * @param {number} orderId - Order ID
     */
    showOrderDetails(orderId) {
        if (!window.ServiceOrders) return;

        const order = window.ServiceOrders.getOrderById(orderId);
        if (!order) {
            window.NotificationSystem?.showError('Order not found');
            return;
        }

        this.currentOrder = order;
        this.displayOrderDetails(order);
        this.showModal('orderDetailsModal');
    }

    /**
     * Display order details in modal
     * @param {Object} order - Order object
     */
    displayOrderDetails(order) {
        const content = document.getElementById('orderDetailsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="order-details">
                <div class="details-grid">
                    <div class="detail-section">
                        <h4>Order Information</h4>
                        <div class="detail-item">
                            <label>Order ID:</label>
                            <span>#${order.id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status-badge ${order.status}">${this.formatStatus(order.status)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Service Type:</label>
                            <span class="service-badge ${order.serviceType}">${this.formatServiceType(order.serviceType)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Cost:</label>
                            <span class="cost">${order.cost.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Customer Information</h4>
                        <div class="detail-item">
                            <label>Name:</label>
                            <span>${order.customerName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${order.customerEmail}</span>
                        </div>
                        <div class="detail-item">
                            <label>Phone:</label>
                            <span>${order.customerPhone}</span>
                        </div>
                        <div class="detail-item">
                            <label>Address:</label>
                            <span>${order.address}</span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Scheduling</h4>
                        <div class="detail-item">
                            <label>Scheduled Date:</label>
                            <span>${this.formatDate(order.scheduledDate)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Scheduled Time:</label>
                            <span>${order.scheduledTime}</span>
                        </div>
                        <div class="detail-item">
                            <label>Duration:</label>
                            <span>${order.estimatedDuration} minutes</span>
                        </div>
                        <div class="detail-item">
                            <label>Created:</label>
                            <span>${this.formatDateTime(order.createdAt)}</span>
                        </div>
                    </div>

                    ${order.providerName ? `
                        <div class="detail-section">
                            <h4>Service Provider</h4>
                            <div class="detail-item">
                                <label>Provider:</label>
                                <span>${order.providerName}</span>
                            </div>
                            <div class="detail-item">
                                <label>Provider ID:</label>
                                <span>${order.providerId}</span>
                            </div>
                        </div>
                    ` : ''}

                    ${order.assignedEquipment && order.assignedEquipment.length > 0 ? `
                        <div class="detail-section">
                            <h4>Assigned Equipment</h4>
                            <div class="equipment-list">
                                ${order.assignedEquipment.map(eq => `
                                    <div class="equipment-item">
                                        <span class="equipment-name">${eq.name}</span>
                                        <span class="equipment-sku">SKU: ${eq.sku}</span>
                                        <span class="equipment-quantity">Qty: ${eq.quantity}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="description-section">
                    <h4>Service Description</h4>
                    <p>${order.description}</p>
                </div>

                ${order.notes ? `
                    <div class="notes-section">
                        <h4>Notes</h4>
                        <p>${order.notes}</p>
                    </div>
                ` : ''}

                ${order.rating || order.feedback ? `
                    <div class="feedback-section">
                        <h4>Customer Feedback</h4>
                        ${order.rating ? `<div class="rating">Rating: ${'★'.repeat(order.rating)}${'☆'.repeat(5-order.rating)}</div>` : ''}
                        ${order.feedback ? `<p class="feedback">${order.feedback}</p>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Handle service type change
     * @param {string} serviceType - Selected service type
     */
    handleServiceTypeChange(serviceType) {
        const equipmentSection = document.getElementById('equipmentSection');
        
        // Show equipment section for services that require equipment
        if (this.isEquipmentRequired(serviceType)) {
            equipmentSection.style.display = 'block';
            this.loadAvailableEquipment(serviceType);
        } else {
            equipmentSection.style.display = 'none';
        }

        // Update estimated cost
        this.updateEstimatedCost();
    }

    /**
     * Check if equipment is required for service type
     * @param {string} serviceType - Service type
     * @returns {boolean} Is equipment required
     */
    isEquipmentRequired(serviceType) {
        return ['maintenance', 'repair', 'installation'].includes(serviceType);
    }

    /**
     * Load available equipment for service type
     * @param {string} serviceType - Service type
     */
    loadAvailableEquipment(serviceType) {
        if (!window.EquipmentIntegration) return;

        const availableEquipment = window.EquipmentIntegration.getAvailableEquipment(serviceType);
        this.displayAvailableEquipment(availableEquipment);
    }

    /**
     * Display available equipment
     * @param {Array} equipment - Available equipment
     */
    displayAvailableEquipment(equipment) {
        const container = document.getElementById('availableEquipmentList');
        if (!container) return;

        container.innerHTML = equipment.map(eq => `
            <div class="equipment-card" data-equipment-sku="${eq.sku}">
                <div class="equipment-info">
                    <h5>${eq.name}</h5>
                    <p>SKU: ${eq.sku}</p>
                    <p>Available: ${eq.availableQuantity}</p>
                </div>
                <button class="btn btn-sm btn-primary add-equipment-btn" data-equipment-sku="${eq.sku}">
                    Add
                </button>
            </div>
        `).join('');
    }

    /**
     * Handle order form submission
     */
    handleOrderSubmit() {
        const form = document.getElementById('orderForm');
        if (!form) return;

        const formData = new FormData(form);
        const orderData = Object.fromEntries(formData.entries());
        
        // Add selected equipment
        orderData.assignedEquipment = this.selectedEquipment;

        // Convert numeric fields
        orderData.cost = parseFloat(orderData.cost) || 0;
        orderData.estimatedDuration = parseInt(orderData.estimatedDuration) || 60;

        if (!window.ServiceOrders) {
            window.NotificationSystem?.showError('Service Orders module not available');
            return;
        }

        const result = window.ServiceOrders.createOrder(orderData);
        
        if (result.success) {
            window.NotificationSystem?.showSuccess(result.message);
            this.hideModal('orderModal');
            this.loadServiceOrders();
            this.resetForm();
        } else {
            window.NotificationSystem?.showError(result.error);
        }
    }

    /**
     * Update available time slots based on selected date
     * @param {string} date - Selected date
     */
    updateAvailableTimeSlots(date) {
        if (!window.ServiceOrders || !date) return;

        const timeSlots = window.ServiceOrders.getAvailableTimeSlots(date);
        const timeSelect = document.getElementById('scheduledTime');
        
        if (timeSelect) {
            timeSelect.innerHTML = '<option value="">Select Time</option>' +
                timeSlots.map(slot => `<option value="${slot}">${slot}</option>`).join('');
        }
    }

    /**
     * Update estimated cost based on service type and duration
     */
    updateEstimatedCost() {
        const serviceType = document.getElementById('serviceType')?.value;
        const duration = parseInt(document.getElementById('estimatedDuration')?.value) || 60;
        const costInput = document.getElementById('cost');

        if (serviceType && costInput && window.ServiceOrders) {
            const estimatedCost = window.ServiceOrders.calculateEstimatedCost(serviceType, duration);
            costInput.value = estimatedCost;
        }
    }

    /**
     * Apply current filters to orders list
     */
    applyFilters() {
        this.filters = {
            status: document.getElementById('statusFilter')?.value || '',
            serviceType: document.getElementById('serviceTypeFilter')?.value || '',
            dateFrom: document.getElementById('dateFromFilter')?.value || '',
            dateTo: document.getElementById('dateToFilter')?.value || ''
        };

        this.loadServiceOrders();
    }

    /**
     * Handle search input
     * @param {string} searchTerm - Search term
     */
    handleSearch(searchTerm) {
        if (!window.ServiceOrders) return;

        const orders = searchTerm.trim() ? 
            window.ServiceOrders.searchOrders(searchTerm) : 
            window.ServiceOrders.getOrders(this.filters);
            
        this.displayOrders(orders);
    }

    /**
     * Handle table sorting
     * @param {string} field - Field to sort by
     */
    handleSort(field) {
        if (this.sortBy === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = field;
            this.sortDirection = 'asc';
        }

        this.updateSortIndicators();
        this.loadServiceOrders();
    }

    /**
     * Update sort indicators in table headers
     */
    updateSortIndicators() {
        const headers = document.querySelectorAll('.sortable');
        headers.forEach(header => {
            const icon = header.querySelector('.sort-icon');
            if (header.dataset.sort === this.sortBy) {
                icon.className = `sort-icon ${this.sortDirection}`;
            } else {
                icon.className = 'sort-icon';
            }
        });
    }

    /**
     * Show equipment assignment modal
     * @param {number} orderId - Order ID
     */
    showEquipmentAssignment(orderId) {
        if (!window.ServiceOrders || !window.EquipmentIntegration) return;

        const order = window.ServiceOrders.getOrderById(orderId);
        if (!order) return;

        this.currentOrder = order;
        this.loadEquipmentAssignmentTable();
        this.showModal('equipmentModal');
    }

    /**
     * Load equipment assignment table
     */
    loadEquipmentAssignmentTable() {
        const tbody = document.getElementById('equipmentAssignmentTable');
        if (!tbody || !this.currentOrder) return;

        const availableEquipment = window.EquipmentIntegration.getAvailableEquipment(this.currentOrder.serviceType);
        
        tbody.innerHTML = availableEquipment.map(equipment => `
            <tr>
                <td>${equipment.sku}</td>
                <td>${equipment.name}</td>
                <td>${equipment.availableQuantity}</td>
                <td>
                    <input type="number" min="0" max="${equipment.availableQuantity}" 
                           value="0" class="quantity-input" data-equipment-sku="${equipment.sku}">
                </td>
                <td>
                    <button class="btn btn-sm btn-primary assign-btn" data-equipment-sku="${equipment.sku}">
                        Assign
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Save equipment assignment
     */
    saveEquipmentAssignment() {
        if (!this.currentOrder || !window.ServiceOrders) return;

        const quantities = document.querySelectorAll('.quantity-input');
        const equipmentToAssign = [];

        quantities.forEach(input => {
            const quantity = parseInt(input.value);
            if (quantity > 0) {
                const equipmentSku = input.dataset.equipmentSku;
                const equipment = window.EquipmentIntegration.equipmentData.get(equipmentSku);
                
                if (equipment) {
                    equipmentToAssign.push({
                        sku: equipmentSku,
                        name: equipment.name,
                        quantity: quantity
                    });
                }
            }
        });

        if (equipmentToAssign.length === 0) {
            window.NotificationSystem?.showWarning('Please select at least one equipment item');
            return;
        }

        const result = window.ServiceOrders.assignEquipment(this.currentOrder.id, equipmentToAssign);
        
        if (result.success) {
            window.NotificationSystem?.showSuccess(result.message);
            this.hideModal('equipmentModal');
            this.loadServiceOrders();
        } else {
            window.NotificationSystem?.showError(result.error);
        }
    }

    /**
     * Edit order
     * @param {number} orderId - Order ID
     */
    editOrder(orderId) {
        if (!window.ServiceOrders) return;

        const order = window.ServiceOrders.getOrderById(orderId);
        if (!order) return;

        this.currentOrder = order;
        this.populateOrderForm(order);
        document.getElementById('modalTitle').textContent = 'Edit Service Order';
        this.showModal('orderModal');
    }

    /**
     * Populate order form with existing data
     * @param {Object} order - Order data
     */
    populateOrderForm(order) {
        const form = document.getElementById('orderForm');
        if (!form) return;

        // Populate form fields
        Object.keys(order).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = order[key] || '';
            }
        });

        // Handle equipment assignment
        if (order.assignedEquipment) {
            this.selectedEquipment = [...order.assignedEquipment];
        }

        this.populateTimeSlots();
        this.populateProviders();
        this.handleServiceTypeChange(order.serviceType);
    }

    /**
     * Complete current order
     */
    completeCurrentOrder() {
        if (!this.currentOrder || !window.ServiceOrders) return;

        // Show rating dialog
        const rating = prompt('Please rate the service (1-5 stars):');
        const feedback = prompt('Additional feedback (optional):');

        const result = window.ServiceOrders.completeOrder(
            this.currentOrder.id,
            rating ? parseInt(rating) : null,
            feedback || ''
        );

        if (result.success) {
            window.NotificationSystem?.showSuccess(result.message);
            this.hideModal('orderDetailsModal');
            this.loadServiceOrders();
        } else {
            window.NotificationSystem?.showError(result.error);
        }
    }

    /**
     * Cancel current order
     */
    cancelCurrentOrder() {
        if (!this.currentOrder || !window.ServiceOrders) return;

        const reason = prompt('Please provide a reason for cancellation:');
        if (!reason) return;

        const result = window.ServiceOrders.cancelOrder(this.currentOrder.id, reason);

        if (result.success) {
            window.NotificationSystem?.showSuccess(result.message);
            this.hideModal('orderDetailsModal');
            this.loadServiceOrders();
        } else {
            window.NotificationSystem?.showError(result.error);
        }
    }

    /**
     * Export orders
     */
    exportOrders() {
        if (!window.ServiceOrders) return;

        const format = confirm('Export as CSV? (Cancel for JSON)') ? 'csv' : 'json';
        const exportData = window.ServiceOrders.exportOrders(format, this.filters);
        
        const blob = new Blob([exportData], { 
            type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `service-orders-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.NotificationSystem?.showSuccess('Orders exported successfully');
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('serviceTypeFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        document.getElementById('searchOrders').value = '';
        
        this.filters = {};
        this.loadServiceOrders();
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        if (!window.ServiceOrders) return;

        const stats = window.ServiceOrders.getOrdersStats();
        
        document.getElementById('pendingCount').textContent = stats.pending || 0;
        document.getElementById('confirmedCount').textContent = stats.confirmed || 0;
        document.getElementById('completedCount').textContent = stats.completed || 0;
        document.getElementById('totalRevenue').textContent = `${stats.totalRevenue.toFixed(2)}`;
    }

    /**
     * Populate time slots
     */
    populateTimeSlots() {
        const timeSelect = document.getElementById('scheduledTime');
        if (!timeSelect) return;

        const timeSlots = [];
        for (let hour = 8; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                timeSlots.push(timeSlot);
            }
        }

        timeSelect.innerHTML = '<option value="">Select Time</option>' +
            timeSlots.map(slot => `<option value="${slot}">${slot}</option>`).join('');
    }

    /**
     * Populate providers dropdown
     */
    populateProviders() {
        const providerSelect = document.getElementById('providerId');
        if (!providerSelect) return;

        // Sample providers - in real app, this would come from providers module
        const providers = [
            { id: 'PROV001', name: 'Expert Maintenance Co.' },
            { id: 'PROV002', name: 'Quick Repair Services' },
            { id: 'PROV003', name: 'Professional Cleaners Inc.' },
            { id: 'PROV004', name: 'Elite Installation Team' }
        ];

        providerSelect.innerHTML = '<option value="">Select Provider</option>' +
            providers.map(provider => 
                `<option value="${provider.id}">${provider.name}</option>`
            ).join('');
    }

    /**
     * Show modal
     * @param {string} modalId - Modal ID
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
        }
    }

    /**
     * Hide modal
     * @param {string} modalId - Modal ID
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    }

    /**
     * Reset form and clear selected equipment
     */
    resetForm() {
        const form = document.getElementById('orderForm');
        if (form) {
            form.reset();
        }
        this.selectedEquipment = [];
        this.currentOrder = null;
    }

    /**
     * Add equipment to selection
     * @param {string} equipmentSku - Equipment SKU
     */
    addEquipmentToSelection(equipmentSku) {
        if (window.EquipmentIntegration) {
            const equipment = window.EquipmentIntegration.equipmentData.get(equipmentSku);
            if (equipment && !this.selectedEquipment.find(eq => eq.sku === equipmentSku)) {
                this.selectedEquipment.push({
                    sku: equipment.sku,
                    name: equipment.name,
                    quantity: 1
                });
                this.updateSelectedEquipmentDisplay();
            }
        }
    }

    /**
     * Remove equipment from selection
     * @param {string} equipmentSku - Equipment SKU
     */
    removeEquipmentFromSelection(equipmentSku) {
        this.selectedEquipment = this.selectedEquipment.filter(eq => eq.sku !== equipmentSku);
        this.updateSelectedEquipmentDisplay();
    }

    /**
     * Update selected equipment display
     */
    updateSelectedEquipmentDisplay() {
        const container = document.getElementById('selectedEquipmentList');
        if (!container) return;

        container.innerHTML = this.selectedEquipment.map(eq => `
            <div class="selected-equipment-item">
                <div class="equipment-info">
                    <h5>${eq.name}</h5>
                    <p>SKU: ${eq.sku} | Qty: ${eq.quantity}</p>
                </div>
                <button class="btn btn-sm btn-danger remove-equipment-btn" data-equipment-sku="${eq.sku}">
                    Remove
                </button>
            </div>
        `).join('');
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        const form = document.getElementById('orderForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleOrderSubmit();
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    /**
     * Validate individual form field
     * @param {HTMLElement} field - Form field to validate
     */
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.name) {
            case 'customerName':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Customer name must be at least 2 characters';
                }
                break;
            case 'customerEmail':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'customerPhone':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
            case 'description':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Description must be at least 10 characters';
                }
                break;
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    /**
     * Show field validation result
     * @param {HTMLElement} field - Form field
     * @param {boolean} isValid - Is field valid
     * @param {string} errorMessage - Error message
     */
    showFieldValidation(field, isValid, errorMessage) {
        // Remove existing error
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        field.classList.remove('error', 'valid');

        if (!isValid && errorMessage) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = errorMessage;
            field.parentElement.appendChild(errorDiv);
        } else if (field.value.trim()) {
            field.classList.add('valid');
        }
    }

    /**
     * Setup table sorting functionality
     */
    setupTableSorting() {
        // Sorting is handled in the click event listener
        this.updateSortIndicators();
    }

    /**
     * Setup equipment selection functionality
     */
    setupEquipmentSelection() {
        this.selectedEquipment = [];
    }

    /**
     * Handle order created event
     * @param {Object} order - Created order
     */
    handleOrderCreated(order) {
        this.loadServiceOrders();
        window.NotificationSystem?.showSuccess(`Order #${order.id} created successfully`);
    }

    /**
     * Handle order updated event
     * @param {Object} eventData - Update event data
     */
    handleOrderUpdated(eventData) {
        const { newOrder, oldOrder } = eventData;
        this.loadServiceOrders();
        
        if (newOrder.status !== oldOrder.status) {
            window.NotificationSystem?.showInfo(
                `Order #${newOrder.id} status changed to ${this.formatStatus(newOrder.status)}`
            );
        }
    }

    /**
     * Show equipment recommendations
     * @param {Object} eventData - Recommendation event data
     */
    showEquipmentRecommendations(eventData) {
        const { orderId, recommendations } = eventData;
        
        window.NotificationSystem?.showInfo(
            `Equipment recommendations available for order #${orderId}`,
            5000
        );
    }

    // Utility Methods

    /**
     * Format service type for display
     * @param {string} serviceType - Service type
     * @returns {string} Formatted service type
     */
    formatServiceType(serviceType) {
        return serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Format status for display
     * @param {string} status - Status
     * @returns {string} Formatted status
     */
    formatStatus(status) {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Format date for display
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format date and time for display
     * @param {string} dateTimeString - DateTime string
     * @returns {string} Formatted date and time
     */
    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Check if equipment button should be shown
     * @param {Object} order - Order object
     * @returns {boolean} Should show equipment button
     */
    shouldShowEquipmentButton(order) {
        return this.isEquipmentRequired(order.serviceType) && 
               order.status !== 'completed' && 
               order.status !== 'cancelled';
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (!document.hidden) {
            this.loadServiceOrders();
        }
    }

    /**
     * Refresh data periodically
     */
    startPeriodicRefresh() {
        setInterval(() => {
            if (!document.hidden) {
                this.loadServiceOrders();
            }
        }, 30000); // Refresh every 30 seconds
    }

    /**
     * Initialize responsive design handlers
     */
    initializeResponsive() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleResponsive = (e) => {
            if (e.matches) {
                this.enableMobileMode();
            } else {
                this.enableDesktopMode();
            }
        };

        mediaQuery.addListener(handleResponsive);
        handleResponsive(mediaQuery);
    }

    /**
     * Enable mobile-friendly interface
     */
    enableMobileMode() {
        const table = document.getElementById('ordersTable');
        if (table) {
            table.classList.add('mobile-table');
        }
    }

    /**
     * Enable desktop interface
     */
    enableDesktopMode() {
        const table = document.getElementById('ordersTable');
        if (table) {
            table.classList.remove('mobile-table');
        }
    }

    /**
     * Get current view state
     * @returns {Object} Current view state
     */
    getViewState() {
        return {
            currentView: this.currentView,
            filters: this.filters,
            sortBy: this.sortBy,
            sortDirection: this.sortDirection,
            selectedEquipment: this.selectedEquipment
        };
    }

    /**
     * Set view state
     * @param {Object} state - View state to restore
     */
    setViewState(state) {
        this.currentView = state.currentView || 'list';
        this.filters = state.filters || {};
        this.sortBy = state.sortBy || 'createdAt';
        this.sortDirection = state.sortDirection || 'desc';
        this.selectedEquipment = state.selectedEquipment || [];
        
        this.loadServiceOrders();
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: New order
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.showAddOrderModal();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                this.hideModal(activeModal.id);
            }
        }
    }

    /**
     * Initialize keyboard shortcuts
     */
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Cleanup resources
     */
    destroy() {
        document.removeEventListener('orderCreated', this.handleOrderCreated);
        document.removeEventListener('orderUpdated', this.handleOrderUpdated);
        document.removeEventListener('equipmentRecommendations', this.showEquipmentRecommendations);
        console.log('Service Orders UI Controller destroyed');
    }
}

// Create and initialize UI controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ServiceOrdersUI = new ServiceOrdersUI();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceOrdersUI;
}