// ==================== script.js ====================

const _supabase = supabase.createClient(
    'https://wsbzipduafiuwqvmjjxi.supabase.co',
    'sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0'
);

const userId = 1;   // TODO: Replace with real auth later

// ==================== EVENTS LIST PAGE ====================
async function initEventsList() {
    const grid = document.getElementById('events-grid');
    if (!grid) return;

    grid.innerHTML = '<p>Loading events...</p>';

    const { data, error } = await _supabase
        .from('Events')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.error(error);
        grid.innerHTML = '<p>Error loading events.</p>';
        return;
    }

    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = '<p>No events found.</p>';
        return;
    }

    data.forEach(event => {
        grid.innerHTML += `
            <a href="eventdetails.html?id=${event.id}" class="card hover-lift">
                <img src="${event.image_url || 'https://via.placeholder.com/400x200'}" 
                     style="width:100%; height:200px; object-fit:cover; border-radius: 1.5rem 1.5rem 0 0;">
                <div style="padding: 1.5rem;">
                    <p style="color: var(--color-primary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
                        ${event.organizer || 'Club'}
                    </p>
                    <h3 style="margin: 0.5rem 0; font-size: 1.25rem;">${event.title}</h3>
                    <p style="color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.4;">
                        ${event.mini_description || ''}
                    </p>
                    <div style="margin-top: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--color-text-muted);">
                        <span>📅 ${event.date}</span>
                        <span>•</span>
                        <span>⏰ ${event.time}</span>
                    </div>
                </div>
            </a>`;
    });
}

// ==================== EVENT DETAILS PAGE ====================
async function initEventDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const container = document.getElementById('detail-card');

    if (!eventId) {
        container.innerHTML = "<p>Error: No Event ID provided.</p>";
        return;
    }

    container.innerHTML = "<p>Loading event details...</p>";

    const { data: event, error: eventError } = await _supabase
        .from('Events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (eventError || !event) {
        container.innerHTML = "<p>Event not found.</p>";
        return;
    }

    // Check if already in My Events
    const { data: existing } = await _supabase
        .from('my_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single();

    const isJoined = !!existing;

    container.innerHTML = `
        <div class="card" style="max-width: 900px; margin: 0 auto;">
            <img src="${event.image_url || 'https://via.placeholder.com/800x400'}" 
                 class="event-hero" 
                 style="width:100%; height:420px; object-fit:cover; border-radius: 1.5rem 1.5rem 0 0;">
            
            <div style="padding: 3rem;">
                <h1 class="event-title">${event.title}</h1>
                <p style="color: var(--color-primary); font-weight: 600; margin-bottom: 2rem;">
                    Host: ${event.organizer || 'Club'}
                </p>

                <div style="background: rgba(255,255,255,0.03); padding: 1.8rem; border-radius: 1rem; margin-bottom: 2.5rem;">
                    <p><strong>📅 Date:</strong> ${event.date}</p>
                    <p><strong>⏰ Time:</strong> ${event.time}</p>
                    <p><strong>📍 Location:</strong> ${event.location || 'Campus Center'}</p>
                </div>

                <p style="color: var(--color-text-muted); line-height: 1.8; margin-bottom: 3rem;">
                    ${event.description || event.mini_description || 'No description available.'}
                </p>

                <button id="add-btn" class="btn-primary btn-add"
                    ${isJoined ? 'disabled style="opacity:0.6;"' : `onclick="joinEvent(${event.id})"`}>
                    ${isJoined ? '✓ Added to My Events' : 'Add to My Events'}
                </button>
            </div>
        </div>`;
}

// Join Event
async function joinEvent(eventId) {
    const btn = document.getElementById('add-btn');
    if (!btn) return;

    btn.disabled = true;
    btn.textContent = 'Adding...';

    const { error } = await _supabase
        .from('my_events')
        .insert({ user_id: userId, event_id: eventId });

    if (error) {
        console.error('Join Error:', error);
        btn.textContent = 'Failed – Try Again';
        btn.disabled = false;
        alert('Could not add event. Check console for details.');
    } else {
        btn.innerHTML = '✓ Added to My Events';
        btn.style.opacity = '0.6';
        btn.onclick = null;
    }
}

