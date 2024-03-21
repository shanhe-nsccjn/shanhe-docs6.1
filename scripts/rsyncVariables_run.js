const shell = require('shelljs');
const path = require('path');
const logger = require('./logger');

const themeCustomDir = path.join(process.cwd(), 'themes/qing-theme/assets/scss/custom');
const namespace = process.env.NAMESPACE;

const rsyncVariables = function () {
  const filePath = path.join(process.cwd(), `config/@${namespace}/_variables.scss`);
  const result = shell.exec(`rsync -av "${filePath}" "${themeCustomDir}"`);
  console.log();
  if (result.code === 0) {
    logger.success(`Rsync _variables.scss Success!`);
  } else {
    shell.exit(1);
  }
};

rsyncVariables();
