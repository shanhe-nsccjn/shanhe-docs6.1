const fs = require('fs')
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Bookmark,
  InternalHyperlink,
  ExternalHyperlink,
  TableCell,
  TableRow,
  Table,
  AlignmentType,
  ShadingType,
  LevelFormat,
  LevelSuffix,
  TabStopType,
  VerticalAlign,
  BorderStyle,
  WidthType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  TableOfContents,
} = require('docx')
const cheerio = require('cheerio')
const sharp = require('sharp')
const sizeOf = require('image-size')

const imageDir = ''
const htmlFileDir = process.argv[2]
const html = fs.readFileSync(htmlFileDir, "utf8")
$=cheerio.load(html)
const sections = $('html').find('div[class=sect1]')
const legalInfo = $('html').find('div.legal_info')
const preface = $('html').find('div.preface')
const { getCommandParams } = require('../../scripts/utils');
const commandParams = getCommandParams();

var docContent = []

const footerHeader = node => ({
  headers: {
    default: new Header({
      children: [new Table({
        rows: [new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: splitHTML($('html').find('div.top_left>p').html()),
                style: 'header-top-left'
              })],
              verticalAlign: VerticalAlign.CENTER,
              borders: {
                top: {style: BorderStyle.NIL},
                right: {style: BorderStyle.NIL},
                left: {style: BorderStyle.NIL}
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: splitHTML(' '),
              })],
              verticalAlign: VerticalAlign.CENTER,
              borders: {
                top: {style: BorderStyle.NIL},
                right: {style: BorderStyle.NIL},
                left: {style: BorderStyle.NIL}
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: splitHTML(
                  node.find('h2').length > 0
                  ? node.find('h2').html().replace(/<a.+a>/g, '')
                  : node.find('div.preface_title').length > 0
                    ? node.find('div.preface_title>p').html().replace(/<a.+a>/g, '')
                      : node.attr('class') && node.attr('class').search('toctitle') !== -1
                        ? node.html()
                        : ' '
                ),
                style: 'header-top-right'
              })],
              verticalAlign: VerticalAlign.CENTER,
              borders: {
                top: {style: BorderStyle.NIL},
                right: {style: BorderStyle.NIL},
                left: {style: BorderStyle.NIL}
              },
            }),
          ]
        })],
        width: {
          size: 10410,
          type: WidthType.DXA
        }
      })]
    })
  },
  footers: {
    default: new Footer({
      children: [new Table({
        rows: [new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: splitHTML($('html').find('div.bottom_left>p').html()),
                style: 'footer-bottom-left'
              })],
              verticalAlign: VerticalAlign.CENTER,
              borders: {
                bottom: {style: BorderStyle.NIL},
                right: {style: BorderStyle.NIL},
                left: {style: BorderStyle.NIL}
              },
              width: {
                size: 2000,
                type: WidthType.DXA
              }
            }),
            new TableCell({
              children: [new Paragraph({
                children: splitHTML($('html').find('div.bottom_center>p').html()),
                style: 'footer-bottom-center'
              })],
              verticalAlign: VerticalAlign.CENTER,
              borders: {
                bottom: {style: BorderStyle.NIL},
                right: {style: BorderStyle.NIL},
                left: {style: BorderStyle.NIL}
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT]
                  })
                ],
                style: 'footer-bottom-right'
              })],
              verticalAlign: VerticalAlign.CENTER,
              borders: {
                bottom: {style: BorderStyle.NIL},
                right: {style: BorderStyle.NIL},
                left: {style: BorderStyle.NIL}
              },
              width: {
                size: 2000,
                type: WidthType.DXA
              }
            }),
          ]
        })],
        width: {
          size: 10410,
          type: WidthType.DXA
        }
      })]
    })
  }
})

