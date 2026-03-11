// 1. Listen for background push events
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Message Received.');

  // Default payload
  let pushData = {
    title: '🔥 Flash Deal!',
    body: 'A new deal just dropped. Click to view.',
    image: 'https://cdn-icons-png.flaticon.com/512/1163/1163337.png',
    url: 'http://localhost:5173'
  };

  // 2. Extract JSON payload from server
  if (event.data) {
    try {
      const data = event.data.json();
      pushData = { ...pushData, ...data };
    } catch (error) {
      pushData.body = event.data.text();
    }
  }

  // 3. Notification options
  const options = {
    body: pushData.body,
    icon: pushData.image,
    badge: 'https://cdn-icons-png.flaticon.com/512/1163/1163337.png',
    image: pushData.image,
    data: {
      url: pushData.url
    }
  };

  // 4. Show notification
  event.waitUntil(
    self.registration.showNotification(pushData.title, options)
  );
});


// 5. Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received.');

  event.notification.close();

  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {

      // If app tab already open → focus it
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }

      // Otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});