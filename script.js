/* ==============================================
   ABIS SPECIAL TOMBROWN — SCRIPT.JS
   Full script with database connection
============================================== */

/* ── MENU TOGGLE ── */
document.addEventListener("DOMContentLoaded", function () {
  var menuBtn = document.getElementById("menuToggle");
  var nav     = document.getElementById("mainNav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      nav.classList.toggle("show");
    });
  }
});

/* ============================================
   CART SYSTEM
============================================ */
var cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price, image) {
  cart.push({ name: name, price: price, image: image });
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast("✅ " + name + " added to cart!");
  updateCartCount();
}

function updateCartCount() {
  var count = document.getElementById("cartCount");
  var data  = JSON.parse(localStorage.getItem("cart")) || [];
  if (count) count.innerText = data.length;
}

function displayCart() {
  var cartDiv  = document.getElementById("cartItems");
  var totalDiv = document.getElementById("cartTotal");
  if (!cartDiv || !totalDiv) return;

  cartDiv.innerHTML = "";

  if (cart.length === 0) {
    cartDiv.innerHTML =
      '<div style="text-align:center;padding:40px 20px;background:white;border-radius:14px;box-shadow:0 2px 10px rgba(62,20,0,.10);">' +
      '<p style="font-size:2.5rem;margin-bottom:.8rem">🛒</p>' +
      '<p style="color:#9e7050;font-family:Nunito,sans-serif;font-size:1rem;">' +
      'Your cart is empty. <a href="products.html" style="color:#6b3e26;font-weight:700;">Browse products →</a>' +
      '</p></div>';
    totalDiv.innerText = "0";
    return;
  }

  var total = 0;
  cart.forEach(function (item, index) {
    total += item.price;
    cartDiv.innerHTML +=
      '<div class="cart-item">' +
      '<img src="' + item.image + '" class="cart-img" alt="' + item.name + '">' +
      '<div class="cart-info">' +
      '<h3>' + item.name + '</h3>' +
      '<p>GH&#8373; ' + item.price + '</p>' +
      '<button onclick="removeItem(' + index + ')">Remove</button>' +
      '</div></div>';
  });

  totalDiv.innerText = total;
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
  showToast("🗑️ Item removed.");
}

/* ============================================
   TOAST NOTIFICATION
============================================ */
function showToast(msg) {
  var toast = document.getElementById("siteToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "siteToast";
    toast.style.cssText =
      "position:fixed;bottom:80px;right:20px;" +
      "background:#4a2510;color:white;" +
      "padding:12px 22px;border-radius:50px;" +
      "font-family:Nunito,sans-serif;font-weight:700;font-size:.9rem;" +
      "box-shadow:0 6px 24px rgba(0,0,0,.25);" +
      "transform:translateY(20px);opacity:0;" +
      "transition:all .35s ease;z-index:9999;";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.transform = "translateY(0)";
  toast.style.opacity   = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () {
    toast.style.transform = "translateY(20px)";
    toast.style.opacity   = "0";
  }, 2800);
}

/* ============================================
   SLIDESHOW
============================================ */
var slideIndex = 0;

function showSlides() {
  var slides = document.getElementsByClassName("slide");
  if (slides.length === 0) return;
  for (var i = 0; i < slides.length; i++) slides[i].classList.remove("active");
  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1;
  slides[slideIndex - 1].classList.add("active");
  setTimeout(showSlides, 4000);
}

