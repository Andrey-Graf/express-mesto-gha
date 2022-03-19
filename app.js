const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { validateSignIn, validateSingUp } = require('./middlewares/validators');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signin', validateSignIn, login);
app.post('/signup', validateSingUp, createUser);

app.use(auth);

app.use('/', userRouter);
app.use('/', cardRouter);
app.use('*', (req, res, next) => {
  next(res.status(404).send({ message: 'Запршиваемый ресурс не найден' }));
});

app.use(errors());

app.use((err, req, res, next) => {
  next(res.status(500).send({ message: 'На сервере произошла ошибка' }));
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});