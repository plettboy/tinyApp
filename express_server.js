const express = require('express');
var cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.set('view engine', 'ejs');

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

//our database for urls to start
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com'
};

//this is simply the example page
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
})

//whenever we see app.get and then a render request we are asking html to render the html webpage.
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] }; //to get the username to show up we added the username cookie as a paramter.
  res.render('urls_index', templateVars);
});

//this is meant for entering 
app.post('/urls', (req, res) => {
  console.log(req.body);
  const longURL = req.body.longURL;
  if (!longURL) {

    return res.status(400).send('Enter valid url!'); 
  }

  const id = generateRandomString();
  urlDatabase[id] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
})

//this is a post and not a delete because it does not take us to new page, it posts and deletes the thing
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  //once you delete, redirect to the url page
  res.redirect(`/urls`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (!longURL) {
    return res.status(400).send("URL doesn't exist!");
  }

  const templateVars = { id, longURL, username: req.cookies["username"] };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello!<b>World</b></body></html>\n');
});

//requests the username, and assigns it to a cookie
app.post('/login', (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect(`/urls`);
})

//clears the username cookie from memory
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});