console.log('Service Worker Loaded');
self.addEventListener('push', e => {
  const data = e.data.json();
  console.log('Push Received');

  e.waitUntil(self.registration.showNotification(data.title, { body: 'Notified Blah Blah' }));
});

self.addEventListener('notificationclick', e => {
  console.log('Notification Clicked.');

  e.notification.close();

  e.waitUntil(clients.openWindow('https://jessdiary.herokuapp.com'));
});
