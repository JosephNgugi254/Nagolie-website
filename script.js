// Updated script.js
// Data Storage
let clients = [];
let transactions = [];
let applications = [];
let livestockGallery = [];

// Initialize data on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    loadGallery();
    setupEventListeners();
    updateCurrentDate();
});

// Initialize sample data with localStorage persistence
function initializeData() {
    // Load ALL data from localStorage first
    loadApplicationsFromStorage();
    loadLivestockGalleryFromStorage(); // NEW: Load livestock gallery from localStorage
    
    // Only use sample data if no stored data exists
    if (applications.length === 0) {
        applications = getSampleApplications();
        saveApplicationsToStorage();
    }
    
    if (livestockGallery.length === 0) {
        livestockGallery = getSampleGallery();
        saveLivestockGalleryToStorage(); // NEW: Save to localStorage
    }
    
    clients = getSampleClients();
    transactions = getSampleTransactions();
    
    // Sync with global scope
    window.clients = clients;
    window.transactions = transactions;
    window.applications = applications;
    window.livestockGallery = livestockGallery;
}

// NEW FUNCTION: Load livestock gallery from localStorage
function loadLivestockGalleryFromStorage() {
    try {
        const stored = localStorage.getItem('livestockGallery');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Convert date strings back to Date objects and remove daysRemaining if it exists
            livestockGallery = parsed.map(item => ({
                ...item,
                availableDate: new Date(item.availableDate)
                // Remove daysRemaining property if it exists - we'll calculate it dynamically
            }));
            // Remove daysRemaining property from each item
            livestockGallery.forEach(item => {
                if (item.hasOwnProperty('daysRemaining')) {
                    delete item.daysRemaining;
                }
            });
            window.livestockGallery = livestockGallery;
        }
    } catch (error) {
        console.error('Error loading livestock gallery from storage:', error);
    }
}

// NEW FUNCTION: Save livestock gallery to localStorage
function saveLivestockGalleryToStorage() {
    try {
        localStorage.setItem('livestockGallery', JSON.stringify(livestockGallery));
        window.livestockGallery = livestockGallery;
    } catch (error) {
        console.error('Error saving livestock gallery to storage:', error);
    }
}

// NEW FUNCTION: Save applications to localStorage
function saveApplicationsToStorage() {
    try {
        localStorage.setItem('loanApplications', JSON.stringify(applications));
        // Also update global variable for immediate access
        window.applications = applications;
    } catch (error) {
        console.error('Error saving applications to storage:', error);
    }
}

// NEW FUNCTION: Load applications from localStorage
function loadApplicationsFromStorage() {
    try {
        const stored = localStorage.getItem('loanApplications');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Convert date strings back to Date objects
            applications = parsed.map(app => ({
                ...app,
                date: new Date(app.date)
            }));
            window.applications = applications;
        }
    } catch (error) {
        console.error('Error loading applications from storage:', error);
    }
}

// Sample clients with relative dates
function getSampleClients() {
    return [
        {
            id: 1,
            name: "Mary Mugo",
            phone: "0712345678",
            idNumber: "12345678",
            borrowedAmount: 50000,
            borrowedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            expectedReturnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            amountPaid: 0,
            status: "active",
            livestockType: "goats",
            livestockCount: 5,
            livestockValue: 60000
        },
        {
            id: 2,
            name: "Joseph Ngugi",
            phone: "0723456789",
            idNumber: "23456789",
            borrowedAmount: 30000,
            borrowedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            expectedReturnDate: new Date(Date.now()),
            amountPaid: 20000,
            status: "active",
            livestockType: "cattle",
            livestockCount: 2,
            livestockValue: 40000
        },
        {
            id: 3,
            name: "Samuel Parmale",
            phone: "0734567890",
            idNumber: "34567890",
            borrowedAmount: 25000,
            borrowedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
            expectedReturnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            amountPaid: 0,
            status: "active",
            livestockType: "sheep",
            livestockCount: 8,
            livestockValue: 32000
        },
        {
            id: 4,
            name: "John Doe",
            phone: "0745678901",
            idNumber: "45678901",
            borrowedAmount: 40000,
            borrowedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            expectedReturnDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            amountPaid: 52000,
            status: "completed",
            livestockType: "goats",
            livestockCount: 4,
            livestockValue: 48000
        },
        {
            id: 5,
            name: "Leah Mugo",
            phone: "0756789012",
            idNumber: "56789012",
            borrowedAmount: 35000,
            borrowedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            expectedReturnDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
            amountPaid: 15000,
            status: "active",
            livestockType: "cattle",
            livestockCount: 3,
            livestockValue: 45000
        }
    ];
}

