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
  console.log("プッシュメッセージを受信しました", event);

  try {
    var payload = event.data ? event.data.json() : {};
    console.log("ペイロード:", JSON.stringify(payload, null, 2));

    const notificationTitle =
      payload.notification?.title || payload.data?.title || "リマインダー";
    const notificationOptions = {
      body:
        payload.notification?.body ||
        payload.data?.body ||
        payload.data?.message ||
        "",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: payload.data?.tag || Date.now().toString(),
      requireInteraction: true,
      data: payload.data || {},
    };

    console.log("通知タイトル:", notificationTitle);
    console.log(
      "通知オプション:",
      JSON.stringify(notificationOptions, null, 2)
    );

    event.waitUntil(
      self.registration
        .showNotification(notificationTitle, notificationOptions)
        .then(() => {
          console.log("通知が正常に表示されました");
        })
        .catch((error) => {
          console.error("通知の表示中にエラーが発生しました:", error);
        })
    );
  } catch (error) {
    console.error("プッシュメッセージの処理中にエラーが発生しました:", error);
  }
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
