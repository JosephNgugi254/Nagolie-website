// Updated admin-script.js
// Admin Dashboard JavaScript

let currentUser = null;
const bootstrap = window.bootstrap; // Declare bootstrap variable

// Function declarations
function showAlert(type, message) {
  const alertContainer = document.getElementById("alertContainer");
  const alertElement = document.createElement("div");
  alertElement.classList.add("alert", `alert-${type}`);
  alertElement.textContent = message;
  alertContainer.appendChild(alertElement);

  setTimeout(() => {
    alertContainer.removeChild(alertElement);
  }, 3000);
}

function updateCurrentDate() {
  const currentDateElement = document.getElementById("currentDate");
  if (currentDateElement) {
    currentDateElement.textContent = new Date().toLocaleDateString();
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KES",
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function calculateDaysRemaining(expectedDate) {
  const today = new Date();
  const expected = new Date(expectedDate);
  const difference = expected - today;
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function loadGallery() {
  console.log("Public gallery updated with latest livestock data");
}

// Initialize admin dashboard
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  setupAdminEventListeners();
  syncGlobalData(); // Sync data from global scope on load
});

// Check authentication status
function checkAuthStatus() {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
  if (isLoggedIn) {
    showDashboard();
    loadDashboardData();
  } else {
    showLoginModal();
  }
}

// Show login modal
function showLoginModal() {
  const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
  loginModal.show();
}

// Setup admin event listeners
function setupAdminEventListeners() {
  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin);

  // Search and filter functionality
  document.getElementById("clientSearch")?.addEventListener("input", filterClients);
  document.getElementById("clientFilter")?.addEventListener("change", filterClients);
  document.getElementById("dueDateFilter")?.addEventListener("change", filterClients);
  document.getElementById("transactionSearch")?.addEventListener("input", filterTransactions);
  document.getElementById("transactionDateFilter")?.addEventListener("change", filterTransactions);

  // Payment form
  document.getElementById("paymentForm")?.addEventListener("submit", handlePayment);

  // Add livestock form
  document.getElementById("addLivestockForm")?.addEventListener("submit", handleAddLivestock);
}

// Sync data from global scope
function syncGlobalData() {
  if (typeof window.clients !== 'undefined') clients = window.clients;
  if (typeof window.transactions !== 'undefined') transactions = window.transactions;
  if (typeof window.applications !== 'undefined') applications = window.applications;
  if (typeof window.livestockGallery !== 'undefined') livestockGallery = window.livestockGallery;
}

// Handle login
function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Simple authentication (in production, use proper authentication)
  if (username === "admin" && password === "admin123") {
    sessionStorage.setItem("adminLoggedIn", "true");
    currentUser = { username: "admin", role: "admin" };

    const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
    loginModal.hide();

    showDashboard();
    loadDashboardData();
    showAlert("success", "Login successful!");
  } else {
    showAlert("danger", "Invalid credentials. Use admin/admin123");
  }
}

// Show dashboard
function showDashboard() {
  document.getElementById("adminDashboard").style.display = "block";
  updateCurrentDate();
}

// Logout
function logout() {
  sessionStorage.removeItem("adminLoggedIn");
  currentUser = null;
  location.href = 'index.html';
}

// Show section
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll(".content-section").forEach((section) => {
    section.style.display = "none";
  });

  // Show selected section
  document.getElementById(`${sectionName}-section`).style.display = "block";

  // Update navigation
  document.querySelectorAll(".sidebar .nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  event.target.classList.add("active");

  // Load section-specific data
  switch (sectionName) {
    case "overview":
      loadOverviewData();
      break;
    case "clients":
      loadClientsData();
      break;
    case "transactions":
      loadTransactionsData();
      break;
    case "gallery":
      loadAdminGalleryData();
      break;
    case "applications":
      loadApplicationsData();
      break;
  }
}

// Load dashboard data
function loadDashboardData() {
  syncGlobalData(); // Sync data before loading
  loadOverviewData();
  loadClientsData();
  loadTransactionsData();
  loadAdminGalleryData();
  loadApplicationsData();
  updateApplicationBadge();
}

// Update application badge
function updateApplicationBadge() {
  const badge = document.getElementById('applicationBadge');
  if (badge) {
    const pendingCount = applications.filter(app => app.status === 'pending').length;
    badge.textContent = pendingCount > 0 ? pendingCount : '';
    badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
  }
}

