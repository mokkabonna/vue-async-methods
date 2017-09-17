/* global describe, it */
var expect = require('chai').expect
var Vue = require('vue')
var asyncMethods = require('./index')
var resolve
var reject

function fetch() {
  return new Promise(function(res, rej) {
    resolve = res
    reject = rej
  })
}

describe('vue-async-methods', function() {
  var vm
  beforeEach(function() {
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
  	  call = vm.fetch.execute()
  	})
  	
  	it('is called', function() {
  	  expect(vm.fetch.isCalled).to.equal(true)
    	expect(vm.fetch.isPending).to.equal(true)
    	expect(vm.fetch.isResolved).to.equal(false)
    	expect(vm.fetch.isRejected).to.equal(false)
    	expect(vm.fetch.resolvedWith).to.equal(null)
    	expect(vm.fetch.resolvedWithSomething).to.equal(false)
    	expect(vm.fetch.resolvedWithEmpty).to.equal(false)
    	expect(vm.fetch.rejectedWith).to.equal(null)
  	})
  })
})
