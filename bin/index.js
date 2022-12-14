#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const {parse} = require('@vue/compiler-sfc')
const {parser} = require('./parser')
const {RenderMd} = require("./render")

const defaultMarkDown = fs.readFileSync(path.resolve(__dirname, `./template.md`), 'utf-8')

let config = {
  include: [],
  exclude: [],
  output: "docs"
}

let configFilePath = path.resolve("./vuedocs.config.js")

fs.access(configFilePath, function (err) {
  if (err && err.code == "ENOENT") {
    start(config)
    return
  }

  let userConfig = require(configFilePath)
  start(Object.assign(config, userConfig))
})


function start(config) {
  // console.log("config:", config)
  let {include, output} = config

  include.forEach(filePath => {
    let fileName = path.basename(filePath, path.extname(filePath))
    console.log("file -> ", filePath)

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('读取文件失败:', err)
        return
      }

      let info = parser(parse(data))
      // console.log('info:', info)

      fs.readFile(`./${output}/${fileName}.md`, 'utf-8', (err, data) => {
        // console.log(err, data)
        let lines = []
        if (err) {
          data = defaultMarkDown
        }

        lines = data.split("\n")
        // console.log("lines:", lines)

        let text = new RenderMd(info, {
          props: {name: '参数', desc: '说明', type: '类型', default: '默认值'},
          methods: {name: '方法名', desc: '说明', params: '参数', res: '返回值'},
          events: {name: '事件名称', desc: '说明'},
          slots: {name: 'name', desc: '说明'}
        }).render(lines)

        var targetFile = path.resolve(`${output || '.'}/${fileName}.md`)

        if (!fs.existsSync(path.dirname(targetFile))) {
          fs.mkdirSync(path.dirname(targetFile))
        }

        fs.writeFile(targetFile, text, (err) => {
          if (err)
            return console.log(err)
        })
      })
    })
  })
}