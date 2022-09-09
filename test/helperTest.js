const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    return assert.equal(user.id, expectedUserID);
  });
  //return null if invalid
  it('should return null if invalid is is used to login', function() {
    const user = findUserByEmail("bingbong@bingo.ca", testUsers)
    const expectedReturn = null;
    return assert.equal(user, expectedReturn);
  });
});