const axios = require('axios');
const CONFIG_NAME = 'side_features';
// const CONFIG_NAME = 'production_services';
// const CONFIG_NAME = 'global_config';
// http://192.168.10.24:8889/api/config-service.html 文档

axios
  .post(
    `http://cfgapi.staging.com/config/${CONFIG_NAME}`,
    {
      host: {
        appName: 'webconsole',
        appVersion: '1.0.0',
        '//agentName': 'hinata-js-sdk',
        '//agentVersion': '1.0.0',
      },
      merge: {
        app: ['webconsole'],
        // "//ns": [
        //     "pek2"
        // ]
      },
      // "//rootNS": "GLOBAL",
      verbose: true,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  .then(function (response) {
    if (response.data.statusCode === 0) {
      console.log(JSON.stringify(response.data.result));
    }
  })
  .catch(function (error) {
    console.log(error);
  });
