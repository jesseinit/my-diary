const signUpForm = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');
const storyWrapper = document.querySelector('.diary__cards');
const newStoryForm = document.querySelector('#newstory-form');
const logoutBtn = document.querySelector('#logout');
const deleteStoryBtn = document.querySelector('.delete-confirm');
const notification = document.querySelector('.profile__setting input');
const toastErr = 'toast--error';
const toastSuccess = 'toast--success';
const publicVapid =
  'BM045LgB8vOm-HPga83qiFrUuCFaILe8ymx25HeBbyPB9eGiMnx7ljH6GJ5JVsyEXiBLq5j4OdoGClE-4ZhUW_M';

/* UTILITY FUNCTIONS */
const createNode = (element = HTMLElement, className, content) => {
  const el = document.createElement(element);
  el.className = className;
  el.textContent = content;
  return el;
};

const append = (parent, el) => parent.appendChild(el);

const toast = (msg, className, delay = 5000) => {
  const errorParagraph = createNode('p', '', msg);
  const toastParent = createNode('div', 'toast');
  toastParent.appendChild(errorParagraph);
  toastParent.classList.add(className);
  const body = document.querySelector('body');
  body.insertBefore(toastParent, body.children[0]);
  setTimeout(() => {
    body.removeChild(toastParent);
  }, delay);
};

const createCards = diary => {
  const card = createNode('div', 'diary-card');
  card.setAttribute('data-id', diary.id);
  const cardTitle = createNode('p', 'diary-card-title', diary.title);
  const cardBody = createNode('p', 'diary-card-body', diary.content);
  const cardInfo = createNode('div', 'diary-card-info');
  const cardDate = createNode('span', 'diary-card-date', new Date(diary.created_on).toDateString());
  const cardView = createNode('span', 'diary-card-view');
  const cardLink = createNode('a', '', 'Read Story');
  cardLink.setAttribute('href', `./view-story.html?id=${diary.id}`);
  append(card, cardTitle);
  append(card, cardBody);
  append(card, cardInfo);
  append(cardInfo, cardDate);
  append(cardInfo, cardView);
  append(cardView, cardLink);
  append(storyWrapper, card);
};

// Fetch Helper Function
const fetchRequest = async (url = '', method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    method,
    mode: 'cors',
    body,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  })
    .then(res => (res.ok ? res.json() : Promise.reject(res.json())))
    .then(response => response)
    .catch(
      error => error /* Perform a Switch with error.status, there throw the respective toast */
    );
};

// Check Token Validity
const isLoggedIn = async () => {
  const response = await fetchRequest('/api/v1/entries/');
  // Once response.status is set then the promise is rejecting which means an error => line 37
  if (response.status) {
    localStorage.removeItem('token');
    window.location.replace('./login.html');
  }
};

// Convert the VapidKey to safe base64 string
const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/* END OF UTILITY FUNCTIONS */

// Update Story
const updateStory = async e => {
  try {
    e.preventDefault();
    isLoggedIn();
    // Get Story ID from URL
    const storyID = new URLSearchParams(window.location.search).get('id');
    // Update Story Endpoint URL
    const updateEndpoint = `/api/v1/entries/${storyID}`;
    const storyTitle = document.querySelector('.view-card-title');
    const storyContent = document.querySelector('.view-card-body');
    if (e.target.textContent === 'Edit Story') {
      e.target.textContent = 'Save Update';
      storyTitle.focus();
      storyTitle.contentEditable = true;
      storyTitle.classList.add('edit-mode');
      storyContent.contentEditable = true;
      storyContent.classList.add('edit-mode');
    } else {
      storyTitle.contentEditable = false;
      storyContent.contentEditable = false;
      storyTitle.classList.remove('edit-mode');
      storyContent.classList.remove('edit-mode');
      e.target.textContent = 'Edit Story';
      const updateData = JSON.stringify({
        title: storyTitle.textContent,
        content: storyContent.textContent
      });
      await fetchRequest(updateEndpoint, 'PUT', updateData);
      toast('Story Has Been Updated', toastSuccess, 3000);
    }
  } catch (error) {
    toast('Error Updating Story', toastErr, 3000);
  }
};