const paragraphStyles = {
  paragraphStyles: [
    {
      id: 'p-level-2-first',
      name: 'p-level-2-first',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 120, after: 120},
        indent: {left: 1080, hanging: 360}
      },
    },
    {
      id: 'p-level-2',
      name: 'p-level-2',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 120, after: 120},
        indent: {left: 1080}
      },
    },
    {
      id: 'pre-level-2',
      run: {
        font: {name: 'Noto Sans Mono'},
        size: 18
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        shading: {
          type: ShadingType.PERCENT_20,
        },
        indent: {left: 1080}
      }
    },
    {
      id: 'p-level-1-first',
      name: 'p-level-1-first',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 120, after: 120},
        indent: {left: 720, hanging: 360}
      },
    },
    {
      id: 'p-level-1',
      name: 'p-level-1',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 120, after: 120},
        indent: {left: 720}
      },
    },
    {
      id: 'p-level-1-first-table',
      name: 'p-level-1-first-table',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75},
        indent: {left: 840, hanging: 360}
      }
    },
    {
      id: 'p-level-1-table',
      name: 'p-level-1-table',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75},
        indent: {left: 840}
      }
    },
    {
      id: 'pre-level-1',
      run: {
        font: {name: 'Noto Sans Mono'},
        size: 18
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        shading: {
          type: ShadingType.PERCENT_20,
        },
        indent: {left: 720}
      }
    },
    {
      id: 'p-level-0-first',
      name: 'p-level-0-first',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 120, after: 120},
        indent: {left: 360, hanging: 360}
      },
    },
    {
      id: 'p-level-0',
      name: 'p-level-0',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 120, after: 120},
        indent: {left: 360}
      },
    },
    {
      id: 'pre-level-0',
      run: {
        font: {name: 'Noto Sans Mono'},
        size: 18
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        shading: {
          type: ShadingType.PERCENT_20,
        },
        spacing: {before: 45, after: 45},
        indent: {left: 360}
      }
    },
    {
      id: 'p-level-0-first-table',
      name: 'p-level-0-first-table',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75},
        indent: {left: 480, hanging: 360}
      }
    },
    {
      id: 'p-level-0-table',
      name: 'p-level-0-table',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75},
        indent: {left: 480}
      }
    },
    {
      id: 'pre-level-0-table',
      name: 'pre-level-0-table',
      run: {
        font: {name: 'Noto Sans Mono'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75},
        shading: {
          type: ShadingType.PERCENT_20,
        },
        indent: {left: 480, right: 480}
      }
    },
    {
      id: 'p-table',
      name: 'p-table',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75},
        indent: {left: 120}
      }
    },
    {
      id: 'th-table-admon',
      name: 'th-table-admon',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
        color: 'ffffff',
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 60, after: 60},
        indent: {left: 120}
      }
    },
    {
      id: 'th-table',
      name: 'th-table',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 60, after: 60},
        indent: {left: 120}
      }
    },
    {
      id: 'p',
      name: 'Paragraph',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 225, after: 225}
      },
    },
    {
      id: 'p-file-class-level-2',
      name: 'p-file-class-level-2',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 27,
        bold: true,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 345, after: 345}
      },
    },
    {
      id: 'p-file-class-level-3',
      name: 'p-file-class-level-3',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 24,
        bold: true,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 345, after: 345}
      },
    },
    {
      id: 'pre',
      name: 'Code block',
      run: {
        font: {name: 'Noto Sans Mono'},
        size: 18
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        shading: {
          type: ShadingType.PERCENT_20,
        },
      }
    },
    {
      id: 'h2',
      name: 'Heading 2',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 43.5,
      },
      paragraph: {
        alignment: AlignmentType.RIGHT,
        thematicBreak: true,
        spacing: {before: 1087.5, after: 217.5}
      },
    },
    {
      id: 'h3',
      name: 'Heading 3',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 36,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 420, after: 420}
      },
    },
    {
      id: 'h4',
      name: 'Heading 4',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 31.5,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 382.5, after: 382.5}
      },
    },
    {
      id: 'h5',
      name: 'Heading 5',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 27,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 345, after: 345}
      },
    },
    {
      id: 'h6',
      name: 'Heading 6',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 24,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 345, after: 345}
      },
    },
    {
      id: 'h7',
      name: 'Heading 7',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 22,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 308, after: 308}
      },
    },
    {
      id: 'h8',
      name: 'Heading 8',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 22,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 280, after: 280}
      },
    },
    {
      id: 'h9',
      name: 'Heading 9',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 22,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 280, after: 280}
      },
    },
    {
      id: 'discrete',
      name: 'Discrete heading',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 27,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 345, after: 345}
      },
    },
    {
      id: 'header-top-left',
      name: 'Header top left',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
      },
    },
    {
      id: 'header-top-right',
      name: 'Header top right',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.RIGHT,
      },
    },
    {
      id: 'footer-bottom-left',
      name: 'Footer bottom left',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
      },
    },
    {
      id: 'footer-bottom-center',
      name: 'Footer bottom center',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
      },
    },
    {
      id: 'footer-bottom-right',
      name: 'Footer bottom right',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.RIGHT,
      },
    },
    {
      id: 'TOC2',
      name: 'toc 2',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
        color: '0000ff',
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75}
      },
    },
    {
      id: 'TOC3',
      name: 'toc 3',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
        color: '0000ff',
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75},
        indent: {left: 360}
      },
    },
    {
      id: 'TOC4',
      name: 'toc 4',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
        color: '0000ff',
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75},
        indent: {left: 720}
      },
    },
    {
      id: 'TOC5',
      name: 'toc 5',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
        color: '0000ff',
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75},
        indent: {left: 1080}
      },
    },
    {
      id: 'TOC6',
      name: 'toc 6',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
        color: '0000ff',
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 75, after: 75},
        indent: {left: 1440}
      },
    },
    {
      id: 'cover_product_logo',
      name: 'cover_product_logo',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 450},
        indent: {left: 750}
      },
    },
    {
      id: 'cover_doc_image',
      name: 'cover_doc_logo',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: {before: 1350, after: 450},
        indent: {left: 2205}
      },
    },
    {
      id: 'cover_doc_name',
      name: 'cover_doc_name',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 45,
        color: 'ffffff'
      },
      paragraph: {
        alignment: AlignmentType.LEFT,
        spacing: { before: 60, after: 60 },
        indent: {left: 180},
      },
    },
    {
      id: 'cover_doc_name_secondary',
      name: 'cover_doc_name_secondary',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 23,
        color: 'ffffff'
      },
      paragraph: {
        spacing: {before: 60, after: 120},
        alignment: AlignmentType.LEFT,
        indent: {left: 180},
      },
    },
    {
      id: 'cover_footer_spacing',
      name: 'cover_footer_spacing',
      run: {
        font: {name: 'Noto Sans SC Medium'},
        size: 21,
      },
      paragraph: {
        spacing: {before: 870, after: 870},
      },
    },
    {
      id: 'p-cover_footer',
      name: 'p-cover_footer',
      run: {
        font: {name: 'Noto Sans SC Regular'},
        size: 21,
      },
      paragraph: {
        spacing: {before: 120},
      },
    }
  ]
}

const tableCellStyles ={
  'note-th': {
    shading: {fill: '6ab0de'},
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: {style: BorderStyle.NIL},
      right: {style: BorderStyle.NIL},
      bottom: {style: BorderStyle.NIL},
      left: {style: BorderStyle.NIL}
    },

  },
  'note-td': {
    shading: {fill: 'e7f2fa'},
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: {style: BorderStyle.NIL},
      right: {style: BorderStyle.NIL},
      bottom: {style: BorderStyle.NIL},
      left: {style: BorderStyle.NIL}
    },
  },
  'attention-th': {
    shading: {fill: 'BB9D1C'},
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: {style: BorderStyle.NIL},
      right: {style: BorderStyle.NIL},
      bottom: {style: BorderStyle.NIL},
      left: {style: BorderStyle.NIL}
    },

  },
  'attention-td': {
    shading: {fill: 'FFF9D9'},
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: {style: BorderStyle.NIL},
      right: {style: BorderStyle.NIL},
      bottom: {style: BorderStyle.NIL},
      left: {style: BorderStyle.NIL}
    },
  },
  'warning-th': {
    shading: {fill: 'e06f6c'},
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: {style: BorderStyle.NIL},
      right: {style: BorderStyle.NIL},
      bottom: {style: BorderStyle.NIL},
      left: {style: BorderStyle.NIL}
    },
  },
  'warning-td': {
    shading: {fill: 'fae2e2'},
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: {style: BorderStyle.NIL},
      right: {style: BorderStyle.NIL},
      bottom: {style: BorderStyle.NIL},
      left: {style: BorderStyle.NIL}
    },
  },
  'danger-th': {
    shading: {fill: 'e06f6c'},
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: {style: BorderStyle.NIL},
      right: {style: BorderStyle.NIL},
      bottom: {style: BorderStyle.NIL},
      left: {style: BorderStyle.NIL}
    },
  },
  'danger-td': {
    shading: {fill: 'fae2e2'},
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: {style: BorderStyle.NIL},
      right: {style: BorderStyle.NIL},
      bottom: {style: BorderStyle.NIL},
      left: {style: BorderStyle.NIL}
    },
  },
  'tip-th': {
    shading: {fill: '78c578'},
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: {style: BorderStyle.NIL},
      right: {style: BorderStyle.NIL},
      bottom: {style: BorderStyle.NIL},
      left: {style: BorderStyle.NIL}
    },
  },
  'tip-td': {
    shading: {fill: 'e6f9e6'},
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: {style: BorderStyle.NIL},
      right: {style: BorderStyle.NIL},
      bottom: {style: BorderStyle.NIL},
      left: {style: BorderStyle.NIL}
    },
  },
  'td': {
    verticalAlign: VerticalAlign.CENTER,
  },
  'th': {
    shading: {fill: 'efefef'},
    verticalAlign: VerticalAlign.CENTER,
  },
}

