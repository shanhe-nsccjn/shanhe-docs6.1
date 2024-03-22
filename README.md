# ShanHe Docs Center

本项目为山河云文档中心，基于青云文档项目进行定制化修改，使用 Adoc 工具编写文档，使用 Hugo 框架作为文档中心主框架。

## 准备工作

用户如需在本地正常运行该文档框架，需依次安装如下工具：

1. 用户本地下载安装 [asciidoctor](https://docs.asciidoctor.org/asciidoctor/latest/install/)
2. 用户本地下载安装 [hugo (extended)](https://gohugo.io/getting-started/installing/)
3. 用户本地下载安装 [node v14.8.2](https://registry.npmmirror.com/-/binary/node/latest-v14.x/node-v14.18.2.pkg)。
   **说明：**
   * 该下载链接为为 MacOS 版 NodeJs 安装包，其他安装包，可至官网下载。
   * NodeJs 版本需大于 v14.0。
4. 用户本地终端窗口执行命令行：`npm install`。

## 项目开发

本框架支持文档的多版本。

### 开发流程

1. `git clone` 代码至本地。
2. 本地切换到 dev 分支，`git checkout dev`。
3. 基于 dev 分支创建个人分支：`git checkout -b <branch_name>`。
4. 用户自行定义项目名 `<project_name>` 与项目文档版本号 `<project_version>`。
5. 在 `config` 目录下，创建项目配置文件目录。用户可直接拷贝 `config/@demo` 目录，并重命名为：`config/@<project_name>`。
6. 在 `content` 目录下，创建项目文件目录。用户可直接拷贝 `content/@demo/v5.1.0` 目录，并重命名为：`content/@<project_name>/<project_version>`。
7. 在 `content/@<project_name>/<project_version>` 目录下，根据实际情况，调整文档结构，编写文档内容。
   **说明：**
   * 开发的时候，个人操作目录，只操作 `config` `static` 以及 `content` 目录，其余部分代码是框架提供渲染能力。
8. 本地编译运行项目：
   **说明：**
   * 运行命令行 `npm run dev <project_name>`，仅启动项目，不初始化搜索功能，不生成 PDF 文件。
   * 运行命令行 `npm run deploy:dev <project_name>`，初始化搜索功能，并生成 PDF 文件。
   * 用户可根据需求，任选其中一条命令行运行即可。
9. 本地浏览器输入链接 `localhost:1313`，即可浏览项目文档。
10. 文档编写过程中，可以合并 `dev` 分支的最新代码：`git pull && git merge origin/dev`。
11. 开发完毕，提交代码，可以在网页上创建 merge request 请求，合并到 `dev` 分支。
12. `dev` 分支测试无误后，可以在网页上创建 merge request 请求，合并到 `master` 分支。

### 开发示例

1. 新项目的项目名为 `test`，项目文档版本号为 `v3.1`。
2. 拷贝 `config/@demo` 目录，并重命名为：`config/@test`。
3. 拷贝 `content/@demo/v5.1.0` 目录，并重命名为：`content/@test/v3.1`。
4. 在 `content/@test/v3.1` 目录下（保留search.md文件），根据实际情况，调整文档结构，编写文档内容。
5. 本地编译运行项目：`npm run dev test`。
6. 本地浏览器输入链接 `localhost:1313`，即可浏览项目文档。

### 多版本开发

用户如需针对已有项目文档，创建新的版本，即可参考如下步骤：

1. 本地终端进入项目目录。
2. 本地终端执行命令行： `npm run transfer <project_name> <source_version> <target_version>`。
   说明：
   * `<source_version>` 为源文档项目版本号，新建文档版本以此版本文档为蓝本进行创建。
   * `<target_version>`，初目标文档项目版本号，待创建的文档版本。
   * 示例，如用户需给文档项目 `test`，基于 `v3.1` 创建新版本 `v4.1`，可执行命令行：`npm run transfer test v3.1 v4.1`。
3. 命令行回显内容有：`content/@<project_name>/<target_version> 目录已生成，文件转换成功！` 的提示，说明操作成功，此时无需额外操作，可正常开始文档编写工作。
4. 命令行回显内容有：`仍可能存在未转换的文件，请手动查看文件列表，该文件为 content/@<project_name>/warning.txt！` 的提示，说明新文档目录 `content/@<project_name>/<target_version>` 已成功创建，用户需根据 `content/@<project_name>/warning.txt` 文件中的内容，依次复查相应的文件。
5. 命令行回显内容有红色的报错信息，用户需根据报错信息修改命令行，再次执行即可。
6. 新版本文档项目生成后，用户需手动修改 `content/@demo/v6.1.0/_index.adoc` 文件的 `weight`、`pdf_docVersion`、`pdf_releaseDate` 的信息。

操作成功，此时无需额外操作，可正常开始文档编写工作。

### 多版本项目

项目的版本目录 `content/@<project_name>/<project_version>`
其中 `<project_version>` 为项目的版本，项目版本排序是根据 `content/@<project_name>/<project_version>/_index.adoc` 里的 `weight` 参数来排序的。其中 `weight: 1` 为默认版本。

### 项目内版本转移或重命名

假设项目名为 `demo`，版本名为 `v5.1.0`，要改成 `v6.1.0`
**注意：文件名只能为数字、字母以及 . - _ 字符。**

1. 运行命令 `npm run transfer demo v5.1.0 v6.1.0`
   1. 如果运行成功，会有 `content/@demo/v6.1.0 目录已生成，文件转换成功！` 提示
   2. 如果运行成功，但是有部分文件需要手动干预。会有 `仍可能存在未转换的文件，请手动查看文件列表，该文件为 content/@demo/warning.txt` 提示信息，`content/@demo/v6.1.0` 仍然会正常生成，需要人工去复查 `content/@demo/warning.txt`里列出的文件
   3. 如果出错，会显示红色的报错信息，根据报错信息修改命令即可
2. 如果版本是重命名的，则手动删除 `content/@demo/v5.1.0` 源文件夹即可。
3. 转移后，手动更改 `content/@demo/v6.1.0/_index.adoc` 文件的 `weight` `pdf_docVersion` `pdf_releaseDate` 的信息。

## 附录

### 命令行说明

1. `npm run search <project_name>` 生成 `<project_name>` 项目搜索索引文件。
2. `npm run pdf <project_name>` 生成 `<project_name>` 项目的 PDF 文件，并复制到 `static/pdf` 及 `pdf/files/@<project_name>` 目录下。
3. `npm run pdf <project_name> <project_direction>` 生成项目指定目录的 PDF 文件，比如 `npm run pdf demo v5.1.0` 或者 `npm run pdf demo v5.1.0 v5.3.0/qa`。
4. `npm run pdf:force <project_name> <project_direction>` 生成项目指定目录的 PDF 文件(强制更新)。
5. `npm run word <project_name>` 生成 `<project_name>` 项目的 Word 文件，并复制到 `static/docx` 及 `pdf/files/@<project_name>` 目录下(增量更新)。
6. `npm run word:force <project_name> <project_direction>` 生成项目指定目录的 Word 文件(强制更新)。
7. `npm run pdf:file <project_name> <file_path>` 根据 adoc 文件生成指定项目 pdf
8. `npm run word:file <project_name> <file_path>` 根据 adoc 文件生成指定项目 word 文件
9. `npm run pdf:preview <project_name> <file_path>` 预览 pdf
10. `npm run adoc <project_name>` 只生成 Adoc 最终文件，不渲染 PDF/Word
11. `npm run adoc:preview <project_name> <file_path>` 根据 adoc 文件, 预览页面。
12. `npm run pdf:export <project_name>` 导出 `<project_name>` 项目的 PDF 文件，并复制到 `pdf/files/@<project_name>` 目录下。
13. `npm run word:export <project_name>` 导出 `<project_name>` 项目的 Word 文件，并复制到 `pdf/files/@<project_name>` 目录下。
14. `npm run check:pdf <project_name> [project_directory]` 可以检测某个项目的某个目录下 PDF 文件是否生成正常，例如 `npm run check:pdf enterprise user_guide/compute/hpc/quick-start/`
15. `npm run dev <project_name>` 启动 `<project_name>` 服务器。
16. `npm run dev:embed <project_name>` 启动 `<project_name>` 服务器，项目为 `内嵌版` 可以开始开发项目。
17. `npm run build <project_name>` 生成 `<project_name>` 服务器用静态文件。
18. `npm run build:embed <project_name>` 生成 `<project_name>` 服务器用 `内嵌版` 静态文件。

19. `npm run publish:<branch_name> <project_name>`，把 `<branch_name>` 分支代码 `<project_name>` 提交到服务器，该命令行支持同时提交多个项目代码，比如 `npm run publish:dev demo enterprise` 就是把 `dev` 分支的 `demo` `enterprise` 内容提交到服务端，然后本地就可以通过以下地址访问了。
    **注意本地要配置 host 地址**
    * [demo 项目](http://demo.doccenter.dev.com:8000)
    * [demo 内嵌版项目](http://demo_embed.doccenter.dev.com:8000)
    * [enterprise 项目](http://enterprise.doccenter.dev.com:8000)
    * [enterprise 内嵌版项目](http://enterprise_embed.doccenter.dev.com:8000)

20. `npm run check <project_name>`，检测项目`<project_name>`是否报错。

### Adoc 示例文档参考

* content/@demo/v5.1.0/guide/adventure.adoc
* content/@demo/v5.1.0/qa/product_vs.adoc

### Adoc 文件头说明

```sh
---
title: <string> # 文件标题*（会放到 网页标题 里）
description: <string> # 文件描述（会放到 httpHeader 里）
keywords: <string> # 文件关键字（会放到 httpHeader 里）
weight: <number> # 文件权重*
icon: <icon_name> # icon 地址
bannerImage: <image_url> # 学习内容（全局搜索页及目录页选填，可以参考 @demo @enterprise 项目），为学习内容页的图标
draft: <boolean> # 本页是否为草稿页, 草稿页不会被渲染，也不会被加入索引 (可以不填写，不填写，默认为 false)
not_show: <boolean> # 本页是否展示 (可以不填写，不填写，默认为 false)

pdf_docVersion: '<version>' # 版本下首个文件必填，不填的话，使用 default.yaml 里面的 pdf.pdf_docVersion 值
pdf_releaseDate: '<date>'  # PDF release 时间, 格式为 yyyy-MM-DD, 如 2022-01-09

isSearchPage: <boolean> # 是否是全局搜索页（全局搜索页必填，值为 true, 多文档项目）
study_section: <object> # 学习内容（目录页必填，可以参考 @demo 项目）
search_home_section: <object> # 多项目文档内嵌版必填，否则会使用非内嵌版的 (其中的类型为 block list block-list), 具体样式可以参看多文档项目内嵌版预览  http://192.168.12.51:8999
product: <object> # 产品动态，可以参考 content/@demo/v5.1.0/news/product_news.adoc 文件

# 视频专区，可以参考 content/@demo/v5.3.0/video/video.adoc
video_section:
  - title: 功能介绍 # 行标题
    children:
      - title: 创建一个新的Bucket # 视频题目
        time_duration: 01:02 # 视频持续时间
        # poster: "https://s6.jpg.cm/2021/11/0K1qV.png" # 占位图片
        url: "https://pek3b.qingstor.com/yunify-qingcloud-docs/video/qs_qingcloud_domain_name.mp4" # 视频地址
        description: 创建一个新的Bucket 创建一个新的Bucket # 视频描述信息
      - title: ECS+OSS
        time_duration: 01:03
        url: "http://cloud.video.taobao.com/play/u/1644398/p/1/e/6/t/1/254577109657.mp4"
        description: 描述2
  - title: 操作指南
    children:
      - title: 企业云主机安全视频
        time_duration: 00:11
        url: "https://bbs-video.huaweicloud.com/video/media/20191231/20191231144941_91426/开启企业主机安全服务.mp4"
        description: 这是一个问题

# 说明
# <string> 表示字符串
# <date> 表示日期
# <number> 表示数字
# <boolean> 表示布尔值（true/false）
# <object> 表示对象
# <version> 表示填写版本名称
# <image_url> 表示图片地址
# <icon_name> 表示 icon 名称, 填写该名称，会找到该名称对应的图标
# 加 * 表示必填

---
```

### 相关预览网址

* 单文档: demo
* 多文档: enterprise
* 单文档内嵌版: demo_embed
* 多文档内嵌版: enterprise_embed

* staging 分支文档：
  * <http://<project_name>.doccenter.staging.com:8000>
    * [demo 项目](http://demo.doccenter.staging.com:8000)
    * [demo 内嵌版项目](http://demo_embed.doccenter.staging.com:8000)
    * [enterprise 项目](http://enterprise.doccenter.staging.com:8000)
    * [enterprise 内嵌版项目](http://enterprise_embed.doccenter.staging.com:8000)
* dev 分支文档：
  * <http://<project_name>.doccenter.dev.com:8000>
    * [demo 项目](http://demo.doccenter.dev.com:8000)
    * [demo 内嵌版项目](http://demo_embed.doccenter.dev.com:8000)
    * [enterprise 项目](http://enterprise.doccenter.dev.com:8000)
    * [enterprise 内嵌版项目](http://enterprise_embed.doccenter.dev.com:8000)
* icon 字体图标预览：<http://192.168.12.51:8888/>

### host 信息

```sh
192.168.12.51 demo.doccenter.staging.com demo_embed.doccenter.staging.com enterprise.doccenter.staging.com enterprise_embed.doccenter.staging.com
192.168.12.51 demo.doccenter.dev.com demo_embed.doccenter.dev.com enterprise.doccenter.dev.com enterprise_embed.doccenter.dev.com
```

需要新增部署的项目，可以在 master、dev 分支增加项目，然后，根据命名规则访问即可。
**注意：<project_name>.doccenter.staging.com 必须加入 /etc/host，**
*Mac 电脑，推荐使用 [SwitchHosts](https://swh.app/) 来管理 host，或者用 `dnsmasq` 来做泛域名解析。*

## 目录结构

```sh
.
├── README.md              # 框架说明文档
├── config                  # 框架配置目录
│   ├── @demo              # 项目配置
│   │    ├── _variables.scss    # 主题配色配置
│   │    ├── config.yaml    # 项目配置
│   │    └── custom.yaml   # 自定义配置，不会提交到代码仓库
│   ├── default.yaml       # 默认配置
│   └── embed.yaml         # 内嵌文档配置
├── content
│   ├── @demo              # 项目内容页
│   │     ├── _custom      # 项目引用的文件位置
│   │     └── v5.1.0       # @demo 的 v5.1.0 版本
│   └── _components        # 公共组件页
├── node_modules           # 框架依赖包
├── package.json           # 框架 meta 信息
├── pdf                    # pdf 导出目录
├── public                 # 最终生成的静态文件
├── resources              # 系统生成的资源目录（缓存使用）
├── scripts                # 框架的脚本目录
├── static                 # 项目引用的资源文件目录
│   ├── css
│   ├── fonts
│   ├── images
│   │     └── demo         # 项目引用的图片文件目录
│   ├── js
│   └── pdf                # pdf 文件位置
└── themes
    └── qing-theme         # 框架所用的主题
```

### `config/@<project_name>` 配置说明

```yaml
title: <string>                  # 项目的页面标题（必填）

markup:
  asciidocExt:
    attributes:
      <key>: <value>      # 项目全局引入的变量，注意不要与 PDF 配置冲突(该配置会完全覆盖 default.yaml 里的配置)

# 扩展配置（用于配置中心下发配置）
externalConfigs: brand.json # 相对于当前位置的文件位置，用,作为分隔符的字符串
externalConfigsMap:
  params.brand: zh-cn.VENDOR_BRAND
  params.company_full: zh-cn.VENDOR_COMPANY_FULL
  markup.asciidocExt.attributes.platform_name_okr: VENDOR_TITLE

# 扩展样式（用于配置中心下发样式配置）
externalStyles: theme.json # 相对于当前位置的文件位置，用,作为分隔符的字符串
externalStylesMap:
  $active-color: primary
  $icon-dark-color: primary
  $primary-btn-hover-color: primary-hover
  $active-light-color: secondary
  $icon-light-color: secondary-hover
  $font-title-color: title1
  $menu-switch-active-color: title3
  $banner-description-color: title3
  $font-light-color: help2
  $input-placeholder-color: help2
  $theme-background-color: light-background
  $table-header-background-color: light-background
  $normal-background-color: white-background

# 项目相关的配置
params:
  description: "这里是 Demo 文档中心页面"
  favicon: "/images/favicon.ico"
  keywords: "云计算,青云,QingCloud,文档"
  logo: "/images/qingcloud-logo.svg"
  logoInfo: "Demo"
  logoLink: "/v5.2.0/"   # 作为当前项目的版本，点击 logo 可以跳转到默认版本
  disableVersions: <boolean> # 是否显示导航条 "版本号" true 为禁止显示版本号，false 为显示版本号，默认为 false
  docHostPort: <url_string> # 内嵌版必填，用于跳转到完整版页面的链接，为 http:// 或 https:// 开头的链接，如果没有这个值，则不会生成内嵌文档

  # PDF 配置 (会覆盖 config/default.yaml 里的 PDF 配置)
  pdf:
    pdf_projectName: Demo
    pdf_docVersion: 01
    pdf_projectVersion: v1.2.2
    pdf_releaseDate: 2022-07-13
    pdf_coverDocName: QingCloud Demo
    pdf_timeout: 4 # 生成文件超时时间（单位：分钟），默认 30，可以填写正整数或者正小数
    pdf_only:    # 如果有这个参数，则只导出该参数下的 PDF 文件，忽略 pdf_include 参数(列表)
      -             # 列表里如果是数组，则该数组第一个字符串为导出文件根目录，剩余的字符串为需要导出的文件
        - /v5.1.0/product/youshi
        - /v5.1.0/product/youshi/deploy.adoc
      - /v5.1.0/guide/adventure  # 列表里如果是字符串，则该目录下所有文件会被导出
    pdf_include:    # 除了默认导出 PDF 的文件，还要导出的文件(列表)
      -             # 列表里如果是数组，则该数组第一个字符串为导出文件根目录，剩余的字符串为需要导出的文件
        - /v5.1.0/product/youshi
        - /v5.1.0/product/youshi/deploy.adoc
      - /v5.1.0/guide/adventure  # 列表里如果是字符串，则该目录下所有文件会被导出
    pdf_exclude:  # 不导出 PDF 的文件或目录
      - /v5.1.0/zhi_nan/doc.adoc
```

### 注意信息

1. 项目的图片目录在 `static/images/<project_name>` 目录以及 `static/images` 根目录下，其他图片目录下的图片不会提交到服务器。
2. 项目配置信息在 `config/@<project_name>/config.yaml` 文件中。
3. 项目的内容在 `content/@<project_name>/@<project_version>` 目录下。
4. 项目的公共组件在 `content/_components` 下。
5. `config/@<project_name>/custom.yaml`，作为项目 `project_name` 的自定义配置，不会被提交到代码仓库，可以在这里设置各种本地使用的各种配置项。

### FAQ

1. Mac 遇到文件过多，项目启动失败，可参考如下操作方式：
    **方式一：**
    可以命令行运行以下命令，修改最大打开文件数目(在当前 session 有效)

    ```bash
    sudo sysctl -w kern.maxfiles=65536
    sudo sysctl -w kern.maxfilesperproc=65536
    ulimit -n 65536 65536
    ```

    **方式二：**

    可以参考 <https://gist.github.com/tombigel/d503800a282fcadbee14b537735d202c> 修改系统文件，重启电脑后永久有效

    ```bash
    curl -O https://gist.githubusercontent.com/tombigel/d503800a282fcadbee14b537735d202c/raw/ed73cacf82906fdde59976a0c8248cce8b44f906/limit.maxfiles.plist
    curl -O https://gist.githubusercontent.com/tombigel/d503800a282fcadbee14b537735d202c/raw/ed73cacf82906fdde59976a0c8248cce8b44f906/limit.maxproc.plist

    sudo mv limit.maxfiles.plist /Library/LaunchDaemons
    sudo mv limit.maxproc.plist /Library/LaunchDaemons

    sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
    sudo chown root:wheel /Library/LaunchDaemons/limit.maxproc.plist

    sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
    sudo launchctl load -w /Library/LaunchDaemons/limit.maxproc.plist
    ```

2. 遇到 `SourceTree 或者第三方 git 软件` 无法 `git commit`，可以运行以下命令：
`echo "export PATH="$(dirname $(which node)):$PATH"" > ~/.huskyrc` 把 `nodejs` 路径写到自己的根目录下。

3. 项目运行过慢，如何处理？
可以在 `config/@<project_name>/custom.yaml` 配置 `ignorefiles: [ ".*/_custom" ]` 参数，屏蔽部分文件夹，可以加快项目运行速度。
