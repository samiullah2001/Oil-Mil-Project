// Navigation system

// Navigate to a page
function navigateTo(page) {
    console.log("Navigating to:", page);
    loadPage(page);
}

// Load content into #dynamic-content
function loadPage(page) {
    const dynamicContent = document.getElementById("dynamic-content");
    const dashboardContent = document.getElementById("dashboard-content");

    if (!dynamicContent || !dashboardContent) {
        console.error("dynamic-content or dashboard-content missing in DOM");
        return;
    }

    // Hide dashboard when not on dashboard page
    if (page === "dashboard") {
        dashboardContent.style.display = "block";
        dynamicContent.innerHTML = "";
        updateDashboardCounts();
        return;
    } else {
        dashboardContent.style.display = "none";
    }

    // Load module-specific page
    switch (page) {
        case "service-orders":
            loadServiceOrdersPage();
            break;
        case "employees":
            loadEmployeesPage();
            break;
        case "logistics":
            loadLogisticsPage();
            break;
        case "locations":
            loadLocationsPage();
            break;
        default:
            dynamicContent.innerHTML = `<p>Page not found: ${page}</p>`;
    }
}

// Load styles for a page
function loadPageStyles(page) {
    // Remove existing page-specific stylesheet
    const oldLink = document.getElementById("page-style");
    if (oldLink) oldLink.remove();

    // Add new stylesheet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `css/${page}.css`;
    link.id = "page-style";
    document.head.appendChild(link);
}

// Highlight active sidebar item
function highlightActiveMenu(page) {
    document.querySelectorAll("#sidebar li").forEach(li => {
        li.classList.remove("active");
        if (li.getAttribute("data-page") === page) {
            li.classList.add("active");
        }
    });
}

// Initialize navigation
document.addEventListener("DOMContentLoaded", () => {
    // Set up navigation event listeners
    document.querySelectorAll("#sidebar li").forEach(item => {
        item.addEventListener("click", function () {
            const page = this.getAttribute("data-page");
            highlightActiveMenu(page);
            navigateTo(page);
        });
    });

    // Default page: dashboard
    highlightActiveMenu("dashboard");
    navigateTo("dashboard");
});
