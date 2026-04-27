// --- 1. SUPABASE CONNECTION ---
const _supabase = supabase.createClient(
    'https://wsbzipduafiuwqvmjjxi.supabase.co', 
    'sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0'
);

const userId = 1;

// --- 2. IMPROVED ROUTER ---
// This checks the end of the URL to see which page you are on
const currentFile = window.location.pathname.split("/").pop();

if (currentFile === 'events.html' || currentFile === '') {
    initEventsList();
} else if (currentFile === 'eventdetails.html') {
    initEventDetails();
} else if (currentFile === 'myevents.html') {
    initMyEvents();
}

// --- 3. DETAIL PAGE FUNCTION ---
async function initEventDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const container = document.getElementById('detail-card');

    if (!eventId) {
        container.innerHTML = "<p>Error: No Event ID provided.</p>";
        return;
    }

    // Get event info
    const { data: event, error } = await _supabase
        .from('Events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (error || !event) {
        container.innerHTML = "<p>Event not found in database.</p>";
        return;
    }

    // Check if joined
    const { data: existing } = await _supabase
        .from('my_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single();

    const isJoined = !!existing;

    // Render HTML
    container.innerHTML = `
        <div class="card">
            <img src="${event.image_url}" style="width:100%; max-height:400px; object-fit:cover;">
            <div style="padding: 3rem;">
                <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${event.title}</h1>
                <p style="color: var(--color-primary); font-weight: 600; margin-bottom: 2rem;">Host: ${event.organizer}</p>
                
                <div style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 1rem; margin-bottom: 2rem;">
                    <p>📅 <strong>Date:</strong> ${event.date} at ${event.time}</p>
                    <p>📍 <strong>Location:</strong> ${event.location || 'Campus Center'}</p>
                </div>

                <p style="color: var(--color-text-muted); line-height: 1.8; margin-bottom: 3rem;">${event.description}</p>
                
                <button id="add-btn" class="btn-primary" 
                    ${isJoined ? 'disabled style="opacity:0.5;"' : `onclick="joinEvent(${event.id})"`}>
                    ${isJoined ? '✓ Added to My Events' : 'Add to My Events'}
                </button>
            </div>
        </div>`;
}

