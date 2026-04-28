// 1. Initialize Supabase Client
const _supabase = supabase.createClient(
  "https://wsbzipduafiuwqvmjjxi.supabase.co",
  "sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0",
);

// 2. Local State Variables
let CURRENT_CLUB_ID = null;
let CURRENT_USER_ID = "user_99"; // In production, this would come from auth

// 3. Main Functions to Display Clubs
async function showAllClubs() {
  CURRENT_CLUB_ID = null;
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = '<div class="loading">Loading clubs...</div>';

  try {
    const { data: clubs, error } = await _supabase
      .from("clubs")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    if (!clubs || clubs.length === 0) {
      mainContent.innerHTML =
        '<div class="error">No clubs found. Create some clubs in your database first!</div>';
      return;
    }

    // Display clubs in grid
    mainContent.innerHTML = `
      <div class="clubs-grid">
        ${clubs
          .map(
            (club) => `
          <div class="club-card" onclick="showClubDetails('${club.id}')">
            <h3>${escapeHtml(club.name)}</h3>
            <p>${escapeHtml(club.description || "No description available")}</p>
            <div class="club-meta">
              <span class="member-count">👥 Loading members...</span>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;

    // Load member counts for each club
    for (const club of clubs) {
      loadMemberCount(club.id);
    }
  } catch (error) {
    console.error("Error loading clubs:", error);
    mainContent.innerHTML = `<div class="error">Error loading clubs: ${error.message}</div>`;
  }
}

async function loadMemberCount(clubId) {
  try {
    const { count, error } = await _supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("club_id", clubId);

    if (!error) {
      const clubCard = document.querySelector(
        `.club-card[onclick="showClubDetails('${clubId}')"]`,
      );
      if (clubCard) {
        const memberSpan = clubCard.querySelector(".member-count");
        if (memberSpan) {
          memberSpan.textContent = `👥 ${count} member${count !== 1 ? "s" : ""}`;
        }
      }
    }
  } catch (error) {
    console.error("Error loading member count:", error);
  }
}