// Load overview data
function loadOverviewData() {
  const totalClients = clients.length;
  const totalLent = clients.reduce((sum, client) => sum + Number(client.borrowedAmount || 0), 0);
  const totalReceived = clients.reduce((sum, client) => sum + Number(client.amountPaid || 0), 0);
  const totalRevenue = totalReceived - totalLent;

  document.getElementById("totalClients").textContent = totalClients;
  document.getElementById("totalLent").textContent = formatCurrency(totalLent);
  document.getElementById("totalReceived").textContent = formatCurrency(totalReceived);
  document.getElementById("totalRevenue").textContent = formatCurrency(totalRevenue);

  // Load due today and overdue
  loadDueToday();
  loadOverdueLoans();
}

// Load due today
function loadDueToday() {
  const today = new Date();
  const dueToday = clients.filter((client) => {
    const dueDate = new Date(client.expectedReturnDate);
    return dueDate.toDateString() === today.toDateString() && client.status === "active";
  });

  const container = document.getElementById("dueToday");
  if (dueToday.length === 0) {
    container.innerHTML = '<p class="text-muted">No loans due today</p>';
    return;
  }

  container.innerHTML = dueToday
    .map((client) => `
      <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
          <div>
              <strong>${client.name}</strong><br>
              <small class="text-muted">${formatCurrency((client.borrowedAmount || 0) * 1.3 - (client.amountPaid || 0))} remaining</small>
          </div>
          <button class="btn btn-sm btn-primary" onclick="openPaymentModal(${client.id})">
              Process Payment
          </button>
      </div>
    `)
    .join("");
}

// Load overdue loans
function loadOverdueLoans() {
  const today = new Date();
  const overdue = clients.filter((client) => {
    const dueDate = new Date(client.expectedReturnDate);
    return dueDate < today && client.status === "active";
  });

  const container = document.getElementById("overdueLoans");
  if (overdue.length === 0) {
    container.innerHTML = '<p class="text-muted">No overdue loans</p>';
    return;
  }

  container.innerHTML = overdue
    .map((client) => {
      const daysOverdue = Math.abs(calculateDaysRemaining(client.expectedReturnDate));
      return `
          <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-danger bg-opacity-10 rounded">
              <div>
                  <strong>${client.name}</strong><br>
                  <small class="text-danger">${daysOverdue} days overdue</small>
              </div>
              <button class="btn btn-sm btn-danger" onclick="handleDefaultedLoan(${client.id})">
                  Take Action
              </button>
          </div>
      `;
    })
    .join("");
}

// Load clients data
function loadClientsData() {
  const tbody = document.getElementById("clientsTable");
  if (!tbody) return;

  tbody.innerHTML = clients
    .map((client) => {
      const expectedAmount = (client.borrowedAmount || 0) * 1.3; // 30% interest
      const balance = expectedAmount - (client.amountPaid || 0);
      const daysRemaining = calculateDaysRemaining(client.expectedReturnDate);

      let daysDisplay = "";
      if (daysRemaining > 0) {
        daysDisplay = `<span class="days-counter positive">${daysRemaining} days left</span>`;
      } else if (daysRemaining === 0) {
        daysDisplay = `<span class="days-counter zero">Due today</span>`;
      } else {
        daysDisplay = `<span class="days-counter negative">${Math.abs(daysRemaining)} days overdue</span>`;
      }

      return `
          <tr>
              <td>${client.name || 'N/A'}</td>
              <td>${client.phone || 'N/A'}</td>
              <td>${client.idNumber || 'N/A'}</td>
              <td>${formatDate(client.borrowedDate)}</td>
              <td>${formatCurrency(client.borrowedAmount)}</td>
              <td>${formatDate(client.expectedReturnDate)}</td>
              <td>${formatCurrency(client.amountPaid)}</td>
              <td>${formatCurrency(balance)}</td>
              <td>${daysDisplay}</td>
              <td>
                  <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" onclick="openPaymentModal(${client.id})">
                          <i class="fas fa-money-bill-wave"></i>
                      </button>
                      <button class="btn btn-outline-info" onclick="downloadReceipt(${client.id})">
                          <i class="fas fa-download"></i>
                      </button>
                      <button class="btn btn-outline-success" onclick="sendMpesaPromptDirect(${client.id})">
                          <i class="fas fa-mobile-alt"></i>
                      </button>
                  </div>
              </td>
          </tr>
      `;
    })
    .join("");
}