/* ============================================
   LOAD PRODUCTS FROM DATABASE
============================================ */
function loadProductsFromDB(gridId, featuredOnly) {
  var grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML =
    '<p style="text-align:center;padding:40px;color:#9e7050;font-family:Nunito,sans-serif;grid-column:1/-1;">' +
    '⏳ Loading products...</p>';

  fetch("get_products.php")
    .then(function (res) { return res.json(); })
    .then(function (data) {

      if (data.status !== "success" || !data.products.length) {
        // fallback to hardcoded
        loadFallbackProducts(gridId, featuredOnly);
        return;
      }

      var products = data.products;

      // Featured — show only Best Sellers (max 3)
      if (featuredOnly) {
        products = products.filter(function (p) {
          return p.badge === "Best Seller";
        }).slice(0, 3);
      }

      if (!products.length) {
        loadFallbackProducts(gridId, featuredOnly);
        return;
      }

      grid.innerHTML = "";
      products.forEach(function (p) {
        var badgeHTML = p.badge
          ? '<span class="badge">' + p.badge + "</span>"
          : "";

        if (featuredOnly) {
          grid.innerHTML +=
            '<div class="featured-card">' +
            '<img src="' + p.image + '" alt="' + p.name + '">' +
            '<h3>' + p.name + '</h3>' +
            '<p class="fc-price">GH&#8373; ' + p.price + '</p>' +
            '<button onclick="addToCart(\'' + p.name.replace(/'/g, "\\'") + '\',' + p.price + ',\'' + p.image + '\')">Add to Cart</button>' +
            '</div>';
        } else {
          grid.innerHTML +=
            '<div class="product-card" data-size="' + p.size + '">' +
            badgeHTML +
            '<img src="' + p.image + '" alt="' + p.name + '">' +
            '<h3>' + p.name + '</h3>' +
            '<p>' + p.description + '</p>' +
            '<h4>GH&#8373; ' + p.price + '</h4>' +
            '<button onclick="addToCart(\'' + p.name.replace(/'/g, "\\'") + '\',' + p.price + ',\'' + p.image + '\')">Add to Cart</button>' +
            '</div>';
        }
      });
    })
    .catch(function () {
      loadFallbackProducts(gridId, featuredOnly);
    });
}

/* ── FALLBACK HARDCODED PRODUCTS (if DB fails) ── */
function loadFallbackProducts(gridId, featuredOnly) {
  var grid = document.getElementById(gridId);
  if (!grid) return;

  var all = [
    { name: "Normal Tombrown (Small)",         size: "small",  price: 15, image: "images/normal-small.jpg",    desc: "Nutritious and delicious",   badge: ""            },
    { name: "Normal Tombrown (Medium)",        size: "medium", price: 25, image: "images/normal-medium.jpg",   desc: "Nutritious and smooth blend", badge: "Best Seller" },
    { name: "Normal Tombrown (Big)",           size: "big",    price: 60, image: "images/normal-big.jpg",      desc: "Nutritious and hearty",       badge: ""            },
    { name: "Tombrown with Carrot (Medium)",   size: "medium", price: 40, image: "images/carrot-medium.jpg",   desc: "Nutritious and flavorful",    badge: "Best Seller" },
    { name: "Tombrown with Carrot (Big)",      size: "big",    price: 70, image: "images/carrot-big.jpg",      desc: "Nutritious and hearty",       badge: ""            },
    { name: "Tombrown with Beetroot (Medium)", size: "medium", price: 40, image: "images/beetroot-medium.jpg", desc: "Nutritious and flavorful",    badge: ""            },
    { name: "Tombrown with Beetroot (Big)",    size: "big",    price: 70, image: "images/beetroot-big.jpg",    desc: "Nutritious and hearty",       badge: "Best Seller" }
  ];

  var products = featuredOnly
    ? all.filter(function (p) { return p.badge === "Best Seller"; }).slice(0, 3)
    : all;

  grid.innerHTML = "";
  products.forEach(function (p) {
    if (featuredOnly) {
      grid.innerHTML +=
        '<div class="featured-card">' +
        '<img src="' + p.image + '" alt="' + p.name + '">' +
        '<h3>' + p.name + '</h3>' +
        '<p class="fc-price">GH&#8373; ' + p.price + '</p>' +
        '<button onclick="addToCart(\'' + p.name.replace(/'/g, "\\'") + '\',' + p.price + ',\'' + p.image + '\')">Add to Cart</button>' +
        '</div>';
    } else {
      var badgeHTML = p.badge ? '<span class="badge">' + p.badge + "</span>" : "";
      grid.innerHTML +=
        '<div class="product-card" data-size="' + p.size + '">' +
        badgeHTML +
        '<img src="' + p.image + '" alt="' + p.name + '">' +
        '<h3>' + p.name + '</h3>' +
        '<p>' + p.desc + '</p>' +
        '<h4>GH&#8373; ' + p.price + '</h4>' +
        '<button onclick="addToCart(\'' + p.name.replace(/'/g, "\\'") + '\',' + p.price + ',\'' + p.image + '\')">Add to Cart</button>' +
        '</div>';
    }
  });
}

/* ============================================
   SEARCH + FILTER (work together)
============================================ */
var activeFilter = "all";

function applySearchAndFilter() {
  var searchEl = document.getElementById("searchInput");
  var input    = searchEl ? searchEl.value.toLowerCase() : "";
  var products = document.querySelectorAll(".product-card");

  products.forEach(function (p) {
    var nameEl    = p.querySelector("h3");
    var name      = nameEl ? nameEl.innerText.toLowerCase() : "";
    var size      = p.getAttribute("data-size") || "";
    var matchName = name.indexOf(input) !== -1;
    var matchSize = activeFilter === "all" || size === activeFilter;
    p.style.display = (matchName && matchSize) ? "flex" : "none";
  });
}

function searchProducts()      { applySearchAndFilter(); }
function filterProducts(size)  { activeFilter = size; applySearchAndFilter(); }

/* ============================================
   PAGE LOAD
============================================ */
window.addEventListener("load", function () {
  updateCartCount();
  displayCart();
  showSlides();

  // Home page — featured grid from DB
  if (document.getElementById("featuredGrid")) {
    loadProductsFromDB("featuredGrid", true);
  }

  // Products page — full grid from DB
  if (document.getElementById("productsGrid")) {
    loadProductsFromDB("productsGrid", false);
  }

  // Slideshow manual controls
  var prev = document.getElementById("prevSlide");
  var next = document.getElementById("nextSlide");
  if (prev && next) {
    next.addEventListener("click", function () {
      var slides = document.getElementsByClassName("slide");
      for (var i = 0; i < slides.length; i++) slides[i].classList.remove("active");
      slideIndex++;
      if (slideIndex > slides.length) slideIndex = 1;
      slides[slideIndex - 1].classList.add("active");
    });
    prev.addEventListener("click", function () {
      var slides = document.getElementsByClassName("slide");
      for (var i = 0; i < slides.length; i++) slides[i].classList.remove("active");
      slideIndex--;
      if (slideIndex < 1) slideIndex = slides.length;
      slides[slideIndex - 1].classList.add("active");
    });
  }

  // Cookie check
  var cookieBox = document.getElementById("cookie");
  if (cookieBox && localStorage.getItem("cookiesAccepted") === "yes") {
    cookieBox.style.display = "none";
  }
});

/* ============================================
   PROMO POPUP
============================================ */
window.addEventListener("load", function () {
  setTimeout(function () {
    var popup = document.getElementById("promoPopup");
    if (popup && !localStorage.getItem("promoShown")) {
      popup.style.display = "flex";
    }
  }, 3000);
});

function closePromo() {
  var popup = document.getElementById("promoPopup");
  if (popup) popup.style.display = "none";
  localStorage.setItem("promoShown", "true");
}

function submitPromoEmail() {
  var input = document.querySelector("#promoPopup input[type='email']");
  if (!input) { closePromo(); return; }

  var email = input.value.trim();
  if (!email || email.indexOf("@") === -1) {
    showToast("⚠️ Please enter a valid email!");
    return;
  }

  fetch("save_email.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email: email })
  })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    if (data.status === "success")       showToast("🎉 10% discount code sent to your email!");
    else if (data.status === "exists")   showToast("✅ You are already signed up!");
    else                                 showToast("🎉 Thank you for signing up!");
    closePromo();
  })
  .catch(function () {
    showToast("🎉 Thank you! Discount applied.");
    closePromo();
  });
}

/* ============================================
   COOKIES
============================================ */
function acceptCookies() {
  localStorage.setItem("cookiesAccepted", "yes");
  var cookieBox = document.getElementById("cookie");
  if (cookieBox) cookieBox.style.display = "none";
}

/* ============================================
   CHECKOUT — SAVES TO DATABASE
============================================ */
function checkout() {
  var name     = document.getElementById("customerName").value.trim();
  var location = document.getElementById("customerLocation").value.trim().toLowerCase();
  var payment  = document.getElementById("paymentMethod").value;
  var phone    = document.getElementById("customerPhone").value.trim();
  var address  = document.getElementById("customerAddress").value.trim();
  var note     = document.getElementById("customerNote").value.trim();

  if (!name || !location || !phone) {
    showToast("⚠️ Please fill in all required fields!");
    return;
  }
  if (cart.length === 0) {
    showToast("⚠️ Your cart is empty!");
    return;
  }

  // Delivery fee by city
  var deliveryFee = 25;
  if      (location.indexOf("accra")  !== -1) deliveryFee = 10;
  else if (location.indexOf("tema")   !== -1) deliveryFee = 12;
  else if (location.indexOf("kasoa")  !== -1) deliveryFee = 15;
  else if (location.indexOf("kumasi") !== -1) deliveryFee = 20;

  var subtotal  = cart.reduce(function (s, i) { return s + i.price; }, 0);
  var orderID   = "ABIS-" + Date.now();

  var orderData = {
    id:       orderID,
    name:     name,
    phone:    phone,
    location: location,
    address:  address,
    note:     note,
    payment:  payment,
    items:    cart,
    delivery: deliveryFee,
    total:    subtotal + deliveryFee,
    date:     new Date().toLocaleString()
  };

  // Save to localStorage for thank you page
  localStorage.setItem("lastOrder", JSON.stringify(orderData));

  // Save to database
  fetch("save_order.php", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(orderData)
  })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    if (data.status === "success") {
      console.log("✅ Order saved to DB:", data.order_id);
    } else {
      console.warn("⚠️ DB issue:", data.message);
    }
  })
  .catch(function (err) {
    console.warn("DB not reachable, order saved locally.", err);
  });

  // Save to localStorage history
  var history = JSON.parse(localStorage.getItem("orderHistory")) || [];
  history.push(orderData);
  localStorage.setItem("orderHistory", JSON.stringify(history));

  // Clear cart
  localStorage.removeItem("cart");
  cart = [];

  // Go to thank you page
  window.location.href = "thankyou.html";
}