var numberingRef = 0
var numbering = {
  config: [
    {
      reference: 'bullet',
      levels: [
        {
          level: 2,
          format: LevelFormat.BULLET,
          text: '-',
          suffix: LevelSuffix.NOTHING
        },
        {
          level: 1,
          format: LevelFormat.BULLET,
          text: '◦',
          suffix: LevelSuffix.NOTHING
        },
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          suffix: LevelSuffix.NOTHING
        }
      ]
    }
  ]
}

function getHTagContent(node, hNumber) {
  const style = hNumber ? { style: `h${hNumber}` } : {};
  let children = splitHTML(node.html());
  if (node.attr('id')) {
    const bookmark = new Bookmark({
      id: node.attr('id'),
      children,
    });
    children = [bookmark];
  }
  return new Paragraph({ children, ...style });
}

function getPFileClassContent(node, level) {
  const style = level ? { style: `p-file-class-level-${level}` } : {};
  let children = splitHTML(node.html());
  const id = node.parent().attr('id');
  if (id) {
    const bookmark = new Bookmark({
      id,
      children,
    });
    children = [bookmark];
  }
  return new Paragraph({children, ...style });
}

const contentMap = {
  'table-level-2': node => new Table({
    rows: traverseTable(node),
    indent: {
      size: 1080,
      type: WidthType.DXA,
    },
    width: {
      size: 9330,
      type: WidthType.DXA
    }
  }),
  'p-level-2': node => new Paragraph({children: splitHTML(node.html()), style: 'p-level-2'}),
  'p-level-2-first-ul': node => new Paragraph({
    children: splitHTML(`\t${node.html()}`),
    style: 'p-level-2-first',
    numbering: {reference: 'bullet', level: 2},
    tabStops: [{type: TabStopType.LEFT, position: 1080}]
  }),
  'p-level-2-first-ol': node => new Paragraph({
    children: splitHTML(`\t${node.html()}`),
    style: 'p-level-2-first',
    numbering: {
      reference: `${numberingRef}`,
      level: 2
    },
    tabStops: [{ type: TabStopType.LEFT, position: 1080 }]
  }),
  'pre-level-2': node => new Paragraph({children: splitHTML(node.replace('</code>', '').replace(/<code.*?>/g, '')), style: 'pre-level-2'}),
  'img-level-2': node => {
    let width = sizeOf(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).width
    let height = sizeOf(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).height
    return new Paragraph({
      children: [new ImageRun({
        data: sharp(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).png({ compressionLevel: 0 }),
        transformation: { width: 622, height: 622/width*height }
      })],
      style: 'p-level-2',
    });
  },
  'table-level-1': node => new Table({
    rows: traverseTable(node),
    indent: {
      size: 720,
      type: WidthType.DXA,
    },
    width: {
      size: 9690,
      type: WidthType.DXA
    }
  }),
  'p-level-1': node => new Paragraph({children: splitHTML(node.html()), style: 'p-level-1'}),
  'p-level-1-first-ul': node => new Paragraph({
    children: splitHTML(`\t${node.html()}`),
    style: 'p-level-1-first',
    numbering: {reference: 'bullet', level: 1},
    tabStops: [{type: TabStopType.LEFT, position: 720}]
  }),
  'p-level-1-first-ol': node => new Paragraph({
    children: splitHTML(`\t${node.html()}`),
    style: 'p-level-1-first',
    numbering: {
      reference: `${numberingRef}`,
      level: 1
    },
    tabStops: [{ type: TabStopType.LEFT, position: 720 }]
  }),
  'pre-level-1': node => new Paragraph({children: splitHTML(node.replace('</code>', '').replace(/<code.*?>/g, '')), style: 'pre-level-1'}),
  'img-level-1': node => {
    let width = sizeOf(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).width
    let height = sizeOf(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).height
    return new Paragraph({
      children: [new ImageRun({
        data: sharp(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).png({ compressionLevel: 0 }),
        transformation: { width: 646, height: 646/width*height }
      })],
      style: 'p-level-1',
    });
  },
  'table-level-0': node => new Table({
    rows: traverseTable(node),
    indent: {
      size: 360,
      type: WidthType.DXA,
    },
    width: {
      size: 10050,
      type: WidthType.DXA
    }
  }),
  'p-level-0': node => new Paragraph({children: splitHTML(node.html()), style: 'p-level-0'}),
  'p-level-0-first-ul': node => new Paragraph({
    children: splitHTML(`\t${node.html()}`),
    style: 'p-level-0-first',
    numbering: {reference: 'bullet', level: 0},
    tabStops: [{type: TabStopType.LEFT, position: 360}]
  }),
  'p-level-0-first-ol': node => new Paragraph({
    children: splitHTML(`\t${node.html()}`),
    style: 'p-level-0-first',
    numbering: { reference: `${numberingRef}`, level: 0 },
    tabStops: [{ type: TabStopType.LEFT, position: 360 }]
  }),
  'pre-level-0': node => new Paragraph({children: splitHTML(node.replace('</code>', '').replace(/<code.*?>/g, '')), style: 'pre-level-0'}),
  'img-level-0': node => {
    let width = sizeOf(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).width
    let height = sizeOf(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).height
    return new Paragraph({
      children: [new ImageRun({
        data: sharp(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).png({compressionLevel: 0}),
        transformation: {width: 670, height: 670/width*height}
      })],
      style: 'p-level-0',
    })
  },
  'table': node => new Table({
    rows: traverseTable(node),
    width: {
      size: 10410,
      type: WidthType.DXA
    }
  }),
  'p': node => new Paragraph({children: splitHTML(node.html()), style: 'p'}),
  'p-file-class-level-2': node => getPFileClassContent(node, 2),
  'p-file-class-level-3': node => getPFileClassContent(node, 3),
  'pre': node => new Paragraph({ children: splitHTML(node.replace('</code>', '').replace(/<code.*?>/g, '')), style: 'pre' }),
  'img': node => {
    let width = sizeOf(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).width
    let height = sizeOf(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).height
    return new Paragraph({
      children: [new ImageRun({
        data: sharp(node.prop('outerHTML').replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).png({compressionLevel: 0}),
        transformation: {width: 694, height: 694/width*height}
      })],
      style: 'p',
    })
  },
  'discrete': node => new Paragraph({children: splitHTML(node.html()), style: 'discrete'}),
  'h1': node => getHTagContent(node),
  'h2': node => getHTagContent(node, 2),
  'h3': node => getHTagContent(node, 3),
  'h4': node => getHTagContent(node, 4),
  'h5': node => getHTagContent(node, 5),
  'h6': node => getHTagContent(node, 6),
  'h7': node => getHTagContent(node, 7),
  'h8': node => getHTagContent(node, 8),
  'h9': node => getHTagContent(node, 9),
}