// Filter clients
function filterClients() {
  const searchTerm = document.getElementById("clientSearch").value.toLowerCase();
  const filterValue = document.getElementById("clientFilter").value;
  const dueDateValue = document.getElementById("dueDateFilter").value;

  let filteredClients = clients;

  // Apply search filter
  if (searchTerm) {
    filteredClients = filteredClients.filter(
      (client) =>
        (client.name || '').toLowerCase().includes(searchTerm) ||
        (client.phone || '').includes(searchTerm) ||
        (client.idNumber || '').includes(searchTerm),
    );
  }

  // Apply status filter
  if (filterValue) {
    const today = new Date();
    filteredClients = filteredClients.filter((client) => {
      switch (filterValue) {
        case "active":
          return client.status === "active";
        case "due-today":
          const dueDate = new Date(client.expectedReturnDate);
          return dueDate.toDateString() === today.toDateString() && client.status === "active";
        case "overdue":
          return new Date(client.expectedReturnDate) < today && client.status === "active";
        case "completed":
          return client.status === "completed";
        default:
          return true;
      }
    });
  }

  // Apply due date filter
  if (dueDateValue) {
    const selectedDueDate = new Date(dueDateValue);
    filteredClients = filteredClients.filter((client) => {
      const clientDueDate = new Date(client.expectedReturnDate);
      return clientDueDate.toDateString() === selectedDueDate.toDateString();
    });
  }

  // Update table with filtered data
  const tbody = document.getElementById("clientsTable");
  tbody.innerHTML = filteredClients
    .map((client) => {
      const expectedAmount = (client.borrowedAmount || 0) * 1.3;
      const balance = expectedAmount - (client.amountPaid || 0);
      const daysRemaining = calculateDaysRemaining(client.expectedReturnDate);

      let daysDisplay = "";
      if (daysRemaining > 0) {
        daysDisplay = `<span class="days-counter positive">${daysRemaining} days left</span>`;
      } else if (daysRemaining === 0) {
        daysDisplay = `<span class="days-counter zero">Due today</span>`;
      } else {
        daysDisplay = `<span class="days-counter negative">${Math.abs(daysRemaining)} days overdue</span>`;
      }

      return `
          <tr>
              <td>${client.name || 'N/A'}</td>
              <td>${client.phone || 'N/A'}</td>
              <td>${client.idNumber || 'N/A'}</td>
              <td>${formatDate(client.borrowedDate)}</td>
              <td>${formatCurrency(client.borrowedAmount)}</td>
              <td>${formatDate(client.expectedReturnDate)}</td>
              <td>${formatCurrency(client.amountPaid)}</td>
              <td>${formatCurrency(balance)}</td>
              <td>${daysDisplay}</td>
              <td>
                  <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" onclick="openPaymentModal(${client.id})">
                          <i class="fas fa-money-bill-wave"></i>
                      </button>
                      <button class="btn btn-outline-info" onclick="downloadReceipt(${client.id})">
                          <i class="fas fa-download"></i>
                      </button>
                      <button class="btn btn-outline-success" onclick="sendMpesaPromptDirect(${client.id})">
                          <i class="fas fa-mobile-alt"></i>
                      </button>
                  </div>
              </td>
          </tr>
      `;
    })
    .join("");
}

// Open payment modal
function openPaymentModal(clientId) {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return;

  const expectedAmount = (client.borrowedAmount || 0) * 1.3;
  const balance = expectedAmount - (client.amountPaid || 0);

  document.getElementById("paymentClientId").value = clientId;
  document.getElementById("paymentClientName").value = client.name || 'N/A';
  document.getElementById("paymentCurrentBalance").value = formatCurrency(balance);
  document.getElementById("paymentAmount").value = "";

  const paymentModal = new bootstrap.Modal(document.getElementById("paymentModal"));
  paymentModal.show();
}

