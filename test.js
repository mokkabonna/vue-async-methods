/* global describe, it, beforeEach */
var expect = require('chai').expect
var sinon = require('sinon')
var decache = require('decache')
var asyncMethods = require('./index')
var resolvePromise
var rejectPromise

function fetch() {
  return new Promise(function(resolve, reject) {
    resolvePromise = resolve
    rejectPromise = reject
  })
}

describe('vue-async-methods custom options', function() {
  var vm
  var onError
  var Vue
  beforeEach(function() {
    decache('vue')
    Vue = require('vue')
    onError = sinon.stub()
    Vue.use(asyncMethods, {
      createComputed: true,
      onError: onError
    })

    vm = new Vue({
      asyncMethods: {
        fetchArticle: fetch
      }
    })
  })

  it('creates computeds based on prefix', function() {
    expect(vm.article).to.equal(null)
  })

  it('does not create computed if only prefix', function() {
    function create() {
      vm = new Vue({
        asyncMethods: {
          fetch: fetch
        }
      })
    }

    expect(create).to.throw(/Computed name for method fetch is empty/)
  })
  
  describe('direct call', function() {
    var article = {}
    beforeEach(function() {
      var call = vm.fetchArticle()
      resolvePromise(article)
      return call
    })

    it('updates the computed', function() {
      expect(vm.article).to.equal(article)
    })
  })

  describe('when it succeds', function() {
    var article = {}
    beforeEach(function() {
      var call = vm.fetchArticle.execute()
      resolvePromise(article)
      return call
    })

    it('updates the computed', function() {
      expect(vm.article).to.equal(article)
    })
  })

  describe('when it fail', function() {
    var error = new Error('fail')
    beforeEach(function() {
      var call = vm.fetchArticle.execute(1, 2, 3)
      rejectPromise(error)
      return call.catch(function () {})
    })

    it('calls the global error handler', function() {
      sinon.assert.calledOnce(onError)
      sinon.assert.calledWithMatch(onError, error, false, sinon.match.object, 'fetchArticle', [1, 2, 3])
    })
  })
})

