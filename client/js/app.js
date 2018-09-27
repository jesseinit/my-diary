const spinner = document.querySelector('.loading__stories');
const mobileMenuBtn = document.querySelector('.menu__btn');
const mobileMenuWrapper = document.querySelector('.mobile_menu');
const closeMenuBtn = document.querySelector('.menu__close');
const formSubmitBtn = document.querySelector('.form .btn');
const signUpForm = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');
const storyWrapper = document.querySelector('.diary__cards');
const diarySection = document.querySelector('.diary');
const newStoryForm = document.querySelector('#newstory-form');
const logoutBtn = document.querySelector('#logout');
const deleteStoryBtn = document.querySelector('.delete-confirm');
const notification = document.querySelector('.profile__setting input');
const cardImage =
  'linear-gradient(rgba(0,0,0, 0.8), rgba(0,0,0, 0.8)), url(https://picsum.photos/425/69?random)';
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
  cardTitle.style.backgroundImage = cardImage;
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
    .catch(error => error);
};

// Check Token Validity
const isLoggedIn = async () => {
  // TODO: Implement better login check
  const response = await fetchRequest('/api/v1/entries/');
  if (response.err) {
    localStorage.clear();
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

const addCardListenter = () => {
  Array.from(storyWrapper.children).forEach(child => {
    child.addEventListener('click', () => {
      const storyID = child.getAttribute('data-id');
      window.location.href = `./view-story.html?id=${storyID}`;
    });
  });
};

/* Notification Functionality */
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
  if (subscription) {
    subscription.unsubscribe();
  }
  subscription = await swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapid)
  });
  return subscription;
};

const handleInputErrors = (response, formClass) => {
  const ul = createNode('ul', 'error__container');
  const form = document.querySelector(formClass);
  if (form.children[0].classList.contains('error__container')) {
    form.removeChild(form.children[0]);
  }
  if (response.message) {
    const li = createNode('li', '', response.message);
    append(ul, li);
    form.insertBefore(ul, form.children[0]);
  } else {
    response.error.forEach(msg => {
      const li = createNode('li', '', msg);
      append(ul, li);
      form.insertBefore(ul, form.children[0]);
    });
  }
};
/* END OF UTILITY FUNCTIONS */

/* Mobile Menu */
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuWrapper.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });
  closeMenuBtn.addEventListener('click', () => {
    mobileMenuWrapper.classList.add('hidden');
    document.body.style.overflow = 'unset';
  });
}

// Register User
const registerUser = async e => {
  try {
    e.preventDefault();
    formSubmitBtn.classList.add('spinning');
    formSubmitBtn.textContent = 'Running Checks';
    const email = document.querySelector('#reg-email').value;
    const fullname = document.querySelector('#reg-fullname').value;
    const password = document.querySelector('#reg-password').value;
    const confirmPassword = document.querySelector('#reg-confirm-password').value;
    if (password !== confirmPassword) {
      toast('Your password are not matching', toastErr);
      formSubmitBtn.classList.remove('spinning');
      formSubmitBtn.textContent = 'Sign Up';
      return;
    }
    const signUpURI = '/api/v1/auth/signup';
    const signUpInfo = JSON.stringify({ email, fullname, password });
    const response = await fetchRequest(signUpURI, 'POST', signUpInfo);
    if (!response.token) {
      handleInputErrors(response, '.form__signup');
      formSubmitBtn.classList.remove('spinning');
      formSubmitBtn.textContent = 'Sign Up';
      return;
    }
    formSubmitBtn.classList.remove('spinning');
    toast(response.message, toastSuccess);
    localStorage.setItem('token', response.token);
    window.location.replace('./dashboard.html');
  } catch (error) {
    toast('There has been an error from your input', toastErr);
    formSubmitBtn.classList.remove('spinning');
    formSubmitBtn.textContent = 'Sign Up';
  }
};
// Login User
const loginUser = async e => {
  try {
    e.preventDefault();
    formSubmitBtn.classList.add('spinning');
    const email = document.querySelector('#login-email').value;
    const password = document.querySelector('#login-password').value;
    const loginInfo = JSON.stringify({ email, password });
    const loginURI = '/api/v1/auth/login';
    const response = await fetchRequest(loginURI, 'POST', loginInfo);
    if (!response.token) {
      handleInputErrors(response, '.form__login');
      formSubmitBtn.classList.remove('spinning');
      return;
    }
    toast(response.message, toastSuccess);
    formSubmitBtn.classList.remove('spinning');
    localStorage.setItem('token', response.token);
    window.location.replace('./dashboard.html');
  } catch (error) {
    toast('There has been an error from your input', toastErr);
    formSubmitBtn.classList.remove('spinning');
  }
};

// Logout User
const logoutUser = e => {
  e.preventDefault();
  localStorage.clear();
  window.location.replace('./login.html');
};

// Load Stories
const loadStories = async () => {
  isLoggedIn();
  const response = await fetchRequest('/api/v1/entries/');
  if (!response.data) {
    spinner.classList.add('hide');
    const message = createNode('p', 'diary-message', 'You have not created any diaries yet');
    const writeStoryBtn = createNode('a', 'btn', 'Write a Story');
    writeStoryBtn.classList.add('btn__primary');
    writeStoryBtn.classList.add('btn--centered');
    writeStoryBtn.setAttribute('href', './new-story.html');
    diarySection.insertBefore(message, diarySection.children[0]);
    diarySection.insertBefore(writeStoryBtn, diarySection.children[1]);
  } else {
    spinner.classList.add('hide');
    response.data.forEach(diary => createCards(diary));
    addCardListenter();
  }
};

