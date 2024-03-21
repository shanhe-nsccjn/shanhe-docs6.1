const fs = require('fs');
const shell = require('shelljs');
const checkNamespace = require('./checkNamespace');
const path = require('path');
const { getConfig } = require('./utils');
const logger = require('./logger');
const build = require('./build');
const search = require('./search/search');
const pubCloudProductNews = require('./pubCloudProductNews');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const { mergeDeep } = require('./utils');
const YAML = require('yaml');

process.on('SIGINT', () => process.exit());
process.on('SIGQUIT', () => process.exit());
process.on('SIGTERM', () => process.exit());

axiosRetry(axios, {
  retries: 3,
  onRetry: function (retryCount, error, requestConfig) {
    logger.warn(`请求重试 ${requestConfig.url} 第${retryCount}次`);
  },
});

const UPDATE_DATA_PATH = path.join(process.cwd(), 'scripts/data/update.json');

function getNamespacesAndQuitePreviousProcess() {
  const namespaces = process.argv.slice(2);

  const updateData = {
    pid: process.pid,
    params: namespaces,
    time: new Date().toLocaleString(),
  };
  if (fs.existsSync(UPDATE_DATA_PATH)) {
    const data = JSON.parse(fs.readFileSync(UPDATE_DATA_PATH, 'utf8'));
    if (data.pid) {
      shell.exec(`kill -9 ${data.pid}`);
      logger.warn(`[pid ${data.pid} killed] npm run update ${data.params.join(' ')}`);
    }
  }

  fs.writeFileSync(UPDATE_DATA_PATH, JSON.stringify(updateData, null, 2));

  return namespaces;
}

function resetUpdateCommand() {
  fs.writeFileSync(UPDATE_DATA_PATH, JSON.stringify({}));
}

async function syncConfigToHinata(namespace) {
  const config = getConfig(namespace);
  const CONFIG_PATH = path.join(process.cwd(), `config/@${namespace}`);
  const CONFIG_NAMES = [];
  [config.externalConfigs, config.externalStyles].forEach((v) => {
    if (!v) {
      return;
    }

    v.split(',')
      .filter(Boolean)
      .forEach((file) => {
        const [name, type] = file.split('.');
        if (name?.trim() && type?.trim()) {
          CONFIG_NAMES.push({ name: name.trim(), extension: type.trim() });
        }
      });
  });

  if (CONFIG_NAMES.length) {
    const CONFIG_CENTER_URL = 'http://api.qingcloud.com:13001/config';
    const result = await Promise.all(
      CONFIG_NAMES.map((v) =>
        axios
          .post(
            `${CONFIG_CENTER_URL}/${v.name}`,
            {
              host: {
                appName: 'docs-center',
                appVersion: '1.0.0',
              },
              merge: {
                app: ['webconsole-common'],
              },
              rootNS: 'GLOBAL',
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .catch(function (err) {
            return null;
          }),
      ),
    );
    result.forEach((response, idx) => {
      if (response?.data?.statusCode === 0 && response.data?.result?.content) {
        const { name, extension } = CONFIG_NAMES[idx];
        const responseContent = response.data.result.content;
        const filePath = path.join(CONFIG_PATH, `${name}.${extension}`);
        let originContent = {};
        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
          originContent =
            (extension === 'yaml'
              ? YAML.parse(fs.readFileSync(filePath, 'utf8'))
              : JSON.parse(fs.readFileSync(filePath, 'utf8'))) || {};
        }
        const fileContent =
          extension === 'yaml'
            ? YAML.stringify(mergeDeep(originContent, responseContent))
            : JSON.stringify(mergeDeep(originContent, responseContent), null, 2);
        fs.writeFileSync(filePath, fileContent);
        logger.success(`${filePath} 写入成功!`);
      }
    });
  }
}

async function execCommand({ namespace, isEmbed }) {
  await build({ namespace, isEmbed });

  search(namespace, isEmbed);
  pubCloudProductNews({ namespace, isEmbed });
  if (fs.existsSync(`pdf/files/@${namespace}/pdf`)) {
    const destination = isEmbed ? `${namespace.toLowerCase()}_embed` : namespace.toLowerCase();
    shell.exec(`cp -R pdf/files/@${namespace}/pdf public/${destination}`);
  }
}

async function runSingle(namespace) {
  await syncConfigToHinata(namespace);

  await execCommand({ namespace, isEmbed: false });

  if (getConfig(namespace).params.docHostPort) {
    await execCommand({ namespace, isEmbed: true });
  }

  logger.success(`Build @${namespace} Success!`);
}

async function runCommand(namespaces) {
  namespaces.forEach((namespace) => checkNamespace(namespace));

  logger.info(`${namespaces.map((v) => `@${v}`).join(' ')} 正在更新，请稍后...`);

  await namespaces.reduce(async (acc, namespace) => {
    return acc.then(() => runSingle(namespace));
  }, Promise.resolve());

  resetUpdateCommand();

  logger.info(`${namespaces.map((v) => `@${v}`).join(' ')} 更新成功!`);
}

runCommand(getNamespacesAndQuitePreviousProcess());