function traverseDivAdmonContent(node, array){
  function traverse(node){
    if(
      node.get(0).tagName === 'ol'
      && node.parents('ol').length === 0
    ) {
      numbering.config.push(
        {
          reference: `${numberingRef}`,
          levels: [
            {
              level: 1,
              format: LevelFormat.LOWER_ROMAN,
              text: '%2.',
              suffix: LevelSuffix.NOTHING
            },
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              suffix: LevelSuffix.NOTHING
            }
          ]
        }
      )
      node.children().each(function(){
        traverse($(this))
      })
      numberingRef++
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parentsUntil('div.admon').filter('ul').length === 1
      && node.parentsUntil('div.admon').filter('ol').length === 0
    ) {
      array.push(
        new Paragraph({
          children: splitHTML(`\t${node.html()}`),
          style: 'p-level-0-first-table',
          numbering: { reference: 'bullet', level: 0 },
          tabStops: [{ type: TabStopType.LEFT, position: 480 }]
        })
      )
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parentsUntil('div.admon').filter('ol').length === 1
      && node.parentsUntil('div.admon').filter('ul').length === 0
    ) {
      array.push(
        new Paragraph({
          children: splitHTML(`\t${node.html()}`),
          style: 'p-level-0-first-table',
          numbering: { reference: `${numberingRef}`, level: 0 },
          tabStops: [{ type: TabStopType.LEFT, position: 480 }]
        })
      )
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parentsUntil('div.admon').filter('ol').length === 1
      && node.parentsUntil('div.admon').filter('ul').length === 0
    ) {
      array.push(
        new Paragraph({
          children: splitHTML(node.html()),
          style: 'p-level-0-table'
        })
      )
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parentsUntil('div.admon').filter('ul').length === 1
      && node.parentsUntil('div.admon').filter('ol').length === 0
    ) {
      array.push(
        new Paragraph({
          children: splitHTML(node.html()),
          style: 'p-level-0-table'
        })
      )
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parentsUntil('div.admon').filter('ul').length === 0
      && node.parentsUntil('div.admon').filter('ol').length === 0
    ) {
      array.push(
        new Paragraph({ children: splitHTML(node.html()), style: 'p-table' })
      )
    }
    else {
      node.children().each(function(){
        traverse($(this))
      })
    }
  }
  traverse(node);
}

function traverseTable(node){
  function traverse(node){
    if(node.get(0).tagName === 'tr'){
      tableContent.push(new TableRow({
        children: traverseTableRow(node),
        tableHeader: node.parent().get(0).tagName === 'thead' ? true : false,
        cantSplit: true
      }))
    }
    else{
      node.children().each(function(){
        traverse($(this))
      })
    }
  }
  var tableContent = []
  traverse(node)
  return tableContent
}

function traverseTableRow(node){
  function traverse(node){
    if(node.get(0).tagName === 'th' || node.get(0).tagName === 'td'){
      if(node.parents('table').attr('class') && node.parents('table').attr('class').search('admon') !== -1){
        tableRowContent.push(new TableCell({children: traverseTableCell(node), ...tableCellStyles[
          `${node.parents('table').attr('class').replace(/^.+admon (.+)$/, '$1')}-${node.get(0).tagName}`
        ]}))
      }
      else if (node.get(0).tagName === 'td') {
        const cellParams = {};
        if (node.attr('rowspan')) {
          cellParams.rowSpan = +node.attr('rowspan');
        }
        if (node.attr('colspan')) {
          cellParams.columnSpan = +node.attr('colspan');
        }
        tableRowContent.push(new TableCell(
          node.siblings().length > 0 && node.index() === 0
          ? {
            children: traverseTableCell(node),
            width: {size: 2082, type: WidthType.DXA},
            ...tableCellStyles['td'],
            ...cellParams,
          }
          : {
            children: traverseTableCell(node),
            ...tableCellStyles['td'],
            ...cellParams,
          }
        ))
      }
      else if(node.get(0).tagName === 'th'){
        tableRowContent.push(new TableCell(
          node.siblings().length > 0 && node.index() === 0
          ? {
            children: traverseTableCell(node),
            width: {size: 2082, type: WidthType.DXA},
            ...tableCellStyles['th']
          }
          : {
            children: traverseTableCell(node),
            ...tableCellStyles['th']
          }
        ))
      }
    }
    else{
      node.children().each(function(){
        traverse($(this))
      })
    }
  }
  var tableRowContent = []
  traverse(node)
  return tableRowContent
}


