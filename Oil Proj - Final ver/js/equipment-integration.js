/**
 * Equipment Integration Module
 * Handles communication between service orders and equipment modules
 * Manages equipment availability, status synchronization, and automatic maintenance orders
 */

class EquipmentIntegration {
    constructor() {
        this.equipmentData = new Map();
        this.equipmentStatus = {
            READY: 'ready',
            IN_USE: 'in_use',
            UNDER_INSPECTION: 'under_inspection',
            DAMAGE: 'damage',
            OUT_OF_SERVICE: 'out_of_service'
        };
        this.maintenanceThresholds = {
            usage_hours: 100,
            days_since_maintenance: 30,
            issue_count: 3
        };
        this.init();
    }

    /**
     * Initialize the integration module
     */
    init() {
        this.loadEquipmentData();
        this.setupEventListeners();
        this.startPeriodicChecks();
        console.log('Equipment Integration Module initialized');
    }

    /**
     * Load equipment data from the equipment module
     */
    loadEquipmentData() {
        // Sample equipment data based on the images shown
        const sampleEquipment = [
            {
                id: 1,
                sku: '10000',
                name: '9 5/8" Rotary hand sifter',
                type: 'rotary_hand_sifter',
                totalQuantity: 20,
                availableQuantity: 8,
                inUseQuantity: 12,
                status: this.equipmentStatus.READY,
                lastMaintenanceDate: '2025-08-15',
                usageHours: 45,
                issueCount: 0,
                components: [
                    { name: 'Slip Body', quantity: 4, uom: 'SHARING' },
                    { name: 'Slip Segments', quantity: 4, uom: 'SHARING' },
                    { name: 'Insert Teeth/Dies', quantity: 4, uom: 'SHARING' },
                    { name: 'Handles', quantity: 4, uom: 'SHARING' }
                ]
            },
            {
                id: 2,
                sku: '20000',
                name: '9 5/8" Rotary hand sifter',
                type: 'rotary_hand_sifter',
                totalQuantity: 20,
                availableQuantity: 20,
                inUseQuantity: 0,
                status: this.equipmentStatus.UNDER_INSPECTION,
                lastMaintenanceDate: '2025-07-20',
                usageHours: 85,
                issueCount: 1
            },
            {
                id: 3,
                sku: '30000',
                name: '9 5/8" Rotary hand sifter',
                type: 'rotary_hand_sifter',
                totalQuantity: 20,
                availableQuantity: 8,
                inUseQuantity: 12,
                status: this.equipmentStatus.DAMAGE,
                lastMaintenanceDate: '2025-06-10',
                usageHours: 120,
                issueCount: 2
            }
        ];

        sampleEquipment.forEach(equipment => {
            this.equipmentData.set(equipment.sku, equipment);
        });
    }

    /**
     * Setup event listeners for cross-module communication
     */
    setupEventListeners() {
        // Listen for service order events
        document.addEventListener('orderCreated', (event) => {
            this.handleOrderCreated(event.detail);
        });

        document.addEventListener('orderCompleted', (event) => {
            this.handleOrderCompleted(event.detail);
        });

        document.addEventListener('orderCancelled', (event) => {
            this.handleOrderCancelled(event.detail);
        });

        // Listen for equipment status changes from equipment module
        document.addEventListener('equipmentStatusChanged', (event) => {
            this.handleEquipmentStatusChanged(event.detail);
        });

        // Listen for equipment usage updates
        document.addEventListener('equipmentUsageUpdate', (event) => {
            this.handleEquipmentUsageUpdate(event.detail);
        });
    }

