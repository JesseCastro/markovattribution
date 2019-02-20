# Markov Chain Channel Attribution

This library is based off of Sergey Bryl's fantastic [article on Markov chain attribution](https://analyzecore.com/2016/08/03/attribution-model-r-part-1/). Tests included in the library are based off the results found in that tutorial.  The object of this library is to use markov chain math to find the removal effect of individual channels in customer journey paths.  This is a data-driven equivalent to heuristic attribution methods such as "first touch" and "last touch".  

## Instantiation

To use the object, create an instance:
```
const Markov = require('markovattribution')

var markov = new Markov(config)
```

## Data array

The object should be primed with an array of objects in the following format:
```
{conversions:1, value:1000.00, path:'C1 > C2 > C3'}
```
For example:
```
const Markov = require('markovattribution')

const data = [
  {conversions:1, value:1000.00, path:'C1 > C2 > C3'},
  {conversions:0, value:0, path:'C1'},
  {conversions:0, value:0, path:'C2 > C3'},
]

var markov = new Markov(config)
```

## Configuration

The object can be passed a configuration object in the following format:
```
const Markov = require('markovattribution')

const data = [
  {conversions:1, value:1000.00, path:'C1 > C2 > C3'},
  {conversions:0, value:0, path:'C1'},
  {conversions:0, value:0, path:'C2 > C3'},
]
const config = {
  devMsg: true,    // if true, reports info to the console
  separator: ' > ' // string used to separate channel entries in the conversion data
}

var markov = new Markov(config)
```

## Instance methods

The instance of the object exposes the following methods:

### channels(conversions)

Returns the transient channels in data in an array.  Example:

```
const Markov = require('markovattribution')

const data = [
  {conversions:1, value:1000.00, path:'C1 > C2 > C3'},
  {conversions:0, value:0, path:'C1'},
  {conversions:0, value:0, path:'C2 > C3'},
]
const config = {
  devMsg: true,    // if true, reports info to the console
  separator: ' > ' // string used to separate channel entries in the conversion data
}

var markov = new Markov(config)

console.log(markov.channels(data))
```

returns:

```
> ['C1','C2','C3']
```

### prob(matrix)

Returns the probability of the graph to reach the conversion state when starting from the "start" state.  Example:

```
const Markov = require('markovattribution')

const data = [
  {conversions:1, value:1000.00, path:'C1 > C2 > C3'},
  {conversions:0, value:0, path:'C1'},
  {conversions:0, value:0, path:'C2 > C3'},
]
const config = {
  devMsg: true,    // if true, reports info to the console
  separator: ' > ' // string used to separate channel entries in the conversion data
}

var markov = new Markov(config)

console.log(markov.prob(data))
```

returns:

```
> 0.3333333333333
```

### removalEffect(conversions, channel, fullprob)

Returns the raw (unweighted) removal effect of channel for the set of conversions data.  Example:

```
const Markov = require('markovattribution')

const data = [
  {conversions:1, value:1000.00, path:'C1 > C2 > C3'},
  {conversions:0, value:0, path:'C1'},
  {conversions:0, value:0, path:'C2 > C3'},
]
const config = {
  devMsg: true,    // if true, reports info to the console
  separator: ' > ' // string used to separate channel entries in the conversion data
}

var markov = new Markov(config)

var fullProbability = markov.prob()

console.log(markov.removalEffect(data, 'C1', fullProbability))
```

returns:

```
> 0.5
```


### channelAttribution(conversions)

Returns an object containing channel attribution information about each of the channels in the conversions dataset.  Object returned is in the following format:

```
{
  <channel1name>: {
    conversions: <weighted conversions>,
    removal: <raw removal effect>,
    value: <weighted value>,
    weighted: <weighted removal effect>,
  },
  ...
  <channelNname> :{...}
}
```

Example:

```
const Markov = require('markovattribution')

const data = [
  {conversions:1, value:1000.00, path:'C1 > C2 > C3'},
  {conversions:0, value:0, path:'C1'},
  {conversions:0, value:0, path:'C2 > C3'},
]
const config = {
  devMsg: true,    // if true, reports info to the console
  separator: ' > ' // string used to separate channel entries in the conversion data
}

var markov = new Markov(config)

console.log(markov.channelAttribution(data))
```

returns:

```
> {
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
  }
```
