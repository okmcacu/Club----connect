import { supabase } from "./supabaseClient.js";

// 1. JOIN LOGIC (Image 6)
async function handleJoin(clubId, userId) {
  const { data, error } = await supabase
    .from("memberships")
    .insert([{ user_id: userId, club_id: clubId }]);

  if (!error) {
    const btn = document.getElementById("join-btn");
    btn.innerText = "Joined";
    btn.style.background = "var(--color-bg-main)";
    btn.style.color = "var(--color-text-muted)";
    btn.disabled = true;
  }
}

// 2. SCHEDULE EVENT LOGIC (Image 3)
async function createEvent(clubId, title, date) {
  const { error } = await supabase.from("events").insert([
    {
      club_id: clubId,
      event_title: title,
      date_time: date,
    },
  ]);

  if (!error) refreshEvents();
}

// 3. FEED LOGIC (Image 4)
async function createPost(userId, clubId) {
  const content = document.getElementById("post-input").value;
  const { error } = await supabase.from("feed_posts").insert([
    {
      user_id: userId,
      club_id: clubId,
      content: content,
    },
  ]);

  if (!error) {
    document.getElementById("post-input").value = "";
    refreshFeed();
  }
}

// TAB SWITCHING UTILITY
function showTab(tabName) {
  const tabs = ["description", "events", "feed"];
  tabs.forEach((t) => {
    document.getElementById(`${t}-tab`).style.display =
      t === tabName ? "block" : "none";
  });
}