    /**
     * Check equipment availability for service order
     * @param {string} equipmentSku - Equipment SKU
     * @param {number} requiredQuantity - Required quantity
     * @returns {Object} Availability check result
     */
    checkEquipmentAvailability(equipmentSku, requiredQuantity = 1) {
        const equipment = this.equipmentData.get(equipmentSku);
        
        if (!equipment) {
            return {
                available: false,
                reason: 'Equipment not found',
                availableQuantity: 0
            };
        }

        if (equipment.status === this.equipmentStatus.DAMAGE || 
            equipment.status === this.equipmentStatus.OUT_OF_SERVICE) {
            return {
                available: false,
                reason: `Equipment is ${equipment.status}`,
                availableQuantity: 0
            };
        }

        if (equipment.availableQuantity < requiredQuantity) {
            return {
                available: false,
                reason: 'Insufficient quantity available',
                availableQuantity: equipment.availableQuantity,
                requiredQuantity: requiredQuantity
            };
        }

        return {
            available: true,
            availableQuantity: equipment.availableQuantity,
            equipment: equipment
        };
    }

    /**
     * Reserve equipment for a service order
     * @param {string} equipmentSku - Equipment SKU
     * @param {number} quantity - Quantity to reserve
     * @param {number} orderId - Service order ID
     * @returns {Object} Reservation result
     */
    reserveEquipment(equipmentSku, quantity, orderId) {
        const availability = this.checkEquipmentAvailability(equipmentSku, quantity);
        
        if (!availability.available) {
            return {
                success: false,
                error: availability.reason
            };
        }

        const equipment = this.equipmentData.get(equipmentSku);
        equipment.availableQuantity -= quantity;
        equipment.inUseQuantity += quantity;
        equipment.status = this.equipmentStatus.IN_USE;

        // Track the reservation
        if (!equipment.reservations) {
            equipment.reservations = [];
        }
        
        equipment.reservations.push({
            orderId: orderId,
            quantity: quantity,
            reservedAt: new Date().toISOString()
        });

        this.updateEquipmentInUI(equipment);
        
        return {
            success: true,
            equipment: equipment,
            message: `Reserved ${quantity} units of ${equipment.name}`
        };
    }

    /**
     * Release equipment from service order
     * @param {string} equipmentSku - Equipment SKU
     * @param {number} quantity - Quantity to release
     * @param {number} orderId - Service order ID
     * @returns {Object} Release result
     */
    releaseEquipment(equipmentSku, quantity, orderId) {
        const equipment = this.equipmentData.get(equipmentSku);
        
        if (!equipment) {
            return {
                success: false,
                error: 'Equipment not found'
            };
        }

        // Find and remove the reservation
        if (equipment.reservations) {
            const reservationIndex = equipment.reservations.findIndex(r => r.orderId === orderId);
            if (reservationIndex !== -1) {
                equipment.reservations.splice(reservationIndex, 1);
            }
        }

        equipment.availableQuantity += quantity;
        equipment.inUseQuantity -= quantity;
        
        // Update status if no longer in use
        if (equipment.inUseQuantity === 0) {
            equipment.status = this.equipmentStatus.READY;
        }

        // Update usage hours
        equipment.usageHours += 2; // Assume 2 hours per service

        this.updateEquipmentInUI(equipment);
        this.checkMaintenanceNeeded(equipment);
        
        return {
            success: true,
            equipment: equipment,
            message: `Released ${quantity} units of ${equipment.name}`
        };
    }

    /**
     * Get all available equipment for service orders
     * @param {string} serviceType - Optional service type filter
     * @returns {Array} Available equipment list
     */
    getAvailableEquipment(serviceType = null) {
        const availableEquipment = [];
        
        this.equipmentData.forEach(equipment => {
            if (equipment.availableQuantity > 0 && 
                equipment.status === this.equipmentStatus.READY) {
                
                // Filter by service type if specified
                if (!serviceType || this.isEquipmentSuitableForService(equipment, serviceType)) {
                    availableEquipment.push({
                        sku: equipment.sku,
                        name: equipment.name,
                        type: equipment.type,
                        availableQuantity: equipment.availableQuantity,
                        status: equipment.status
                    });
                }
            }
        });

        return availableEquipment;
    }