// ==================== MY EVENTS PAGE (with Remove Button) ====================
async function initMyEvents() {
    const container = document.getElementById('my-events-list');
    if (!container) return;

    container.innerHTML = '<p>Loading your events...</p>';

    const { data, error } = await _supabase
        .from('my_events')
        .select(`
            id,
            event_id,
            Events (
                id,
                title,
                date,
                time,
                location,
                image_url,
                organizer,
                mini_description
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        container.innerHTML = '<p>Error loading your events.</p>';
        return;
    }

    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `
            <p style="color: var(--color-text-muted); text-align: center; padding: 4rem 2rem;">
                You haven't saved any events yet.<br><br>
                <a href="events.html" style="color: var(--color-primary); font-weight: 500;">Browse Events →</a>
            </p>`;
        return;
    }

    data.forEach(item => {
        const event = item.Events;
        if (!event) return;

        const myEventId = item.id;   // This is the row id in my_events table

        container.innerHTML += `
            <div class="card hover-lift" style="position: relative;">
                <a href="eventdetails.html?id=${event.id}" style="text-decoration: none; color: inherit; display: block;">
                    <img src="${event.image_url || 'https://via.placeholder.com/400x200'}" 
                         style="width:100%; height:200px; object-fit:cover; border-radius: 1.5rem 1.5rem 0 0;">
                    <div style="padding: 1.5rem;">
                        <p style="color: var(--color-primary); font-size: 0.85rem; font-weight: 600;">
                            ${event.organizer || 'Club'}
                        </p>
                        <h3 style="margin: 0.6rem 0 0.8rem 0;">${event.title}</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem;">
                            ${event.mini_description || ''}
                        </p>
                        <div style="margin-top: 1.2rem; font-size: 0.85rem; color: var(--color-text-muted);">
                            📅 ${event.date} • ⏰ ${event.time}
                        </div>
                    </div>
                </a>

                <!-- Remove Button -->
                <button onclick="removeFromMyEvents(${myEventId}, this)" 
                        style="position: absolute; top: 15px; right: 15px; 
                               background: rgba(255,255,255,0.1); color: #ff4d4d; 
                               border: none; padding: 8px 14px; border-radius: 9999px; 
                               font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                    Remove
                </button>
            </div>`;
    });
}

// ==================== REMOVE FUNCTION ====================
async function removeFromMyEvents(myEventId, buttonElement) {
    if (!confirm('Remove this event from My Events?')) return;

    buttonElement.textContent = 'Removing...';
    buttonElement.disabled = true;

    const { error } = await _supabase
        .from('my_events')
        .delete()
        .eq('id', myEventId);

    if (error) {
        console.error('Remove Error:', error);
        buttonElement.textContent = 'Failed';
        setTimeout(() => {
            buttonElement.textContent = 'Remove';
            buttonElement.disabled = false;
        }, 2000);
    } else {
        // Remove the card from UI smoothly
        const card = buttonElement.closest('.card');
        if (card) {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.remove();
                
                // If no events left, show empty state
                if (document.querySelectorAll('.card').length === 0) {
                    const container = document.getElementById('my-events-list');
                    container.innerHTML = `
                        <p style="color: var(--color-text-muted); text-align: center; padding: 4rem 2rem;">
                            You haven't saved any events yet.<br><br>
                            <a href="events.html" style="color: var(--color-primary); font-weight: 500;">Browse Events →</a>
                        </p>`;
                }
            }, 300);
        }
    }
}

// ==================== ROUTER ====================
function initRouter() {
    const path = window.location.pathname.split("/").pop() || '';

    if (path === 'events.html' || path === '') {
        initEventsList();
    } 
    else if (path === 'eventdetails.html') {
        initEventDetails();
    } 
    else if (path === 'myevents.html') {
        initMyEvents();
    }
}

window.onload = initRouter;