async function showMyClubs() {
  CURRENT_CLUB_ID = null;
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = '<div class="loading">Loading your clubs...</div>';

  try {
    // First get user's memberships
    const { data: memberships, error: membershipError } = await _supabase
      .from("memberships")
      .select("club_id")
      .eq("user_id", CURRENT_USER_ID);

    if (membershipError) throw membershipError;

    if (!memberships || memberships.length === 0) {
      mainContent.innerHTML =
        '<div class="error">You haven\'t joined any clubs yet. Browse clubs and join!</div>';
      return;
    }

    const clubIds = memberships.map((m) => m.club_id);

    // Then fetch the club details
    const { data: clubs, error: clubsError } = await _supabase
      .from("clubs")
      .select("*")
      .in("id", clubIds)
      .order("name", { ascending: true });

    if (clubsError) throw clubsError;

    if (!clubs || clubs.length === 0) {
      mainContent.innerHTML = '<div class="error">No clubs found.</div>';
      return;
    }

    mainContent.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h2>My Clubs</h2>
      </div>
      <div class="clubs-grid">
        ${clubs
          .map(
            (club) => `
          <div class="club-card" onclick="showClubDetails('${club.id}')">
            <h3>${escapeHtml(club.name)}</h3>
            <p>${escapeHtml(club.description || "No description available")}</p>
            <div class="club-meta">
              <span class="member-count">👥 Member</span>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  } catch (error) {
    console.error("Error loading my clubs:", error);
    mainContent.innerHTML = `<div class="error">Error loading your clubs: ${error.message}</div>`;
  }
}

// 4. Club Detail View
async function showClubDetails(clubId) {
  CURRENT_CLUB_ID = clubId;
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = '<div class="loading">Loading club details...</div>';

  try {
    // Fetch club details
    const { data: club, error: clubError } = await _supabase
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .single();

    if (clubError) throw clubError;

    // Check if user has joined
    const { data: membership } = await _supabase
      .from("memberships")
      .select("*")
      .eq("user_id", CURRENT_USER_ID)
      .eq("club_id", clubId)
      .single();

    const hasJoined = !!membership;

    // Load member count
    const { count: memberCount } = await _supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("club_id", clubId);

    mainContent.innerHTML = `
      <button class="back-button" onclick="showAllClubs()">Back to all clubs</button>
      
      <div class="card club-header">
        <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
          <div style="flex: 1;">
            <h1>${escapeHtml(club.name)}</h1>
            <p class="club-description">${escapeHtml(club.description || "No description available")}</p>
            <small class="text-muted">👥 ${memberCount || 0} members</small>
          </div>
          <button 
            id="join-btn"
            class="btn-primary" 
            onclick="handleJoin()"
            ${hasJoined ? 'disabled style="opacity: 0.5;"' : ""}
          >
            ${hasJoined ? "✓ Joined" : "Join Club"}
          </button>
        </div>
        
        <div class="tab-navigation">
          <button class="tab-link active" onclick="showTab('description', this)">About</button>
          <button class="tab-link" onclick="showTab('events', this)">Events</button>
          <button class="tab-link" onclick="showTab('feed', this)">Feed</button>
        </div>
      </div>
      
      <div class="club-content">
        <div id="description-tab" class="tab-pane">
          <div class="card" style="padding: 2rem">
            <h3 style="margin-bottom: 1rem;">About ${escapeHtml(club.name)}</h3>
            <p class="text-muted">
              ${escapeHtml(club.full_description || club.description || "Welcome to the club! More details coming soon.")}
            </p>
          </div>
        </div>
        
        <div id="events-tab" class="tab-pane" style="display: none">
          <div class="card" style="padding: 2rem">
            <h3 style="margin-bottom: 1rem;">📅 Schedule New Event</h3>
            <input type="text" id="event-title" placeholder="Event Title" class="dark-input" />
            <input type="datetime-local" id="event-date" class="dark-input" />
            <button class="btn-primary" onclick="createEvent()">Create Event</button>
          </div>
          <div class="card" style="padding: 2rem">
            <h4 style="margin-bottom: 1rem;">Upcoming Events</h4>
            <div id="events-display"></div>
          </div>
        </div>
        
        <div id="feed-tab" class="tab-pane" style="display: none">
          <div class="card" style="padding: 2rem">
            <textarea id="post-input" placeholder="What's happening?" class="dark-input" style="height: 100px"></textarea>
            <button class="btn-primary" onclick="createPost()">Post</button>
          </div>
          <div class="card" style="padding: 2rem">
            <h4 style="margin-bottom: 1rem;">Recent Activity</h4>
            <div id="posts-display"></div>
          </div>
        </div>
      </div>
    `;

    // Load initial data
    if (hasJoined) {
      loadEvents();
      loadPosts();
    } else {
      // Show message that user needs to join first
      const eventsDisplay = document.getElementById("events-display");
      const postsDisplay = document.getElementById("posts-display");
      if (eventsDisplay)
        eventsDisplay.innerHTML =
          '<p class="text-muted">Join the club to see events!</p>';
      if (postsDisplay)
        postsDisplay.innerHTML =
          '<p class="text-muted">Join the club to see posts!</p>';
    }
  } catch (error) {
    console.error("Error loading club details:", error);
    mainContent.innerHTML = `<div class="error">Error loading club: ${error.message}</div>`;
  }
}

// 5. Tab Navigation Logic
function showTab(tabId, btnElement) {
  document
    .querySelectorAll(".tab-pane")
    .forEach((p) => (p.style.display = "none"));
  document
    .querySelectorAll(".tab-link")
    .forEach((l) => l.classList.remove("active"));

  document.getElementById(tabId + "-tab").style.display = "block";
  btnElement.classList.add("active");

  // Trigger Data Loading
  if (tabId === "events") loadEvents();
  if (tabId === "feed") loadPosts();
}

// 6. Create Operations (Write to DB)
async function handleJoin() {
  if (!CURRENT_CLUB_ID) return;

  const { error } = await _supabase
    .from("memberships")
    .insert([{ user_id: CURRENT_USER_ID, club_id: CURRENT_CLUB_ID }]);

  if (!error) {
    const btn = document.getElementById("join-btn");
    btn.innerText = "✓ Joined";
    btn.disabled = true;
    btn.style.opacity = "0.5";

    // Refresh the view to show events and feed
    showClubDetails(CURRENT_CLUB_ID);
  } else {
    alert("Error joining club: " + error.message);
  }
}

async function createEvent() {
  const title = document.getElementById("event-title").value;
  const date = document.getElementById("event-date").value;

  if (!title || !date) return alert("Fill in the title and date!");

  const { error } = await _supabase
    .from("events")
    .insert([
      { club_id: CURRENT_CLUB_ID, event_title: title, date_time: date },
    ]);

  if (!error) {
    document.getElementById("event-title").value = "";
    document.getElementById("event-date").value = "";
    loadEvents(); // Refresh list
  } else {
    alert("Error creating event: " + error.message);
  }
}

async function createPost() {
  const content = document.getElementById("post-input").value;
  if (!content) return;

  const { error } = await _supabase
    .from("feed_posts")
    .insert([
      { user_id: CURRENT_USER_ID, club_id: CURRENT_CLUB_ID, content: content },
    ]);

  if (!error) {
    document.getElementById("post-input").value = "";
    loadPosts(); // Refresh list
  } else {
    alert("Error creating post: " + error.message);
  }
}

// 7. Read Operations (Fetch from DB)
async function loadEvents() {
  if (!CURRENT_CLUB_ID) return;

  const { data, error } = await _supabase
    .from("events")
    .select("*")
    .eq("club_id", CURRENT_CLUB_ID)
    .order("date_time", { ascending: true });

  if (error) {
    console.error("Error loading events:", error);
    return;
  }

  const display = document.getElementById("events-display");
  if (!display) return;

  display.innerHTML =
    data.length > 0
      ? data
          .map(
            (ev) => `
          <div class="list-item">
            <h5>📌 ${escapeHtml(ev.event_title)}</h5>
            <small class="text-primary">${new Date(ev.date_time).toLocaleString()}</small>
          </div>
        `,
          )
          .join("")
      : '<p class="text-muted">No events found.</p>';
}

async function loadPosts() {
  if (!CURRENT_CLUB_ID) return;

  const { data, error } = await _supabase
    .from("feed_posts")
    .select("*")
    .eq("club_id", CURRENT_CLUB_ID)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading posts:", error);
    return;
  }

  const display = document.getElementById("posts-display");
  if (!display) return;

  display.innerHTML =
    data.length > 0
      ? data
          .map(
            (post) => `
          <div class="list-item">
            <p>💬 ${escapeHtml(post.content)}</p>
            <small class="text-muted">${new Date(post.created_at || Date.now()).toLocaleDateString()}</small>
          </div>
        `,
          )
          .join("")
      : '<p class="text-muted">No posts yet. Be the first to post!</p>';
}

// 8. Helper Functions
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 9. Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  showAllClubs();
});
