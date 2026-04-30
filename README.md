# CLUB---CONNECT

**A Social Hub & Marketplace for AASTU Clubs**

ClubConnect is a web platform designed to serve as a **central social hub** for student clubs at **Addis Ababa Science and Technology University (AASTU)**. It helps students discover events, manage their club activities, and trade items within the university community through an integrated marketplace.

---

## ✨ Features

### Events System
- Browse upcoming club events
- View detailed event information (date, time, location, description)
- Save events to "My Events"
- Join/Remove events with Supabase backend

### Marketplace
- Browse items posted by fellow students
- View item details (price, condition, status, description, seller)
- Add items to Wishlist
- Dedicated Wishlist page

### User Experience
- Beautiful dark luxury UI with smooth animations
- Fully responsive design
- Sticky premium navbar across all pages
- Consistent design language

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend/Database**: [Supabase](https://supabase.com) (PostgreSQL + Auth)
- **Styling**: Custom CSS with modern glassmorphism & hover effects
- **Icons**: Unicode emojis + custom styling

---

## 📁 Project Structure

```bash
CLUB---CONNECT - MAIN-FOLDER/
├── betlehem-sefiw-markets/          # Marketplace Module
│   ├── base.css
│   ├── index.html
│   ├── market-script.js
│   ├── marketdetail.html
│   └── wishlist.html
│
├── betlehem-Eshetu-events/          # Events Module
│   ├── app.js
│   ├── base.css
│   ├── eventdetails.html
│   ├── events.html
│   └── myevents.html
│
└── biruk-clubs/                     # Clubs Module (in progress)
    ├── details.html
    ├── details.js
    ├── index.html
    ├── script.js
    └── style.css
