const mainRouter = require('express').Router();

const {
  validateUserAuth,
  validateUserRegister,
} = require('../utils/constant');
const { registerUser, authorizeUser } = require('../controllers/users');
const authGuard = require('../middlewares/auth');
const cardRouter = require('./cards');
const userRouter = require('./users');
const NotFound = require('../errors/NotFound');

mainRouter.post('/signup', validateUserRegister, registerUser);
mainRouter.post('/signin', validateUserAuth, authorizeUser);

mainRouter.use('/cards', authGuard, cardRouter);
mainRouter.use('/users', authGuard, userRouter);

mainRouter.use('*', authGuard, (req, res, next) => {
  next(new NotFound('страница не найдена'));
});

module.exports = mainRouter;
