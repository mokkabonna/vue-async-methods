'use strict'

var blockRegex = /^(address|blockquote|body|center|dir|div|dl|fieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|p|pre|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)$/i

function isBlockLevel(name) {
  return blockRegex.test(name)
}

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

function createComputed(self, key) {
  return function() {
    return self[key].resolvedWith
  }
}

module.exports = {
  install: function(Vue, options) {
    options = options || {}
    options.getComputedName = options.getComputedName || function(vm, funcName) {
      var withoutPrefix = funcName.replace(/^(fetch|get|load)/, '')
      return withoutPrefix.slice(0, 1).toLowerCase() + withoutPrefix.slice(1)
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
            vm[funcName].promise = result.then(function(res) {
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
                options.onError(err, vm[funcName].handleErrorInView, vm, funcName, args)
              }

              throw err
            })

            return vm[funcName].promise
          } else {
            // always return a promise for consistency
            vm[funcName].promise = new Promise(function(resolve) {
              var empty = isEmpty(result)
              vm[funcName].resolvedWithEmpty = empty
              vm[funcName].resolvedWithSomething = !empty

              resolve(result)
            })

            return vm[funcName].promise
          }
        } catch (err) {
          // always return a promise for consistency
          vm[funcName].promise = new Promise(function(resolve, reject) {
            vm[funcName].isPending = false
            vm[funcName].isRejected = true
            vm[funcName].rejectedWith = err

            if (isFunction(options.onError)) {
              options.onError(err, vm[funcName].handleErrorInView, vm, funcName, args)
            }

            reject(err)
          })

          return vm[funcName].promise
        }
      }

      return wrapped
    }

    Vue.component('catch-async-error', {
      props: {
        method: {
          type: Object,
          required: true
        }
      },
      render: function(h) {
        if (!this.error || !this.$slots || !this.$slots.default) return null

        if (this.$slots.default.length === 1) {
          return this.$slots.default[0]
        }

        var isAnyBlock = this.$slots.default.some(function(vNode) {
          return isBlockLevel(vNode.tag)
        })
        var baseElement = isAnyBlock ? 'div' : 'span'
        return h(baseElement, this.$slots.default)
      },
      data: function() {
        return {
          error: null
        }
      },
      created: function() {
        this.method.handleErrorInView = true

        if (this.method.promise) {
          this.catchError()
        }
      },
      watch: {
        'method.promise': 'catchError'
      },
      methods: {
        catchError: function() {
          var self = this
          this.error = null

          this.method.promise.catch(function(err) {
            self.error = err
          })
        }
      }
    })

    Vue.config.optionMergeStrategies.asyncMethods = Vue.config.optionMergeStrategies.methods

    Vue.mixin({
      beforeCreate: function() {
        var self = this
        var asyncMethods = this.$options.asyncMethods || {}

        for (var key in asyncMethods) {
          Vue.util.defineReactive(this, key, {
            execute: wrapMethod(asyncMethods[key], this, key),
            promise: null,
            isCalled: false,
            isPending: false,
            isResolved: false,
            isRejected: false,
            resolvedWith: null,
            resolvedWithSomething: false,
            resolvedWithEmpty: false,
            rejectedWith: null,
            handleErrorInView: false
          })

          // add computed
          if (options.createComputed) {
            this.$options.computed = this.$options.computed || {}
            var computedName = options.getComputedName(this, key)

            if (!computedName || !computedName.length) {
              throw new Error('Computed name for method ' + key + ' is empty, return a non zero length string')
            }

            this.$options.computed[computedName] = createComputed(self, key)
          }
        }
      }
    })
  }
}
