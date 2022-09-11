const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080


const {generateRandomString, findUserByEmail, getUserFromCookie, getURLSofUser, emailMatch} = require("./helpers.js")
console.log(findUserByEmail())
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey'],
}))
app.set('view engine', 'ejs');

//our updated database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "b2x3rt",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//this is simply the example page
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/u/:id', (req, res) => {
  // incorrect id entered, so we send an error 
  console.log(req)
  const id = req.params.id;
  const urlID = urlDatabase[id];
  if (!urlID) {
    return res.status(400).send("That id doesn't exist!");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
})

//whenever we see app.get and then a render request we are asking html to render the html webpage.
app.get('/urls', (req, res) => {
  const userID = (req.session["user_id"])
  const user = getUserFromCookie(userID, users)
const myURLS = getURLSofUser(userID, urlDatabase)

const templateVars = { urls: myURLS, user }; //to get the username to show up we added the username cookie as a paramter.

if(!userID) {
  return res.send("You need to login!")
}
res.render('urls_index', templateVars);
});

app.get('/login', (req, res) => {
  if (req.session['user_id']) {
    res.redirect(`/urls`);
  } 

  const templateVars = {user: null}
  res.render("login", templateVars)
});

app.post('/login', (req, res) => {
const email = req.body.email;
const password = req.body.password;

//error handling, if user and pass are zero return error
if (email.length === 0 && password.length === 0) {
  return res.status(400).send(`400 error - Missing E-mail or Password`);
}
//if emailmatch is true, then error
const user = findUserByEmail(email, users)
if (!user) {
  return res.status(400).send(`400 error - No user found!`);
}
if (!bcrypt.compareSync(password, user.password)) {
  return res.status(400).send(`400 error - Incorrect email or password!`);
}

if (user) {

  req.session.user_id = user.id
  res.redirect(`/urls`);

} else {
  res.redirect('/login')
}
})

app.post('/urls', (req, res) => {
  console.log(req.body);
  const longURL = req.body.longURL;

  if (!longURL) {
    
    return res.status(400).send('Enter valid url!'); 
  }

  const user = getUserFromCookie(req.session["user_id"], users)
  if(!user) {
    return res.status(400).send('NO! You are not logged in!'); 
  }

  const id = generateRandomString();
  urlDatabase[id] = {
    longURL,
    userID: req.session["user_id"]
  }
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls`);
})

app.post('/urls/:id/delete', (req, res) => {

  // if user doesn't own url
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send(`You don't own that URL.`);
  }

  delete urlDatabase[req.params.id];
  //once you delete, redirect to the url page
  res.redirect(`/urls`);
});

app.get('/urls/new', (req, res) => {
const user = getUserFromCookie(req.session["user_id"], users)
  if(!user) {
    res.redirect('/login')
  }

  const templateVars = { user };
  res.render('urls_new', templateVars);
});

//this is a get request for a new register page, user name is null and we render the file /register
app.get('/register', (req, res) => {
  const templateVars = { user:getUserFromCookie(null, users) };
  res.render('register', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!req.session['user_id']) {
    return res.status(403).send(`You are not logged in!`)
  } 

  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(403).send(`ID not present in database!`)
  }

  let urlsOfUser = getURLSofUser(req.session['user_id'], urlDatabase)
  if (!urlsOfUser[id]) {
    return res.status(403).send(`You do not own this ID!`)
  }

  const longURL = urlDatabase[id].longURL;

  if (!longURL) {
    return res.status(400).send("URL doesn't exist!");
  }

  const templateVars = { id, longURL, user:getUserFromCookie(req.session["user_id"], users) };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello!<b>World</b></body></html>\n');
});

//clears the username cookie from memory
app.post("/logout", (req, res) => {
req.session = null;
  res.redirect("/urls");
});

// this connects the forms in register.ejs to our server
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const hashedPassword = bcrypt.hashSync(password, 10);

  //error handling, if user and password are zero return error
  if (email.length === 0 || password.length === 0) {
    return res.status(400).send(`400 error - Missing E-mail or Password`);
  }

// if emailmatch is true, then error
  if (findUserByEmail(email, users)) {
    return res.status(400).send(`400 error - A new email is required.`);

  }

  const id = generateRandomString()


  //hashed passowrd added in to the password property
  const user = { email, password: hashedPassword, id }

  users[id] = user;
  req.session.user_id = id;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
