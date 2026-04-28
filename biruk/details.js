// 1. INITIALIZE SUPABASE
const supabaseClient = supabase.createClient(
  "https://wsbzipduafiuwqvmjjxi.supabase.co",
  "sb_publishable_WvATkOwadGEY59I3gfn8Tw_vA5wpiM0",
);

/**
 * Loads the specific community data based on the ID in the URL
 */
async function loadDetails() {
  // Get the club ID from the browser address bar (e.g., details.html?id=5)
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get("id");

  const container = document.getElementById("detailsContainer");

  if (!clubId) {
    container.innerHTML = `<div class="loading">Community not found. <a href="index.html">Go back</a></div>`;
    return;
  }

  // Fetch the specific row from Supabase
  const { data: club, error } = await supabaseClient
    .from("clubs")
    .select("*")
    .eq("id", clubId)
    .single();

  if (error || !club) {
    console.error("Supabase Error:", error);
    container.innerHTML = `<div class="loading">Error loading community details.</div>`;
    return;
  }

  // Set fallback images if they are missing in the database
  const mainImg =
    club.image_url || "https://via.placeholder.com/600x400?text=Banner+1";
  const sideImg =
    club.image2_url || "https://via.placeholder.com/600x400?text=Banner+2";
  const logoImg = club.logo_url || "https://via.placeholder.com/120?text=Logo";

  // Build the HTML structure
  container.innerHTML = `
        <div class="details-card">
            <div class="image-header-full">
                <img src="${mainImg}" class="img-half" alt="Banner Image 1">
                <img src="${sideImg}" class="img-half" alt="Banner Image 2">
            </div>

            <div class="details-content">
                <img src="${logoImg}" class="details-logo-large" alt="Club Logo">
                <h1 class="details-title">${club.name}</h1>
                <p class="details-slogan">${club.slogan || "Learn. Build. Innovate."}</p>
                
                <div class="about-section">
                    <h2 class="about-header">About the Community</h2>
                    <div class="about-text">
                        ${marked.parse(club.description || "No detailed description available.")}
                    </div>
                </div>

                <div class="details-action">
                    <button class="join-btn-large" onclick="toggleJoin(this)">
                        Join Community
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handles the Join Community toggle logic
 * @param {HTMLElement} button - The button element clicked
 */
function toggleJoin(button) {
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get("id");

  // Get existing joined clubs from localStorage or start empty array
  let joinedClubs = JSON.parse(localStorage.getItem("joinedClubs")) || [];

  if (button.classList.contains("joined")) {
    // Unjoin: Remove ID from the list
    button.innerText = "Join Community";
    button.classList.remove("joined");
    joinedClubs = joinedClubs.filter((id) => id !== clubId);
  } else {
    // Join: Add ID to the list
    button.innerText = "Joined";
    button.classList.add("joined");
    if (!joinedClubs.includes(clubId)) joinedClubs.push(clubId);
  }

  // Save the updated list back to localStorage
  localStorage.setItem("joinedClubs", JSON.stringify(joinedClubs));
}

// Run the function as soon as the script loads
loadDetails();
