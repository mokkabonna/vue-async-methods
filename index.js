'use strict'

module.exports = {
  install(Vue, options) {
    options = options || {}

    function isEmpty(val) {
      if (Array.isArray(val)) {
        return val.length === 0
      } else if (typeof val === 'object' && val !== null) {
        return Object.keys(val).length === 0
      } else if (val === null) {
        return true
      } else {
        return false
      }
    }

    function isFunction(func) {
      return typeof func === 'function'
    }

    function wrapMethod(func, vm, funcName) {
      function wrapped() {
        var args = [].slice.call(arguments)

        vm[funcName].isCalled = true
        vm[funcName].isPending = true
        vm[funcName].isResolved = false
        vm[funcName].isRejected = false
        vm[funcName].resolvedWith = null
        vm[funcName].resolvedWithSomething = false
        vm[funcName].resolvedWithEmpty = false
        vm[funcName].rejectedWith = null

        try {
          var result = func.apply(vm, args)
          if (result && result.then) {
            return result.then(function(res) {
              vm[funcName].isPending = false
              vm[funcName].isResolved = true
              vm[funcName].resolvedWith = res

              var empty = isEmpty(res)
              vm[funcName].resolvedWithEmpty = empty
              vm[funcName].resolvedWithSomething = !empty

              return res
            }).catch(function(err) {
              vm[funcName].isPending = false
              vm[funcName].isRejected = true
              vm[funcName].rejectedWith = err

              if (isFunction(options.onError)) {
                options.onError(err, vm, funcName, args)
              } else {
                throw err
              }
            })
          } else {
            // always return a promise for consistency
            return new Promise(function(resolve) {
              var empty = isEmpty(result)
              vm[funcName].resolvedWithEmpty = empty
              vm[funcName].resolvedWithSomething = !empty

              resolve(result)
            })
          }
        } catch (err) {
          // always return a promise for consistency
          return new Promise(function(resolve, reject) {
            vm[funcName].isPending = false
            vm[funcName].isRejected = true
            vm[funcName].rejectedWith = err

            if (isFunction(options.onError)) {
              options.onError(err, vm, funcName, args)
            } else {
              reject(err)
            }
          })
        }
      }

      return wrapped
    }

    Vue.mixin({
      beforeCreate() {
        for (const key in this.$options.asyncMethods || {}) {
          Vue.util.defineReactive(this, key, {
            execute: wrapMethod(this.$options.asyncMethods[key], this, key),
            isCalled: false,
            isPending: false,
            isResolved: false,
            isRejected: false,
            resolvedWith: null,
            resolvedWithSomething: false,
            resolvedWithEmpty: false,
            rejectedWith: null
          })
        }
      }
    })
  }
}
