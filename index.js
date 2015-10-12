require('source-map-support').install()

var ava = require('ava')
var sinon = require('sinon')
var Promise = require('bluebird')

var wrap = function (fn) {
  return function (t) {
    var sandbox = sinon.sandbox.create({
      injectInto: t,
      properties: ['spy', 'stub', 'mock']
    })

    return new Promise(function (resolve, reject) {
      try {
        resolve(fn(t))
      } catch (e) {
        reject(e)
      }
      resolve()
    }).finally(() => {
      sandbox.verifyAndRestore()
      t.end()
    })
  }
}

var zopf = function (title, fn) {
  if (typeof title !== 'string') {
    fn = title
    title = null
  }

  ava(title, wrap(fn))
}

zopf.serial = function (title, fn) {
  if (typeof title !== 'string') {
    fn = title
    title = null
  }

  ava.serial(title, wrap(fn))
}

module.exports = zopf

