const fs = require('fs');
const shell = require('shelljs');
const checkNamespace = require('./checkNamespace');
const path = require('path');
const { getImageDirectories, getConfig } = require('./utils');
const argvs = process.argv;
const namespaces = argvs.slice(3);
const branch = argvs[2] === 'staging' ? 'master' : argvs[2];
const logger = require('./logger');
const build = require('./build');
const search = require('./search/search');

namespaces.forEach((namespace) => {
  checkNamespace(namespace);
});

const isServer = fs.existsSync(`/data/docs_public/${argvs[2]}`);

if (!isServer) {
  const result = shell.exec(`git checkout ${branch} && git pull`);
  if (result.code === 0) {
    logger.success(`Checkout and Pull ${branch} Success!`);
  } else {
    shell.exit(1);
  }
}

function execCommand({ namespace, isEmbed, imageDirs }) {
  const publicPath = `public_${namespace}${isEmbed ? '_embed' : ''}`.toLowerCase();
  shell.exec(`rm -rf ${publicPath}`);
  build({ namespace, isEmbed });
  search(namespace, isEmbed);
  shell.exec(`mv public ${publicPath}`);
  if (fs.existsSync(`${publicPath}/images`)) {
    fs.readdirSync(`${publicPath}/images`).forEach(function (fileName) {
      const fileDir = path.join(`${publicPath}/images`, fileName);
      if (fs.statSync(fileDir).isDirectory()) {
        if (!imageDirs.includes(fileName.toLowerCase()) && fileName !== 'icons') {
          shell.exec(`rm -rf ${fileDir}`);
        }
      }
    });
  }
  shell.exec(`rm -rf ${publicPath}/pdf`);
  if (fs.existsSync(path.join(process.cwd(), `pdf/files/@${namespace}/pdf`))) {
    shell.exec(`rsync --delete -a ${path.join(process.cwd(), `pdf/files/@${namespace}/pdf`)} ${publicPath}`);
  }
  shell.exec(`rm -rf ${publicPath}/docx`);
  if (isServer) {
    shell.exec(`rsync -a ${publicPath} /data/docs_public/${argvs[2]}`);
  } else {
    shell.exec(`rsync --delete -av ${publicPath} root@192.168.12.51:/data/docs_public/${argvs[2]}`);
    shell.exec(`ssh root@192.168.12.51 "chown -R gitlab-runner:gitlab-runner /data/docs_public/${argvs[2]}"`);
  }
  shell.exec(`rm -rf ${publicPath}`);
}

namespaces.forEach((namespace) => {
  const imageDirs = getImageDirectories(namespace);
  execCommand({ namespace, isEmbed: false, imageDirs });
  const config = getConfig(namespace);
  if (config.params.docHostPort) {
    execCommand({ namespace, isEmbed: true, imageDirs });
  }
  logger.success(`Rsync @${namespace} ${argvs[2]} Success!`);
});