function getSampleTransactions() {
    return [
        {
            id: 1,
            clientId: 1,
            clientName: "Mary Mugo",
            type: "loan",
            amount: 50000,
            method: "cash",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            status: "completed"
        },
        {
            id: 2,
            clientId: 2,
            clientName: "Joseph Ngugi",
            type: "loan",
            amount: 30000,
            method: "mpesa",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            status: "completed"
        },
        {
            id: 3,
            clientId: 2,
            clientName: "Joseph Ngugi",
            type: "payment",
            amount: 20000,
            method: "mpesa",
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: "completed"
        },
        {
            id: 4,
            clientId: 4,
            clientName: "John Doe",
            type: "payment",
            amount: 52000,
            method: "cash",
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: "completed"
        }
    ];
}

function getSampleApplications() {
    return [
        {
            id: 1,
            name: "Peter Kamau",
            phone: "0767890123",
            idNumber: "67890123",
            loanAmount: 45000,
            livestockType: "cattle",
            livestockCount: 3,
            estimatedValue: 50000,
            location: "Isinya Town, near the market",
            additionalInfo: "Urgent loan needed for school fees",
            status: "pending",
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            photos: [] // base64 or paths
        }
    ];
}

function getSampleGallery() {
    return [
        {
            id: 1,
            title: "Premium Dairy Cattle",
            type: "cattle",
            price: 45000,
            availableDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            description: "High-quality dairy cattle from defaulted loan. Excellent milk production.",
            images: [
                "public/dairy-cattle-close-up.jpg",
                "public/dairy-cattle-in-grazing.jpg"
            ]
            // Remove daysRemaining - it will be calculated dynamically
        },
        {
            id: 2,
            title: "Healthy Goat Herd",
            type: "goats",
            price: 25000,
            availableDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            description: "5 healthy goats suitable for breeding or meat production.",
            images: [
                "public/goat-herd-grazing.jpg",
                "public/goats-in-farm-setting.jpg"
            ]
            // Remove daysRemaining - it will be calculated dynamically
        }
    ];
}

// Setup event listeners
function setupEventListeners() {
    // Loan application form
    const loanForm = document.getElementById('loanApplicationForm');
    if (loanForm) {
        loanForm.addEventListener('submit', handleLoanApplication);
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Handle loan application form submission
async function handleLoanApplication(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Generate unique ID based on timestamp to avoid conflicts
    const newId = applications.length > 0 ? Math.max(...applications.map(app => app.id)) + 1 : 1;
    
    const application = {
        id: newId,
        name: formData.get('fullName'),
        phone: formData.get('phoneNumber'),
        idNumber: formData.get('idNumber'),
        loanAmount: parseInt(formData.get('loanAmount')) || 0,
        livestockType: formData.get('livestockType'),
        livestockCount: parseInt(formData.get('livestockCount')) || 0,
        estimatedValue: parseInt(formData.get('estimatedValue')) || 0,
        location: formData.get('livestockLocation'),
        additionalInfo: formData.get('additionalInfo') || "None",
        status: 'pending',
        date: new Date(),
        photos: []
    };

    // Handle file uploads as base64
    const photoFiles = document.getElementById('livestockPhotos').files;
    if (photoFiles.length > 0) {
        const photoPromises = Array.from(photoFiles).map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve(ev.target.result);
                reader.readAsDataURL(file);
            });
        });
        application.photos = await Promise.all(photoPromises);
    }

    // Add to applications array
    applications.push(application);
    
    // CRITICAL: Save to localStorage for persistence
    saveApplicationsToStorage();
    
    // Show success message
    showAlert('success', 'Loan application submitted successfully! We will contact you within 24 hours.');
    
    // Reset form
    form.reset();

    // Automatically trigger admin panel refresh if functions exist
    // This happens asynchronously without needing a manual refresh button
    setTimeout(() => {
        if (typeof window.renderApplications === "function") {
            window.renderApplications();
        }
        if (typeof window.updateNotifications === "function") {
            window.updateNotifications();
        }
        if (typeof window.loadApplicationsData === "function") {
            window.loadApplicationsData();
        }
    }, 100);
}

// Handle contact form submission
function handleContactForm(e) {
    e.preventDefault();
    showAlert('success', 'Thank you for your message! We will get back to you soon.');
    e.target.reset();
}

