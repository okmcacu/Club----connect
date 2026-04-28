// 1. Initialize Supabase Client
const _supabase = supabase.createClient(
  "https://wsbzipduafiuwqvmjjxi.supabase.co",
  "sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0",
);

// 2. Local State Variables (Modify these for your testing)
const CLUB_ID = "demo_club_01";
const USER_ID = "user_99";

// 3. Tab Navigation Logic
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

// 4. Create Operations (Write to DB)
async function handleJoin() {
  const { error } = await _supabase
    .from("memberships")
    .insert([{ user_id: USER_ID, club_id: CLUB_ID }]);

  if (!error) {
    const btn = document.getElementById("join-btn");
    btn.innerText = "Joined";
    btn.disabled = true;
    btn.style.opacity = "0.5";
  }
}

async function createEvent() {
  const title = document.getElementById("event-title").value;
  const date = document.getElementById("event-date").value;

  if (!title || !date) return alert("Fill in the title and date!");

  const { error } = await _supabase
    .from("events")
    .insert([{ club_id: CLUB_ID, event_title: title, date_time: date }]);

  if (!error) {
    document.getElementById("event-title").value = "";
    loadEvents(); // Refresh list
  }
}

async function createPost() {
  const content = document.getElementById("post-input").value;
  if (!content) return;

  const { error } = await _supabase
    .from("feed_posts")
    .insert([{ user_id: USER_ID, club_id: CLUB_ID, content: content }]);

  if (!error) {
    document.getElementById("post-input").value = "";
    loadPosts(); // Refresh list
  }
}

// 5. Read Operations (Fetch from DB)
async function loadEvents() {
  const { data } = await _supabase
    .from("events")
    .select("*")
    .eq("club_id", CLUB_ID)
    .order("date_time", { ascending: true });

  const display = document.getElementById("events-display");
  display.innerHTML =
    data
      .map(
        (ev) => `
        <div class="list-item">
            <h5 style="color: var(--color-text-main);">${ev.event_title}</h5>
            <small style="color: var(--color-primary);">${new Date(ev.date_time).toLocaleString()}</small>
        </div>
    `,
      )
      .join("") ||
    '<p style="color: var(--color-text-muted);">No events found.</p>';
}

async function loadPosts() {
  const { data } = await _supabase
    .from("feed_posts")
    .select("*")
    .eq("club_id", CLUB_ID)
    .order("created_at", { ascending: false });

  const display = document.getElementById("posts-display");
  display.innerHTML =
    data
      .map(
        (post) => `
        <div class="list-item">
            <p>${post.content}</p>
            <small style="color: var(--color-text-muted);">${new Date(post.created_at || Date.now()).toLocaleDateString()}</small>
        </div>
    `,
      )
      .join("") ||
    '<p style="color: var(--color-text-muted);">No posts yet.</p>';
}
