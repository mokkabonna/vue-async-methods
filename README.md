# vue-async-methods [![Build Status](https://travis-ci.org/mokkabonna/vue-async-methods.svg?branch=master)](https://travis-ci.org/mokkabonna/vue-async-methods)

> Vue async methods support

## Install

```
$ npm install vue-async-methods
```

## Usage

```javascript
import AsyncMethods from 'vue-async-methods'

Vue.use(AsyncMethods)
```

Now you can define async methods on your vm:

```javascript
export default {
  asyncMethods: {
    fetchData() {
      return ajax('http://example.com/data.json') //must return a promise
    }
  },
}
```

And use the following helper variables in your view:

```js
fetchData.execute // executes the method
fetchData.isCalled // false until first called
fetchData.isPending
fetchData.isResolved
fetchData.isRejected
fetchData.resolvedWith
fetchData.resolvedWithEmpty //empty means empty object or empty array
fetchData.resolvedWithSomething //opposite of empty
fetchData.rejectedWith //Error object
```


```html
<button type="button" @click="fetchData.execute">Load data</button>
<div v-if="!fetchData.isCalled">Click button to load data</div>
<div v-if="fetchData.isPending">Loading data...</div>

<div v-if="fetchData.isResolved">
    <div v-if="fetchData.resolvedWithSomething">
        <ul>
            <li v-for="item in fetchData.resolvedWith">
                {{item.name}}
            </li>
        </ul>
    </div>
    <div v-if="fetchData.resolvedWithEmpty">
        Empty list returned
    </div>
</div>

<div v-if="fetchData.isRejected">
    <div v-if="fetchData.rejectedWith">
        Could not load data due to an error. Details: {{fetchData.rejectedWith.message}}
    </div>
</div>
```

## License

MIT © [Martin Hansen](http://martinhansen.com)
