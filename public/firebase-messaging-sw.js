// Import and configure the Firebase SDK
// Import and configure the Firebase SDK
importScripts(
  "https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyBkixriKKp6zUECgt2bbaaDmzNDIghrym0",
  authDomain: "appre-9193e.firebaseapp.com",
  projectId: "appre-9193e",
  storageBucket: "appre-9193e.firebasestorage.app",
  messagingSenderId: "1067610280679",
  appId: "1:1067610280679:web:25733f8fd6f7320ed60842",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// バックグラウンドでのメッセージ受信処理
messaging.onBackgroundMessage(function (payload) {
  console.log("1");

  const notificationTitle = payload.notification.title || "リマインダー";
  const notificationOptions = {
    body: payload.notification.body || payload.data.message || "",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: payload.data.tag || Date.now().toString(),
    requireInteraction: true,
    data: payload.data,
  };
  console.log("2");

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// バックグラウンドでのメッセージ受信処理
self.addEventListener("push", function (event) {
  console.log("Received a push message", event);

  var payload = event.data ? event.data.json() : {};
  console.log("Payload:", payload);

  const notificationTitle = payload.notification.title || "リマインダー";
  const notificationOptions = {
    body: payload.notification.body || payload.data.message || "",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: payload.data.tag || Date.now().toString(),
    requireInteraction: true,
    data: payload.data,
  };
  console.log("aaaaaaaaaa:");
  alert("ok");

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});
self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked", event);
  event.notification.close();
  // 通知クリック時の処理をここに追加
});

self.addEventListener("error", function (event) {
  console.error("Service Worker error:", event.error);
});
