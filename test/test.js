const assert = require('assert');
const markov = require('../index.js')
// Note test values were derived from:
// https://analyzecore.com/2016/08/03/attribution-model-r-part-1/
const testData = [
  {conversions:1, value:1000.00, path:'C1 > C2 > C3'},
  {conversions:0, value:0, path:'C1'},
  {conversions:0, value:0, path:'C2 > C3'},
]
var markovObj = new markov({
    devMsg: true,
    separator: ' > '
});
describe('Channel Attribution', function() {
  describe('#channels()', function() {
    it('should return the list of channels', function() {
      var expected = ['C1', 'C2', 'C3'];
      var test = markovObj.channels(testData);
      assert.equal(expected.toString(),test.toString());
    });
  });
  describe('#prob()', function() {
    it('should return the expected probability of the test matrix', function() {
      var expected = 1/3;
      var matrix = markovObj.matrix(markovObj.seed(testData));
      var test = markovObj.prob(matrix);
      assert.equal(expected,test);
    });
    it('should return the expected probability of the test matrix minus c1', function() {
      var expected = 1/6;
      var matrix = markovObj.matrix(markovObj.seedRm(testData,'C1'));
      var test = markovObj.prob(matrix);
      assert.equal(expected,test);
    });
  });
  describe('#removalEffect()', function() {
    it('should return the expected removal effect of C1', function() {
      var expected = .5;
      var test = markovObj.removalEffect(testData,'C1');
      assert.equal(expected,test);
    });
    it('should return the expected removal effect of C2', function() {
      var expected = 1;
      var test = markovObj.removalEffect(testData,'C2');
      assert.equal(expected,test);
    });
    it('should return the expected removal effect of C3', function() {
      var expected = 1;
      var test = markovObj.removalEffect(testData,'C3');
      assert.equal(expected,test);
    });
  });
  describe('#channelAttribution()', function() {
    it('should return the expected channel attribution data', function() {
      var expected = {
        C1: {
          conversions: 0.2,
          removal: 0.5,
          value: 200,
          weighted: 0.2,
        },
        C2: {
          conversions: 0.4,
          removal: 1,
          value: 400,
          weighted: 0.4,
        },
        C3: {
          conversions: 0.4,
          removal: 1,
          value: 400,
          weighted: 0.4,
        }
      };
      var test = markovObj.channelAttribution(testData);
      assert.deepEqual(expected,test);
    });

  });

});
