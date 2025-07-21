// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const dashboard = document.getElementById('dashboard');
    const notification = document.getElementById('notification');
    
    // Initialize
    checkDarkModePreference();
    checkLoggedInUser();

    // Dark Mode Toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = document.getElementById(this.getAttribute('data-target'));
            togglePassword(input.id);
        });
    });
});

// Dark Mode Functions
function checkDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').textContent = '☀️';
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    document.getElementById('darkModeToggle').textContent = isDarkMode ? '☀️' : '🌙';
}

// Form Visibility
function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    clearErrors();
}

function showLogin() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    clearErrors();
}

function showDashboard() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
}

// Password Strength Checker
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthPercent = strength * 25;
    document.getElementById('strength-bar').style.width = `${strengthPercent}%`;

    // Update color and text
    const colors = ['#ff0000', '#ff6600', '#ffcc00', '#33cc33'];
    const texts = ['Very Weak', 'Weak', 'Moderate', 'Strong'];
    document.getElementById('strength-bar').style.backgroundColor = colors[strength - 1] || colors[0];
    document.getElementById('strength-text').textContent = texts[strength - 1] || '';
    document.getElementById('strength-text').style.color = colors[strength - 1] || colors[0];

    return strength;
}

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '👁️';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
    }
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show ' + type;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Clear Error Messages
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

// User Authentication Functions
async function hashPassword(password) {
    // Simple hashing for demo (use proper hashing in production)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkLoggedInUser() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(localStorage.getItem(currentUser));
        displayUserDashboard(user);
        showDashboard();
    }
}

async function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('register-error');

    // Validation
    if (password !== confirmPassword) {
        errorElement.textContent = "Passwords do not match!";
        return;
    }

    const strength = checkPasswordStrength(password);
    if (strength < 3) {
        errorElement.textContent = "Password too weak! Use uppercase, numbers, and symbols.";
        return;
    }

    if (localStorage.getItem(email)) {
        errorElement.textContent = "Email already registered!";
        return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = {
        name,
        email,
        password: hashedPassword,
        joinDate: new Date().toLocaleDateString()
    };

    // Save to localStorage
    localStorage.setItem(email, JSON.stringify(user));
    localStorage.setItem('currentUser', email);

    // Show success
    showNotification('Registration successful!', 'success');
    displayUserDashboard(user);
    showDashboard();
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');

    // Check if user exists
    const userData = localStorage.getItem(email);
    if (!userData) {
        errorElement.textContent = "User not found!";
        return;
    }

    const user = JSON.parse(userData);
    const hashedPassword = await hashPassword(password);

    if (hashedPassword === user.password) {
        localStorage.setItem('currentUser', email);
        showNotification('Login successful!', 'success');
        displayUserDashboard(user);
        showDashboard();
    } else {
        errorElement.textContent = "Incorrect password!";
    }
}

function displayUserDashboard(user) {
    document.getElementById('dashboard-username').textContent = user.name;
    document.getElementById('dashboard-email').textContent = user.email;
    document.getElementById('join-date').textContent = user.joinDate;
    
    // Set avatar initials
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.querySelector('.avatar').textContent = initials;
}

function logout() {
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully', 'success');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.querySelectorAll('input').forEach(input => input.value = '');
    clearErrors();
}
// ======================
// ANIMATION-RELATED CODE
// ======================

// 1. Ripple Effect for Buttons
function createRippleEffect(button, e) {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

document.querySelectorAll('.auth-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        createRippleEffect(this, e);
    });
});

// 2. Form Switch Animation Handler
function animateFormSwitch(hideEl, showEl) {
    hideEl.style.animation = 'fadeOut 0.4s ease forwards';
    setTimeout(() => {
        hideEl.classList.add('hidden');
        showEl.classList.remove('hidden');
        showEl.style.animation = 'fadeInUp 0.6s ease forwards';
    }, 400);
}

// 3. Update showRegister/showLogin functions
function showRegister() {
    animateFormSwitch(
        document.getElementById('login-form'),
        document.getElementById('register-form')
    );
    clearErrors();
}

function showLogin() {
    animateFormSwitch(
        document.getElementById('register-form'),
        document.getElementById('login-form')
    );
    clearErrors();
}

// 4. Page Load Animation
window.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease-out';
        document.body.style.opacity = '1';
    }, 100);
});