function traverseTableCell(node){
  function traverse(node){
    if (
      node.get(0).tagName === 'ol'
      && node.parents('ol').length === 0
    ) {
      numbering.config.push(
        {
          reference: `${numberingRef}`,
          levels: [
            {
              level: 1,
              format: LevelFormat.LOWER_ROMAN,
              text: '%2.',
              suffix: LevelSuffix.NOTHING
            },
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              suffix: LevelSuffix.NOTHING
            }
          ]
        }
      )
      node.children().each(function () {
        traverse($(this))
      })
      numberingRef++
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parentsUntil('td').filter('ul').length + node.parentsUntil('td').filter('ol').length === 2
      && node.parentsUntil('td').filter('ul').length >= 1
      && node.parentsUntil('td').find('ul').filter('ol').length === 0
    ) {
      tableCellContent.push(
        new Paragraph({
          children: splitHTML(`\t${node.html()}`),
          style: 'p-level-1-first-table',
          numbering: { reference: 'bullet', level: 1 },
          tabStops: [{ type: TabStopType.LEFT, position: 480 }]
        })
      )
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parentsUntil('td').filter('ul').length + node.parentsUntil('td').filter('ol').length === 2
      && node.parentsUntil('td').filter('ol').length >= 1
      && node.parentsUntil('td').find('ol').filter('ul').length === 0
    ) {
      tableCellContent.push(
        new Paragraph({
          children: splitHTML(`\t${node.html()}`),
          style: 'p-level-1-first-table',
          numbering: { reference: `${numberingRef}`, level: 1 },
          tabStops: [{ type: TabStopType.LEFT, position: 480 }]
        })
      )
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parentsUntil('td').filter('ul').length === 1
      && node.parentsUntil('td').filter('ol').length === 0
    ) {
      tableCellContent.push(
        new Paragraph({
          children: splitHTML(`\t${node.html()}`),
          style: 'p-level-0-first-table',
          numbering: { reference: 'bullet', level: 0 },
          tabStops: [{ type: TabStopType.LEFT, position: 480 }]
        })
      )
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parentsUntil('td').filter('ol').length === 1
      && node.parentsUntil('td').filter('ul').length === 0
    ) {
      tableCellContent.push(
        new Paragraph({
          children: splitHTML(`\t${node.html()}`),
          style: 'p-level-0-first-table',
          numbering: { reference: `${numberingRef}`, level: 0 },
          tabStops: [{ type: TabStopType.LEFT, position: 480 }]
        })
      )
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parentsUntil('td').filter('ol').length === 1
      && node.parentsUntil('td').filter('ul').length === 0
    ) {
      tableCellContent.push(
        new Paragraph({
          children: splitHTML(node.html()),
          style: 'p-level-0-table'
        })
      )
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parentsUntil('td').filter('ul').length === 1
      && node.parentsUntil('td').filter('ol').length === 0
    ) {
      tableCellContent.push(
        new Paragraph({
          children: splitHTML(node.html()),
          style: 'p-level-0-table'
        })
      )
    }
    else if (
      node.get(0).tagName === 'p'
      && node.parentsUntil('td').filter('ul').length === 0
      && node.parentsUntil('td').filter('ol').length === 0
    ) {
      tableCellContent.push(
        new Paragraph({ children: splitHTML(node.html()), style: 'p-table' })
      )
    }
    else if ((
      node.get(0).tagName === 'div'
      || node.get(0).tagName === 'table'
    ) && node.hasClass('admon')) {
      let divAdmonTitle = '';
      let divAdmonClass = '';
      if (node.hasClass('note')) {
        divAdmonTitle = '说明';
        divAdmonClass = 'note';
      }
      else if (node.hasClass('attention')) {
        divAdmonTitle = '注意';
        divAdmonClass = 'attention';
      }
      else if (node.hasClass('warning')) {
        divAdmonTitle = '警告';
        divAdmonClass = 'warning';
      }
      else if (node.hasClass('danger')) {
        divAdmonTitle = '危险';
        divAdmonClass = 'danger';
      }
      if (divAdmonTitle && node.children().length > 1) {
        const childrenNodes = [];
        node.children().each(function (i) {
          if (i > 0) {
            traverseDivAdmonContent($(this), childrenNodes);
          }
        });
        tableCellContent.push(new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ text: divAdmonTitle, style: 'th-table-admon' })
                  ],
                  ...tableCellStyles[`${divAdmonClass}-th`],
                }),

              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: childrenNodes,
                  ...tableCellStyles[`${divAdmonClass}-td`]
                }),
              ]
            })
          ],
          indent: {
            size: 120,
            type: WidthType.DXA,
          },
          width: {
            size: "94%",
            type: WidthType.PERCENTAGE
          },
        }));
        tableCellContent.push(new Paragraph(' '))
      }
    }
    else if (
      node.get(0).tagName === 'th'
      && node.parents('table').attr('class')
      && node.parents('table').attr('class').search('admon') !== -1
    ){
      tableCellContent.push(
        new Paragraph({children: splitHTML(node.html()), style: 'th-table-admon'})
      )
    }
    else if (
      node.get(0).tagName === 'div'
      && node.hasClass('imageblock')
      && node.find('img').length
      && (
        (
          node.parentsUntil('div.imageblock').filter('ul').length === 1
            && node.parentsUntil('div.imageblock').filter('ol').length === 0
        )
      || (
        node.parentsUntil('div.imageblock').filter('ul').length === 0
          && node.parentsUntil('div.imageblock').filter('ol').length === 1
        )
      )
    ) {
      const nodeImages = node.find('img');
      nodeImages.each(function() {
        const nodeImageSrc = $(this).attr("src");
        let width = sizeOf(nodeImageSrc).width
        let height = sizeOf(nodeImageSrc).height
        tableCellContent.push(new Paragraph({
          children: [new ImageRun({
            data: sharp(nodeImageSrc).png({ compressionLevel: 0 }),
            transformation: { width: 480, height: 480 / width * height }
          })],
          style: 'p-level-0-table',
        }));
      })
    }
    else if (
      node.get(0).tagName === 'div'
      && node.hasClass('listingblock')
      && node.find('pre').length
      && (
        (
          node.parentsUntil('div.listingblock').filter('ul').length === 1
            && node.parentsUntil('div.listingblock').filter('ol').length === 0
        )
      || (
        node.parentsUntil('div.listingblock').filter('ul').length === 0
          && node.parentsUntil('div.listingblock').filter('ol').length === 1
        )
      )
    ) {
      const results = node.find('pre');
      results.each(function() {
        const itemText = $(this).text();
        tableCellContent.push(new Paragraph({
          children: splitHTML(itemText),
          style: 'pre-level-0-table',
        }));
      })
    }
    else if(
      node.get(0).tagName === 'th'
    ){
      tableCellContent.push(
        new Paragraph({children: splitHTML(node.html()), style: 'th-table'})
      )
    }
    else{
      node.children().each(function(){
        traverse($(this))
      })
    }
  }
  var tableCellContent = []
  traverse(node)
  return tableCellContent
}

