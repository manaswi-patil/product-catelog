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
    brand: "Dabur",
    category: "Hair Oil",
  },
  {
    id: 2,
    name: "Bajaj Almond Drops",
    price: 120,
    description:
      "Pure almond oil enriched with vitamins for hair growth and scalp nourishment.",
    image: "images/img2.jpg",
    specifications: "100ml, Pure almond extract, Vitamin E enriched",
    brand: "Bajaj",
    category: "Hair Oil",
  },
  {
    id: 3,
    name: "Parachute Coconut Oil",
    price: 75,
    description:
      "Pure coconut oil for deep hair conditioning and natural hair care.",
    image: "images/img3.jpg",
    specifications: "300ml, 100% pure coconut oil, Cold pressed",
    brand: "Parachute",
    category: "Hair Oil",
  },
  {
    id: 4,
    name: "Himalaya Herbals Hair Oil",
    price: 95,
    description:
      "Herbal hair oil with natural ingredients for hair fall control and growth.",
    image: "images/img4.jpg",
    specifications: "150ml, Herbal formula, Ayurvedic ingredients",
    brand: "Himalaya",
    category: "Hair Oil",
  },
  {
    id: 5,
    name: "Khadi Natural Hair Oil",
    price: 110,
    description:
      "Organic hair oil with natural herbs for hair strengthening and shine.",
    image: "images/img5.jpg",
    specifications: "100ml, Organic certified, Natural herbs",
    brand: "Khadi",
    category: "Hair Oil",
  },
  {
    id: 6,
    name: "Indulekha Bringha Hair Oil",
    price: 180,
    description:
      "Ayurvedic hair oil with bringharaj for hair growth and scalp health.",
    image: "images/img6.jpg",
    specifications: "100ml, Ayurvedic formula, Bringharaj extract",
    brand: "Indulekha",
    category: "Hair Oil",
  },
  {
    id: 7,
    name: "Khadi Natural Hair Oil",
    price: 110,
    description:
      "Organic hair oil with natural herbs for hair strengthening and shine.",
    image: "images/img2.jpg",
    specifications: "100ml, Organic certified, Natural herbs",
    brand: "Khadi",
    category: "Hair Oil",
  },
  {
    id: 8,
    name: "Indulekha Bringha Hair Oil",
    price: 180,
    description:
      "Ayurvedic hair oil with bringharaj for hair growth and scalp health.",
    image: "images/img1.jpg",
    specifications: "100ml, Ayurvedic formula, Bringharaj extract",
    brand: "Indulekha",
    category: "Hair Oil",
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
    console.error("Error loading saved data:", error);
  }
}

function saveData() {
  try {
    localStorage.setItem(
      "techstore_cart_items",
      JSON.stringify(Array.from(cartItems.entries()))
    );
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

/* =========================================================
     Cart Count Update
  ========================================================= */
function updateCartCount() {
  const totalItems = Array.from(cartItems.values()).reduce(
    (sum, quantity) => sum + quantity,
    0
  );
  $("#cartCount").text(totalItems);
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
                      ? `<button class="btn btn-primary btn-sm w-100 remove-from-cart added" data-product-id="${product.id}">Remove from Cart</button>`
                      : `<button class="btn btn-primary btn-sm w-100 add-to-cart" data-product-id="${product.id}">Add to Cart</button>`
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
     Footer Functionality
  ========================================================= */

// Newsletter subscription
function setupNewsletterForm() {
  $("#newsletterForm").on("submit", function (e) {
    e.preventDefault();

    const email = $("#newsletterEmail").val().trim();

    if (!email) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    // Simulate newsletter subscription
    showToast("Thank you for subscribing to our newsletter!", "success");
    $("#newsletterEmail").val("");

    // You can add AJAX call here to actually subscribe the user
    console.log("Newsletter subscription for:", email);
  });
}

// Back to top functionality
function setupBackToTop() {
  const backToTopBtn = $("#backToTop");

  // Show/hide button based on scroll position
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 300) {
      backToTopBtn.addClass("show");
    } else {
      backToTopBtn.removeClass("show");
    }
  });

  // Smooth scroll to top when clicked
  backToTopBtn.on("click", function () {
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      800
    );
  });
}

// Smooth scroll for footer links
function setupFooterLinks() {
  $('.footer-link[href^="#"]').on("click", function (e) {
    e.preventDefault();

    const target = $(this.getAttribute("href"));
    if (target.length) {
      $("html, body").animate(
        {
          scrollTop: target.offset().top - 80,
        },
        800
      );
    }
  });
}

// Footer animations on scroll
function setupFooterAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe footer widgets for animation
  $(".footer-widget").each(function () {
    this.style.opacity = "0";
    this.style.transform = "translateY(30px)";
    this.style.transition = "all 0.6s ease";
    observer.observe(this);
  });
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

  // Footer event listeners
  setupNewsletterForm();
  setupBackToTop();
  setupFooterLinks();
  setupFooterAnimations();
}

/* =========================================================
     Cart Modal Functions
  ========================================================= */
function openCartModal() {
  const modal = new bootstrap.Modal(document.getElementById("cartModal"));
  modal.show();
  displayCartItems();
}

function displayCartItems() {
  const cartItemsList = $("#cartItemsList");

  if (cartItems.size === 0) {
    cartItemsList.html(`
      <div class="text-center py-4">
        <p class="text-muted">Your cart is empty</p>
      </div>
    `);
    return;
  }

  let cartHTML = "";
  let totalPrice = 0;

  cartItems.forEach((quantity, productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const itemTotal = product.price * quantity;
      totalPrice += itemTotal;

      cartHTML += `
        <div class="cart-item d-flex align-items-center">
          <div class="cart-item-image me-3">
            <img src="${product.image}" alt="${product.name}" 
                 class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
          </div>
          <div class="cart-item-details flex-grow-1">
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-price">₹${product.price} × ${quantity}</div>
          </div>
          <div class="cart-item-total me-3">₹${itemTotal}</div>
          <div class="cart-item-actions">
            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${productId})">
              Remove
            </button>
          </div>
        </div>
      `;
    }
  });

  cartItemsList.html(cartHTML);
  $(".cart-total-price").text(`₹${totalPrice}`);
  $(".cart-total-count").text(cartItems.size);
}

function clearCart() {
  cartItems.clear();
  updateCartCount();
  displayProducts(filteredProducts);
  saveData();
  showToast("Cart cleared successfully!", "success");

  // Close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("cartModal")
  );
  if (modal) modal.hide();
}

/* =========================================================
     Init on DOM Ready
  ========================================================= */
$(document).ready(() => init());
