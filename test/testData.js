const input = {
  validSignUpInput: {
    email: 'admin@admin.com',
    fullname: 'Jesse Init',
    password: 'inflames'
  },

  validSignUpInput2: {
    email: 'hi@admin.com',
    fullname: 'Jesse Init',
    password: 'inflames'
  },

  invalidSignUpInput: {
    email: 'adminadmin.com',
    fullname: 'Jesse Init'
  },

  validUser: {
    email: 'admin@admin.com',
    password: 'inflames'
  },

  wrongPassword: {
    email: 'admin@admin.com',
    password: 'inflames1'
  },

  wrongEmail: {
    email: 'hello@admin.com',
    password: 'inflames1'
  },

  invalidLoginInput: {
    email: 'invalidEmail',
    password: 'badp'
  }
};

const entry = {
  validEntry: {
    title: 'Story Title',
    content: 'Story Body'
  },

  invalidEntry: {},

  yesterdayStory: {
    title: 'Updated',
    content: "Story with yesterday's date"
  }
};

const profile = {
  details: { reminder: true, pushSubscription: null }
};

export { input, entry, profile };
