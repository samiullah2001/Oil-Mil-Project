// navigation.js

(function () {
  console.log("Navigation module initializing...");

  // Define navigation items
  const NAV_ITEMS = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "service-orders", icon: "📋", label: "Service Orders" },
    { id: "employees", icon: "👥", label: "Employees" },
    { id: "logistics", icon: "🚛", label: "Logistics" },
    { id: "locations", icon: "📍", label: "Locations" },
    { id: "equipment", icon: "🔧", label: "Equipment" },
    { id: "reports", icon: "📊", label: "Reports" },
  ];

  let currentPage = null;

  // Build sidebar dynamically
  function buildSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) {
      console.error("Sidebar not found!");
      return;
    }

    let html = `
      <div class="nav-header">
        <div class="logo">
          <span class="logo-text">📦 Logistics</span>
        </div>
      </div>
      <ul class="nav-list">
    `;

    NAV_ITEMS.forEach((item) => {
      html += `
        <li class="nav-item">
          <a href="#" class="nav-link" data-page="${item.id}">
            <i class="nav-icon">${item.icon}</i>
            <span class="nav-text">${item.label}</span>
          </a>
        </li>
      `;
    });

    html += `</ul>`;
    sidebar.innerHTML = html;

    // Attach click listeners
    sidebar.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.getAttribute("data-page");
        if (!page) {
          console.warn("Clicked item has no data-page");
          return;
        }
        highlightActiveMenu(page);
        navigateTo(page);
      });
    });
  }

  // ✅ Keep base.css always loaded, swap page-specific CSS
  function loadPageStyles(page) {
    // Ensure base.css is always loaded
    if (!document.getElementById("base-style")) {
      const base = document.createElement("link");
      base.rel = "stylesheet";
      base.href = "css/base.css";
      base.id = "base-style";
      document.head.appendChild(base);
    }

    // Remove old page stylesheet if exists
    const oldPage = document.getElementById("page-style");
    if (oldPage) oldPage.remove();

    // Add current page-specific stylesheet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `css/${page}.css`;
    link.id = "page-style";
    document.head.appendChild(link);
  }

  // Navigate to a page
  function navigateTo(page) {
    console.log("Navigating to:", page);
    if (!page) return;
    currentPage = page;
    loadPage(page);
  }

  // Load page content into #main-content
  function loadPage(page) {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    // Load page-specific CSS
    loadPageStyles(page);

    if (page === "dashboard") {
      mainContent.innerHTML = `
        <div id="dashboard-content" class="page-content active">
          <div class="dashboard-overview">
            <div class="overview-card" onclick="navigateTo('service-orders')">
              <div class="card-icon">📋</div>
              <div class="card-title">Service Orders</div>
              <div class="card-count" id="serviceOrdersCount">0</div>
              <div class="card-description">Active service orders</div>
            </div>
            <div class="overview-card" onclick="navigateTo('employees')">
              <div class="card-icon">👥</div>
              <div class="card-title">Employees</div>
              <div class="card-count" id="employeesCount">0</div>
              <div class="card-description">Total employees</div>
            </div>
            <div class="overview-card" onclick="navigateTo('logistics')">
              <div class="card-icon">🚛</div>
              <div class="card-title">Logistics</div>
              <div class="card-count" id="logisticsCount">0</div>
              <div class="card-description">Logistics entries</div>
            </div>
            <div class="overview-card" onclick="navigateTo('locations')">
              <div class="card-icon">📍</div>
              <div class="card-title">Locations</div>
              <div class="card-count" id="locationsCount">0</div>
              <div class="card-description">Registered locations</div>
            </div>
            <div class="overview-card" onclick="navigateTo('equipment')">
              <div class="card-icon">🔧</div>
              <div class="card-title">Equipment</div>
              <div class="card-count" id="equipmentCount">0</div>
              <div class="card-description">Equipment Page</div>
            </div>
          </div>
        </div>
      `;
      if (typeof updateDashboardCounts === "function") {
        updateDashboardCounts();
      }
      return;
    }

    // Show loading spinner
    mainContent.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Loading ${page}...</p>
      </div>
    `;

    // Call correct page loader
    switch (page) {
      case "service-orders":
        if (typeof loadServiceOrdersPage === "function") {
          loadServiceOrdersPage(mainContent);
        }
        break;
      case "employees":
        if (typeof loadEmployeesPage === "function") {
          loadEmployeesPage(mainContent);
        }
        break;
      case "logistics":
        if (typeof loadLogisticsPage === "function") {
          loadLogisticsPage(mainContent);
        }
        break;
      case "locations":
        if (typeof loadLocationsPage === "function") {
          loadLocationsPage(mainContent);
        }
        break;
      case "equipment":
        if (window.EquipmentPage) {
        window.EquipmentPage.loadEquipmentPage();
        } 
        else {
            console.error("EquipmentPage not loaded!");
        }
        break;
      case "reports":
        mainContent.innerHTML = `
          <div class="module-not-available">
            <div class="error-icon">📊</div>
            <h2>Reports</h2>
            <p>This module is not available yet.</p>
          </div>
        `;
        break;
      default:
        mainContent.innerHTML = `<p>Page not found: ${page}</p>`;
    }
  }

  // Highlight active menu item
  function highlightActiveMenu(page) {
    document.querySelectorAll("#sidebar .nav-link").forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("data-page") === page) {
        link.classList.add("active");
      }
    });
  }

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    buildSidebar();
    highlightActiveMenu("dashboard");
    navigateTo("dashboard");

    // Signal module loaded
    window.dispatchEvent(
      new CustomEvent("moduleLoaded", { detail: { module: "navigation" } })
    );
  });

  // Expose globally
  window.navigateTo = navigateTo;
})();