// Delete Story
const deleteStory = async e => {
  const storyID = new URLSearchParams(window.location.search).get('id');
  try {
    e.preventDefault();
    isLoggedIn();
    const requestURL = `/api/v1/entries/${storyID}`;
    await fetchRequest(requestURL, 'DELETE');
    toast('Message Deleted', toastSuccess);
    window.location.replace('./dashboard.html');
  } catch (error) {
    window.location.replace(`./view-story.html?id=${storyID}`);
  }
};

const addCardListenter = () => {
  Array.from(storyWrapper.children).forEach(child => {
    child.addEventListener('click', () => {
      const storyID = child.getAttribute('data-id');
      window.location.href = `./view-story.html?id=${storyID}`;
    });
  });
};

// Load Stories
const loadStories = async () => {
  const response = await fetchRequest('/api/v1/entries/');
  if (response.message) {
    const message = createNode('p', 'diary-message', response.message);
    storyWrapper.parentNode.insertBefore(message, storyWrapper);
  } else {
    response.forEach(diary => {
      createCards(diary);
    });
    addCardListenter();
  }
};

const inifiteScroll = () => {
  let atLastPost = false;
  if (atLastPost === false) {
    window.addEventListener('scroll', async () => {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
        const id = storyWrapper.lastChild.getAttribute('data-id');
        if (atLastPost !== true) {
          const response = await fetchRequest(`api/v1/entries?id=${id}`);
          if (response.message) {
            atLastPost = true;
            const message = createNode('p', 'diary-message', response.message);
            storyWrapper.appendChild(message);
            return;
          }
          response.forEach(diary => {
            createCards(diary);
          });
          addCardListenter();
        }
      }
    });
  }
};

// View Strory
const viewStory = async () => {
  const viewWrapper = document.querySelector('.view-card');
  try {
    const diaryID = new URLSearchParams(window.location.search).get('id');
    const response = await fetchRequest(`/api/v1/entries/${diaryID}`);
    if (response.status) {
      throw new Error(response.statusText);
    }
    const dateCreated = new Date(response.created_on).getTime();
    const difference = (new Date().getTime() - dateCreated) / (1000 * 60 * 60);
    const cardTitle = createNode('p', 'view-card-title', response.title);
    const cardDate = createNode(
      'span',
      'view-card-date',
      new Date(response.created_on).toDateString()
    );
    const cardBody = createNode('p', 'view-card-body', response.content);
    const cardAction = createNode('span', 'view-card-actions');
    const cardDelete = createNode('a', 'view-del-btn', 'Delete Story');
    cardDelete.setAttribute('href', '#infopanel');
    const cardEdit = createNode('button', 'view-edit-btn', 'Edit Story');

    if (difference > 24) {
      cardEdit.disabled = true;
      cardEdit.textContent = 'Edit Disabled';
      cardEdit.style.background = '#c5c5c5';
      cardEdit.style.cursor = 'not-allowed';
    }

    append(cardAction, cardDelete);
    append(cardAction, cardEdit);
    append(viewWrapper, cardTitle);
    append(viewWrapper, cardDate);
    append(viewWrapper, cardBody);
    append(viewWrapper, cardAction);

    const editStoryBtn = document.querySelector('.view-edit-btn');
    editStoryBtn.addEventListener('click', updateStory);
  } catch (error) {
    const cardBody = createNode('p');
    cardBody.className = 'view-card-body';
    cardBody.textContent = `Ooops - Dairy ${error}`;
    append(viewWrapper, cardBody);
  }
};

const checkSwSupport = e => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    toast('Service Worker not Supported in your Browser', toastErr);
    e.target.checked = false;
    return false;
  }
  return true;
};

const askPermission = async e => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    e.target.checked = false;
    return false;
  }
  return true;
};

const subscribeUser = async () => {
  const swRegistration = await navigator.serviceWorker.register('./sw.js', { scope: '/' });
  let subscription = await swRegistration.pushManager.getSubscription();
  subscription.unsubscribe();
  subscription = await swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapid)
  });
  return subscription;
};

