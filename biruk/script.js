// --- CONFIGURATION ---
const supabaseClient = supabase.createClient(
  "https://wsbzipduafiuwqvmjjxi.supabase.co",
  "sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0",
);

// --- CORE FUNCTIONS ---

/**
 * Loads communities from Supabase and builds the simplified cards
 */
async function fetchAndDisplay() {
  const { data: clubs, error } = await supabaseClient
    .from("clubs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clubs:", error);
    return;
  }

  const grid = document.getElementById("clubGrid");

  // 1. Get the list of joined IDs from the browser's memory
  const joinedClubs = JSON.parse(localStorage.getItem("joinedClubs")) || [];

  grid.innerHTML = clubs
    .map((club) => {
      const logoImg =
        club.logo_url || "https://via.placeholder.com/90/222/888?text=Logo";
      const slogan = club.slogan || "Learn. Build. Innovate.";

      // 2. Check if THIS specific club's ID is in our joined list
      const isJoined = joinedClubs.includes(club.id.toString());

      // 3. Set the button text and class based on the memory
      const buttonText = isJoined ? "Joined" : "Join Community";
      const buttonClass = isJoined ? "join-btn joined" : "join-btn";

      return `
      <div class="card" id="club-${club.id}">
          <a href="details.html?id=${club.id}" class="logo-link" title="View Details">
              <img src="${logoImg}" class="logo-img" alt="${club.name}">
          </a>
          <h3>${club.name}</h3>
          <p class="one-liner">${slogan}</p>
          <button class="${buttonClass}" onclick="joinClub(this, '${club.id}')">${buttonText}</button>
      </div>`;
    })
    .join("");
}

/**
 * Toggles the 'Joined' state locally
 */
function joinClub(button, clubId) {
  let joinedClubs = JSON.parse(localStorage.getItem("joinedClubs")) || [];
  clubId = clubId.toString();

  if (button.classList.contains("joined")) {
    button.innerText = "Join Community";
    button.classList.remove("joined");
    joinedClubs = joinedClubs.filter((id) => id !== clubId);
  } else {
    button.innerText = "Joined";
    button.classList.add("joined");
    if (!joinedClubs.includes(clubId)) joinedClubs.push(clubId);
  }
  localStorage.setItem("joinedClubs", JSON.stringify(joinedClubs));
}

/**
 * Navigation Logic for Clubs & My Clubs
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-links a");
  const pageTitle = document.getElementById("pageTitle");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const tabName = this.innerText.toLowerCase();

      // 1. Update active tab UI
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      // 2. Handle Filtering
      const allCards = document.querySelectorAll(".card");

      if (tabName === "my clubs") {
        pageTitle.innerText = "My Joined Communities";
        allCards.forEach((card) => {
          const joined = card
            .querySelector(".join-btn")
            .classList.contains("joined");
          card.style.display = joined ? "flex" : "none";
        });
      } else if (tabName === "clubs") {
        pageTitle.innerText = "Explore Communities";
        allCards.forEach((card) => (card.style.display = "flex"));
      } else {
        // Placeholder behavior for other tabs
        pageTitle.innerText = this.innerText;
        allCards.forEach((card) => (card.style.display = "none"));
      }
    });
  });
}

// --- INITIALIZE ---
fetchAndDisplay();
setupNavigation();
