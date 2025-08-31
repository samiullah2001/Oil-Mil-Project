// Global application state
const AppState = {
    currentPage: 'dashboard',
    data: {
        serviceOrders: [],
        employees: [],
        logistics: [],
        locations: []
    }
};

// Page configurations
const PageConfig = {
    'dashboard': {
        title: 'Dashboard',
        template: 'dashboard-overview'
    },
    'service-orders': {
        title: 'Service Order',
        template: 'service-orders',
        cssFile: 'service-orders.css',
        jsFile: 'service-orders.js'
    },
    'employees': {
        title: 'Employee',
        template: 'employees',
        cssFile: 'employees.css',
        jsFile: 'employees.js'
    },
    'logistics': {
        title: 'Logistics',
        template: 'logistics',
        cssFile: 'logistics.css',
        jsFile: 'logistics.js'
    },
    'locations': {
        title: 'Locations',
        template: 'locations',
        cssFile: 'locations.css',
        jsFile: 'locations.js'
    },
    'inventory': {
        title: 'Inventory',
        template: 'inventory'
    },
    'delivery': {
        title: 'Delivery',
        template: 'delivery'
    },
    'warehouse': {
        title: 'Warehouse',
        template: 'warehouse'
    },
    'processes': {
        title: 'Key Processes',
        template: 'processes'
    },
    'reports': {
        title: 'Reports',
        template: 'reports'
    }
};

// Initialize sample data
function initializeSampleData() {
    // Service Orders
    AppState.data.serviceOrders = [
        {
            id: 1,
            sho: "00001",
            vendorName: "Aramco",
            address: "T-506, Tower Building P.O. Box, 09934 Dhahran 31311 Saudi Arabia",
            date: "14 June 2025",
            type: "Oil & Gas",
            status: "On Process"
        },
        {
            id: 2,
            sho: "00002",
            vendorName: "Aramco",
            address: "T-506, Tower Building P.O. Box, 09934 Dhahran 31311 Saudi Arabia",
            date: "14 June 2025",
            type: "Oil & Gas",
            status: "Completed"
        }
    ];

    // Employees
    AppState.data.employees = [
        {
            id: 1,
            employeeId: "EMP001",
            firstName: "John",
            lastName: "Pork",
            position: "Senior Engineer",
            department: "Engineering",
            salary: 85000,
            email: "john.pork@logistics.com",
            phone: "+1234567890",
            employmentStatus: "Active",
            imageUrl: null
        },
        {
            id: 2,
            employeeId: "EMP002",
            firstName: "Melanie",
            lastName: "David",
            position: "Project Manager",
            department: "Operations",
            salary: 75000,
            email: "melanie.david@logistics.com",
            phone: "+1234567892",
            employmentStatus: "Active",
            imageUrl: null
        }
    ];

    // Logistics
    AppState.data.logistics = [
        {
            id: 1,
            sho: "00001",
            vendorName: "Aramco",
            deliverFrom: "Office Address",
            deliverTo: "Location Address",
            companyName: "ABC Logistics",
            status: "On Process"
        }
    ];

    // Locations
    AppState.data.locations = [
        {
            id: 1,
            locationDescription: "Al-Ahsa gathering point",
            location: "25.363472:1.40",
            wellNo: "Hufr Batin",
            nextLocation: "NB",
            group: "A",
            drivingRoute: "2.30hr m233km",
            network: "Good"
        }
    ];
}

// Update dashboard counts
function updateDashboardCounts() {
    document.getElementById('serviceOrdersCount').textContent = AppState.data.serviceOrders.length;
    document.getElementById('employeesCount').textContent = AppState.data.employees.length;
    document.getElementById('logisticsCount').textContent = AppState.data.logistics.length;
    document.getElementById('locationsCount').textContent = AppState.data.locations.length;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    updateDashboardCounts();
    
    // Set up navigation event listeners
    document.querySelectorAll('[data-page]').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            navigateTo(page);
        });
    });

    // Set dashboard as default active page
    navigateTo('dashboard');

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
});