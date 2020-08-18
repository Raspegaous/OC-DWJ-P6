const fs = require('fs');
const Sauce = require('../models/Sauce');

const error400 = error => res.status(400).json({error});
const error500 = error => res.status(500).json({error});

exports.getAll = (req, res) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error400);
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
        .catch(error400);
}

exports.getOne = (req, res) => {
    Sauce.find({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error400);
};

exports.update = (req, res) => {
    const object = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.host}/images/${req.file.filename}`
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
                        .catch(error400);
                });
            } else {
                Sauce.updateOne(
                    {_id: req.params.id},
                    {...object, _id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
                    .catch(error400);
            }
        })
        .catch(error500);
};

exports.delete = (req, res) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce supprimée !'}))
                    .catch(error400);
            })
        })
        .catch(error500);
};

exports.like = (req, res) => {
    // like d'une sauce
    if (req.body.like === 1) {
        Sauce.updateOne(
            {_id: req.params.id},
            {
                $set: {userLiked: req.body.userId},
                $inc: {likes: 1}
            })
            .then(() => res.status(200).json({message: "Like de la sauce"}))
            .catch(error400);
    }
    // dislike d'une sauce
    if (req.body.like === -1) {
        Sauce.updateOne(
            {_id: req.params.id},
            {
                $set: {userDisliked: req.body.userId},
                $inc: {dislikes: 1}
            })
            .then(() => res.status(200).json({message: "Dislike de la sauce"}))
            .catch(error400);
    }
    // annulation d'un like/dislike
    if (req.body.like === 0) {
        Sauce.findOne({_id: req.params.id})
            .then(sauce => {
                // on vérifie le like de l'utilisateur
                const check = sauce.userLiked.includes(req.body.userId);
                if (check) {
                    Sauce.updateOne(
                        {_id: req.params.id},
                        {
                            $pull: {userLiked: req.body.userId},
                            $inc: {likes: -1}
                        })
                        .then(() => res.status(200).json({message: 'Suppression du like'}))
                        .catch(error400);
                } else {
                    Sauce.updateOne(
                        {_id: req.params.id},
                        {
                            $pull: {userDisliked: req.body.userId},
                            $inc: {dislikes: -1}
                        })
                        .then(() => res.status(200).json({message: 'Suppression du dislike'}))
                        .catch(error400);
                }
            })
            .catch(error500);
    }
};