'use strict';
module.exports = {
  install(Vue, options) {
    options = options || {}

    function isEmpty(val) {
      if (Array.isArray(val)) {
        return val.length === 0
      } else if (typeof val === 'object') {
        return Object.keys(val).length === 0
      } else {
        return false
      }
    }

    function wrapMethod(func, vm) {
      function wrapped() {
        var args = [].slice.call(arguments)

        wrapped.isCalled = true
        wrapped.isPending = true
        wrapped.isResolved = false
        wrapped.isRejected = false
        wrapped.resolvedWith = null
        wrapped.resolvedWithSomething = false
        wrapped.resolvedWithEmpty = false
        wrapped.rejectedWith = null

        var result = func.apply(vm, args)

        if (result && result.then) {
          return result.then(function(res) {
            wrapped.isPending = false
            wrapped.isResolved = true
            wrapped.resolvedWith = res

            var empty = isEmpty(res)
            wrapped.resolvedWithEmpty = empty
            wrapped.resolvedWithSomething = !empty
            vm.$forceUpdate()
            return res
          }).catch(function(err) {
            wrapped.isPending = false
            wrapped.isRejected = true
            wrapped.rejectedWith = err
            vm.$forceUpdate()

            throw err
          })
        } else {
          return result
        }
      }

      wrapped.isCalled = false
      wrapped.isPending = false
      wrapped.isResolved = false
      wrapped.isRejected = false
      wrapped.resolvedWith = null
      wrapped.resolvedWithSomething = false
      wrapped.resolvedWithEmpty = false
      wrapped.rejectedWith = null

      return wrapped
    }

    Vue.mixin({
      beforeCreate() {
        for (const key in this.$options.asyncMethods || {}) {
          this[key] = wrapMethod(this.$options.asyncMethods[key], this)
        }
      }
    })
  }
}
