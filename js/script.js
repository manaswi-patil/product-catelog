/* =========================================================
   Product Data
========================================================= */
const products = [
  {
    id: 1,
    name: "Dabur Amla Hair Oil",
    price: 89,
    description:
      "Natural amla hair oil for strong, healthy hair with traditional Ayurvedic formula.",
    image: "images/img1.jpg",
    specifications: "200ml, Natural ingredients, No chemicals",
  },
  {
    id: 2,
    name: "Bajaj Almond Drops",
    price: 120,
    description:
      "Pure almond oil enriched with vitamins for hair growth and scalp nourishment.",
    image: "images/img2.jpg",
    specifications: "100ml, Pure almond extract, Vitamin E enriched",
  },
  {
    id: 3,
    name: "Parachute Coconut Oil",
    price: 75,
    description:
      "Pure coconut oil for deep hair conditioning and natural hair care.",
    image: "images/img3.jpg",
    specifications: "300ml, 100% pure coconut oil, Cold pressed",
  },
  {
    id: 4,
    name: "Himalaya Herbals Hair Oil",
    price: 95,
    description:
      "Herbal hair oil with natural ingredients for hair fall control and growth.",
    image: "images/img4.jpg",
    specifications: "150ml, Herbal formula, Ayurvedic ingredients",
  },
  {
    id: 5,
    name: "Khadi Natural Hair Oil",
    price: 110,
    description:
      "Organic hair oil with natural herbs for hair strengthening and shine.",
    image: "images/img5.jpg",
    specifications: "100ml, Organic certified, Natural herbs",
  },
  {
    id: 6,
    name: "Indulekha Bringha Hair Oil",
    price: 180,
    description:
      "Ayurvedic hair oil with bringharaj for hair growth and scalp health.",
    image: "images/img6.jpg",
    specifications: "100ml, Ayurvedic formula, Bringharaj extract",
  },
  {
    id: 7,
    name: "Khadi Natural Hair Oil",
    price: 110,
    description:
      "Organic hair oil with natural herbs for hair strengthening and shine.",
    image: "images/img2.jpg",
    specifications: "100ml, Organic certified, Natural herbs",
  },
  {
    id: 8,
    name: "Indulekha Bringha Hair Oil",
    price: 180,
    description:
      "Ayurvedic hair oil with bringharaj for hair growth and scalp health.",
    image: "images/img1.jpg",
    specifications: "100ml, Ayurvedic formula, Bringharaj extract",
  },
];

let cartItems = new Map(); // Stores product ID & quantity
let filteredProducts = [...products];

/* =========================================================
     Initialization
  ========================================================= */
function init() {
  loadSavedData();
  displayProducts(products);
  setupEventListeners();
}

/* =========================================================
     Local Storage Handling
  ========================================================= */
function loadSavedData() {
  try {
    const savedCartItems = localStorage.getItem("techstore_cart_items");
    if (savedCartItems) {
      cartItems = new Map(JSON.parse(savedCartItems));
      updateCartCount();
    }
  } catch (error) {
    console.error("Failed to load saved data:", error);
    cartItems.clear();
  }
}

function saveData() {
  try {
    localStorage.setItem(
      "techstore_cart_items",
      JSON.stringify(Array.from(cartItems.entries()))
    );
  } catch (error) {
    console.error("Failed to save data:", error);
  }
}

/* =========================================================
     Cart Management
  ========================================================= */
function updateCartCount() {
  const cartCount = Array.from(cartItems.values()).reduce(
    (total, qty) => total + qty,
    0
  );
  $("#cartCount").text(cartCount);
  $(".cart-total-count").text(cartCount);
  updateCartModal();
}

function updateCartModal() {
  const cartItemsList = $("#cartItemsList");
  const cartTotalPrice = $(".cart-total-price");

  if (cartItems.size === 0) {
    cartItemsList.html(
      '<div class="text-center py-5 text-muted"><h6>Your cart is empty</h6><p>Add some products to get started!</p></div>'
    );
    cartTotalPrice.text("₹0");
    return;
  }

  let totalPrice = 0;

  const cartHTML = Array.from(cartItems.entries())
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return "";

      const itemTotal = product.price * quantity;
      totalPrice += itemTotal;

      return `
          <div class="cart-item d-flex align-items-center p-3 border-bottom">
  <div class="cart-item-image me-3">
    <img src="${product.image}" alt="${product.name}" 
         class="rounded bg-light" 
         style="width: 100px; height: 100px; object-fit: cover;">
  </div>
  <div class="cart-item-details flex-grow-1">
    <div class="cart-item-name fw-bold mb-1">${product.name}</div>
    <div class="cart-item-price text-muted mb-1">₹${
      product.price
    } × ${quantity}</div>
    <div class="cart-item-total fw-bold text-primary">₹${itemTotal.toFixed(
      2
    )}</div>
  </div>
  <div class="cart-item-actions">
    <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${
      product.id
    })" title="Remove item">
      ❌ Remove
    </button>
  </div>
</div>

        `;
    })
    .join("");

  cartItemsList.html(cartHTML);
  cartTotalPrice.text(`₹${totalPrice.toFixed(2)}`);
}

