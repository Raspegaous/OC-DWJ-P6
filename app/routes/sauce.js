const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauce');

const router = express.Router();

router.get('/', auth, sauceCtrl.getAll);
router.post('/', auth, multer, sauceCtrl.create);
router.get('/:id', auth, sauceCtrl.getOne);
router.put('/:id', auth, sauceCtrl.update);
router.delete('/:id', auth, sauceCtrl.delete);
router.post('/:id/like', auth, sauceCtrl.like)

module.exports = router;
