/* ============================================================
   DASHBOARD LOGIC
   - Auth guard (login zaroori)
   - Sidebar tab switching
   - Firestore se orders/services/users load karna
   ============================================================ */

if (!initFirebaseFromStorage()) {
  window.location.href = "setup.html";
} else {
  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("avatarLetter").textContent = user.email.charAt(0).toUpperCase();
    loadOverview();
    loadOrders();
    loadServices();
    loadUsers();
    renderConfigTable();
  });

  document.getElementById("signoutBtn").addEventListener("click", () => {
    auth.signOut().then(() => { window.location.href = "login.html"; });
  });

  document.getElementById("disconnectBtn").addEventListener("click", () => {
    if (confirm("Firebase disconnect karein? Aapko dobara config paste karna hoga.")) {
      clearFirebaseConfig();
      window.location.href = "setup.html";
    }
  });

  /* ---------------- Sidebar tab switching ---------------- */
  const navItems = document.querySelectorAll(".nav-item");
  const titles = {
    overview: "Overview", orders: "Orders", services: "Services",
    users: "Users", settings: "Settings"
  };
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      const tab = item.dataset.tab;
      document.querySelectorAll(".tab-panel").forEach((p) => (p.style.display = "none"));
      document.getElementById("tab-" + tab).style.display = "block";
      document.getElementById("pageTitle").textContent = titles[tab];
    });
  });

  /* ---------------- Data loaders ---------------- */
  function loadOverview() {
    db.collection("orders").get().then((snap) => {
      document.getElementById("statOrders").textContent = snap.size;
      let pending = 0;
      const rows = [];
      snap.forEach((doc) => {
        const d = doc.data();
        if ((d.status || "").toLowerCase() === "pending") pending++;
        if (rows.length < 5) {
          rows.push(`<tr><td>${doc.id}</td><td>${d.service || "-"}</td><td>${d.status || "-"}</td><td>${d.amount || "-"}</td></tr>`);
        }
      });
      document.getElementById("statPending").textContent = pending;
      document.getElementById("recentOrdersBody").innerHTML =
        rows.length ? rows.join("") : `<tr class="empty-row"><td colspan="4">Abhi koi order nahi hai</td></tr>`;
    }).catch(() => {
      document.getElementById("recentOrdersBody").innerHTML =
        `<tr class="empty-row"><td colspan="4">"orders" collection nahi mili — Firestore me bana lein</td></tr>`;
    });

    db.collection("services").get().then((snap) => {
      document.getElementById("statServices").textContent = snap.size;
    }).catch(() => {});

    db.collection("users").get().then((snap) => {
      document.getElementById("statUsers").textContent = snap.size;
    }).catch(() => {});
  }

  function loadOrders() {
    db.collection("orders").get().then((snap) => {
      const rows = [];
      snap.forEach((doc) => {
        const d = doc.data();
        rows.push(`<tr><td>${doc.id}</td><td>${d.service || "-"}</td><td>${d.status || "-"}</td><td>${d.amount || "-"}</td></tr>`);
      });
      document.getElementById("allOrdersBody").innerHTML =
        rows.length ? rows.join("") : `<tr class="empty-row"><td colspan="4">Abhi koi order nahi hai</td></tr>`;
    }).catch(() => {
      document.getElementById("allOrdersBody").innerHTML =
        `<tr class="empty-row"><td colspan="4">"orders" collection nahi mili</td></tr>`;
    });
  }

  function loadServices() {
    db.collection("services").get().then((snap) => {
      const rows = [];
      snap.forEach((doc) => {
        const d = doc.data();
        rows.push(`<tr><td>${d.name || doc.id}</td><td>${d.rate || "-"}</td><td>${d.category || "-"}</td></tr>`);
      });
      document.getElementById("servicesBody").innerHTML =
        rows.length ? rows.join("") : `<tr class="empty-row"><td colspan="3">Abhi koi service nahi hai</td></tr>`;
    }).catch(() => {
      document.getElementById("servicesBody").innerHTML =
        `<tr class="empty-row"><td colspan="3">"services" collection nahi mili</td></tr>`;
    });
  }

  function loadUsers() {
    db.collection("users").get().then((snap) => {
      const rows = [];
      snap.forEach((doc) => {
        const d = doc.data();
        rows.push(`<tr><td>${d.email || doc.id}</td><td>${d.balance || "0"}</td><td>${d.joined || "-"}</td></tr>`);
      });
      document.getElementById("usersBody").innerHTML =
        rows.length ? rows.join("") : `<tr class="empty-row"><td colspan="3">Abhi koi user nahi hai</td></tr>`;
    }).catch(() => {
      document.getElementById("usersBody").innerHTML =
        `<tr class="empty-row"><td colspan="3">"users" collection nahi mili</td></tr>`;
    });
  }

  function renderConfigTable() {
    const config = getFirebaseConfig();
    const rows = Object.keys(config).map(
      (key) => `<tr><td style="color:var(--text-soft);width:160px;">${key}</td><td>${config[key]}</td></tr>`
    );
    document.getElementById("configTableBody").innerHTML = rows.join("");
  }
}
