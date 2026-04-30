const _supabase = supabase.createClient("https://wsbzipduafiuwqvmjjxi.supabase.co", "sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0");

// Initialize wishlist from LocalStorage
let wishlist = JSON.parse(localStorage.getItem('club_wishlist')) || [];

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

async function loadMarket() {
    const { data: items, error } = await _supabase.from('Market').select('*').order('created_at', { ascending: false });
    if (error) return;

    const grid = document.getElementById('marketGrid');
    grid.innerHTML = items.map(item => {
        const isAdded = wishlist.some(w => w.id === item.id);
        const img2 = Array.isArray(item.image2_urls) ? item.image2_urls[0] : '';
        const itemData = JSON.stringify(item).replace(/'/g, "&apos;");

        return `
        <div class="card">
            <div class="img-header">
                <img src="${item.image_urls || 'https://via.placeholder.com/300'}" alt="Product image">
                <img src="${img2 || 'https://via.placeholder.com/300'}" alt="Secondary image">
            </div>
            <div class="content">
                <h3 class="title">${item.title}</h3>
                <div class="price">${item.price} ETB</div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted)">Seller: ${item.seller_name}</div>
            </div>
            <div class="btn-group">
                <button class="wish-btn ${isAdded ? 'added' : ''}" 
                        onclick='toggleWishlist(${itemData})'>
                    ${isAdded ? 'Added to Wishlist' : 'Add to Wishlist'}
                </button>
            </div>
        </div>`;
    }).join('');
    updateWishCount();
}

function toggleWishlist(item) {
    const index = wishlist.findIndex(w => w.id === item.id);
    if (index === -1) {
        wishlist.push(item); 
    } else {
        wishlist.splice(index, 1);
    }
    localStorage.setItem('club_wishlist', JSON.stringify(wishlist));
    
    // Refresh the currently active tab
    if (!document.getElementById('market-section').classList.contains('hidden')) {
        loadMarket();
    } else {
        renderWishlist();
    }
    updateWishCount();
}

function renderWishlist() {
    const grid = document.getElementById('wishlistGrid');
    if (wishlist.length === 0) {
        grid.innerHTML = "<p style='padding: 20px; color: var(--color-text-muted)'>No items in your wishlist yet.</p>";
        return;
    }

    grid.innerHTML = wishlist.map(item => {
        const itemData = JSON.stringify(item).replace(/'/g, "&apos;");
        const img2 = Array.isArray(item.image2_urls) ? item.image2_urls[0] : '';

        return `
        <div class="card">
            <div class="img-header">
                <img src="${item.image_urls || 'https://via.placeholder.com/300'}" alt="Product image">
                <img src="${img2 || 'https://via.placeholder.com/300'}" alt="Secondary image">
            </div>
            <div class="content">
                <h3 class="title">${item.title}</h3>
                <div class="price">${item.price} ETB</div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted)">Seller: ${item.seller_name}</div>
            </div>
            <div class="btn-group">
                <button class="wish-btn added" onclick='toggleWishlist(${itemData})'>
                    Remove from Wishlist
                </button>
            </div>
        </div>`;
    }).join('');
}

function updateWishCount() {
    const countSpan = document.getElementById('wish-count');
    if (countSpan) countSpan.innerText = wishlist.length;
}

loadMarket();