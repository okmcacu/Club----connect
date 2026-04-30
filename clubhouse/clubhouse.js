// 1. INITIALIZATION & DATABASE CONNECTION
const _supabase = supabase.createClient(
    "https://wsbzipduafiuwqvmjjxi.supabase.co", 
    "sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0"
);

// Wishlist stored in LocalStorage for persistence across refreshes
let wishlist = JSON.parse(localStorage.getItem('club_wishlist')) || [];

/**
 * 2. NAVIGATION LOGIC
 * Switches between Market and Wishlist sections and triggers re-renders.
 */
function switchTab(view) {
    const marketSec = document.getElementById('market-section');
    const wishSec = document.getElementById('wishlist-section');
    const marketTab = document.getElementById('marketTab');
    const wishTab = document.getElementById('wishlistTab');

    if (view === 'market') {
        marketSec.classList.remove('hidden');
        wishSec.classList.add('hidden');
        marketTab.classList.add('active');
        wishTab.classList.remove('active');
        loadMarket(); 
    } else {
        marketSec.classList.add('hidden');
        wishSec.classList.remove('hidden');
        marketTab.classList.remove('active');
        wishTab.classList.add('active');
        renderWishlist(); 
    }
}

/**
 * 3. DATA UTILITIES
 * Standardizes how data (like images) is extracted from the database objects.
 */
function getSecondaryImage(item) {
    // Handles if image2_urls is a Postgres array or a single string
    if (Array.isArray(item.image2_urls) && item.image2_urls.length > 0) {
        return item.image2_urls[0];
    }
    return item.image2_urls || 'https://via.placeholder.com/300';
}

/**
 * 4. MARKET RENDERER
 * Fetches all columns from Supabase and displays the full data.
 */
async function loadMarket() {
    const { data: items, error } = await _supabase
        .from('Market')
        .select('*') // Fetches title, price, description, phone, qty, etc.
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch error:", error);
        return;
    }

    const grid = document.getElementById('marketGrid');
    if (!grid) return;

    grid.innerHTML = items.map(item => {
        const isAdded = wishlist.some(w => w.id === item.id);
        const img2 = getSecondaryImage(item);
        const verifiedBadge = item.verified === 'yes' ? '<span class="verified-badge"></span>' : '';
        
        // Escape quotes to safely pass the object to the toggle function
        const itemData = JSON.stringify(item).replace(/'/g, "&apos;");

        return `
        <div class="card">
            <!-- Interactivity: Status Badge -->
            <div class="status-pill ${item.status || 'active'}">${item.status || 'Active'}</div>
            
            <div class="img-header">
                <img src="${item.image_urls || 'https://via.placeholder.com/300'}" alt="Primary">
                <img src="${img2}" alt="Secondary">
            </div>

            <div class="content">
                <div class="short-desc">${item.short_description || ''}</div>
                <h3 class="title" style="text-align: center; margin: 0;">${item.title}</h3>
                
                <div class="price-row">
                    <span class="price">${item.price} ETB</span>
                    <span class="cond-badge">${item.condition || 'New'}</span>
                </div>

                <div class="desc">
                    ${marked.parse(item.description || '')}
                </div>
            </div>

            <div class="footer-info">
                <strong>Seller:</strong> ${item.seller_name}${verifiedBadge}<br>
                <strong>Qty:</strong> ${item.quantity || 1} | <strong>Loc:</strong> ${item.address || 'N/A'}<br>
                <strong>Phone:</strong> ${item.phone || 'N/A'}
            </div>

            <div class="btn-group">
                <button class="wish-btn ${isAdded ? 'added' : ''}" 
                        onclick='toggleWishlist(${itemData})'>
                    ${isAdded ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
            </div>
        </div>`;
    }).join('');
    
    updateWishCount();
}

/**
 * 5. WISHLIST RENDERER
 * Matches the Market card exactly to show full data in the wishlist.
 */
function renderWishlist() {
    const grid = document.getElementById('wishlistGrid');
    if (!grid) return;

    if (wishlist.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 40px;'>Your wishlist is empty.</p>";
        return;
    }

    grid.innerHTML = wishlist.map(item => {
        const img2 = getSecondaryImage(item);
        const itemData = JSON.stringify(item).replace(/'/g, "&apos;");
        const verifiedBadge = item.verified === 'yes' ? '<span class="verified-badge"></span>' : '';

        return `
        <div class="card">
            <div class="status-pill ${item.status || 'active'}">${item.status || 'Active'}</div>
            <div class="img-header">
                <img src="${item.image_urls || 'https://via.placeholder.com/300'}">
                <img src="${img2}">
            </div>
            <div class="content">
                <div class="short-desc">${item.short_description || ''}</div>
                <h3 class="title" style="text-align: center;">${item.title}</h3>
                <div class="price-row">
                    <span class="price">${item.price} ETB</span>
                    <span class="cond-badge">${item.condition || 'New'}</span>
                </div>
                <div class="desc">${marked.parse(item.description || '')}</div>
            </div>
            <div class="footer-info">
                <strong>Seller:</strong> ${item.seller_name}${verifiedBadge}<br>
                <strong>Phone:</strong> ${item.phone || 'N/A'}<br>
                <strong>Loc:</strong> ${item.address || 'N/A'}
            </div>
            <div class="btn-group">
                <button class="wish-btn added" onclick='toggleWishlist(${itemData})'>
                    Remove from Wishlist
                </button>
            </div>
        </div>`;
    }).join('');
}

/**
 * 6. GLOBAL UPDATES
 * Handles adding/removing items and updating the UI badge.
 */
function toggleWishlist(item) {
    const index = wishlist.findIndex(w => w.id === item.id);
    if (index === -1) {
        wishlist.push(item);
    } else {
        wishlist.splice(index, 1);
    }
    
    localStorage.setItem('club_wishlist', JSON.stringify(wishlist));
    
    // Check current view to refresh the specific grid
    if (!document.getElementById('market-section').classList.contains('hidden')) {
        loadMarket();
    } else {
        renderWishlist();
    }
    updateWishCount();
}

function updateWishCount() {
    const countSpan = document.getElementById('wish-count');
    if (countSpan) countSpan.innerText = wishlist.length;
}

// Start application
document.addEventListener('DOMContentLoaded', loadMarket);