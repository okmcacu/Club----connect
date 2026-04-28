const supabaseClient = supabase.createClient(
  "https://wsbzipduafiuwqvmjjxi.supabase.co",
  "sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0",
);

async function fetchAndDisplay() {
  const { data: clubs, error } = await supabaseClient
    .from("clubs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return console.error(error);

  const grid = document.getElementById("clubGrid");
  grid.innerHTML = clubs
    .map((club) => {
      const mainImg = club.image_url || "https://via.placeholder.com/200x180";
      const sideImg = club.image2_url || "https://via.placeholder.com/200x180";
      const logoImg = club.logo_url || "https://via.placeholder.com/64";

      return `
      <div class="card" id="club-${club.id}">
          <div class="image-header">
              <img src="${mainImg}" class="img-half">
              <img src="${sideImg}" class="img-half">
          </div>
          <div class="content">
              <img src="${logoImg}" class="logo-img">
              <h3>${club.name}</h3>
              <span class="slogan-text">${club.slogan || ""}</span>
              <div class="description-text">${marked.parse(club.description || "")}</div>
          </div>
          <button class="join-btn" onclick="joinClub(this)">Join Community</button>
      </div>`;
    })
    .join("");
}

function joinClub(button) {
  if (button.classList.contains("joined")) {
    button.innerText = "Join Community";
    button.classList.remove("joined");
  } else {
    button.innerText = "Joined";
    button.classList.add("joined");
  }
}

// Navigation Logic
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const linkText = this.innerText.toLowerCase();
    const pageTitle = document.getElementById("pageTitle");

    // 1. Update Active State for ALL tabs
    document.querySelector(".nav-links a.active")?.classList.remove("active");
    this.classList.add("active");

    // 2. Filter logic only for your specific parts
    const allCards = document.querySelectorAll(".card");

    if (linkText === "my clubs") {
      pageTitle.innerText = "My Joined Communities";
      allCards.forEach((card) => {
        const isJoined = card
          .querySelector(".join-btn")
          .classList.contains("joined");
        card.style.display = isJoined ? "flex" : "none";
      });
    } else if (linkText === "clubs") {
      pageTitle.innerText = "Explore Communities";
      allCards.forEach((card) => (card.style.display = "flex"));
    } else {
      // For all other tabs (Home, Events, etc.), just show empty or all
      // Since they aren't your part, we keep the UI but don't change the grid content
      pageTitle.innerText = this.innerText;
      allCards.forEach((card) => (card.style.display = "none"));
    }
  });
});

fetchAndDisplay();