// Infinity Scroll
const infiniteScroll = () => {
  let atLastPost = false;
  if (atLastPost === false) {
    window.addEventListener('scroll', async () => {
      isLoggedIn();
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
        spinner.classList.remove('hide');
        const id = storyWrapper.lastChild.getAttribute('data-id');
        if (atLastPost !== true) {
          const response = await fetchRequest(`api/v1/entries?id=${id}`);
          if (!response.data) {
            atLastPost = true;
            spinner.classList.add('hide');
            const message = createNode('p', 'diary-message', response.message);
            document.querySelector('.diary').appendChild(message);
            return;
          }
          response.data.forEach(diary => createCards(diary));
          addCardListenter();
        }
      }
      spinner.classList.add('hide');
    });
  }
};

// Create Story
const createStory = async e => {
  const createStoryBtn = document.querySelector('#newstory-form .btn');
  try {
    e.preventDefault();
    isLoggedIn();
    createStoryBtn.classList.add('spinning');
    const title = document.querySelector('.diary__title').value;
    const content = document.querySelector('.diary__content').value;
    const newStoryInput = JSON.stringify({ title, content });
    const newStoryURI = '/api/v1/entries';
    createStoryBtn.textContent = 'Creating Your Story...';
    const response = await fetchRequest(newStoryURI, 'POST', newStoryInput);
    if (!response.data) {
      // Gets this from the validateInput.js Middleware
      toast(response.error[0], toastErr);
      createStoryBtn.classList.remove('spinning');
      createStoryBtn.textContent = 'Save Diary';
      return;
    }
    toast(response.message, toastSuccess);
    window.location.replace(`./view-story.html?id=${response.data.id}`);
  } catch (error) {
    toast(error, toastErr);
    createStoryBtn.classList.remove('spinning');
    createStoryBtn.textContent = 'Save Diary';
  }
};

// Update Story
const updateStory = async e => {
  try {
    e.preventDefault();
    isLoggedIn();
    // Get Story ID from URL
    const storyID = new URLSearchParams(window.location.search).get('id');
    // Update Story Endpoint URL
    const updateEndpoint = `/api/v1/entries/${storyID}`;
    const storyTitle = document.querySelector('.vcard__title');
    const storyContent = document.querySelector('.vcard__body');
    if (e.target.textContent === 'Edit Story') {
      e.target.textContent = 'Save Update';
      storyTitle.focus();
      storyTitle.contentEditable = true;
      storyTitle.classList.add('edit-mode');
      storyContent.contentEditable = true;
      storyContent.classList.add('edit-mode');
    } else {
      e.target.textContent = 'Saving Update...';
      e.target.classList.toggle('spinning');
      storyTitle.contentEditable = false;
      storyContent.contentEditable = false;
      storyTitle.classList.remove('edit-mode');
      storyContent.classList.remove('edit-mode');
      const updateData = JSON.stringify({
        title: storyTitle.textContent,
        content: storyContent.textContent
      });
      await fetchRequest(updateEndpoint, 'PUT', updateData);
      toast('Story Has Been Updated', toastSuccess, 7000);
      e.target.classList.toggle('spinning');
      e.target.textContent = 'Edit Story';
    }
  } catch (error) {
    toast(error, toastErr, 3000);
  }
};

// View Strory
const viewStory = async () => {
  const viewWrapper = document.querySelector('.view__card');
  try {
    const diaryID = new URLSearchParams(window.location.search).get('id');
    let response = await fetchRequest(`/api/v1/entries/${diaryID}`);
    if (!response.data) {
      throw new Error(response.message);
    }
    response = response.data;
    const dateCreated = new Date(response.created_on).getTime();
    const difference = (new Date().getTime() - dateCreated) / (1000 * 60 * 60);
    const cardTitle = createNode('p', 'vcard__title', response.title);
    const cardDate = createNode(
      'span',
      'vcard__date',
      new Date(response.created_on).toDateString()
    );
    const cardBody = createNode('p', 'vcard__body', response.content);
    const cardAction = createNode('span', 'vcard__actions');
    const cardDelete = createNode('a', 'vdel__btn', 'Delete Story');
    cardDelete.setAttribute('href', '#infopanel');
    const cardEdit = createNode('button', 'vedit__btn', 'Edit Story');
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
    const editStoryBtn = document.querySelector('.vedit__btn');
    editStoryBtn.addEventListener('click', updateStory);
  } catch (error) {
    const cardBody = createNode('p');
    cardBody.className = 'vcard__body';
    cardBody.textContent = `Ooops - Dairy was not found`;
    append(viewWrapper, cardBody);
  }
};

// Delete Story
const deleteStory = async () => {
  const storyID = new URLSearchParams(window.location.search).get('id');
  try {
    isLoggedIn();
    toast('Deleting Message...', toastSuccess);
    const requestURL = `/api/v1/entries/${storyID}`;
    await fetchRequest(requestURL, 'DELETE');
    toast('Message Deleted', toastSuccess, 7000);
    window.location.replace('./dashboard.html');
  } catch (error) {
    window.location.replace(`./view-story.html?id=${storyID}`);
  }
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
      toast('An error has occured...Try again later', toastErr, 6000);
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
      toast('An error has occured...Try again later', toastErr);
    }
  }
};

// Load Prfile
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

if (signUpForm) signUpForm.addEventListener('submit', registerUser);

if (loginForm) loginForm.addEventListener('submit', loginUser);

if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

if (newStoryForm) newStoryForm.addEventListener('submit', createStory);

if (deleteStoryBtn) deleteStoryBtn.addEventListener('click', deleteStory);

if (notification) notification.addEventListener('change', setUpNotification);

const currentPage = window.location.pathname;
switch (currentPage) {
  case '/':
    if (localStorage.getItem('token')) window.location.replace('./dashboard.html');
    break;
  case '/dashboard.html':
    loadStories();
    infiniteScroll();
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
