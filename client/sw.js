console.log('Service Worker Loaded');
self.addEventListener('push', e => {
  const data = e.data.json();
  console.log('Push Received');

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: 'Let every moment count. Write a diary today in History'
    })
  );
});

self.addEventListener('notificationclick', e => {
  console.log('Notification Clicked.');

  e.notification.close();

  e.waitUntil(clients.openWindow('https://jessdiary.herokuapp.com'));
});
