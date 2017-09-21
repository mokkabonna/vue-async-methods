# vue-async-methods [![Build Status](https://travis-ci.org/mokkabonna/vue-async-methods.svg?branch=master)](https://travis-ci.org/mokkabonna/vue-async-methods)

> Vue async methods support

Gives you utility methods for your promise based methods for use in the view. Also catch errors in the view.

[Demo](https://jsfiddle.net/nyz4ahys/4/)

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

default `false`, if true: creates computeds that proxies `fetchArticles.resolvedWith` to `articles`

#### getComputedName(vm, methodName)

A function that should return the name of the desired computed if createComputed is `true`

default:
```js
// turns "fetchArticles", "getArticles" or "loadArticles" into "articles" computed
function (vm, methodName) {
  var withoutPrefix = methodName.replace(/^(fetch|get|load)/, '')
  return withoutPrefix.slice(0, 1).toLowerCase() + withoutPrefix.slice(1)
}
```

#### onError(err, handledInView, vm, methodName, args)

default: `null`

All error raised by the methods will be passed to the onError handler, enabling you to implement
global error handling, logging, etc.

Now you can define async methods on your vm:

```javascript
export default {
  asyncMethods: {
    fetchArticles() {
      return ajax('http://example.com/data.json')
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

It also registers a component called `catch-async-error` that enables you to catch errors in the view instead of in the code.


```html
<button type="button" @click="fetchArticles.execute">Load data</button>
<div v-if="!fetchArticles.isCalled">Click button to load data</div>
<div v-if="fetchArticles.isPending">Loading data...</div>

<ul v-if="fetchArticles.resolvedWithSomething">
    <li v-for="article in articles">
        {{article.name}}
    </li>
</ul>
    
<div v-if="fetchArticles.resolvedWithEmpty">
    There are no articles.
</div>

<catch-async-error :method="fetchArticles">
    <div v-if="fetchArticles.rejectedWith">
        Could not load articles due to an error. Details: {{fetchArticles.rejectedWith.message}}
    </div>
</catch-async-error>
```

## Contributing

Create tests for new functionality and follow the eslint rules.

## License

MIT © [Martin Hansen](http://martinhansen.com)
