const fs = require('fs');
const path = require('path');
const { uniq, flatten, compact, sortBy, isArray } = require('lodash');
const {
  PDF_CONTENT_DIR,
  PDF_CONTENT_EXCLUDE_DIR,
  PDF_CONTENT_INCLUDE_DIR,
  PDF_CONTENT_ONLY_DIR,
  PDF_CONTENT_VERSIONS_DIR,
  CONFIG,
} = require('./constants');
const { getMeta } = require('../utils');
const logger = require('../logger');

function getDepth(filePath) {
  return (
    compact(filePath.replace(/\/_index.adoc$/i, '').split('/')).length - compact(PDF_CONTENT_DIR.split('/')).length
  );
}

function getAllAdocFiles() {
  const listFiles = [];
  const searchPageSections = [];
  const studySections = [];
  function loopDirectory(directory, depth) {
    if (fs.existsSync(directory)) {
      if (fs.statSync(directory).isDirectory()) {
        const listByWeight = [];
        fs.readdirSync(directory).forEach((file) => {
          const curPath = path.join(directory, file);
          // 文件如果在 PDF_CONTENT_EXCLUDE_DIR 内，则不渲染
          const isInExcludeDir = PDF_CONTENT_EXCLUDE_DIR.find((v) => curPath.startsWith(v));
          if (!isInExcludeDir) {
            // 文件夹名不以 _ 开头
            if (
              fs.statSync(curPath).isDirectory() &&
              !file.startsWith('_') &&
              !['news', 'video', 'videos'].includes(file.toLowerCase().trim())
            ) {
              const childrenIndex = path.join(curPath, '_index.adoc');
              if (fs.existsSync(childrenIndex) && fs.statSync(childrenIndex).isFile()) {
                const meta = getMeta(childrenIndex);
                if (!meta) {
                  logger.error(`NO_META_ERROR: ${curPath}`);
                } else if (meta.draft || meta.not_show) {
                  // 不渲染草稿
                } else {
                  listByWeight.push({
                    filePath: curPath,
                    depth,
                    weight: meta.weight || meta.Weight,
                  });
                }
              }
            } else if (file.endsWith('.adoc')) {
              const meta = getMeta(curPath);
              if (!meta) {
                logger.error(`NO_META_ERROR: ${curPath}`);
              } else if (meta.draft || meta.not_show) {
                // 不渲染草稿
              } else {
                const weight = file === '_index.adoc' ? -1 : meta.weight || meta.Weight;
                if (meta.study_section) {
                  studySections.push(directory);
                } else if (meta.isSearchPage) {
                  // 不渲染 文档首页
                  // searchPageSections.push(directory);
                }
                listByWeight.push({
                  filePath: curPath,
                  meta,
                  title: meta.title,
                  depth: getDepth(curPath),
                  weight,
                  type: 'file',
                });
              }
            }
          }
        });

        sortBy(listByWeight, 'weight').forEach((file) => {
          if (file.type === 'file') {
            listFiles.push(file);
          } else {
            loopDirectory(file.filePath, file.depth + 1);
          }
        });
      }
    }
  }

  loopDirectory(PDF_CONTENT_DIR, 1);

  const nextStudySections = flatten(
    studySections.map((section) =>
      uniq(
        listFiles
          .filter((v) => {
            const realSection = section.endsWith('/') ? section : `${section}/`;
            return v.filePath.startsWith(realSection) && !v.filePath.endsWith('_index.adoc');
          })
          .map((v) => path.join(section, compact(v.filePath.replace(section, '').split('/'))[0])),
      ),
    ),
  );
  const sections = uniq(PDF_CONTENT_ONLY_DIR).length
    ? uniq(PDF_CONTENT_ONLY_DIR)
    : uniq(
        [
          ...PDF_CONTENT_INCLUDE_DIR, // 自定义目录
          ...searchPageSections, // searchPageSections
          ...studySections, // studySections
          ...nextStudySections, // studySections 一级子目录
          ...(PDF_CONTENT_VERSIONS_DIR || []).filter((v) => studySections.find((section) => v.startsWith(section))), // 命令行自定义目录
        ].map((v) => (v.endsWith('.adoc') ? v : `${v.replace(/\/+$/, '')}/`)),
      );
  const PICKED_SECTION_DIR_MAP = {};
  const pickedSessions = uniq(PDF_CONTENT_ONLY_DIR).length ? CONFIG.params.pdf.pdf_only : CONFIG.params.pdf.pdf_include;
  (pickedSessions || []).forEach((v) => {
    if (isArray(v) && v.length > 1) {
      PICKED_SECTION_DIR_MAP[path.join(PDF_CONTENT_DIR, v[0])] = v.map((item) => path.join(PDF_CONTENT_DIR, item));
    }
  });
  const pickedSections = sections.filter((v) => Object.keys(PICKED_SECTION_DIR_MAP).includes(v));
  const normalSections = sections.filter((v) => !Object.keys(PICKED_SECTION_DIR_MAP).includes(v));

  function parseSections(checkSections) {
    const result = {};
    listFiles.forEach((v) => {
      checkSections.forEach((section) => {
        const inSection = section.endsWith('/')
          ? v.filePath.startsWith(section)
          : v.filePath.startsWith(section) &&
            (v.filePath.replace(section, '').startsWith('/') ||
              v.filePath.replace(section, '') === '' ||
              v.filePath.replace(section, '') === '_index.adoc');
        if (inSection) {
          if (path.join(section, '_index.adoc') === v.filePath && nextStudySections.includes(section)) {
            const parentMeta = getMeta(path.join(section, '../_index.adoc'));
            if (parentMeta?.title) {
              v.parentTitle = parentMeta.title;
            }
          } else if (
            !v.filePath.endsWith('_index.adoc') &&
            fs.existsSync(v.filePath.replace(/\/[^\/]+?\.adoc$/i, '/_index.adoc')) &&
            studySections.includes(v.filePath.replace(/\/[^\/]+?\.adoc$/i, ''))
          ) {
            const parentMeta = getMeta(v.filePath.replace(/\/[^\/]+?\.adoc$/i, '/_index.adoc'));
            if (parentMeta?.title) {
              v.parentTitle = parentMeta.title;
            }
          }
          if (result[section]) {
            result[section].push(v);
          } else {
            result[section] = [v];
          }
        }
      });
    });
    return result;
  }

  const normals = parseSections(normalSections);
  const picks = {};
  pickedSections.forEach(function (section) {
    const sections = PICKED_SECTION_DIR_MAP[section];
    const result = parseSections(sections);
    const sectionDirs = sections.map((v) => v.replace(/\/+[^/]+\.adoc$/i, '/'));
    const pickedSection = flatten(sections.map((k) => result[k]).filter(Boolean));

    picks[section] = pickedSection
      .map((v, idx) => {
        if (
          pickedSection[idx - 1] &&
          pickedSection[idx] &&
          pickedSection[idx].depth - pickedSection[idx - 1].depth > 1
        ) {
          pickedSection[idx].depth = pickedSection[idx - 1].depth + 1;
        }
        return v;
      })
      .map((v, idx) => {
        const sectionBaseIndex = sectionDirs.findIndex((dir) => v.filePath.startsWith(dir));
        const sectionBaseDir = sectionDirs.find((dir) => v.filePath.startsWith(dir));
        if (sectionBaseIndex > 0) {
          const baseSectionIndex = pickedSection.findIndex((r) => r.filePath.startsWith(sectionBaseDir));
          if (baseSectionIndex === idx) {
            pickedSection[baseSectionIndex].originDepth = pickedSection[baseSectionIndex].depth;
            pickedSection[baseSectionIndex].depth = pickedSection[0].depth + 1;
          } else {
            v.depth = v.depth - pickedSection[baseSectionIndex].originDepth + pickedSection[baseSectionIndex].depth;
          }
        }
        return v;
      });
  });

  const resultMap = {
    ...normals,
    ...picks,
  };

  const result = sections
    .map((section) => resultMap[section])
    .filter((section) => {
      // PDF_CONTENT_VERSIONS_DIR 存在，如果在 PDF_CONTENT_VERSIONS_DIR 内，则渲染，PDF_CONTENT_VERSIONS_DIR为 null 则渲染全部
      if (section[0]?.filePath && PDF_CONTENT_VERSIONS_DIR) {
        return PDF_CONTENT_VERSIONS_DIR.find((v) => section[0].filePath.startsWith(v));
      }
      return true;
    });
  return result;
}

module.exports = getAllAdocFiles;
