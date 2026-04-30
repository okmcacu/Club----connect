const _supabase = supabase.createClient("https://wsbzipduafiuwqvmjjxi.supabase.co", "sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0");

// Helper to handle both Single Strings and Arrays from Supabase
const getImg = (v) => Array.isArray(v) ? v[0] : (v || 'https://via.placeholder.com/300');

// 1. Load Main Market Grid (market.html)
async function loadMarketItems() {
    const { data: items, error } = await _supabase.from('Market').select('*').order('created_at', { ascending: false });
    const list = document.getElementById('market-list');
    if (error || !list) return;

    list.innerHTML = items.map(item => `
        <div class="card" onclick="window.location.href='marketdetail.html?id=${item.id}'">
            <div class="card-images">
                <img src="${getImg(item.image_urls)}">
                <img src="${getImg(item.image2_urls)}">
            </div>
            <div class="card-content">
                <div class="category-tag">${item.category || 'GENERAL'}</div>
                <div class="card-title">${item.title}</div>
                <div class="card-price">
                    ${item.price} ETB
                    <span style="font-size:0.7rem; color:gray;">@${item.seller_name}</span>
                </div>
            </div>
        </div>`).join('');
}

// 2. Load Detail Page (marketdetail.html)
async function loadProductDetail() {
    const id = new URLSearchParams(window.location.search).get('id');
    const container = document.getElementById('product-detail-container');
    if (!id || !container) return;

    const { data: item, error } = await _supabase.from('Market').select('*').eq('id', id).single();
    if (error || !item) { container.innerHTML = "Product not found."; return; }

    // Check if item is already in wishlist to toggle button UI
    const list = JSON.parse(localStorage.getItem('cc_wishlist')) || [];
    const isSaved = list.includes(String(item.id));

    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
            <div>
                <img src="${getImg(item.image_urls)}" style="width:100%; border-radius:1rem; margin-bottom:1rem;">
                <img src="${getImg(item.image2_urls)}" style="width:45%; border-radius:0.5rem;">
            </div>
            <div>
                <h1>${item.title}</h1>
                <p style="color:var(--color-primary); font-size:2rem; font-weight:700;">${item.price} ETB</p>
                <div style="background:#1a1c1e; padding:1.5rem; border-radius:1rem; margin:2rem 0;">
                    ${marked.parse(item.description || '')}
                </div>
                <!-- Dynamic Button: Green for Add, Red for Remove -->
                <button onclick="toggleWishlist('${item.id}')" 
                    style="background:${isSaved ? '#ff4b4b' : 'var(--color-primary)'}; border:none; padding:1rem; width:100%; border-radius:2rem; font-weight:700; cursor:pointer; color: white;">
                    ${isSaved ? '❤ Remove from Wishlist' : '♡ Add to Wishlist'}
                </button>
            </div>
        </div>`;
}

// 3. Wishlist Management Logic
function toggleWishlist(id) {
    let list = JSON.parse(localStorage.getItem('cc_wishlist')) || [];
    const idStr = String(id);
    
    if (list.includes(idStr)) {
        // Remove logic
        list = list.filter(itemId => itemId !== idStr);
        localStorage.setItem('cc_wishlist', JSON.stringify(list));
        alert("Removed from Wishlist");
    } else {
        // Add logic
        list.push(idStr);
        localStorage.setItem('cc_wishlist', JSON.stringify(list));
        alert("Added to Wishlist!");
    }

    // Refresh the UI based on which page we are on
    if (document.getElementById('product-detail-container')) {
        loadProductDetail();
    } else if (document.getElementById('wishlist-list')) {
        displayWishlist();
    }
}

// 4. Display Wishlist (wishlist.html)
async function displayWishlist() {
    const container = document.getElementById('wishlist-list');
    const listIds = JSON.parse(localStorage.getItem('cc_wishlist')) || [];
    if (!container) return;

    if (listIds.length === 0) { 
        container.innerHTML = "<p style='color:var(--color-muted)'>Your wishlist is empty.</p>"; 
        return; 
    }

    const { data: items } = await _supabase.from('Market').select('*').in('id', listIds);
    
    container.innerHTML = items.map(item => `
        <div class="card" style="position: relative;">
            <!-- Delete Button Overlay -->
            <button onclick="event.stopPropagation(); toggleWishlist('${item.id}')" 
                style="position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(255,75,75,0.9); border: none; border-radius: 50%; width: 30px; height: 30px; color: white; cursor: pointer; font-weight: bold;">
                ✕
            </button>
            <div onclick="window.location.href='marketdetail.html?id=${item.id}'">
                <div class="card-images">
                    <img src="${getImg(item.image_urls)}">
                    <img src="${getImg(item.image2_urls)}">
                </div>
                <div class="card-content">
                    <div class="card-title">${item.title}</div>
                    <div class="card-price">${item.price} ETB</div>
                </div>
            </div>
        </div>`).join('');
}
