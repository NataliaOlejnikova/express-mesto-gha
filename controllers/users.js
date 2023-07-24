const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { ValidationError, CastError } = mongoose.Error;

const User = require('../models/user');

const {
  SUCCESS_CREATED,
  DUPLICATE_OBJECT,
} = require('../utils/response-status');

const NotFound = require('../errors/NotFound');
const BadRequests = require('../errors/BadRequest');
const ConflictingRequest = require('../errors/ConflictingRequest');

const getUserList = (req, res, next) => {
  User.find({})
    .then((userList) => res.send({ data: userList }))
    .catch(next);
};

const getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .then((selectedUser) => {
      if (selectedUser) {
        res.send({ data: selectedUser });
      } else {
        next(new NotFound('Пользователь с указанным _id не найден'));
      }
    })
    .catch((error) => {
      if (error instanceof CastError) {
        next(new BadRequests('Неправильный _id пользователя'));
      } else {
        next(error);
      }
    });
};

const registerUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  const passwordHash = bcrypt.hash(password, 10);
  passwordHash
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => res.status(SUCCESS_CREATED).send({
      name,
      about,
      avatar,
      email,
    }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        next(new BadRequests('Переданы некорректные данные'));
      } else if (error.code === DUPLICATE_OBJECT) {
        next(
          new ConflictingRequest(
            'Пользователь с указанной почтой уже существует',
          ),
        );
      } else {
        next(error);
      }
    });
};

const updateUserData = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((updatedData) => res.send({ data: updatedData }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        next(
          new BadRequests('При обновлении профиля указаны некорректные данные'),
        );
      } else {
        next(error);
      }
    });
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((updatedAvatar) => res.send({ data: updatedAvatar }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        next(
          new BadRequests('При обновлении аватара переданы некорректные данные'),
        );
      } else {
        next(error);
      }
    });
};

const authorizeUser = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((selectedUser) => {
      const userToken = jwt.sign(
        { _id: "d285e3dceed844f902650f40" },
        'token-generate-key',
        { expiresIn: '7d' },
      );
      res.send({ userToken });
    })
    .catch((error) => next(error));
};

const getUserProfile = (req, res, next) => {
  User.findById(req.user._id)
    .then((selectedUser) => {
      if (!selectedUser) {
        next(new NotFound('Пользователь с указанным _id не найден'));
      } else {
        res.send({ data: selectedUser });
      }
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  getUserList,
  getUserId,
  registerUser,
  updateUserData,
  updateUserAvatar,
  authorizeUser,
  getUserProfile,
};