// Handle payment
function handlePayment(e) {
  e.preventDefault();

  const clientId = Number.parseInt(document.getElementById("paymentClientId").value);
  const paymentAmount = Number.parseFloat(document.getElementById("paymentAmount").value);
  const paymentMethod = document.getElementById("paymentMethod").value;

  const client = clients.find((c) => c.id === clientId);
  if (!client) return;

  // Update client payment
  client.amountPaid = (client.amountPaid || 0) + paymentAmount;

  // Check if loan is fully paid
  const expectedAmount = (client.borrowedAmount || 0) * 1.3;
  if (client.amountPaid >= expectedAmount) {
    client.status = "completed";
  }

  // Add transaction record
  const transaction = {
    id: transactions.length + 1,
    clientId: clientId,
    clientName: client.name,
    type: "payment",
    amount: paymentAmount,
    method: paymentMethod,
    date: new Date(),
    status: "completed",
  };
  transactions.push(transaction);
  window.transactions = transactions; // Sync with global scope

  // Close modal and refresh data
  const paymentModal = bootstrap.Modal.getInstance(document.getElementById("paymentModal"));
  paymentModal.hide();

  loadDashboardData();
  showAlert("success", `Payment of ${formatCurrency(paymentAmount)} processed successfully!`);
}

// Send M-Pesa prompt
function sendMpesaPrompt() {
  const clientId = Number.parseInt(document.getElementById("paymentClientId").value);
  const paymentAmount = Number.parseFloat(document.getElementById("paymentAmount").value);

  if (!paymentAmount) {
    showAlert("danger", "Please enter payment amount first");
    return;
  }

  const client = clients.find((c) => c.id === clientId);
  if (!client) return;

  // Simulate M-Pesa prompt (in real implementation, integrate with M-Pesa API)
  showAlert("info", `M-Pesa prompt sent to ${client.phone} for ${formatCurrency(paymentAmount)}`);

  // Simulate successful payment after 3 seconds
  setTimeout(() => {
    client.amountPaid = (client.amountPaid || 0) + paymentAmount;
    window.clients = clients; // Sync with global scope

    const expectedAmount = (client.borrowedAmount || 0) * 1.3;
    if (client.amountPaid >= expectedAmount) {
      client.status = "completed";
    }

    const transaction = {
      id: transactions.length + 1,
      clientId: clientId,
      clientName: client.name,
      type: "payment",
      amount: paymentAmount,
      method: "mpesa",
      date: new Date(),
      status: "completed",
    };
    transactions.push(transaction);
    window.transactions = transactions; // Sync with global scope

    const paymentModal = bootstrap.Modal.getInstance(document.getElementById("paymentModal"));
    paymentModal.hide();

    loadDashboardData();
    showAlert("success", `M-Pesa payment of ${formatCurrency(paymentAmount)} received successfully!`);
  }, 3000);
}

// Send M-Pesa prompt directly
function sendMpesaPromptDirect(clientId) {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return;

  const expectedAmount = (client.borrowedAmount || 0) * 1.3;
  const balance = expectedAmount - (client.amountPaid || 0);

  const amount = prompt(
    `Send M-Pesa prompt to ${client.name}\nCurrent balance: ${formatCurrency(balance)}\n\nEnter amount:`,
  );

  if (amount && !isNaN(amount) && Number.parseFloat(amount) > 0) {
    showAlert("info", `M-Pesa prompt sent to ${client.phone} for ${formatCurrency(Number.parseFloat(amount))}`);

    // Simulate successful payment
    setTimeout(() => {
      client.amountPaid = (client.amountPaid || 0) + Number.parseFloat(amount);
      window.clients = clients; // Sync with global scope

      if (client.amountPaid >= expectedAmount) {
        client.status = "completed";
      }

      const transaction = {
        id: transactions.length + 1,
        clientId: clientId,
        clientName: client.name,
        type: "payment",
        amount: Number.parseFloat(amount),
        method: "mpesa",
        date: new Date(),
        status: "completed",
      };
      transactions.push(transaction);
      window.transactions = transactions; // Sync with global scope

      loadDashboardData();
      showAlert("success", `M-Pesa payment of ${formatCurrency(Number.parseFloat(amount))} received!`);
    }, 3000);
  }
}

// Load transactions data
function loadTransactionsData() {
  const tbody = document.getElementById("transactionsTable");
  if (!tbody) return;

  tbody.innerHTML = transactions
    .map((transaction) => `
      <tr>
          <td>${formatDate(transaction.date)}</td>
          <td>${transaction.clientName}</td>
          <td>
              <span class="badge ${transaction.type === "loan" ? "bg-primary" : "bg-success"}">
                  ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </span>
          </td>
          <td>${formatCurrency(transaction.amount)}</td>
          <td>
              <span class="badge ${transaction.method === "mpesa" ? "bg-info" : "bg-secondary"}">
                  ${transaction.method.toUpperCase()}
              </span>
          </td>
          <td>
              <span class="badge bg-success">${transaction.status}</span>
          </td>
          <td>
              <button class="btn btn-sm btn-outline-info" onclick="downloadTransactionReceipt(${transaction.id})">
                  <i class="fas fa-download"></i>
              </button>
          </td>
      </tr>
    `)
    .join("");
}

