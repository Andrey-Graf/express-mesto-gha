const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const { PORT = 3000 } = process.env;
const app = express();



mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false,
  // В 'Mongoose' 6 версии "useCreateIndex: true", "useFindAndModify: false" больше не поддерживаються.
  useUnifiedTopology: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: '621920270695d1a8936c849e'
  };

  next();
});

app.use('/', userRouter);
app.use('/', cardRouter);
app.use('*', (req, res) => {
  res.status(404).send({ message: 'Запршиваемый ресурс не найден' })
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});