const fs = require('fs');
const shell = require('shelljs');
const { getConfig } = require('../utils');
const checkNamespace = require('../checkNamespace');
const argvs = process.argv;
const namespaces = argvs.slice(3);
const branch = argvs[2] === 'staging' ? 'master' : argvs[2];
const logger = require('../logger');
const path = require('path');

namespaces.forEach((namespace) => {
  checkNamespace(namespace);
});

const result = shell.exec(`git checkout ${branch} && git pull`);
if (result.code === 0) {
  logger.success(`Checkout and Pull ${branch} Success!`);
} else {
  shell.exit(1);
}

function execCommand({ namespace, isEmbed }) {
  const origin = path.join(process.cwd(), `pdf/files/@${namespace}/pdf`);
  const command = `rsync --delete -av ${origin} root@192.168.12.51:/data/docs_public/${
    argvs[2]
  }/public_${namespace.toLowerCase()}${isEmbed ? '_embed' : ''}/`;
  shell.exec(command);
  const originDocx = path.join(process.cwd(), `pdf/files/@${namespace}/docx`);
  const commandDocx = `rsync --delete -av ${originDocx} root@192.168.12.51:/data/docs_public/${
    argvs[2]
  }/public_${namespace.toLowerCase()}${isEmbed ? '_embed' : ''}/`;
  shell.exec(commandDocx);
}
namespaces.forEach((namespace) => {
  shell.exec(`npm run pdf ${namespace}`);
  shell.exec(`npm run word ${namespace}`);
  execCommand({ namespace, isEmbed: true });
  const config = getConfig(namespace);
  if (config.params.docHostPort) {
    execCommand({ namespace, isEmbed: true, imageDirs });
  }
  logger.success(`Rsync @${namespace} ${argvs[2]} pdf、word Success!`);
});
