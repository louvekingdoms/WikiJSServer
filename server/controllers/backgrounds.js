'use strict'

/* global git, lang, lcdata, upl */

const express = require('express')
const router = express.Router()

const validPathRe = new RegExp('^[a-zA-Z0-9](?:[a-zA-Z0-9 ._-]*[a-zA-Z0-9])?\.[a-zA-Z0-9_-]+$')

router.get('/*', (req, res, next) => {
  let fileName = req.params[0];
  
  if (!validPathRe.test(fileName)) {
    return res.sendStatus(404).end()
  }

  // todo: Authentication-based access

  res.sendFile(fileName, {
    root: git.getRepoPath() + '/backgrounds/',
    dotfiles: 'deny'
  }, (err) => {
    if (err) {
      res.status(err.status).end()
    }
  })
})

module.exports = router