// Filter transactions
function filterTransactions() {
  const searchTerm = document.getElementById("transactionSearch").value.toLowerCase();
  const dateFilter = document.getElementById("transactionDateFilter").value;

  let filteredTransactions = transactions;

  if (searchTerm) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) =>
        transaction.clientName.toLowerCase().includes(searchTerm) ||
        transaction.type.toLowerCase().includes(searchTerm) ||
        transaction.method.toLowerCase().includes(searchTerm),
    );
  }

  if (dateFilter) {
    const filterDate = new Date(dateFilter);
    filteredTransactions = filteredTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.toDateString() === filterDate.toDateString();
    });
  }

  // Update table with filtered data
  const tbody = document.getElementById("transactionsTable");
  tbody.innerHTML = filteredTransactions
    .map((transaction) => `
      <tr>
          <td>${formatDate(transaction.date)}</td>
          <td>${transaction.clientName}</td>
          <td>
              <span class="badge ${transaction.type === "loan" ? "bg-primary" : "bg-success"}">
                  ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </span>
          </td>
          <td>${formatCurrency(transaction.amount)}</td>
          <td>
              <span class="badge ${transaction.method === "mpesa" ? "bg-info" : "bg-secondary"}">
                  ${transaction.method.toUpperCase()}
              </span>
          </td>
          <td>
              <span class="badge bg-success">${transaction.status}</span>
          </td>
          <td>
              <button class="btn btn-sm btn-outline-info" onclick="downloadTransactionReceipt(${transaction.id})">
                  <i class="fas fa-download"></i>
              </button>
          </td>
      </tr>
    `)
    .join("");
}

// Load admin gallery data
function loadAdminGalleryData() {
  const container = document.getElementById("adminGallery");
  if (!container) return;

  container.innerHTML = livestockGallery
    .map((item) => `
      <div class="col-md-6 col-lg-4 gallery-item">
          <div class="card gallery-card">
              <img src="${item.images[0]}" class="card-img-top" alt="${item.title}">
              <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                  <p class="card-text">${item.description}</p>
                  <div class="d-flex justify-content-between align-items-center">
                      <span class="h6 text-primary">${formatCurrency(item.price)}</span>
                      <span class="badge bg-warning">${item.daysRemaining} days left</span>
                  </div>
                  <div class="mt-2">
                      <button class="btn btn-sm btn-outline-primary" onclick="editLivestock(${item.id})">
                          <i class="fas fa-edit"></i> Edit
                      </button>
                      <button class="btn btn-sm btn-outline-danger" onclick="deleteLivestock(${item.id})">
                          <i class="fas fa-trash"></i> Delete
                      </button>
                  </div>
              </div>
          </div>
      </div>
    `)
    .join("");
}

// Show add livestock modal
function showAddLivestockModal() {
  const modal = new bootstrap.Modal(document.getElementById("addLivestockModal"));
  modal.show();
}

// Handle add livestock
function handleAddLivestock(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const availableDate = new Date(document.getElementById("availableDate").value);
  const daysRemaining = calculateDaysRemaining(availableDate);

  const newLivestock = {
    id: livestockGallery.length + 1,
    title: document.getElementById("livestockTitle").value,
    type: document.getElementById("livestockTypeGallery").value,
    price: Number.parseInt(document.getElementById("livestockPrice").value) || 0,
    availableDate: availableDate,
    description: document.getElementById("livestockDescription").value,
    images: [
      `/placeholder.svg?height=300&width=400&query=${document.getElementById("livestockTypeGallery").value} livestock`,
    ],
    daysRemaining: daysRemaining,
  };

  livestockGallery.push(newLivestock);
  window.livestockGallery = livestockGallery; // Sync with global scope

  const modal = bootstrap.Modal.getInstance(document.getElementById("addLivestockModal"));
  modal.hide();

  loadAdminGalleryData();
  loadGallery(); // Update public gallery
  showAlert("success", "Livestock added to gallery successfully!");

  e.target.reset();
}

