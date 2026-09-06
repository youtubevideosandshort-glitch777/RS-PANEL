/* ============================================================
   FIREBASE CONFIG MANAGER
   - Yeh file Firebase config ko localStorage me save/load karti hai
   - Aur Firebase SDK ko us config se initialize karti hai
   ============================================================ */

const RS_CONFIG_KEY = "rs_panel_firebase_config";

/**
 * User Firebase console se poora block copy karke paste karega, jaise:
 *
 * const firebaseConfig = {
 *   apiKey: "AIzaSy...",
 *   authDomain: "myapp.firebaseapp.com",
 *   projectId: "myapp",
 *   storageBucket: "myapp.appspot.com",
 *   messagingSenderId: "123456789",
 *   appId: "1:123456789:web:abcdef"
 * };
 *
 * Yeh function us pasted text me se object nikal kar return karta hai.
 * Isse raw eval() nahi karte — sirf key: "value" pairs ko regex se
 * safely extract karte hain, taaki koi bhi extra/malicious code na chale.
 */
function parseFirebaseConfigText(raw) {
  if (!raw || !raw.trim()) {
    throw new Error("Config khali hai. Firebase console se config paste karein.");
  }

  const keys = [
    "apiKey", "authDomain", "projectId", "storageBucket",
    "messagingSenderId", "appId", "measurementId", "databaseURL"
  ];

  const config = {};
  keys.forEach((key) => {
    // key ke baad ka value dhoondo, quotes ke andar ya bina quotes ke (number)
    const regex = new RegExp(`${key}\\s*:\\s*["']?([^"',\\n}]+)["']?`, "i");
    const match = raw.match(regex);
    if (match) {
      config[key] = match[1].trim();
    }
  });

  if (!config.apiKey || !config.projectId) {
    throw new Error("apiKey ya projectId nahi mila. Poora config block paste karein jaisa Firebase console me dikhta hai.");
  }

  return config;
}

function saveFirebaseConfig(configObj) {
  localStorage.setItem(RS_CONFIG_KEY, JSON.stringify(configObj));
}

function getFirebaseConfig() {
  const raw = localStorage.getItem(RS_CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearFirebaseConfig() {
  localStorage.removeItem(RS_CONFIG_KEY);
}

function isFirebaseConfigured() {
  return !!getFirebaseConfig();
}

/**
 * Saved config se Firebase app initialize karta hai.
 * Har page load par call hota hai (login.html, dashboard.html, etc.)
 * Returns: true agar successfully init hua, false agar config missing hai.
 */
function initFirebaseFromStorage() {
  const config = getFirebaseConfig();
  if (!config) return false;

  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }
  return true;
}