    /**
     * Check if equipment is suitable for service type
     * @param {Object} equipment - Equipment object
     * @param {string} serviceType - Service type
     * @returns {boolean} Is suitable
     */
    isEquipmentSuitableForService(equipment, serviceType) {
        const serviceEquipmentMap = {
            'maintenance': ['rotary_hand_sifter', 'slip_body', 'slip_segments'],
            'repair': ['rotary_hand_sifter', 'slip_body', 'insert_teeth'],
            'installation': ['rotary_hand_sifter', 'handles'],
            'cleaning': ['rotary_hand_sifter']
        };

        return serviceEquipmentMap[serviceType]?.includes(equipment.type) || false;
    }

    /**
     * Create automatic maintenance order for equipment
     * @param {Object} equipment - Equipment needing maintenance
     * @param {string} reason - Reason for maintenance
     * @returns {Object} Maintenance order creation result
     */
    createMaintenanceOrder(equipment, reason) {
        const maintenanceData = {
            customerId: 'INTERNAL_MAINTENANCE',
            customerName: 'Internal Maintenance Team',
            customerEmail: 'maintenance@company.com',
            customerPhone: '+1-555-MAINT',
            serviceType: 'maintenance',
            description: `Scheduled maintenance for ${equipment.name} (SKU: ${equipment.sku}) - ${reason}`,
            address: 'Equipment Storage Facility',
            scheduledDate: this.getNextMaintenanceSlot(),
            scheduledTime: '08:00',
            estimatedDuration: this.getMaintenanceDuration(equipment.type),
            cost: this.calculateMaintenanceCost(equipment.type),
            priority: this.getMaintenancePriority(reason),
            equipmentSku: equipment.sku,
            equipmentId: equipment.id
        };

        // Create the maintenance order via service orders module
        if (window.ServiceOrders) {
            const result = window.ServiceOrders.createOrder(maintenanceData);
            
            if (result.success) {
                // Update equipment status to under inspection
                this.updateEquipmentStatus(equipment.sku, this.equipmentStatus.UNDER_INSPECTION);
                
                this.dispatchEvent('maintenanceOrderCreated', {
                    order: result.order,
                    equipment: equipment,
                    reason: reason
                });
            }
            
            return result;
        }

        return {
            success: false,
            error: 'Service Orders module not available'
        };
    }

    /**
     * Check if equipment needs maintenance
     * @param {Object} equipment - Equipment to check
     * @returns {Object} Maintenance check result
     */
    checkMaintenanceNeeded(equipment) {
        const issues = [];
        
        // Check usage hours
        if (equipment.usageHours >= this.maintenanceThresholds.usage_hours) {
            issues.push('High usage hours detected');
        }

        // Check days since last maintenance
        const daysSinceMaintenance = this.getDaysSinceLastMaintenance(equipment.lastMaintenanceDate);
        if (daysSinceMaintenance >= this.maintenanceThresholds.days_since_maintenance) {
            issues.push('Overdue for scheduled maintenance');
        }

        // Check issue count
        if (equipment.issueCount >= this.maintenanceThresholds.issue_count) {
            issues.push('Multiple issues reported');
        }

        if (issues.length > 0) {
            console.log(`Maintenance needed for ${equipment.name}:`, issues);
            this.createMaintenanceOrder(equipment, issues.join(', '));
            
            return {
                maintenanceNeeded: true,
                issues: issues,
                equipment: equipment
            };
        }

        return {
            maintenanceNeeded: false,
            equipment: equipment
        };
    }

    /**
     * Update equipment status
     * @param {string} equipmentSku - Equipment SKU
     * @param {string} newStatus - New status
     * @param {string} reason - Reason for status change
     */
    updateEquipmentStatus(equipmentSku, newStatus, reason = '') {
        const equipment = this.equipmentData.get(equipmentSku);
        
        if (!equipment) {
            console.error('Equipment not found:', equipmentSku);
            return;
        }

        const oldStatus = equipment.status;
        equipment.status = newStatus;
        equipment.lastStatusUpdate = new Date().toISOString();
        
        if (reason) {
            if (!equipment.statusHistory) {
                equipment.statusHistory = [];
            }
            equipment.statusHistory.push({
                from: oldStatus,
                to: newStatus,
                reason: reason,
                timestamp: new Date().toISOString()
            });
        }

        // Update UI
        this.updateEquipmentInUI(equipment);

        // Notify other modules
        this.dispatchEvent('equipmentStatusChanged', {
            equipmentSku: equipmentSku,
            equipmentName: equipment.name,
            oldStatus: oldStatus,
            newStatus: newStatus,
            reason: reason,
            equipment: equipment
        });

        console.log(`Equipment ${equipmentSku} status changed: ${oldStatus} → ${newStatus}`);
    }

