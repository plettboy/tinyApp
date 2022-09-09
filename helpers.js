//outputs the user object
const getUserFromCookie = (cookie, users) => {
  for (const user in users) {
    if (user === cookie) {
      return users[user]
    }
  }
  return null;
}



//takes in the email and outputs the id attached to the email
const getUserFromEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user]
    }
  }
  return null;
}

//this generates a random string id
const generateRandomString = function() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 6; i > 0; i--) {
    const randChar = chars.charAt(Math.floor(Math.random() * chars.length));
    result += randChar;
  }
  return result;
}

//this is a function to grab the specific urls associated with the passed in ID
const getURLSofUser = (userID, urlDatabase) => {
  const result = {};
  for (let shortIds in urlDatabase) {
    if (urlDatabase[shortIds].userID === userID) {
      result[shortIds] = urlDatabase[shortIds]
    }
  }
return result
}

//function designed for register/post to match emails to db
const emailMatch = (candUser) => {
  if (getUserFromEmail(candUser) === null) {
    return false
  }
  return true
}




module.exports = { generateRandomString, getUserFromEmail, getUserFromCookie, getURLSofUser, emailMatch }