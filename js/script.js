/* =========================================================
   Product Catalog - Assignment Requirements Implementation
========================================================= */

// Global variables
let products = [];
let cartItems = new Map(); // Stores product ID & quantity
let filteredProducts = [];
let currentProductId = null;
let selectedCategory = "all";
let currentPage = 1;
let productsPerPage = 8;
let showAllProducts = false;

/* =========================================================
     Initialization
  ========================================================= */
function init() {
  loadProductsFromJSON();
  loadSavedData();
  setupEventListeners();
}

/* =========================================================
     AJAX Product Loading
  ========================================================= */
function loadProductsFromJSON() {
  fetch("products.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      products = data;
      filteredProducts = [...products];
      displayProducts(products);
      setupCategoryFilter();
    })
    .catch((error) => {
      console.error("Error loading products:", error);
      showToast("Failed to load products. Please refresh the page.", "error");
    });
}

/* =========================================================
     Local Storage Handling
  ========================================================= */
function loadSavedData() {
  try {
    const savedCartItems = localStorage.getItem("haircare_cart_items");
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
      "haircare_cart_items",
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
     Category Filter Setup
  ========================================================= */
function setupCategoryFilter() {
  const categories = ["all", ...new Set(products.map((p) => p.category))];

  let categoryHTML = "";

  categories.forEach((category) => {
    if (category === "all") {
      const productCount = products.length;
      categoryHTML += `
        <li>
          <a class="dropdown-item category-option active" href="#" data-category="${category}">
            <i class="fas fa-th-large me-2"></i>All Categories
            <span class="badge bg-primary ms-auto">${productCount}</span>
          </a>
        </li>
      `;
    } else {
      const productCount = products.filter(
        (p) => p.category === category
      ).length;
      categoryHTML += `
        <li>
          <a class="dropdown-item category-option" href="#" data-category="${category}">
            <i class="fas fa-tag me-2"></i>${category}
            <span class="badge bg-secondary ms-auto">${productCount}</span>
          </a>
        </li>
      `;
    }
  });

  // Insert after the divider
  $(".category-dropdown-menu .dropdown-divider").after(categoryHTML);
}

function filterByCategory(category) {
  selectedCategory = category;
  currentPage = 1;
  showAllProducts = false;

  // Update active state in dropdown
  $(".category-option").removeClass("active");
  $(`.category-option[data-category="${category}"]`).addClass("active");

  // Update dropdown button text
  const categoryText = category === "all" ? "All Categories" : category;
  $("#selectedCategoryText").text(categoryText);

  // Apply category filter
  if (category === "all") {
    filteredProducts = [...products];
  } else {
    filteredProducts = products.filter((p) => p.category === category);
  }

  // Apply search filter if exists
  const searchTerm = $("#searchInput").val().toLowerCase();
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm) ||
        p.specifications.toLowerCase().includes(searchTerm)
    );
  }

  displayProducts(filteredProducts);
}

/* =========================================================
     Pagination Functions
  ========================================================= */
function getPaginatedProducts(products, page, perPage) {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  return products.slice(startIndex, endIndex);
}

