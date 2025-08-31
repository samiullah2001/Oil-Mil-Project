// Utility functions

// Show notification
function showNotification(message, type = 'success') {
    // Create notification if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Set background color based on type
    const colors = {
        'success': '#059669',
        'error': '#dc2626',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background-color: ${colors[type] || colors.info};
        animation: slideIn 0.3s ease;
    `;

    // Show notification
    notification.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Format date
function formatDate(date) {
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    };
    return new Date(date).toLocaleDateString('en-GB', options);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export to Excel (placeholder)
function exportToExcel(data, filename) {
    console.log('Export to Excel:', filename, data);
    showNotification('Excel export feature coming soon!', 'info');
    // In production, use SheetJS (xlsx) or similar library
}

// Import from Excel (placeholder)
function importFromExcel(file, callback) {
    console.log('Import from Excel:', file.name);
    showNotification('Excel import feature coming soon!', 'info');
    // In production, use SheetJS (xlsx) to parse Excel
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Sort array of objects
function sortBy(array, key, order = 'asc') {
    return array.sort((a, b) => {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });
}

// Filter array of objects
function filterBy(array, searchTerm, keys) {
    searchTerm = searchTerm.toLowerCase();
    return array.filter(item => {
        return keys.some(key => {
            const value = item[key];
            if (value) {
                return value.toString().toLowerCase().includes(searchTerm);
            }
            return false;
        });
    });
}
