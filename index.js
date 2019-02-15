const Hash = require('hashish')
const Matrix = require('stochasticmath')

var markov = function(config){
  // The interface we'll return
  var self = {};

  /**
   * Public method, seeds the markov db
   */
  self.seed = function (conversions) {
    devMsg('Seeding database with conversions: ',conversions.length)
    var words = [];
    var links = [];
    var db = {};
    var startNode = '[START]';
    for(var i = 0; i < conversions.length; i++){
      var conversion = conversions[i];
      var finalNode = (conversion.conversions === undefined || conversion.conversions > 0)?'[CONVERSION]':'[NULL]';
      var curpath = (conversion.path == "")?"":conversion.path + config.separator;
      var newpath = startNode + config.separator + curpath + finalNode;
      var split = newpath.split(config.separator);
      words = words.concat(split)
    }

    // for more than one order, need to replace the order below with more than one or config.order
    for (var i = 0; i < words.length; i += config.order) {
        var link = words.slice(i, i + config.order).join(config.separator);
        links.push(link);
    }

    for (var i = 1; i < links.length; i++) {
        var word = links[i-1];
        var cword = sanitize(word);
        var next = links[i];
        var cnext = sanitize(next);

        var node = Hash.has(db, cword)
            ? db[cword]
            : {
                count : 0,
                words : {},
                next : {},
            }
        ;
        db[cword] = node;

        node.count ++;
        node.words[word] = (
            Hash.has(node.words, word) ? node.words[word] : 0
        ) + 1;
        node.next[cnext] = (
            Hash.has(node.next, cnext) ? node.next[cnext] : 0
        ) + 1

    }

    if (!Hash.has(db, cnext)) db[cnext] = {
        count : 1,
        words : {},
        next : { '' : 0 },
    };
    var n = db[cnext];
    n.words[next] = (Hash.has(n.words, next) ? n.words[next] : 0) + 1;
    n.next[''] = (n.next[''] || 0) + 1;
    //devMsg('seeded db was', db)
    return db;
  };

  /**
   * Public method, seeds the markov db without a channel
   */
  self.seedRm = function (conversions,channel) {
    devMsg('Seeding removal database with conversions: ',conversions.length)

    var words = [];
    var links = [];
    var db = {};
    var startNode = '[START]';
    for(var i = 0; i < conversions.length; i++){
      var conversion = conversions[i];
      var finalNode = (conversion.conversions === undefined || conversion.conversions > 0)?'[CONVERSION]':'[NULL]';
      var curpath = (conversion.path == "")?"":conversion.path + config.separator;
      var newpath = startNode + config.separator + curpath + finalNode;
      var split = newpath.split(config.separator);
      words = words.concat(split)
    }
    // for more than one order
    for (var i = 0; i < words.length; i += config.order) {
        var link = words.slice(i, i + config.order).join(config.separator);
        links.push(link);
    }

    if (links.length <= 1) {
        return;
    }

    for (var i = 1; i < links.length; i++) {
        var word = links[i-1];
        var cword = sanitize(word);
        var next = links[i];
        var cnext = sanitize(next);

        if(next == channel){
          cnext = '[NULL]'
        }
        if(word != channel){
          var node = Hash.has(db, cword)
              ? db[cword]
              : {
                  count : 0,
                  words : {},
                  next : {},
              }
          ;
          db[cword] = node;

          node.count ++;
          node.words[word] = (
              Hash.has(node.words, word) ? node.words[word] : 0
          ) + 1;
          node.next[cnext] = (
              Hash.has(node.next, cnext) ? node.next[cnext] : 0
          ) + 1
        }
    }

    if (!Hash.has(db, cnext)) db[cnext] = {
        count : 1,
        words : {},
        next : { '' : 0 },
    };
    var n = db[cnext];
    n.words[next] = (Hash.has(n.words, next) ? n.words[next] : 0) + 1;
    n.next[''] = (n.next[''] || 0) + 1;

    return db;
  };

  /**
   * Public method, creates a stochastic matrix from the markov db
   */
  self.matrix = function(db){
    devMsg('creating matrix of shape', Object.keys(db).length)
    var matrixObj = {}
    for(key in db){
      var row = db[key];
      var rkey = Object.keys(row.words)[0];
      matrixObj[rkey] = (matrixObj[rkey]===undefined)?{}:matrixObj[rkey];
      var rowTotal = 0;
      for(key2 in db){
        var ckey = Object.keys(db[key2].words)[0]
        switch(rkey){
          case "[NULL]":
          case "[CONVERSION]":
            matrixObj[rkey][ckey] = (rkey==ckey)?1:0;
          break;
          default:
            matrixObj[rkey][ckey] = (row.next[key2] === undefined)?0:row.next[key2]
          break;
        }
        rowTotal+= matrixObj[rkey][ckey];
      }
      for(key3 in db){
        var ckey = Object.keys(db[key3].words)[0]
        matrixObj[rkey][ckey] = (isNaN(matrixObj[rkey][ckey] / rowTotal))?0:(matrixObj[rkey][ckey] / rowTotal)
      }
    }

    var okeys = ['[START]']
    for(var rkey in matrixObj){
      if(rkey !='[START]' && rkey!='[NULL]' && rkey!='[CONVERSION]'){
        okeys.push(rkey)
      }
    }
    okeys.push('[NULL]');
    okeys.push('[CONVERSION]');

    var values = []
    for(var i = 0; i < okeys.length; i++){
      var rowkey = okeys[i];
      for(var j = 0; j < okeys.length; j++){
        var colkey = okeys[j];
        if(matrixObj[rowkey]!== undefined){
          values.push((matrixObj[rowkey][colkey]===undefined)?0:matrixObj[rowkey][colkey])
        }
        else{
          values.push(0)
        }
      }
    }

    var matrix = new Matrix()
    matrix.setData(values, okeys.length,okeys.length)
    //devMsg('matrix',matrix.toLogString())
    return matrix
  }

  /**
   * Public method, calculates the total probability of a matrix to convert.
   */
  self.prob = function(matrix){
    return matrix.probability(0,1)
  }

  /**
   * Public method, gets the removal effect for a channel.
   */
  self.removalEffect = function(conversions, channel){
    // Calculate the conversion probability
    var db = self.seed(conversions);
    var matrix = self.matrix(db);
    var conversionProb = self.prob(matrix);
    devMsg('Full graph probability is',conversionProb)
    var newDb = self.seedRm(conversions, channel);
    if(!newDb.hasOwnProperty('[CONVERSION]')){
      // No coversions so we know the removal effect is one
      return 1;
    }
    else{
      var newMatrix = self.matrix(newDb);
      var removedProb = self.prob(newMatrix);

      var subtracted = removedProb/conversionProb;

      var removalEffect = (1 - subtracted);

      return removalEffect;
    }

  }

  /**
   * Public method, gets the list of channels.
   */
  self.channels = function(conversions){
    var db = self.seed(conversions);

    var channels = []
    for(key in db){
      if(key !='[START]'&&key!='[NULL]'&&key!='[CONVERSION]'){
        channels.push(key)
      }
    }
    return channels;
  }

  /**
   * Public method, gets the channel attribution for a set of visit data
   */
  self.channelAttribution = function(conversions){
    var channels = self.channels(conversions);
    devMsg('Finding channel attribution for', channels)
    var attribution = {};
    var cumulative = 0;
    for(var i = 0; i < channels.length; i++){
      var channel = channels[i];
      devMsg('Calculating removal effect of ', channel)
      var removalEffect = self.removalEffect(conversions,channel);
      devMsg('Removal effect was', removalEffect);
      attribution[channel] = {
        removal: removalEffect
      };
      cumulative+= removalEffect
    }
    var totalConversions = 0;
    var totalValue = 0;
    for(var i = 0; i < conversions.length; i++){
      totalConversions+= conversions[i].conversions
      totalValue+= conversions[i].value
    }
    for(var i = 0; i < channels.length; i++){
      var channel = channels[i];
      attribution[channel]['weighted'] = attribution[channel].removal/cumulative;
      attribution[channel]['conversions'] = attribution[channel].weighted * totalConversions;
      attribution[channel]['value'] = attribution[channel].weighted * totalValue;
    }
    devMsg('Weighted values are ', attribution)
    return attribution;
  }

  /**
   * Private utility function to configure the obj
   */
  function configure(){
    config = (config === undefined)?{}:config;
    // for now we're limited to single-order markov chains
    config.order = 1

  }

  /**
   * Private utility function to print dev messages based on config.
   */
  function devMsg(label,vari){
    if(config.devMsg){
      console.log(label,vari)
    }
  }

  /**
   * Private utility function to sanitize words
   */
  function sanitize(s) {
       return s
           //.toLowerCase()
           //.replace(/[^a-z\d]+/g, '_')
           //.replace(/^_/, '')
           //.replace(/_$/, '')
       ;
   }


  configure();

  return self;
}

module.exports = markov;
