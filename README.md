# vue-async-methods [![Build Status](https://travis-ci.org/mokkabonna/vue-async-methods.svg?branch=master)](https://travis-ci.org/mokkabonna/vue-async-methods)

> Vue async methods support

## Install

```
$ npm install vue-async-methods
```

## Usage

```javascript
import AsyncMethods from 'vue-async-methods'

Vue.use(AsyncMethods [,options])
```

### Options

#### createComputed 

default `false`, if true: creates computeds that proxies fetchArticle.resolvedWith

#### getComputedName 

A function that should return the name of the desired computed if createComputed is `true`
default
```js
// turns "fetchArticle", "getArticle" or "loadArticle" into "article" computed
function (vm, funcName) {
  var withoutPrefix = funcName.replace(/^(fetch|get|load)/, '')
  return withoutPrefix.slice(0, 1).toLowerCase() + withoutPrefix.slice(1)
}
```

Now you can define async methods on your vm:

```javascript
export default {
  asyncMethods: {
    fetchArticle() {
      return ajax('http://example.com/data.json') //must return a promise
    }
  },
}
```

And use the following helper variables in your view:

```js
article // this is a computed that aliases fetchArticle.resolvedWith
fetchArticle.execute // executes the method
fetchArticle.promise // the current or last promise
fetchArticle.isCalled // false until first called
fetchArticle.isPending
fetchArticle.isResolved
fetchArticle.isRejected
fetchArticle.resolvedWith
fetchArticle.resolvedWithEmpty //empty means empty object or empty array
fetchArticle.resolvedWithSomething //opposite of empty
fetchArticle.rejectedWith //Error object
```


```html
<button type="button" @click="fetchArticle.execute">Load data</button>
<div v-if="!fetchArticle.isCalled">Click button to load data</div>
<div v-if="fetchArticle.isPending">Loading data...</div>

<div v-if="fetchArticle.isResolved">
    <div v-if="fetchArticle.resolvedWithSomething">
        <ul>
            <li v-for="item in fetchArticle.resolvedWith">
                {{item.name}}
            </li>
        </ul>
    </div>
    <div v-if="fetchArticle.resolvedWithEmpty">
        Empty list returned
    </div>
</div>

<div v-if="fetchArticle.isRejected">
    <div v-if="fetchArticle.rejectedWith">
        Could not load data due to an error. Details: {{fetchData.rejectedWith.message}}
    </div>
</div>
```

## License

MIT © [Martin Hansen](http://martinhansen.com)