function splitHTML(html){
  var htmlList = html
  .replace(/<\/[^<>]+>/g, '$&@@')
  .replace(/<[^\/][^<>]*>/g, '@@$&')
  .replace(/<img[^<>]+>/g, '$&@@')
  .replace(/&nbsp;/g, ' ')
  .replace(/&#160;/g, ' ')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/<br>/g, ' ')
  .replace(/<\/?span[^<>]*>/g, '')
  .split('@@').filter(item => item)
  return htmlList.map(item => {
    if (item.search('<strong>') !== -1) {
      return new TextRun({
        text: item.replace(/<\/?strong>/g, ''),
        font: 'Noto Sans SC Regular',
        bold: true
      })
    }
    else if (item.search(/^<code>.*?<\/code>$/) !== -1) {
      return new TextRun({
        text: item.replace('<code>', '').replace('</code>', ''),
        color: "15A675",
      })
    }
    else if (item.search('<code') !== -1 || item.search('</code') !== -1) {
      return new TextRun({
        text: item.replace('</code>', '').replace(/<code.*?>/g, ''),
      })
    }
    else if (item.search('<img') !== -1) {
      let width = sizeOf(item.replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).width
      let height = sizeOf(item.replace(/.+src="([^"]+)".+/, `${imageDir}$1`)).height
      return new ImageRun({
        data: sharp(item.replace(/.+src="([^"]+)".+/, `${imageDir}$1`))
          .resize({
            width: parseInt(36 / height * width),
            height: 36
          })
          .png({ compressionLevel: 0 }),
        transformation: {
          width: 18 / height * width,
          height: 18
        }
      })
    }
    else if (item.search('></a>') !== -1) {
      return new Bookmark({
        id: item.replace(/.+id="([^"]+)".+/, '$1'),
        children: [new TextRun('')]
      })
    }
    else if (item.search('<a href="#') !== -1) {
      return new InternalHyperlink({
        children: [
          new TextRun({
            text: item.replace(/.+>(.+)<\/a>/g, '$1'),
            color: '0000ff'
          })
        ],
        anchor: item.replace(/<a href="#([^"]+)".+/g, '$1'),
      })
    }
    else if (item.search('<a href') !== -1) {
      return new ExternalHyperlink({
        children: [
          new TextRun({
            text: item.replace(/.+>(.+)<\/a>/g, '$1'),
            color: '0000ff'
          })
        ],
        link: item.replace(/<a href="([^"]+)".+/g, '$1'),
      })
    } else if (item.search('<p class="tableblock"') !== -1) {
      return new TextRun({text: item.replace(/<p.+?>(.+?)<\/p>/g, '$1'),})
    }

    else {
      return new TextRun({text: item})
    }
  })
}