function setupPagination(totalProducts, currentPage, productsPerPage) {
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  if (totalPages <= 1) {
    $("#paginationContainer").html("");
    return;
  }

  let paginationHTML = `
    <nav aria-label="Product pagination" class="mt-4">
      <ul class="pagination justify-content-center">
  `;

  // Previous button
  paginationHTML += `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <button class="page-link" onclick="changePage(${currentPage - 1})" ${
    currentPage === 1 ? "disabled" : ""
  }>
        <i class="fas fa-chevron-left"></i> Previous
      </button>
    </li>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      paginationHTML += `
        <li class="page-item ${i === currentPage ? "active" : ""}">
          <button class="page-link" onclick="changePage(${i})">${i}</button>
        </li>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += `
        <li class="page-item disabled">
          <span class="page-link">...</span>
        </li>
      `;
    }
  }

  // Next button
  paginationHTML += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <button class="page-link" onclick="changePage(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }>
        Next <i class="fas fa-chevron-right"></i>
      </button>
    </li>
  `;

  paginationHTML += `
      </ul>
    </nav>
  `;

  $("#paginationContainer").html(paginationHTML);
}

function changePage(page) {
  currentPage = page;
  displayProducts(filteredProducts);
}

function showAllProductsInCategory() {
  showAllProducts = true;
  displayProducts(filteredProducts);
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
            <p>Try adjusting your search criteria or category selection</p>
          </div>
        </div>
      `);
    $("#paginationContainer").html("");
    return;
  }

  let productsToDisplay = productsToShow;
  let showViewAllButton = false;

  // Handle pagination for different categories
  if (selectedCategory === "all") {
    // For "All Products" - always show pagination
    productsToDisplay = getPaginatedProducts(
      productsToShow,
      currentPage,
      productsPerPage
    );
    setupPagination(productsToShow.length, currentPage, productsPerPage);
  } else {
    // For specific categories - show limited products initially
    if (!showAllProducts && productsToShow.length > 8) {
      productsToDisplay = productsToShow.slice(0, 8);
      showViewAllButton = true;
      $("#paginationContainer").html("");
    } else {
      showAllProducts = true;
      productsToDisplay = productsToShow;
      $("#paginationContainer").html("");
    }
  }

  const productsHTML = productsToDisplay
    .map((product) => {
      // compute values (place above the template for each product)
      const mrp = product.mrp ?? Math.round(product.price / 0.85);
      const discountPercent =
        product.discountPercent ??
        Math.round(((mrp - product.price) / mrp) * 100);
      const discountedPrice = product.price;
      const youSave = mrp - discountedPrice;

      return `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3 product-card" data-product-id="${
          product.id
        }">
          <div class="card h-100">
            <div class="position-relative">
            </div>
            
            <div class="card-body d-flex flex-column text-start">
              <div class="text-center mb-3">
                <div class="cart-item-image me-0 product-image-clickable" data-product-id="${
                  product.id
                }" title="View details" style="cursor:pointer;">
                  <img src="${product.image}" alt="${
        product.name
      }" class="rounded bg-light" style="width: 60px; height: 60px; object-fit: cover;">
                </div>
              </div>

              <!-- Name + Discounted Price (same line) -->
              <div class="w-100 mb-1">
                <h6 class="product-name mb-1">${product.name}</h6>
              </div>

              <!-- Discount info first (MRP + % OFF + you save) -->
              <div class="w-100 mb-2 text-start">
                <small class="text-muted">
                  <span class="text-decoration-line-through me-2">₹${mrp}</span>
                  <span class="badge bg-success me-2">${discountPercent}% OFF</span>
                  <span>You save ₹${youSave}</span>
                </small>
              </div>

              <!-- Current price below discount -->
              <div class="w-100 mb-3 text-start">
                <div class="h6 mb-0 fw-bold">₹${discountedPrice}</div>
              </div>

              <!-- Description -->
              <p class="card-text product-description flex-grow-1">${
                product.description
              }</p>
              
              <!-- Actions -->
              <div class="product-actions mt-auto">
                ${
                  cartItems.has(product.id)
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

  // Add "View All" button for specific categories
  if (showViewAllButton) {
    grid.append(`
      <div class="col-12 text-center mt-4">
        <button class="btn btn-outline-primary btn-lg" onclick="showAllProductsInCategory()">
          <i class="fas fa-eye me-2"></i>View All ${productsToShow.length} Products
        </button>
      </div>
    `);
  }
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

  // Find the product card element
  const productCard = $(`.product-card[data-product-id="${productId}"]`);

  // Add fade-out animation
  productCard.addClass("fade-out");

  // Remove from cart after animation
  setTimeout(() => {
    cartItems.delete(productId);
    updateCartCount();
    displayProducts(filteredProducts);
    saveData();
    showToast(`Removed ${product.name} from cart!`, "info");
  }, 500);
}

/* =========================================================
     Search Functions
  ========================================================= */
function filterProducts() {
  const searchTerm = $("#searchInput").val().toLowerCase();

  // Start with category filter
  let baseProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Apply search filter
  filteredProducts = baseProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      p.specifications.toLowerCase().includes(searchTerm)
  );

  // Reset pagination for search
  currentPage = 1;
  showAllProducts = false;

  // Show/hide search suggestions
  if (searchTerm.length > 0) {
    showSearchSuggestions(searchTerm);
  } else {
    hideSearchSuggestions();
  }

  displayProducts(filteredProducts);
}

function showSearchSuggestions(searchTerm) {
  const suggestions = [];

  // Get unique suggestions from products
  const allSuggestions = new Set();

  products.forEach((product) => {
    if (product.name.toLowerCase().includes(searchTerm)) {
      allSuggestions.add(product.name);
    }
    if (product.brand.toLowerCase().includes(searchTerm)) {
      allSuggestions.add(product.brand);
    }
    if (product.category.toLowerCase().includes(searchTerm)) {
      allSuggestions.add(product.category);
    }
  });

  // Convert to array and limit results
  const suggestionArray = Array.from(allSuggestions).slice(0, 5);

  if (suggestionArray.length > 0) {
    let suggestionsHTML = "";

    suggestionArray.forEach((suggestion) => {
      const icon = getSuggestionIcon(suggestion);
      suggestionsHTML += `
        <div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">
          <div class="suggestion-icon">
            <i class="${icon}"></i>
          </div>
          <div class="suggestion-text">
            <div class="suggestion-title">${suggestion}</div>
            <div class="suggestion-subtitle">Click to search</div>
          </div>
        </div>
      `;
    });

    $("#searchSuggestions").html(suggestionsHTML).addClass("show");
  } else {
    hideSearchSuggestions();
  }
}

function hideSearchSuggestions() {
  $("#searchSuggestions").removeClass("show");
}

function selectSuggestion(suggestion) {
  $("#searchInput").val(suggestion);
  hideSearchSuggestions();
  filterProducts();

  // Add visual feedback
  const searchInput = $("#searchInput");
  searchInput.focus();

  showToast(`Searching for "${suggestion}"`, "info");
}

function getSuggestionIcon(suggestion) {
  // Determine icon based on suggestion type
  if (products.some((p) => p.name === suggestion)) {
    return "fas fa-tag";
  } else if (products.some((p) => p.brand === suggestion)) {
    return "fas fa-crown";
  } else if (products.some((p) => p.category === suggestion)) {
    return "fas fa-layer-group";
  }
  return "fas fa-search";
}

function performSearch() {
  const searchTerm = $("#searchInput").val().trim();

  if (searchTerm) {
    // Add loading state
    $(".search-wrapper").addClass("loading");

    setTimeout(() => {
      $(".search-wrapper").removeClass("loading");
      filterProducts();

      // Show toast notification
      showToast(`Searching for "${searchTerm}"...`, "info");

      // Hide suggestions
      hideSearchSuggestions();
    }, 800);
  } else {
    showToast("Please enter a search term", "error");
  }
}

function clearSearch() {
  $("#searchInput").val("");
  hideSearchSuggestions();
  filterProducts();

  // Add visual feedback
  const searchInput = $("#searchInput");
  searchInput.focus();

  // Show toast notification
  showToast("Search cleared", "info");
}

/* =========================================================
     Product Detail Modal
  ========================================================= */
function renderProductDetailFooter(id) {
  const inCart = cartItems.has(Number(id));
  $("#productDetailFooter").html(`
    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
    ${
      inCart
        ? `<button type="button" class="btn btn-outline-danger modal-remove-from-cart" data-product-id="${id}">Remove from Cart</button>`
        : `<button type="button" class="btn btn-add-to-cart modal-add-to-cart" data-product-id="${id}">Add to Cart</button>`
    }
  `);
}

function showProductDetails(productId) {
  const id = Number(productId);
  const product = products.find((p) => p.id === id);
  if (!product) return;

  currentProductId = id;

  const mrp = product.mrp ?? Math.round(product.price / 0.85);
  const discountPercent =
    product.discountPercent ?? Math.round(((mrp - product.price) / mrp) * 100);

  $("#productDetailContent").html(`
    <div class="row g-4">
      <div class="col-md-5">
        <img src="${product.image}" alt="${
    product.name
  }" class="img-fluid rounded w-100" style="object-fit:cover; max-height:320px;">
      </div>
      <div class="col-md-7">
        <h4 class="mb-2">${product.name}</h4>
        <div class="d-flex align-items-baseline gap-3 mb-2">
          <div class="h4 mb-0 fw-bold text-dark">₹${product.price}</div>
          <small class="text-muted"><span class="text-decoration-line-through">₹${mrp}</span></small>
          <span class="badge bg-success">${discountPercent}% OFF</span>
        </div>
        <p class="text-muted mb-3">${product.description}</p>
        <div class="mb-2"><strong>Brand:</strong> ${product.brand ?? "-"}</div>
        <div class="mb-2"><strong>Category:</strong> ${
          product.category ?? "-"
        }</div>
        <div class="mb-2"><strong>Specifications:</strong> ${
          product.specifications ?? "-"
        }</div>
      </div>
    </div>
  `);

  renderProductDetailFooter(id);
  new bootstrap.Modal(document.getElementById("productDetailModal")).show();
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
  $(".cart-total-count").text(
    Array.from(cartItems.values()).reduce((sum, qty) => sum + qty, 0)
  );
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
     Category Modal Functions
  ========================================================= */
function openCategoryModal() {
  const modal = new bootstrap.Modal(document.getElementById("categoryModal"));
  modal.show();
  setupCategoryModal();
}

function setupCategoryModal() {
  const categories = [...new Set(products.map((p) => p.category))];
  const categoryGrid = $("#categoryGrid");

  let categoryHTML = "";

  categories.forEach((category) => {
    const productCount = products.filter((p) => p.category === category).length;
    const isActive = category === selectedCategory ? "active" : "";

    categoryHTML += `
      <div class="category-card ${isActive}" onclick="selectCategory('${category}')">
        <div class="category-icon">
          <i class="fas fa-tag"></i>
        </div>
        <div class="category-info">
          <h6 class="category-name">${category}</h6>
          <p class="category-count">${productCount} Products</p>
        </div>
        <div class="category-badge">
          <span class="badge bg-secondary">${productCount}</span>
        </div>
      </div>
    `;
  });

  categoryGrid.html(categoryHTML);

  // Update All Categories count
  $(".all-categories .category-count").text(`${products.length} Products`);
}

function selectCategory(category) {
  // Remove active class from all cards
  $(".category-card").removeClass("active");

  // Add active class to selected card
  if (category === "all") {
    $(".all-categories").addClass("active");
  } else {
    $(`.category-card:contains('${category}')`).addClass("active");
  }

  // Store selected category temporarily
  tempSelectedCategory = category;
}

function applyCategoryFilter() {
  if (tempSelectedCategory) {
    filterByCategory(tempSelectedCategory);

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("categoryModal")
    );
    if (modal) modal.hide();

    // Show toast notification
    const categoryText =
      tempSelectedCategory === "all" ? "All Categories" : tempSelectedCategory;
    showToast(`Filtered by: ${categoryText}`, "success");
  }
}

/* =========================================================
     Category Filter Functions
  ========================================================= */
function filterByCategory(category) {
  selectedCategory = category;
  currentPage = 1;
  showAllProducts = false;

  // Update button text
  const categoryText = category === "all" ? "All Categories" : category;
  $("#selectedCategoryText").text(categoryText);

  // Apply category filter
  if (category === "all") {
    filteredProducts = [...products];
  } else {
    filteredProducts = products.filter((p) => p.category === category);
  }

  // Apply search filter if exists
  const searchTerm = $("#searchInput").val().toLowerCase();
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm) ||
        p.specifications.toLowerCase().includes(searchTerm)
    );
  }

  displayProducts(filteredProducts);
}

/* =========================================================
     Navbar Scroll Effect
  ========================================================= */
function setupNavbarScroll() {
  const navbar = $(".navbar-glass");

  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 50) {
      navbar.addClass("scrolled");
    } else {
      navbar.removeClass("scrolled");
    }
  });
}

/* =========================================================
     Event Listeners
  ========================================================= */
function setupEventListeners() {
  $("#searchInput").on("input", filterProducts);

  // Add Enter key support for search
  $("#searchInput").on("keypress", function (e) {
    if (e.which === 13) {
      // Enter key
      e.preventDefault();
      performSearch();
    }
  });

  // Hide suggestions when clicking outside
  $(document).on("click", function (e) {
    if (!$(e.target).closest(".search-container").length) {
      hideSearchSuggestions();
    }
  });

  // Focus effects
  $("#searchInput").on("focus", function () {
    $(this).closest(".search-wrapper").addClass("focused");
  });

  $("#searchInput").on("blur", function () {
    $(this).closest(".search-wrapper").removeClass("focused");
  });

  $("#productsGrid").on("click", ".add-to-cart", function () {
    addToCart(parseInt($(this).data("product-id")));
  });

  $("#productsGrid").on("click", ".remove-from-cart", function () {
    removeFromCart(parseInt($(this).data("product-id")));
  });

  // Image -> open modal
  $("#productsGrid").on("click", ".product-image-clickable", function () {
    const id = Number($(this).data("product-id"));
    showProductDetails(id);
  });

  // Modal Add to Cart
  $("#productDetailModal")
    .off("click", ".modal-add-to-cart")
    .on("click", ".modal-add-to-cart", function () {
      const id = Number($(this).data("product-id") || currentProductId);
      addToCart(id);
      updateCartCount();
      displayProducts(filteredProducts);
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("productDetailModal")
      );
      if (modal) modal.hide();
    });

  // Modal Remove from Cart
  $("#productDetailModal")
    .off("click", ".modal-remove-from-cart")
    .on("click", ".modal-remove-from-cart", function () {
      const id = Number($(this).data("product-id") || currentProductId);
      removeFromCart(id);
      updateCartCount();
      displayProducts(filteredProducts);
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("productDetailModal")
      );
      if (modal) modal.hide();
    });

  // Footer event listeners
  setupNewsletterForm();
  setupBackToTop();
  setupFooterLinks();
  setupFooterAnimations();

  // Navbar scroll effect
  setupNavbarScroll();
}

// Global variable for temporary category selection
let tempSelectedCategory = "all";

/* =========================================================
     Init on DOM Ready
  ========================================================= */
$(document).ready(() => init());