describe('vue-async-methods default options', function() {
  var vm
  beforeEach(function() {
    decache('vue')
    var Vue = require('vue')
    Vue.use(asyncMethods)
    vm = new Vue({
      asyncMethods: {
        fetch: fetch
      }
    })
  })

  it('creates the method object on the vm', function() {
    expect(vm.fetch.execute).to.be.a('function')
  })

  it('exposes the initial state', function() {
    expect(vm.fetch.promise).to.equal(null)
    expect(vm.fetch.isCalled).to.equal(false)
    expect(vm.fetch.isPending).to.equal(false)
    expect(vm.fetch.isResolved).to.equal(false)
    expect(vm.fetch.isRejected).to.equal(false)
    expect(vm.fetch.resolvedWith).to.equal(null)
    expect(vm.fetch.resolvedWithSomething).to.equal(false)
    expect(vm.fetch.resolvedWithEmpty).to.equal(false)
    expect(vm.fetch.rejectedWith).to.equal(null)
  })

  describe('after called', function() {
    var call
    beforeEach(function() {
      call = vm.fetch()
    })

    it('is called', function() {
      expect(vm.fetch.promise).to.equal(call)
      expect(vm.fetch.isCalled).to.equal(true)
      expect(vm.fetch.isPending).to.equal(true)
      expect(vm.fetch.isResolved).to.equal(false)
      expect(vm.fetch.isRejected).to.equal(false)
      expect(vm.fetch.resolvedWith).to.equal(null)
      expect(vm.fetch.resolvedWithSomething).to.equal(false)
      expect(vm.fetch.resolvedWithEmpty).to.equal(false)
      expect(vm.fetch.rejectedWith).to.equal(null)
    })

    describe('when resolved with empty', function() {
      var resolveResult = {}
      beforeEach(function() {
        resolvePromise(resolveResult)
        return call
      })

      it('reflects status', function() {
        expect(vm.fetch.promise).to.equal(call)
        expect(vm.fetch.isCalled).to.equal(true)
        expect(vm.fetch.isPending).to.equal(false)
        expect(vm.fetch.isResolved).to.equal(true)
        expect(vm.fetch.isRejected).to.equal(false)
        expect(vm.fetch.resolvedWith).to.equal(resolveResult)
        expect(vm.fetch.resolvedWithSomething).to.equal(false)
        expect(vm.fetch.resolvedWithEmpty).to.equal(true)
        expect(vm.fetch.rejectedWith).to.equal(null)
      })
    })

    describe('when resolved with something', function() {
      var resolveResult = {
        foo: false
      }
      beforeEach(function() {
        resolvePromise(resolveResult)
        return call
      })

      it('reflects status', function() {
        expect(vm.fetch.promise).to.equal(call)
        expect(vm.fetch.isCalled).to.equal(true)
        expect(vm.fetch.isPending).to.equal(false)
        expect(vm.fetch.isResolved).to.equal(true)
        expect(vm.fetch.isRejected).to.equal(false)
        expect(vm.fetch.resolvedWith).to.equal(resolveResult)
        expect(vm.fetch.resolvedWithSomething).to.equal(true)
        expect(vm.fetch.resolvedWithEmpty).to.equal(false)
        expect(vm.fetch.rejectedWith).to.equal(null)
      })
    })

    describe('when resolved with empty array', function() {
      var resolveResult = []
      beforeEach(function() {
        resolvePromise(resolveResult)
        return call
      })

      it('reflects status', function() {
        expect(vm.fetch.promise).to.equal(call)
        expect(vm.fetch.isCalled).to.equal(true)
        expect(vm.fetch.isPending).to.equal(false)
        expect(vm.fetch.isResolved).to.equal(true)
        expect(vm.fetch.isRejected).to.equal(false)
        expect(vm.fetch.resolvedWith).to.equal(resolveResult)
        expect(vm.fetch.resolvedWithSomething).to.equal(false)
        expect(vm.fetch.resolvedWithEmpty).to.equal(true)
        expect(vm.fetch.rejectedWith).to.equal(null)
      })
    })

    describe('when resolved with array', function() {
      var resolveResult = [1]
      beforeEach(function() {
        resolvePromise(resolveResult)
        return call
      })

      it('reflects status', function() {
        expect(vm.fetch.promise).to.equal(call)
        expect(vm.fetch.isCalled).to.equal(true)
        expect(vm.fetch.isPending).to.equal(false)
        expect(vm.fetch.isResolved).to.equal(true)
        expect(vm.fetch.isRejected).to.equal(false)
        expect(vm.fetch.resolvedWith).to.equal(resolveResult)
        expect(vm.fetch.resolvedWithSomething).to.equal(true)
        expect(vm.fetch.resolvedWithEmpty).to.equal(false)
        expect(vm.fetch.rejectedWith).to.equal(null)
      })
    })

    describe('when rejected', function() {
      var rejectResult = new Error('msg')
      beforeEach(function() {
        rejectPromise(rejectResult)
        return call.catch(function () {}) // expect fail
      })

      it('reflects status', function() {
        expect(vm.fetch.promise).to.equal(call)
        expect(vm.fetch.isCalled).to.equal(true)
        expect(vm.fetch.isPending).to.equal(false)
        expect(vm.fetch.isResolved).to.equal(false)
        expect(vm.fetch.isRejected).to.equal(true)
        expect(vm.fetch.resolvedWith).to.equal(null)
        expect(vm.fetch.resolvedWithSomething).to.equal(false)
        expect(vm.fetch.resolvedWithEmpty).to.equal(false)
        expect(vm.fetch.rejectedWith).to.equal(rejectResult)
      })
    })
  })
})
