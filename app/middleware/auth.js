require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
      // On récupère la partie correspondant au token dans les headers
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      const { userId } = decodedToken;
      if (req.body.userId && req.body.userId !== userId) {
          throw "ID de l'utilisateur non valide";
      } else {
          next();
      }
  }  catch (error) {
      res.status(401).json({ error: error || 'Requête non authentifiée' });
  }
};