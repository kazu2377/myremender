// Import and configure the Firebase SDK
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
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
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification.title || "リマインダー";
  const notificationOptions = {
    body: payload.notification.body || payload.data.message || "",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: payload.data.tag || Date.now().toString(),
    requireInteraction: true,
    data: payload.data,
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// 通知クリック時の処理
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // 通知をクリックしたときにアプリを開く
  const urlToOpen = new URL("/", self.location.origin).href;

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      // すでに開いているウィンドウがあればそれをフォーカス
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // 開いているウィンドウがなければ新しく開く
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    });

  event.waitUntil(promiseChain);
});
