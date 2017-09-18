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

default `false`, if true: creates computeds that proxies fetchArticles.resolvedWith

#### getComputedName 

A function that should return the name of the desired computed if createComputed is `true`
default
```js
// turns "fetchArticles", "getArticle" or "loadArticle" into "article" computed
function (vm, funcName) {
  var withoutPrefix = funcName.replace(/^(fetch|get|load)/, '')
  return withoutPrefix.slice(0, 1).toLowerCase() + withoutPrefix.slice(1)
}
```

Now you can define async methods on your vm:

```javascript
export default {
  asyncMethods: {
    fetchArticles() {
      return ajax('http://example.com/data.json') //must return a promise
    }
  },
}
```

And use the following helper variables in your view:

```js
articles // this is a computed that aliases fetchArticles.resolvedWith
fetchArticles.execute // executes the method
fetchArticles.promise // the current or last promise
fetchArticles.isCalled // false until first called
fetchArticles.isPending
fetchArticles.isResolved
fetchArticles.isRejected
fetchArticles.resolvedWith
fetchArticles.resolvedWithEmpty //empty means empty object or empty array
fetchArticles.resolvedWithSomething //opposite of empty
fetchArticles.rejectedWith //Error object
```


```html
<button type="button" @click="fetchArticles.execute">Load data</button>
<div v-if="!fetchArticles.isCalled">Click button to load data</div>
<div v-if="fetchArticles.isPending">Loading data...</div>

<div v-if="fetchArticles.isResolved">
    <div v-if="fetchArticles.resolvedWithSomething">
        <ul>
            <li v-for="article in articles">
                {{article.name}}
            </li>
        </ul>
    </div>
    <div v-if="fetchArticles.resolvedWithEmpty">
        Empty list returned
    </div>
</div>

<div v-if="fetchArticles.isRejected">
    <div v-if="fetchArticles.rejectedWith">
        Could not load data due to an error. Details: {{fetchData.rejectedWith.message}}
    </div>
</div>
```

## License

MIT © [Martin Hansen](http://martinhansen.com)