function openCartModal() {
  updateCartModal();
  const cartModal = new bootstrap.Modal(document.getElementById("cartModal"));
  cartModal.show();
}

function clearCart() {
  cartItems.clear();
  updateCartCount();
  displayProducts(filteredProducts);
  saveData();
  showToast("Cart cleared successfully!", "success");

  const cartModal = bootstrap.Modal.getInstance(
    document.getElementById("cartModal")
  );
  if (cartModal) cartModal.hide();
}

/* =========================================================
     Product Display
  ========================================================= */
function displayProducts(productsToShow) {
  const grid = $("#productsGrid");

  if (productsToShow.length === 0) {
    grid.html(`
        <div class="col-12">
          <div class="text-center py-5 text-muted">
            <h5>No products found</h5>
            <p>Try adjusting your search criteria</p>
          </div>
        </div>
      `);
    return;
  }

  const productsHTML = productsToShow
    .map((product) => {
      const isInCart = cartItems.has(product.id);
      return `
          <div class="col-12 col-sm-6 col-md-4 col-lg-3 product-card" data-product-id="${
            product.id
          }">
            <div class="card h-100">
              <div class=" position-relative">
                <div class="product-category">${product.category}</div>
                <button class="wishlist-icon" onclick="toggleWishlist(${
                  product.id
                })" title="Add to wishlist">🤍</button>
              </div>
              
              <div class="card-body d-flex flex-column text-center">
                <div class="text-center mb-4">
                
                    <div class="cart-item-image me-3">
    <img src="${product.image}" alt="${product.name}" 
         class="rounded bg-light" 
         style="width: 60px; height: 60px; object-fit: cover;">
  </div>
                </div>
                
                <h6 class="card-title product-name">${product.name}</h6>
                <div class="product-price h5 mb-3">₹${product.price}</div>
                <p class="card-text product-description flex-grow-1">${
                  product.description
                }</p>
                
                <div class="product-actions mt-auto">
                  ${
                    isInCart
                      ? `<button class="btn btn-danger btn-sm w-100 remove-from-cart" data-product-id="${product.id}">❌ Remove from Cart</button>`
                      : `<button class="btn btn-primary btn-sm w-100 add-to-cart" data-product-id="${product.id}">🛒 Add to Cart</button>`
                  }
                </div>
              </div>
            </div>
          </div>
        `;
    })
    .join("");

  grid.html(productsHTML);
}

/* =========================================================
     Wishlist
  ========================================================= */
function toggleWishlist(productId) {
  const product = products.find((p) => p.id === productId);
  if (product) showToast(`${product.name} added to wishlist!`, "success");
}

/* =========================================================
     Cart Actions
  ========================================================= */
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const currentQuantity = cartItems.get(productId) || 0;
  cartItems.set(productId, currentQuantity + 1);

  updateCartCount();
  displayProducts(filteredProducts);
  saveData();
  showToast(`Added ${product.name} to cart!`, "success");
}

function removeFromCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const currentQuantity = cartItems.get(productId) || 0;
  currentQuantity > 1
    ? cartItems.set(productId, currentQuantity - 1)
    : cartItems.delete(productId);

  updateCartCount();
  displayProducts(filteredProducts);
  saveData();
  showToast(`Removed ${product.name} from cart!`, "info");
}

/* =========================================================
     Search
  ========================================================= */
function filterProducts() {
  const searchTerm = $("#searchInput").val().toLowerCase();

  filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm) ||
      p.specifications.toLowerCase().includes(searchTerm)
  );

  displayProducts(filteredProducts);
}

/* =========================================================
     Toast Notifications
  ========================================================= */
function showToast(message, type = "success") {
  const backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
  const icon = type === "success" ? "🛒" : "❌";

  Toastify({
    text: `${icon} ${message}`,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor,
    color: "white",
    stopOnFocus: true,
    style: {
      borderRadius: "10px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  }).showToast();
}

/* =========================================================
     Event Listeners
  ========================================================= */
function setupEventListeners() {
  $("#searchInput").on("input", filterProducts);

  $("#productsGrid").on("click", ".add-to-cart", function () {
    addToCart(parseInt($(this).data("product-id")));
  });

  $("#productsGrid").on("click", ".remove-from-cart", function () {
    removeFromCart(parseInt($(this).data("product-id")));
  });
}

/* =========================================================
     Init on DOM Ready
  ========================================================= */
$(document).ready(() => init());
