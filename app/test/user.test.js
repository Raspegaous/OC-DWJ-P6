let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require( '../app');

let getAll = require('../controllers/sauce').getAll;

chai.use(chaiHttp);
chai.should();

describe('Sauce', () => {
   it('should get all sauce', () => {
      chai.request(app)
          .get('/api/sauces')
          .end((err, res) => {
             console.log(res.body);
             res.should.have.status(200);
             done();
          })
   });
});