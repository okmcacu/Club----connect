const products = [
{
id:1,
name:"Gaming Mouse",
description:"High speed RGB gaming mouse.",
price:"1200 ETB",
image:"https://images.unsplash.com/photo-1527814050087-3793815479db"
},
{
id:2,
name:"Wireless Headset",
description:"Noise cancelling premium headset.",
price:"3500 ETB",
image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
},
{
id:3,
name:"Mechanical Keyboard",
description:"RGB mechanical keyboard for gamers.",
price:"4200 ETB",
image:"https://images.unsplash.com/photo-1511467687858-23d96c32e4ae"
},
{
id:4,
name:"Smart Watch",
description:"Fitness tracking smartwatch.",
price:"2800 ETB",
image:"https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d"
}
];

let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

/* Save Wishlist */
function saveWishlist(){
localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

/* Home */
function showHome(){
document.getElementById("app").innerHTML = `
<section class="hero">
</section>
`;
}

/* Market Page */
function showMarket(){

let html = `
<div class="container">
<h1 class="page-title">Markets</h1>
<div class="grid">
`;

products.forEach(product=>{

html += `
<div class="card">
<img src="${product.image}">
<h3>${product.name}</h3>
<p>${product.description}</p>
<div class="price">${product.price}</div>
<button class="btn" onclick="showDetail(${product.id})">
View Product
</button>
</div>
`;

});

html += `
</div>
</div>
`;

document.getElementById("app").innerHTML = html;
}

/* Detail Page */
function showDetail(id){

const product = products.find(p => p.id === id);
const added = wishlist.includes(id);

document.getElementById("app").innerHTML = `
<div class="detail">

<div>
<span class="back" onclick="showMarket()">← Back</span>
<img src="${product.image}">
</div>

<div>
<h1>${product.name}</h1>
<p>${product.description}</p>
<div class="price">${product.price}</div>

<button class="btn"
onclick="addToWishlist(${product.id})"
${added ? "disabled" : ""}>
${added ? "Added" : "Add to Wishlist"}
</button>

</div>
</div>
`;
}

/* Add Wishlist */
function addToWishlist(id){

if(!wishlist.includes(id)){
wishlist.push(id);
saveWishlist();
}

showDetail(id);
}

/* Wishlist Page */
function showWishlist(){

let savedProducts = products.filter(product =>
wishlist.includes(product.id)
);

let html = `
<div class="container">
<h1 class="page-title">Wishlist</h1>
`;

if(savedProducts.length === 0){

html += `<p>No saved items yet.</p>`;

}else{

html += `<div class="grid">`;

savedProducts.forEach(product=>{

html += `
<div class="card">
<img src="${product.image}">
<h3>${product.name}</h3>
<div class="price">${product.price}</div>
<button class="btn" onclick="showDetail(${product.id})">
View Product
</button>
</div>
`;

});

html += `</div>`;
}

html += `</div>`;

document.getElementById("app").innerHTML = html;
}

/* Start */
showHome();
