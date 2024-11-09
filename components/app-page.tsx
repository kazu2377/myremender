"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FirebaseApp, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  Messaging,
  onMessage,
} from "firebase/messaging";
import { useEffect, useState } from "react";

// リマインダーの型定義
type Reminder = {
  id: string;
  date: string;
  time: string;
  requirement: string;
};

// Firebaseの設定情報
const firebaseConfig = {
  apiKey: "AIzaSyBkixriKKp6zUECgt2bbaaDmzNDIghrym0",
  authDomain: "appre-9193e.firebaseapp.com",
  projectId: "appre-9193e",
  storageBucket: "appre-9193e.firebasestorage.app",
  messagingSenderId: "1067610280679",
  appId: "1:1067610280679:web:25733f8fd6f7320ed60842",
};

export function BlockPage() {
  // ステートの初期化
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [requirement, setRequirement] = useState("");
  const [messaging, setMessaging] = useState<Messaging | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  // 初期化とリマインダーの読み込み
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // 1. Firebaseの初期化
        const app: FirebaseApp = initializeApp(firebaseConfig);
        const messagingInstance: Messaging = getMessaging(app);
        setMessaging(messagingInstance);

        // 2. 通知の許可状態を取得
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === "granted") {
          // 3. サービスワーカーの登録
          const registration = await registerServiceWorker();
          if (registration) {
            // 4. FCMトークンの取得
            const token = await getToken(messagingInstance, {
              vapidKey:
                "BJE-QzPPFSw0GlkfYDCesLuQhPm9nmdC_6DnTY-QizWFF9qjA0uOH1rukwYWqJsWzmCtC6UFEJxxEUy3-OT9kGY",
              serviceWorkerRegistration: registration,
            });
            console.log("FCM Token:", token);

            // 5. フォアグラウンドメッセージの処理
            // 5. フォアグラウンドメッセージの処理
            onMessage(messagingInstance, (payload) => {
              console.log("Received foreground message:", payload);
              const { title, body } = payload.notification || {};
              if (title && body) {
                if (Notification.permission === "granted") {
                  new Notification(title, {
                    body,
                    icon: "/icon-192x192.png",
                  });
                }
              }
            });
          }
        }
      } catch (error) {
        console.error("Firebase initialization error:", error);
      }
    };

    initializeFirebase(); // 1～5の初期化プロセスを開始
    loadReminders(); // リマインダーの読み込み
  }, []);

  // サービスワーカーの登録関数
  const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      try {
        // 3. サービスワーカーの登録
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          {
            scope: "/", // サービスワーカーのスコープを指定
          }
        );
        console.log(
          "Service Worker registered successfully:",
          registration.scope
        );
        return registration;
      } catch (error) {
        console.error("Service Worker registration failed:", error);
        return null;
      }
    }
    return null;
  };

  // リマインダーをローカルストレージから読み込む関数
  const loadReminders = () => {
    const storedReminders = localStorage.getItem("reminders");
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders));
    }
  };

  // リマインダーが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  // リマインダーに基づいて通知をスケジュールする関数
  const scheduleNotification = async (reminder: Reminder) => {
    if (notificationPermission !== "granted") {
      console.log("Notifications not permitted");
      return;
    }

    const scheduledTime = new Date(
      `${reminder.date}T${reminder.time}`
    ).getTime();
    const now = new Date().getTime();
    const delay = scheduledTime - now;

    if (delay > 0) {
      try {
        // 4. カスタム通知データの作成
        const notificationData = {
          title: "リマインダー",
          body: reminder.requirement,
          tag: reminder.id,
          timestamp: scheduledTime,
          data: {
            reminderDate: reminder.date,
            reminderTime: reminder.time,
            reminderId: reminder.id,
          },
        };
        // 5. ローカルストレージに通知データを保存
        const notifications = JSON.parse(
          localStorage.getItem("scheduledNotifications") || "[]"
        );
        notifications.push(notificationData);
        localStorage.setItem(
          "scheduledNotifications",
          JSON.stringify(notifications)
        );

        // 6. 指定時間後に通知を表示
        setTimeout(async () => {
          try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(notificationData.title, {
              body: notificationData.body,
              icon: "/icon-192x192.png",
              badge: "/icon-192x192.png",
              tag: notificationData.tag,
              requireInteraction: true,
              data: notificationData.data,
              actions: [
                {
                  action: "open",
                  title: "開く",
                },
                {
                  action: "dismiss",
                  title: "閉じる",
                },
              ],
            });
            alert("okきたよ");
          } catch (error) {
            console.error("Error showing notification:", error);
          }
        }, delay);

        console.log(
          `Notification scheduled for ${new Date(
            scheduledTime
          ).toLocaleString()}`
        );
      } catch (error) {
        console.error("Error scheduling notification:", error);
      }
    }
  };

  // サービスワーカーからのメッセージを処理する
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "NOTIFICATION_CLICKED") {
          // 7. 通知がクリックされたときの処理
          console.log("Notification clicked:", event.data);
          // 必要に応じて追加の処理を行う
        }
      });
    }
  }, []);

  // リマインダーを追加する関数
  const addReminder = () => {
    if (reminders.length >= 5) {
      alert("最大5つまでのリマインダーしか設定できません。");
      return;
    }

    if (!date || !time || !requirement) {
      alert("日付、時間、内容をすべて入力してください。");
      return;
    }

    const newReminder: Reminder = {
      id: Date.now().toString(),
      date,
      time,
      requirement,
    };

    setReminders([...reminders, newReminder]); // リマインダーを追加
    scheduleNotification(newReminder); // 追加したリマインダーに基づいて通知をスケジュール

    // 入力フィールドをリセット
    setDate("");
    setTime("");
    setRequirement("");
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>リマインダーアプリ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 8. リマインダーの入力フォーム */}
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="日付"
              required
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="時間"
              required
            />
            <Input
              type="text"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="リマインダーの内容"
              required
            />
            <Button
              onClick={addReminder}
              disabled={notificationPermission !== "granted"}
            >
              リマインダーを追加
            </Button>
            {/* 9. 通知が許可されていない場合のメッセージ */}
            {notificationPermission !== "granted" && (
              <p className="text-red-500">
                通知が許可されていません。ブラウザの設定で通知を許可してください。
              </p>
            )}
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">現在のリマインダー</h2>
            {/* 10. 現在のリマインダーを表示 */}
            {reminders.map((reminder) => (
              <div key={reminder.id} className="mb-2 p-2 bg-gray-50 rounded">
                {reminder.date} {reminder.time}: {reminder.requirement}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
