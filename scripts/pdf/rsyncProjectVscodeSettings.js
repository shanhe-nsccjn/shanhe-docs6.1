const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const logger = require('../logger');
const { getAdocConfig } = require('./utils');

const { PDF_CONTENT_DIR, namespace } = require('./constants');

function rsyncProjectVscodeSettings() {
  const VSCODE_SETTINGS_PATH = path.join(process.cwd(), '.vscode');
  if (!fs.existsSync(VSCODE_SETTINGS_PATH)) {
    shell.exec(`mkdir ${VSCODE_SETTINGS_PATH}`);
  }
  const attributes = getAdocConfig({
    filePath: PDF_CONTENT_DIR,
    pdfTitle: 'Adoc 文件预览',
  });
  const adocPreviewAttributes = {
    'asciidoc.preview.attributes': {
      ...attributes,
      pdfTitle: attributes.product_name,
    },
  };
  const adocPreviewAttributesJSON = JSON.stringify(adocPreviewAttributes, null, 2);
  const settingsPath = `${VSCODE_SETTINGS_PATH}/settings.json`;
  if (fs.existsSync(settingsPath)) {
    const fileContent = fs.readFileSync(settingsPath, 'utf8');
    if (fileContent !== adocPreviewAttributesJSON) {
      fs.writeFileSync(settingsPath, adocPreviewAttributesJSON);
    }
  } else {
    fs.writeFileSync(settingsPath, adocPreviewAttributesJSON);
  }
}

module.exports = rsyncProjectVscodeSettings;