// Notification Settings
const setUpNotification = async e => {
  if (e.target.checked === true) {
    try {
      const swSupported = checkSwSupport(e);
      const permissionStatus = await askPermission(e);
      if (!swSupported || !permissionStatus) {
        toast('Service Worker Not Supported or Notification Not Granted', toastErr);
        return;
      }
      const subscription = await subscribeUser();
      const data = JSON.stringify({ reminder: true, pushSubscription: subscription });
      await fetchRequest('/api/v1/profile/', 'PUT', data);
      toast('You have subscribed to Push Notification', toastSuccess);
    } catch (error) {
      e.target.checked = false;
      toast(error, toastErr);
    }
  } else {
    try {
      const subscription = await subscribeUser();
      subscription.unsubscribe();
      const data = JSON.stringify({ reminder: false, pushSubscription: null });
      await fetchRequest('/api/v1/profile/', 'PUT', data);
      e.target.checked = false;
      toast('You have Unsubscribed to Push Notification', toastSuccess);
    } catch (error) {
      e.target.checked = true;
      toast(error, toastErr);
    }
  }
};

// Register User
const registerUser = async e => {
  try {
    e.preventDefault();
    const email = document.querySelector('#reg-email').value;
    const fullname = document.querySelector('#reg-fullname').value;
    const password = document.querySelector('#reg-password').value;
    // Fetch URL
    const signUpURI = '/api/v1/auth/signup';
    const signUpInfo = JSON.stringify({ email, fullname, password });
    const response = await fetchRequest(signUpURI, 'POST', signUpInfo);
    if (response.message) {
      throw new Error(response.message);
    }
    localStorage.setItem('token', response.token);
    window.location.replace('./dashboard.html');
  } catch (error) {
    toast(error, toastErr);
  }
};

// Login User
const loginUser = async e => {
  try {
    e.preventDefault();
    const email = document.querySelector('#login-email').value;
    const password = document.querySelector('#login-password').value;
    const loginInfo = JSON.stringify({ email, password });
    const loginURI = '/api/v1/auth/login';
    const response = await fetchRequest(loginURI, 'POST', loginInfo);
    if (response.message) {
      throw new Error(response.message);
    }
    localStorage.setItem('token', response.token);
    window.location.replace('./dashboard.html');
  } catch (error) {
    toast(error, toastErr);
  }
};

// Logout User
const logoutUser = e => {
  e.preventDefault();
  // Delete token
  localStorage.clear();
  // Redirect User
  window.location.href = './';
};

// Create Story
const createStory = async e => {
  e.preventDefault();
  isLoggedIn();

  // Create Endpoint URL
  const newStoryEndpoint = '/api/v1/entries';

  // Grab DOM Element
  const title = document.querySelector('.diary-title').value;
  const content = document.querySelector('.diary-content').value;

  if (title.length > 100) {
    // ToastFailure ('Title should not exceed 100 Characters')
    console.log('Title Should not be more than 100 Chars Long');
    return;
  }

  // Grab our form input values
  const newStoryData = JSON.stringify({ title, content });

  const response = await fetchRequest(newStoryEndpoint, 'POST', newStoryData);

  if (response.result) {
    // ToastSuccess(response.message)
    window.location.replace(`./view-story.html?id=${response.result.id}`);
  }
};

const loadProfile = async () => {
  isLoggedIn();
  const fullname = document.querySelector('.profile__name');
  const dateRegistered = document.querySelector('.profile__date');
  const postCount = document.querySelector('.profile__count');
  const response = await fetchRequest('/api/v1/profile/');
  fullname.textContent = response.fullname;
  dateRegistered.textContent = new Date(response.memberSince).toDateString();
  postCount.textContent = response.postCount;
  notification.checked = response.reminder;
};

if (signUpForm) {
  signUpForm.addEventListener('submit', registerUser);
}

if (loginForm) {
  loginForm.addEventListener('submit', loginUser);
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logoutUser);
}

if (newStoryForm) {
  newStoryForm.addEventListener('submit', createStory);
}

if (deleteStoryBtn) {
  deleteStoryBtn.addEventListener('click', deleteStory);
}

if (notification) {
  notification.addEventListener('change', setUpNotification);
}

const currentPage = window.location.pathname;
switch (currentPage) {
  case '/index.html':
    if (localStorage.getItem('token')) {
      window.location.replace('./dashboard.html');
    }
    break;
  case '/dashboard.html':
    isLoggedIn();
    loadStories();
    inifiteScroll();
    break;
  case '/new-story.html':
    isLoggedIn();
    break;
  case '/view-story.html':
    isLoggedIn();
    viewStory();
    break;
  case '/settings.html':
    loadProfile();
    break;
  default:
    break;
}