// Load applications data
function loadApplicationsData() {
  const tbody = document.getElementById("applicationsTable");
  if (!tbody) return;

  syncGlobalData(); // Sync data before loading

  tbody.innerHTML = applications
    .map((app) => `
      <tr class="${app.status === 'pending' ? 'tr-pending' : ''}">
          <td>${formatDate(app.date)}</td>
          <td>${app.name || 'N/A'}</td>
          <td>${app.phone || 'N/A'}</td>
          <td>${formatCurrency(app.loanAmount)}</td>
          <td>${app.livestockCount || 'N/A'} ${app.livestockType || 'N/A'}</td>
          <td>
              <span class="badge ${app.status === "pending" ? "bg-warning" : app.status === "approved" ? "bg-success" : "bg-danger"}">
                  ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </span>
          </td>
          <td>
              <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-success" onclick="approveApplication(${app.id})">
                      <i class="fas fa-check"></i>
                  </button>
                  <button class="btn btn-outline-danger" onclick="rejectApplication(${app.id})">
                      <i class="fas fa-times"></i>
                  </button>
                  <button class="btn btn-outline-info" onclick="viewApplication(${app.id})">
                      <i class="fas fa-eye"></i>
                  </button>
              </div>
          </td>
      </tr>
    `)
    .join("");
  updateApplicationBadge();
}

// Approve application
function approveApplication(appId) {
  const application = applications.find((app) => app.id === appId);
  if (!application) return;

  if (confirm(`Approve loan application for ${application.name}?`)) {
    application.status = "approved";

    // Create new client
    const newClient = {
      id: clients.length + 1,
      name: application.name,
      phone: application.phone,
      idNumber: application.idNumber,
      borrowedAmount: application.loanAmount,
      borrowedDate: new Date(),
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      amountPaid: 0,
      status: "active",
      livestockType: application.livestockType,
      livestockCount: application.livestockCount,
      livestockValue: application.estimatedValue,
    };

    clients.push(newClient);
    window.clients = clients; // Sync with global scope

    // Add loan transaction
    const transaction = {
      id: transactions.length + 1,
      clientId: newClient.id,
      clientName: newClient.name,
      type: "loan",
      amount: application.loanAmount,
      method: "cash",
      date: new Date(),
      status: "completed",
    };
    transactions.push(transaction);
    window.transactions = transactions; // Sync with global scope

    loadApplicationsData();
    loadDashboardData();
    showAlert("success", `Loan approved for ${application.name}!`);
  }
}

// Reject application
function rejectApplication(appId) {
  const application = applications.find((app) => app.id === appId);
  if (!application) return;

  if (confirm(`Reject loan application for ${application.name}?`)) {
    application.status = "rejected";
    window.applications = applications; // Sync with global scope
    loadApplicationsData();
    showAlert("info", `Application rejected for ${application.name}`);
  }
}