// Load livestock gallery
function loadGallery() {
    const galleryContainer = document.getElementById('livestock-gallery');
    if (!galleryContainer) return;

    galleryContainer.innerHTML = '';

    if (livestockGallery.length === 0) {
        galleryContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No livestock available at the moment. Please check back later.
                </div>
            </div>
        `;
        return;
    }

    livestockGallery.forEach(item => {
        const galleryItem = createGalleryItem(item);
        galleryContainer.appendChild(galleryItem);
    });
}

// Create gallery item
function createGalleryItem(item) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';

    // Calculate actual days remaining based on current date
    const actualDaysRemaining = calculateDaysRemaining(item.availableDate);
    
    // Determine the display text based on days remaining
    let daysText = '';
    if (actualDaysRemaining > 1) {
        daysText = `Available in ${actualDaysRemaining} days`;
    } else if (actualDaysRemaining === 1) {
        daysText = 'Available in 1 day';
    } else if (actualDaysRemaining === 0) {
        daysText = 'Available today';
    } else {
        daysText = 'Available';
    }

    const urgentClass = actualDaysRemaining <= 1 ? 'urgent' : '';
    
    // Use first image or placeholder if no images exist
    const primaryImage = item.images && item.images.length > 0 
        ? item.images[0] 
        : `https://via.placeholder.com/400x300/007bff/ffffff?text=${encodeURIComponent(item.type)}`;
    
    col.innerHTML = `
        <div class="livestock-card">
            <div class="position-relative">
                <div id="carousel-${item.id}" class="carousel slide livestock-carousel" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${item.images && item.images.length > 0 ? item.images.map((image, index) => `
                            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                <img src="${image}" class="d-block w-100" alt="${item.title}" 
                                     onerror="this.src='https://via.placeholder.com/400x300/007bff/ffffff?text=${encodeURIComponent(item.type)}'">
                            </div>
                        `).join('') : `
                            <div class="carousel-item active">
                                <img src="${primaryImage}" class="d-block w-100" alt="${item.title}">
                            </div>
                        `}
                    </div>
                    ${item.images && item.images.length > 1 ? `
                        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${item.id}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon"></span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#carousel-${item.id}" data-bs-slide="next">
                            <span class="carousel-control-next-icon"></span>
                        </button>
                    ` : ''}
                </div>
                <div class="days-remaining ${urgentClass}">
                    ${daysText}
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title mb-2">${item.title}</h5>
                <p class="card-text mb-3">${item.description}</p>
                <div class="action-group">
                    <span class="price-info">KSh ${item.price.toLocaleString()}</span>
                    <button class="btn btn-outline-primary btn-sm" onclick="inquireAboutLivestock(${item.id})">
                        Inquire
                    </button>
                </div>
            </div>
        </div>
    `;

    return col;
}

// NEW FUNCTION: Check if image exists
function checkImageExists(url, callback) {
    const img = new Image();
    img.onload = function() { callback(true); };
    img.onerror = function() { callback(false); };
    img.src = url;
}

// Inquire about livestock
function inquireAboutLivestock(id) {
    const item = livestockGallery.find(l => l.id === id);
    if (item) {
        const message = `I'm interested in ${item.title} (KSh ${item.price.toLocaleString()}). Please provide more details.`;
        const whatsappUrl = `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Utility functions
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

function formatCurrency(amount) {
    return `KSh ${(Number(amount) || 0).toLocaleString()}`;
}

function formatDate(date) {
    return date.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function calculateDaysRemaining(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('en-KE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// NEW FUNCTION: Get applications count for admin badge
function getPendingApplicationsCount() {
    return applications.filter(app => app.status === 'pending').length;
}




// Terms and Conditions Popup Functionality
document.addEventListener('DOMContentLoaded', function() {
    const termsLink = document.getElementById('termsLink');
    const termsPopup = document.getElementById('termsPopup');
    const closePopup = document.getElementById('closePopup');
    const closePopupBtn = document.getElementById('closePopupBtn');
    
    // Open popup when terms link is clicked
    termsLink.addEventListener('click', function() {
        termsPopup.style.display = 'flex';
    });
    
    // Close popup when close button is clicked
    closePopup.addEventListener('click', function() {
        termsPopup.style.display = 'none';
    });
    
    // Close popup when close button in footer is clicked
    closePopupBtn.addEventListener('click', function() {
        termsPopup.style.display = 'none';
    });
    
    // Close popup when clicking outside the content
    termsPopup.addEventListener('click', function(e) {
        if (e.target === termsPopup) {
            termsPopup.style.display = 'none';
        }
    });
    
    // Form submission handling
    const loanForm = document.getElementById('loanApplicationForm');
    loanForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if terms are agreed to
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            alert('Please agree to the terms and conditions before submitting your application.');
            return;
        }
        
        // Here you would typically submit the form data to your server
        alert('Application submitted successfully! We will contact you shortly.');
        loanForm.reset();
    });
});

// Export functions for admin use
window.clients = clients;
window.transactions = transactions;
window.applications = applications;
window.livestockGallery = livestockGallery;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.calculateDaysRemaining = calculateDaysRemaining;
window.showAlert = showAlert;
window.getPendingApplicationsCount = getPendingApplicationsCount;
window.saveApplicationsToStorage = saveApplicationsToStorage;
window.loadApplicationsFromStorage = loadApplicationsFromStorage;
window.saveClientsToStorage = saveClientsToStorage;
window.saveTransactionsToStorage = saveTransactionsToStorage;
window.loadClientsFromStorage = loadClientsFromStorage;
window.loadTransactionsFromStorage = loadTransactionsFromStorage;
window.getSampleClients = getSampleClients;
window.getSampleTransactions = getSampleTransactions;
window.saveLivestockGalleryToStorage = saveLivestockGalleryToStorage; // NEW
window.loadLivestockGalleryFromStorage = loadLivestockGalleryFromStorage; // NEW
window.loadGallery = loadGallery; // NEW - Make loadGallery available globally