    /**
     * Handle service order creation
     * @param {Object} order - Created service order
     */
    handleOrderCreated(order) {
        // If this is an equipment-related order, check equipment requirements
        if (this.isEquipmentRequiredForService(order.serviceType)) {
            const recommendations = this.getEquipmentRecommendations(order);
            
            if (recommendations.length > 0) {
                this.dispatchEvent('equipmentRecommendations', {
                    orderId: order.id,
                    recommendations: recommendations
                });
            }
        }
    }

    /**
     * Handle service order completion
     * @param {Object} order - Completed service order
     */
    handleOrderCompleted(order) {
        // Release any assigned equipment
        if (order.assignedEquipment && order.assignedEquipment.length > 0) {
            order.assignedEquipment.forEach(equipmentItem => {
                this.releaseEquipment(equipmentItem.sku, equipmentItem.quantity, order.id);
            });
        }

        // Update equipment condition based on service type
        this.updateEquipmentCondition(order);
    }

    /**
     * Handle service order cancellation
     * @param {Object} eventData - Cancellation event data
     */
    handleOrderCancelled(eventData) {
        const { order } = eventData;
        
        // Release any reserved equipment
        if (order.assignedEquipment && order.assignedEquipment.length > 0) {
            order.assignedEquipment.forEach(equipmentItem => {
                this.releaseEquipment(equipmentItem.sku, equipmentItem.quantity, order.id);
            });
        }
    }

    /**
     * Handle equipment status changes from equipment module
     * @param {Object} eventData - Status change event data
     */
    handleEquipmentStatusChanged(eventData) {
        const { equipmentSku, newStatus, oldStatus } = eventData;
        
        // If equipment becomes unavailable, check for affected orders
        if (newStatus === this.equipmentStatus.DAMAGE || 
            newStatus === this.equipmentStatus.OUT_OF_SERVICE) {
            
            this.handleEquipmentUnavailable(equipmentSku, newStatus);
        }

        // If equipment becomes available again, notify relevant orders
        if (oldStatus !== this.equipmentStatus.READY && 
            newStatus === this.equipmentStatus.READY) {
            
            this.handleEquipmentAvailable(equipmentSku);
        }
    }

    /**
     * Handle equipment becoming unavailable
     * @param {string} equipmentSku - Equipment SKU
     * @param {string} status - New status
     */
    handleEquipmentUnavailable(equipmentSku, status) {
        // Find orders that might be affected
        if (window.ServiceOrders) {
            const activeOrders = window.ServiceOrders.getOrders({
                status: window.ServiceOrders.orderStatuses.CONFIRMED
            });

            const affectedOrders = activeOrders.filter(order => 
                order.assignedEquipment &&
                order.assignedEquipment.some(eq => eq.sku === equipmentSku)
            );

            affectedOrders.forEach(order => {
                this.notifyOrderAffectedByEquipment(order, equipmentSku, status);
            });
        }
    }

