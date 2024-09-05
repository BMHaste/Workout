const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const userRouter = require('./routes/users')
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

app.use('/users', userRouter)

app.get('/', (req, res) => {
  res.redirect('/users/signup');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});