// View application details
function viewApplication(appId) {
  const application = applications.find((app) => app.id === appId);
  if (!application) return;

  const detailsContainer = document.getElementById('applicationDetails');
  detailsContainer.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <p><strong>Name:</strong> ${application.name || 'N/A'}</p>
        <p><strong>Phone:</strong> ${application.phone || 'N/A'}</p>
        <p><strong>ID Number:</strong> ${application.idNumber || 'N/A'}</p>
        <p><strong>Loan Amount:</strong> ${formatCurrency(application.loanAmount)}</p>
        <p><strong>Livestock:</strong> ${application.livestockCount || 'N/A'} ${application.livestockType || 'N/A'}</p>
        <p><strong>Estimated Value:</strong> ${formatCurrency(application.estimatedValue)}</p>
        <p><strong>Location:</strong> ${application.location || 'N/A'}</p>
        <p><strong>Additional Info:</strong> ${application.additionalInfo || "None"}</p>
      </div>
      <div class="col-md-6">
        <strong>Photos:</strong>
        <div class="row mt-2">
          ${application.photos.map(photo => `
            <div class="col-6 mb-2">
              <img src="${photo}" alt="Livestock photo" class="img-fluid rounded">
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById('viewApplicationModal'));
  modal.show();
}

// Download receipt
function downloadReceipt(clientId) {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return;

  const clientTransactions = transactions.filter((t) => t.clientId === clientId);

  let receiptContent = `
NAGOLIE ENTERPRISES LTD
Livestock-Backed Lending Solutions
Isinya, Kajiado County

PAYMENT RECEIPT
================

Client: ${client.name || 'N/A'}
Phone: ${client.phone || 'N/A'}
ID Number: ${client.idNumber || 'N/A'}

Loan Details:
- Amount Borrowed: ${formatCurrency(client.borrowedAmount)}
- Interest Rate: 30%
- Expected Amount: ${formatCurrency((client.borrowedAmount || 0) * 1.3)}
- Amount Paid: ${formatCurrency(client.amountPaid)}
- Balance: ${formatCurrency((client.borrowedAmount || 0) * 1.3 - (client.amountPaid || 0))}

Transaction History:
`;

  clientTransactions.forEach((transaction) => {
    receiptContent += `
- ${formatDate(transaction.date)}: ${transaction.type.toUpperCase()} - ${formatCurrency(transaction.amount)} (${transaction.method.toUpperCase()})`;
  });

  receiptContent += `

Generated on: ${formatDate(new Date())}
Thank you for choosing Nagolie Enterprises!
`;

  // Create and download file
  const blob = new Blob([receiptContent], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt_${(client.name || 'client').replace(/\s+/g, "_")}_${new Date().getTime()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  showAlert("success", "Receipt downloaded successfully!");
}

// Download transaction receipt
function downloadTransactionReceipt(transactionId) {
  const transaction = transactions.find((t) => t.id === transactionId);
  if (!transaction) return;

  const receiptContent = `
NAGOLIE ENTERPRISES LTD
Transaction Receipt
==================

Transaction ID: ${transaction.id}
Date: ${formatDate(transaction.date)}
Client: ${transaction.clientName}
Type: ${transaction.type.toUpperCase()}
Amount: ${formatCurrency(transaction.amount)}
Method: ${transaction.method.toUpperCase()}
Status: ${transaction.status.toUpperCase()}

Generated on: ${formatDate(new Date())}
`;

  const blob = new Blob([receiptContent], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transaction_${transaction.id}_${new Date().getTime()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  showAlert("success", "Transaction receipt downloaded!");
}

// Handle defaulted loan
function handleDefaultedLoan(clientId) {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return;

  const action = confirm(
    `Client ${client.name} has defaulted on their loan.\n\nChoose action:\nOK - Take ownership of livestock\nCancel - Send final reminder`,
  );

  if (action) {
    // Take ownership of livestock
    client.status = "defaulted";
    window.clients = clients; // Sync with global scope

    // Add livestock to gallery
    const newLivestock = {
      id: livestockGallery.length + 1,
      title: `${client.livestockCount} ${client.livestockType} from ${client.name}`,
      type: client.livestockType,
      price: (client.borrowedAmount || 0) * 1.3, // Sell for loan amount + interest
      availableDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Available in 3 days
      description: `${client.livestockType} recovered from defaulted loan. Good condition.`,
      images: [`/placeholder.svg?height=300&width=400&query=${client.livestockType} livestock for sale`],
      daysRemaining: 3,
    };

    livestockGallery.push(newLivestock);
    window.livestockGallery = livestockGallery; // Sync with global scope

    loadDashboardData();
    loadAdminGalleryData();
    loadGallery();

    showAlert("success", `Livestock ownership transferred. Added to gallery for sale.`);
  } else {
    // Send reminder (simulate)
    showAlert("info", `Final payment reminder sent to ${client.phone}`);
  }
}

// Edit livestock
function editLivestock(id) {
  const item = livestockGallery.find((l) => l.id === id);
  if (!item) return;

  const newPrice = prompt(`Edit price for ${item.title}\nCurrent price: ${formatCurrency(item.price)}`, item.price);

  if (newPrice && !isNaN(newPrice) && Number.parseFloat(newPrice) > 0) {
    item.price = Number.parseFloat(newPrice);
    window.livestockGallery = livestockGallery; // Sync with global scope
    loadAdminGalleryData();
    loadGallery();
    showAlert("success", "Livestock price updated!");
  }
}

// Delete livestock
function deleteLivestock(id) {
  const item = livestockGallery.find((l) => l.id === id);
  if (!item) return;

  if (confirm(`Delete ${item.title} from gallery?`)) {
    const index = livestockGallery.findIndex((l) => l.id === id);
    livestockGallery.splice(index, 1);
    window.livestockGallery = livestockGallery; // Sync with global scope

    loadAdminGalleryData();
    loadGallery();
    showAlert("success", "Livestock removed from gallery!");
  }
}

// Initialize dashboard on load
window.addEventListener("load", () => {
  if (sessionStorage.getItem("adminLoggedIn")) {
    showSection("overview");
  }
});