const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const userRouter = require('./routes/users')
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

app.use('/users', userRouter)

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});