function traverseNode(node, withFooterHeader){
  function traverse(node){
    if(
      node.get(0).tagName === 'ol'
      && node.parents('ol').length === 0
    ) {
      numbering.config.push(
        {
          reference: `${numberingRef}`,
          levels: [
            {
              level: 2,
              format: LevelFormat.LOWER_LETTER,
              text: '%3.',
              suffix: LevelSuffix.NOTHING
            },
            {
              level: 1,
              format: LevelFormat.LOWER_ROMAN,
              text: '%2.',
              suffix: LevelSuffix.NOTHING
            },
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              suffix: LevelSuffix.NOTHING
            }
          ]
        }
      )
      node.children().each(function(){
        traverse($(this))
      })
      numberingRef++
    }
    else if(
      node.get(0).tagName === 'table'
      && node.parents('ul').length + node.parents('ol').length === 3
    ){
      sectionContent.push(new Paragraph(' '))
      sectionContent.push(contentMap['table-level-2'](node))
      sectionContent.push(new Paragraph(' '))
    }
    else if(
      node.get(0).tagName === 'img'
      && node.parents('ul').length + node.parents('ol').length === 3
    ){
      sectionContent.push(contentMap['img-level-2'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parents('div.code_blank').length === 0
      && node.parents('ul').length === 3
      && node.parents('ol').length === 0
    ){
      sectionContent.push(contentMap['p-level-2-first-ul'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parents('div.code_blank').length === 0
      && node.parents('ul').length + node.parents('ol').length === 3
      && node.parentsUntil('ol').filter('ul').length >= 1
    ){
      sectionContent.push(contentMap['p-level-2-first-ul'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parents('div.code_blank').length === 0
      && node.parents('ol').length === 3
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['p-level-2-first-ol'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parents('div.code_blank').length === 0
      && node.parents('ul').length + node.parents('ol').length === 3
      && node.parentsUntil('ul').filter('ol').length >= 1
    ){
      sectionContent.push(contentMap['p-level-2-first-ol'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parents('div.code_blank').length === 0
      && node.parents('ul').length + node.parents('ol').length === 3
    ){
      sectionContent.push(contentMap['p-level-2'](node))
    }
    else if(
      node.get(0).tagName === 'pre'
      && node.parents('ul').length + node.parents('ol').length === 3
    ){
      node.html().split(/\n/).forEach(item =>
        sectionContent.push(contentMap['pre-level-2'](item))
      )
    }
    else if(
      node.get(0).tagName === 'table'
      && node.parents('ul').length === 2
      && node.parents('ol').length === 0
    ){
      sectionContent.push(new Paragraph(' '))
      sectionContent.push(contentMap['table-level-1'](node))
      sectionContent.push(new Paragraph(' '))
    }
    else if(
      node.get(0).tagName === 'table'
      && node.parents('ol').length === 2
      && node.parents('ul').length === 0
    ){
      sectionContent.push(new Paragraph(' '))
      sectionContent.push(contentMap['table-level-1'](node))
      sectionContent.push(new Paragraph(' '))
    }
    else if(
      node.get(0).tagName === 'table'
      && node.parents('ol').length === 1
      && node.parents('ul').length === 1
      && node.parentsUntil('ol').filter('ul').length === 1
    ){
      sectionContent.push(new Paragraph(' '))
      sectionContent.push(contentMap['table-level-1'](node))
      sectionContent.push(new Paragraph(' '))
    }
    else if(
      node.get(0).tagName === 'table'
      && node.parents('ol').length === 1
      && node.parents('ul').length === 1
      && node.parentsUntil('ul').filter('ol').length === 1
    ){
      sectionContent.push(new Paragraph(' '))
      sectionContent.push(contentMap['table-level-1'](node))
      sectionContent.push(new Paragraph(' '))
    }
    else if(
      node.get(0).tagName === 'img'
      && node.parents('ul').length === 2
      && node.parents('ol').length === 0
    ){
      sectionContent.push(contentMap['img-level-1'](node))
    }
    else if(
      node.get(0).tagName === 'img'
      && node.parents('ol').length === 2
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['img-level-1'](node))
    }
    else if(
      node.get(0).tagName === 'img'
      && node.parents('ol').length === 1
      && node.parents('ul').length === 1
      && node.parentsUntil('ol').filter('ul').length === 1
    ){
      sectionContent.push(contentMap['img-level-1'](node))
    }
    else if(
      node.get(0).tagName === 'img'
      && node.parents('ol').length === 1
      && node.parents('ul').length === 1
      && node.parentsUntil('ul').filter('ol').length === 1
    ){
      sectionContent.push(contentMap['img-level-1'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parents('div.code_blank').length === 0
      && node.parents('ul').length === 2
      && node.parents('ol').length === 0
    ){
      sectionContent.push(contentMap['p-level-1-first-ul'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parents('div.code_blank').length === 0
      && node.parents('ol').length === 1
      && node.parents('ul').length === 1
      && node.parentsUntil('ol').filter('ul').length === 1
    ){
      sectionContent.push(contentMap['p-level-1-first-ul'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parents('div.code_blank').length === 0
      && node.parents('ol').length === 2
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['p-level-1-first-ol'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parents('div.code_blank').length === 0
      && node.parents('ol').length === 1
      && node.parents('ul').length === 1
      && node.parentsUntil('ul').filter('ol').length === 1
    ){
      sectionContent.push(contentMap['p-level-1-first-ol'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parents('div.code_blank').length === 0
      && node.parents('ol').length === 2
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['p-level-1'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parents('div.code_blank').length === 0
      && node.parents('ul').length === 2
      && node.parents('ol').length === 0
    ){
      sectionContent.push(contentMap['p-level-1'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parents('div.code_blank').length === 0
      && node.parents('ul').length === 1
      && node.parents('ol').length === 1
    ){
      sectionContent.push(contentMap['p-level-1'](node))
    }
    else if(
      node.get(0).tagName === 'pre'
      && node.parents('ol').length === 2
      && node.parents('ul').length === 0
    ){
      node.html().split(/\n/).forEach(item =>
        sectionContent.push(contentMap['pre-level-1'](item))
      )
    }
    else if(
      node.get(0).tagName === 'pre'
      && node.parents('ul').length === 2
      && node.parents('ol').length === 0
    ){
      node.html().split(/\n/).forEach(item =>
        sectionContent.push(contentMap['pre-level-1'](item))
      )
    }
    else if(
      node.get(0).tagName === 'pre'
      && node.parents('ul').length === 1
      && node.parents('ol').length === 1
    ){
      node.html().split(/\n/).forEach(item =>
        sectionContent.push(contentMap['pre-level-1'](item))
      )
    }
    else if(
      node.get(0).tagName === 'table'
      && node.parents('ol').length === 1
      && node.parents('ul').length === 0
    ){
      sectionContent.push(new Paragraph(' '))
      sectionContent.push(contentMap['table-level-0'](node))
      sectionContent.push(new Paragraph(' '))
    }
    else if(
      node.get(0).tagName === 'table'
      && node.parents('ul').length === 1
      && node.parents('ol').length === 0
    ){
      sectionContent.push(new Paragraph(' '))
      sectionContent.push(contentMap['table-level-0'](node))
      sectionContent.push(new Paragraph(' '))
    }
    else if(
      node.get(0).tagName === 'img'
      && node.parents('ol').length === 1
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['img-level-0'](node))
    }
    else if(
      node.get(0).tagName === 'img'
      && node.parents('ul').length === 1
      && node.parents('ol').length === 0
    ){
      sectionContent.push(contentMap['img-level-0'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parents('div.code_blank').length === 0
      && node.parents('ul').length === 1
      && node.parents('ol').length === 0
    ){
      sectionContent.push(contentMap['p-level-0-first-ul'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parent().get(0).tagName === 'li'
      && node.index() === 0
      && node.parents('div.code_blank').length === 0
      && node.parents('ol').length === 1
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['p-level-0-first-ol'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parents('div.code_blank').length === 0
      && node.parents('ol').length === 1
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['p-level-0'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parents('div.code_blank').length === 0
      && node.parents('ul').length === 1
      && node.parents('ol').length === 0
    ){
      sectionContent.push(contentMap['p-level-0'](node))
    }
    else if(
      node.get(0).tagName === 'pre'
      && node.parents('ul').length === 1
      && node.parents('ol').length === 0
    ){
      node.html().split(/\n/).forEach(item =>
        sectionContent.push(contentMap['pre-level-0'](item))
      )
    }
    else if(
      node.get(0).tagName === 'pre'
      && node.parents('ol').length === 1
      && node.parents('ul').length === 0
    ){
      node.html().split(/\n/).forEach(item =>
        sectionContent.push(contentMap['pre-level-0'](item))
      )
    }
    else if(
      node.get(0).tagName === 'table'
      && node.parents('ol').length === 0
      && node.parents('ul').length === 0
    ){
      sectionContent.push(new Paragraph(' '))
      sectionContent.push(contentMap['table'](node))
      sectionContent.push(new Paragraph(' '))
    }
    else if(
      node.get(0).tagName === 'img'
      && node.parents('ol').length === 0
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['img'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parents('div.file-class-level-2').length
      && node.parents('div.code_blank').length === 0
      && node.parents('ol').length === 0
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['p-file-class-level-2'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parents('div.file-class-level-3').length
      && node.parents('div.code_blank').length === 0
      && node.parents('ol').length === 0
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['p-file-class-level-3'](node))
    }
    else if(
      node.get(0).tagName === 'p'
      && node.parents('div.code_blank').length === 0
      && node.parents('ol').length === 0
      && node.parents('ul').length === 0
    ){
      sectionContent.push(contentMap['p'](node))
    }
    else if(
      node.get(0).tagName === 'pre'
      && node.parents('ol').length === 0
      && node.parents('ul').length === 0
    ){
      node.html().split(/\n/).forEach(item =>
        sectionContent.push(contentMap['pre'](item))
      )
    }
    else if(
      node.attr('class') && node.attr('class').search('discrete') !== -1
    ){
      sectionContent.push(contentMap['discrete'](node))
    }
    else if(node.get(0).tagName === 'h1'){
      sectionContent.push(contentMap['h1'](node))
    }
    else if(node.get(0).tagName === 'h2'){
      sectionContent.push(contentMap['h2'](node))
    }
    else if(
      node.attr('class') && node.attr('class').search('preface_title') !== -1
    ){
      sectionContent.push(contentMap['h2'](node.find('p')))
    }
    else if(node.get(0).tagName === 'h3'){
      sectionContent.push(contentMap['h3'](node))
    }
    else if(node.get(0).tagName === 'h4'){
      sectionContent.push(contentMap['h4'](node))
    }
    else if(node.get(0).tagName === 'h5'){
      sectionContent.push(contentMap['h5'](node))
    }
    else if(node.get(0).tagName === 'h6'){
      sectionContent.push(contentMap['h6'](node))
    }
    else if(node.get(0).tagName === 'h7'){
      sectionContent.push(contentMap['h7'](node))
    }
    else if(node.get(0).tagName === 'h8'){
      sectionContent.push(contentMap['h8'](node))
    }
    else if(node.get(0).tagName === 'h9'){
      sectionContent.push(contentMap['h9'](node))
    }
    else{
      node.children().each(function(){
        traverse($(this))
      })
    }
  }
  var sectionContent = []
  traverse(node)
  if(withFooterHeader === false){
    return {
      children: sectionContent,
      properties: {
        page: {
          margin: {
            top: 750,
            right: 750,
            bottom: 750,
            left: 750,
            header: 325,
            footer: 325,
          },
        }
      },
    }
  }
  else {
    return {
      children: sectionContent,
      properties: {
        page: {
          margin: {
            top: 750,
            right: 750,
            bottom: 750,
            left: 750,
            header: 325,
            footer: 325,
          },
          pageNumbers: node.index() === 1
            ? {start: 1}
            : node.attr('class') && node.attr('class').search('preface') !== -1
              ? {start: 1, formatType: NumberFormat.LOWER_ROMAN}
              : {}
        }
      },
      ...footerHeader(node)
    }
  }
}

docContent.push({
  properties: {
    page: {
      margin: {
        top: 750,
        right: 750,
        bottom: 750,
        left: 750,
        header: 325,
        footer: 325,
      },
    }
  },
  children: [
    new Paragraph({
      children: [
        new ImageRun({
          data: sharp(
            $('html')
            .find('div.cover_product_logo img')
            .prop('outerHTML')
            .replace(/.+src="([^"]+)".+/, `${imageDir}$1`)
          )
          .resize({
            width: 400,
            height: 100
          })
          .png({compressionLevel: 0}),
          transformation: {
            width: 200,
            height: 50
          }
        })
      ],
      alignment: AlignmentType.RIGHT,
      style: 'cover_product_logo'
    }),
    new Paragraph({
      children: [
        new ImageRun({
          data: sharp(
            $('html')
            .find('div.cover_doc_image img')
            .prop('outerHTML')
            .replace(/.+src="([^"]+)".+/, `${imageDir}$1`)
          )
          .resize({
            width: 800,
            height: 914
          })
          .png({compressionLevel: 0}),
          transformation: {
            width: 400,
            height: 457
          }
        })
      ],
      style: 'cover_doc_image'
    }),
    new Table({
      rows: [new TableRow({
        children: [new TableCell({
          children: [
            new Paragraph({
              children: splitHTML($('html').find('.cover_doc_name p').html().replace(/(.+)<br>\n.+/g, '$1')),
              style: 'cover_doc_name'
            }),
            new Paragraph({
              children: splitHTML($('html').find('.cover_doc_name p:last-child').html().replace(/.+<br>\n(.+)/g, '$1')),
              style: 'cover_doc_name_secondary',
            }),
          ],
          shading: {fill: '00a971'},
          verticalAlign: VerticalAlign.CENTER,
          borders: {
            top: {style: BorderStyle.NIL},
            right: {style: BorderStyle.NIL},
            bottom: {style: BorderStyle.NIL},
            left: {style: BorderStyle.NIL}
          },
        })]
      })],
      indent: {
        size: 750,
        type: WidthType.DXA,
      },
      width: {
        size: 8910,
        type: WidthType.DXA
      },
      height: {
        size: 1800,
        type: WidthType.DXA
      },
    }),
    new Paragraph({
      text: ' ',
      style: 'cover_footer_spacing'
    }),
    new Table({
      rows: [new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: splitHTML($('html').find('table.cover_footer td p').html()),
                style: 'p-cover_footer'
              }),
              new Paragraph({
                children: splitHTML($('html').find('table.cover_footer td p:last-child').html()),
                style: 'p-cover_footer'
              })
            ],
            verticalAlign: VerticalAlign.BOTTOM,
            borders: {
              top: {style: BorderStyle.NIL},
              right: {style: BorderStyle.NIL},
              bottom: {style: BorderStyle.NIL},
              left: {style: BorderStyle.NIL}
            },
            width: {
              size: 6750,
              type: WidthType.DXA
            },
          }),
        ]
      })],
      indent: {
        size: 750,
        type: WidthType.DXA,
      },
    })
  ]
})

legalInfo.each(
  function(){
    docContent.push(traverseNode($(this), false))
  }
)

preface.each(
  function(){
    docContent.push(traverseNode($(this), true))
  }
)

docContent.push({
  children: [
    new Paragraph({
      children: splitHTML($('html').find('div#toctitle').html()),
      style: 'h2'
    }),
    new TableOfContents(' ', {
      hyperlink: true,
      headingStyleRange: `1-${+(commandParams.toclevels) + 1}`,
      style: 'p'
    }),
  ],
  properties: {
    page: {
      margin: {
        top: 750,
        right: 750,
        bottom: 750,
        left: 750,
        header: 325,
        footer: 325,
      },
      pageNumbers: {formatType: NumberFormat.LOWER_ROMAN}
    }
  },
  ...footerHeader($('html').find('div#toctitle'))
})

sections.each(
  function(){
    docContent.push(traverseNode($(this), true))
  }
)

const doc = new Document({
  features: {
    updateFields: true,
  },
  sections: docContent,
  styles: paragraphStyles,
  numbering
})

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(process.argv[3], buffer);
})
