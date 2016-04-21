(function () {
  'use strict'

  const config = require('./config')
  const mandrill = require('mandrill-api/mandrill')
  const mandrillClient = new mandrill.Mandrill(config.auth.key)
  const request = require('request')

  console.log('index.js - ', process.argv)

  let template = process.argv[2]
  let url = process.argv[3]
  let subject = process.argv[4] || 'Test'

  let content = [{
    name: template,
    content: ''
  }]

  request.get(url, function (error, response, body) {
    if (error) {
      console.error('index.js - request error', error)
      return
    }
    if (response.statusCode === 200) {
      let img = new Buffer(body).toString('base64')
      send(img)
    } else {
      console.warn('index.js - request responded with status %s.', response.statusCode)
    }
  })

  function send (img) {
    var params = {
      template_name: template,
      template_content: [],
      message: {
        headers: {
          'Reply-To': ''
        },
        from_email: config.sender,
        to: config.to,
        bcc_address: '',
        subject: subject,
        html: '',
        global_merge_vars: [{
          name: 'PICTURE',
          content: url
        }],
        attachments: [{
          type: 'image/png',
          name: 'photo.png',
          content: img
        }]
      }
    }

    mandrillClient.messages.sendTemplate(params, function (result) {
      console.log('index.js - mandrill success:', result)
    }, function (error) {
      console.log('index.js - mandrill error:', error)
    })
  }
})()