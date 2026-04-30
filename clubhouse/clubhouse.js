const _supabase = supabase.createClient("https://wsbzipduafiuwqvmjjxi.supabase.co", "sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0");

// Wishlist stored in LocalStorage for now (as per team task)
let wishlist = JSON.parse(localStorage.getItem('club_wishlist')) || [];

// 1. Switch between Market and Wishlist views
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
    } else {
        marketSec.classList.add('hidden');
        wishSec.classList.remove('hidden');
        marketTab.classList.remove('active');
        wishTab.classList.add('active');
        renderWishlist();
    }
}

// 2. Load Market Items
async function loadMarket() {
    const { data: items, error } = await _supabase.from('Market').select('*').order('created_at', { ascending: false });
    if (error) return;

    const grid = document.getElementById('marketGrid');
    grid.innerHTML = items.map(item => {
        const isAdded = wishlist.some(w => w.id === item.id);
        const img2 = Array.isArray(item.image2_urls) ? item.image2_urls[0] : '';
        
        return `
        <div class="card" id="market-item-${item.id}">
            <div class="img-header">
                <img src="${item.image_urls || 'https://via.placeholder.com/300'}">
                <img src="${img2 || 'https://via.placeholder.com/300'}">
            </div>
            <div class="content">
                <h3 class="title">${item.title}</h3>
                <div class="price">${item.price} ETB</div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted)">Seller: ${item.seller_name}</div>
            </div>
            <div class="btn-group">
                <button class="wish-btn ${isAdded ? 'added' : ''}" 
                        onclick='toggleWishlist(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
                    ${isAdded ? 'Added to Wishlist' : 'Add to Wishlist'}
                </button>
                <button class="del-btn" onclick="deleteItem(${item.id})">Delete</button>
            </div>
        </div>`;
    }).join('');
    updateWishCount();
}

// 3. Wishlist Functionality
function toggleWishlist(item) {
    const index = wishlist.findIndex(w => w.id === item.id);
    
    if (index === -1) {
        wishlist.push(item); // Add if not present
    } else {
        wishlist.splice(index, 1); // Remove if clicked again
    }
    
    localStorage.setItem('club_wishlist', JSON.stringify(wishlist));
    loadMarket(); // Refresh UI
}

function renderWishlist() {
    const grid = document.getElementById('wishlistGrid');
    if (wishlist.length === 0) {
        grid.innerHTML = "<p>No items in your wishlist yet.</p>";
        return;
    }

    grid.innerHTML = wishlist.map(item => `
        <div class="card">
            <div class="content">
                <h3>${item.title}</h3>
                <div class="price">${item.price} ETB</div>
                <button class="wish-btn added" onclick='toggleWishlist(${JSON.stringify(item).replace(/'/g, "&apos;")})'>Remove</button>
            </div>
        </div>
    `).join('');
}

function updateWishCount() {
    document.getElementById('wish-count').innerText = wishlist.length;
}

// Reuse the team's delete logic
async function deleteItem(id) {
    if (!confirm("Delete this listing?")) return;
    await _supabase.from('Market').delete().eq('id', id);
    loadMarket();
}

// Start
loadMarket();