const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite')
const favoriteRouter = express.Router();


favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorites => {
                if (favorites) {
                    req.body.forEach(campsite => {
                        if (favorites.campsites.indexOf(campsite._id) === -1) {
                            favorites.campsites.push(campsite);
                        } else {
                            console.log(`Campsite ${campsite._id} is already favorited by User ${req.user._id}`);
                        }
                    });
                    favorites.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorites => {
                            console.log('Favorites Created ', favorites);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorites => {
                if (favorites) {
                    if (favorites.campsites.indexOf(req.params.campsiteId) === -1) {
                        favorites.campsites.push({ "_id": req.params.campsiteId });
                        favorites.save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                            .catch(err => next(err));
                    } else {
                        res.statusCode = 200;
                        res.end('That campsite is already a favorite!');
                    }
                } else {
                    Favorite.create({ user: req.user._id, campsites: [{ "_id": req.params.campsiteId }] })
                        .then(favorites => {
                            console.log('Favorites Created ', favorites);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorites => {
                if (favorites && (favorites.campsites.indexOf(req.params.campsiteId) !== -1)) {
                    if (favorites.campsites.length == 1) {
                        // if we're deleting the last favorite
                        // delete the entire record
                        Favorite.findOneAndDelete({ user: req.user._id })
                            .then(response => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(response);
                            })
                            .catch(err => next(err));
                    } else {
                        // otherwise just delete the respective
                        favorites.campsites.pull({ "_id": req.params.campsiteId });
                        favorites.save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                            .catch(err => next(err));
                    }
                } else if (!favorites) {
                    err = new Error(`User ${req.user._id} has not favorited any campsites.`);
                    err.status = 404;
                    next(err);
                } else if (favorites.campsites.indexOf(req.params.campsiteId) === -1) {
                    err = new Error(`User ${req.user._id} has not favorited campsite ${req.params.campsiteId}.`);
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err => next(err));
    });






module.exports = favoriteRouter;