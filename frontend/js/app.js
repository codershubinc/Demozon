// Global API configuration
const API_BASE_URL = `http://${window.location.hostname}:3000/api`;

// Store user info
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// API helper functions
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return await response.json();
}

// Product functions
async function getProducts() {
    return await apiCall('/products');
}

async function getProductById(id) {
    return await apiCall(`/products/${id}`);
}

async function getProductsByVendor(userId) {
    return await apiCall(`/products/vendor/${userId}`);
}

async function createProduct(productData) {
    return await apiCall('/products', 'POST', productData);
}

async function updateProduct(id, productData) {
    return await apiCall(`/products/${id}`, 'PUT', productData);
}

async function deleteProduct(id) {
    return await apiCall(`/products/${id}`, 'DELETE');
}

// Auth functions
async function signup(name, email, password) {
    return await apiCall('/signup', 'POST', { name, email, password });
}

async function login(email, password) {
    return await apiCall('/login', 'POST', { email, password });
}
