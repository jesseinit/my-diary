console.log('Service Worker Loaded');
self.addEventListener('push', e => {
  const data = e.data.json();
  console.log(data);
  console.log('Push Received');

  e.waitUntil(self.registration.showNotification(data.title, { body: data.body }));
});

self.addEventListener('notificationclick', e => {
  console.log('Notification Clicked.');

  e.notification.close();

  e.waitUntil(clients.openWindow('https://jessdiary.herokuapp.com'));
});