    /**
     * Handle equipment becoming available
     * @param {string} equipmentSku - Equipment SKU
     */
    handleEquipmentAvailable(equipmentSku) {
        // Notify waiting orders that equipment is now available
        this.dispatchEvent('equipmentAvailable', {
            equipmentSku: equipmentSku,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get equipment recommendations for service order
     * @param {Object} order - Service order
     * @returns {Array} Equipment recommendations
     */
    getEquipmentRecommendations(order) {
        const recommendations = [];
        
        // Get suitable equipment for the service type
        const suitableEquipment = this.getSuitableEquipment(order.serviceType);
        
        suitableEquipment.forEach(equipment => {
            const availability = this.checkEquipmentAvailability(equipment.sku, 1);
            
            recommendations.push({
                sku: equipment.sku,
                name: equipment.name,
                type: equipment.type,
                available: availability.available,
                availableQuantity: availability.availableQuantity,
                reason: availability.reason || 'Available for assignment',
                recommended: availability.available
            });
        });

        return recommendations.sort((a, b) => b.recommended - a.recommended);
    }

    /**
     * Get suitable equipment for service type
     * @param {string} serviceType - Service type
     * @returns {Array} Suitable equipment
     */
    getSuitableEquipment(serviceType) {
        const suitableEquipment = [];
        
        this.equipmentData.forEach(equipment => {
            if (this.isEquipmentSuitableForService(equipment, serviceType)) {
                suitableEquipment.push(equipment);
            }
        });

        return suitableEquipment;
    }

    /**
     * Check if equipment is required for service type
     * @param {string} serviceType - Service type
     * @returns {boolean} Is equipment required
     */
    isEquipmentRequiredForService(serviceType) {
        const equipmentRequiredServices = [
            'maintenance',
            'repair', 
            'installation',
            'cleaning'
        ];
        
        return equipmentRequiredServices.includes(serviceType);
    }

    /**
     * Update equipment condition after service
     * @param {Object} order - Completed service order
     */
    updateEquipmentCondition(order) {
        if (!order.assignedEquipment) return;

        order.assignedEquipment.forEach(equipmentItem => {
            const equipment = this.equipmentData.get(equipmentItem.sku);
            if (equipment) {
                // Update usage hours and check condition
                equipment.usageHours += order.estimatedDuration / 60;
                
                // If this was a repair order, reset issue count
                if (order.serviceType === 'repair') {
                    equipment.issueCount = 0;
                    equipment.lastMaintenanceDate = new Date().toISOString().split('T')[0];
                }
                
                this.checkMaintenanceNeeded(equipment);
            }
        });
    }

    /**
     * Get next available maintenance slot
     * @returns {string} Next maintenance date
     */
    getNextMaintenanceSlot() {
        const today = new Date();
        const nextSlot = new Date(today);
        
        // Find next available weekday (assuming maintenance is done Mon-Fri)
        while (nextSlot.getDay() === 0 || nextSlot.getDay() === 6) {
            nextSlot.setDate(nextSlot.getDate() + 1);
        }
        
        return nextSlot.toISOString().split('T')[0];
    }

    /**
     * Get maintenance duration based on equipment type
     * @param {string} equipmentType - Equipment type
     * @returns {number} Duration in minutes
     */
    getMaintenanceDuration(equipmentType) {
        const durations = {
            'rotary_hand_sifter': 180,
            'slip_body': 90,
            'slip_segments': 60,
            'insert_teeth': 45,
            'handles': 30
        };

        return durations[equipmentType] || 120;
    }

    /**
     * Calculate maintenance cost
     * @param {string} equipmentType - Equipment type
     * @returns {number} Maintenance cost
     */
    calculateMaintenanceCost(equipmentType) {
        const costs = {
            'rotary_hand_sifter': 200,
            'slip_body': 120,
            'slip_segments': 80,
            'insert_teeth': 60,
            'handles': 40
        };

        return costs[equipmentType] || 100;
    }

    /**
     * Get maintenance priority
     * @param {string} reason - Maintenance reason
     * @returns {string} Priority level
     */
    getMaintenancePriority(reason) {
        const urgentKeywords = ['damage', 'broken', 'safety', 'critical'];
        const highKeywords = ['multiple issues', 'overdue', 'high usage'];
        
        const reasonLower = reason.toLowerCase();
        
        if (urgentKeywords.some(keyword => reasonLower.includes(keyword))) {
            return 'urgent';
        } else if (highKeywords.some(keyword => reasonLower.includes(keyword))) {
            return 'high';
        }
        
        return 'medium';
    }

    /**
     * Get days since last maintenance
     * @param {string} lastMaintenanceDate - Last maintenance date
     * @returns {number} Days since maintenance
     */
    getDaysSinceLastMaintenance(lastMaintenanceDate) {
        if (!lastMaintenanceDate) return 999; // Very old
        
        const lastDate = new Date(lastMaintenanceDate);
        const today = new Date();
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    /**
     * Update equipment in UI
     * @param {Object} equipment - Updated equipment data
     */
    updateEquipmentInUI(equipment) {
        this.dispatchEvent('updateEquipmentUI', {
            equipment: equipment,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Notify order affected by equipment issues
     * @param {Object} order - Affected order
     * @param {string} equipmentSku - Equipment SKU
     * @param {string} status - Equipment status
     */
    notifyOrderAffectedByEquipment(order, equipmentSku, status) {
        this.dispatchEvent('orderAffectedByEquipment', {
            order: order,
            equipmentSku: equipmentSku,
            equipmentStatus: status,
            message: `Equipment ${equipmentSku} is ${status} - Order ${order.id} may be affected`
        });
    }

    /**
     * Start periodic maintenance checks
     */
    startPeriodicChecks() {
        // Check every hour for maintenance needs
        setInterval(() => {
            this.performMaintenanceChecks();
        }, 60 * 60 * 1000);

        // Initial check
        this.performMaintenanceChecks();
    }

    /**
     * Perform maintenance checks on all equipment
     */
    performMaintenanceChecks() {
        this.equipmentData.forEach(equipment => {
            this.checkMaintenanceNeeded(equipment);
        });
    }

    /**
     * Get equipment utilization statistics
     * @param {string} period - Period ('day', 'week', 'month')
     * @returns {Object} Utilization statistics
     */
    getEquipmentUtilization(period = 'month') {
        const stats = {
            period: period,
            totalEquipment: this.equipmentData.size,
            equipmentBreakdown: {},
            utilizationRate: 0,
            maintenanceOrders: 0
        };

        let totalCapacity = 0;
        let totalInUse = 0;

        this.equipmentData.forEach(equipment => {
            totalCapacity += equipment.totalQuantity;
            totalInUse += equipment.inUseQuantity;
            
            stats.equipmentBreakdown[equipment.status] = 
                (stats.equipmentBreakdown[equipment.status] || 0) + 1;
        });

        stats.utilizationRate = totalCapacity > 0 ? 
            ((totalInUse / totalCapacity) * 100).toFixed(1) : 0;

        return stats;
    }

    /**
     * Dispatch custom events
     * @param {string} eventType - Event type
     * @param {Object} eventData - Event data
     */
    dispatchEvent(eventType, eventData) {
        const event = new CustomEvent(eventType, {
            detail: eventData,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Get module status
     * @returns {Object} Module status
     */
    getStatus() {
        return {
            initialized: true,
            equipmentCount: this.equipmentData.size,
            availableEquipment: Array.from(this.equipmentData.values())
                .filter(eq => eq.status === this.equipmentStatus.READY).length,
            equipmentInUse: Array.from(this.equipmentData.values())
                .filter(eq => eq.status === this.equipmentStatus.IN_USE).length,
            equipmentNeedingMaintenance: Array.from(this.equipmentData.values())
                .filter(eq => eq.status === this.equipmentStatus.UNDER_INSPECTION || 
                             eq.status === this.equipmentStatus.DAMAGE).length
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.equipmentData.clear();
        document.removeEventListener('orderCreated', this.handleOrderCreated);
        document.removeEventListener('orderCompleted', this.handleOrderCompleted);
        document.removeEventListener('orderCancelled', this.handleOrderCancelled);
        console.log('Equipment Integration Module destroyed');
    }
}

// Create and export singleton instance
const equipmentIntegration = new EquipmentIntegration();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = equipmentIntegration;
}

// Global access
window.EquipmentIntegration = equipmentIntegration;