/* ============================================
   WHATSAPP SEND
============================================ */
function sendToWhatsApp() {
  var order = JSON.parse(localStorage.getItem("lastOrder"));
  if (!order) return;

  var msg = "🛒 *NEW ORDER — ABIS SPECIAL TOMBROWN*\n\n";
  msg += "🆔 Order ID: " + order.id       + "\n";
  msg += "👤 Name: "     + order.name     + "\n";
  msg += "📞 Phone: "    + order.phone    + "\n";
  msg += "📍 Location: " + order.location + "\n";
  msg += "🏠 Address: "  + order.address  + "\n";
  msg += "💳 Payment: "  + order.payment  + "\n";
  if (order.note) msg += "📝 Note: " + order.note + "\n";
  msg += "\n*Items:*\n";
  order.items.forEach(function (item, i) {
    msg += (i + 1) + ". " + item.name + " — GH₵" + item.price + "\n";
  });
  msg += "\n🚚 Delivery: GH₵" + order.delivery;
  msg += "\n💰 *Total: GH₵"   + order.total + "*";

  window.open(
    "https://wa.me/233242977037?text=" + encodeURIComponent(msg),
    "_blank"
  );
}

/* ============================================
   CLEAR HISTORY
============================================ */
function clearHistory() {
  localStorage.removeItem("orderHistory");
  location.reload();
}
