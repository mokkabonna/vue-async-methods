'use strict';
module.exports = AsyncMethods = {
  install(Vue, options) {
    options = options || {}

    function wrapMethod(func, vm) {
      function wrapped() {
        var args = [].slice.call(arguments)

        wrapped.isCalled = true
        wrapped.isPending = true
        wrapped.isResolved = false
        wrapped.isRejected = false

        var result = func.apply(vm, args)

        if (result && result.then) {
          result.then(function(res) {
            wrapped.isPending = false
            wrapped.isResolved = true

            return res
          }).catch(function(err) {
            wrapped.isPending = false
            wrapped.isRejected = true

            throw err
          })

          return result
        } else {
          return result
        }
      }

      wrapped.isCalled = false
      wrapped.isPending = false
      wrapped.isResolved = false
      wrapped.isRejected = false

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
