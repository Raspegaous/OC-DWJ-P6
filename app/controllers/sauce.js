const fs = require('fs');
const Sauce = require('../models/Sauce');

exports.getAll = (req, res) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

exports.create = (req, res) => {
    const object = JSON.parse(req.body.sauce);
    delete object._id;
    const sauce = new Sauce({
        ...object,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({message: 'Sauce créée !'}))
        .catch(error => res.status(400).json({error}));
}

exports.getOne = (req, res) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({error}));
};

exports.update = (req, res) => {
    const object = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if (req.file) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne(
                        {_id: req.params.id},
                        {...object, _id: req.params.id})
                        .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
                        .catch(error => res.status(400).json({error}));
                });
            } else {
                Sauce.updateOne(
                    {_id: req.params.id},
                    {...object, _id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
                    .catch(error => res.status(400).json({error}));
            }
        })
        .catch(error => res.status(500).json({error}));
};

exports.delete = (req, res) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce supprimée !'}))
                    .catch(error => res.status(400).json({error}));
            })
        })
        .catch(error => res.status(500).json({error}));
};

/**
 *
 * @param req { Object }
 * @param res { Object }
 * @param msg { String } Message d'erreur
 * @param like { String } Like | Dislike | removeLike | removeDislike
 */
const liking = (req, res, msg, like) => {
    let liked;
    switch (like) {
        case 'like':
            liked = {
                $set: {userslike : req.body.userId},
                $inc: {likes: 1}
            }
            break;
        case 'dislike':
            liked = {
                $set: {usersDlike : req.body.userId},
                $inc: {dislikes: 1}
            }
            break;
        case 'removeLike':
            liked = {
                $pull: {usersLiked: req.body.userId},
                $inc: {likes: -1}
            }
            break;
        case 'removeDislike':
            liked = {
                $pull: {usersDisliked: req.body.userId},
                $inc: {dislikes: -1}
            }
            break;
        default:
            res.status(500).json({message: 'Une erreur inconnue est survenue'});
            break;
    }
    Sauce.updateOne({ _id: req.params.id }, liked)
        .then(() => res.status(200).json({message: msg}))
        .catch(error => res.status(400).json({error}));
}

exports.like = (req, res) => {
    switch (req.body.like) {
        // Like d'une sauce
        case 1:
            liking(req, res, "Like de la sauce", 'like');
            break;
        // dislike d'une sauce
        case -1:
            liking(req, res, "Dislike de la sauce", 'dislike');
            break;
        // Annulation d'un like - dislike
        case 0:
            Sauce.findOne({_id: req.params.id})
                .then(sauce => {
                    // on vérifie le like de l'utilisateur
                    const check = sauce.usersLiked.includes(req.body.userId);
                    if (check) {
                        liking(req, res, 'Suppression du like', 'removeLike');
                    } else {
                        liking(req, res, 'Suppression du dislike', 'removeDislike');
                    }
                })
                .catch(error => res.status(500).json({error}));
            break;
        default:
            res.status(500).json({message: 'Une erreur inconnue est survenue !'});
    }
};