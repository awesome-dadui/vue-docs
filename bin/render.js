class RenderMd {

  constructor(parserResult, options = {}) {
    this.parserResult = parserResult
    this.options = options
  }

  render(lines = []) {
    // console.log('lines:', lines)
    let keys = ["name", "desc", "props", "methods", "events", "slots"].filter(key => this.parserResult.hasOwnProperty(key))
    keys.forEach(key => {
      const element = this.parserResult[key]
      if (element) {
        switch (key) {
          case 'name':
            lines = lines.join("\n")
            var startTag = `<!-- ${key}:start -->`
            var endTag = `<!-- ${key}:end -->`
            var index1 = lines.indexOf(startTag)
            var index2 = lines.indexOf(endTag)
            if (index1 !== -1 && index2 !== -1) {
              lines = lines.slice(0, index1 + startTag.length) + element + lines.slice(index2)
            }
            lines = lines.split("\n")
            // lines.push(...this.renderTitle(`&lt;${element}/&gt;`, false, 3))
            break
          case 'desc':
            var startTag = `<!-- ${key}:start -->`
            var endTag = `<!-- ${key}:end -->`
            var index1 = lines.indexOf(startTag)
            var index2 = lines.indexOf(endTag)
            if (index1 !== -1 && index2 !== -1) {
              lines.splice(index1 + 1, index2 - index1 - 1, element)
            }
            break
          case 'props':
          case 'slots':
          case 'events':
          case 'methods':
            // if (this.options[key])
            //   lines.push(...this[key + 'Render'](element, this.options[key]))

            if (this.options[key]) {
              var startTag = `<!-- ${key}:start -->`
              var endTag = `<!-- ${key}:end -->`
              var index1 = lines.indexOf(startTag)
              var index2 = lines.indexOf(endTag)
              if (index1 !== -1 && index2 !== -1) {
                lines.splice(index1 + 1, index2 - index1 - 1, ...this[key + 'Render'](element, this.options[key]))
              }
            }
            break
          default:
            break
        }
      }
    })
    return lines.join('\n')
  }

  /**
   * ????????????
   * @param {*} propsRes
   * @param {*} config ????????????
   * @returns
   */
  propsRender(propsRes, config) {
    const kt = this._getKeysAndTitles(config, ['name', 'desc', 'type', 'default'])
    // let mdArr = [...this.renderTitle('Props'), '<!-- props:start -->', ...this.renderTabelHeader(kt.titles)]
    let mdArr = [...this.renderTabelHeader(kt.titles)]
    for (const key in propsRes) {
      if (Object.hasOwnProperty.call(propsRes, key)) {
        const element = propsRes[key]
        let row = []
        kt.keys.map(key => {
          if (Object.keys(element).includes(key)) {
            if (key === 'name') {
              row.push(`${element[key]}${this._tag(element, 'sync')}${this._tag(element, 'model')}`)
            } else {
              row.push(element[key])
            }
          } else {
            row.push('??????')
          }
        })
        mdArr.push(this.renderTabelRow(row))
      }
    }
    // mdArr.push('<!-- props:end -->')
    return mdArr
  }

  /**
   * ????????????
   * @param {*} slotsRes
   * @param {*} config ????????????
   * @returns
   */
  methodsRender(slotsRes, config) {
    const kt = this._getKeysAndTitles(config, ['name', 'desc', 'params', 'res'])
    let mdArr = [...this.renderTabelHeader(kt.titles)]
    for (const key in slotsRes) {
      if (Object.hasOwnProperty.call(slotsRes, key)) {
        const element = slotsRes[key]
        let row = []
        kt.keys.map(key => {
          if (Object.keys(element).includes(key)) {
            if (key === 'name') {
              row.push(`${element[key]}${this._tag(element, 'async')}`)
            } else if (key === 'params') {
              row.push(this._funParam(element[key]))
            } else {
              row.push(element[key])
            }
          } else {
            row.push('??????')
          }
        })
        mdArr.push(this.renderTabelRow(row))
      }
    }
    return mdArr
  }

  /**
   * ????????????
   * @param {*} propsRes
   * @param {*} config ????????????
   * @returns
   */
  eventsRender(propsRes, config) {
    const kt = this._getKeysAndTitles(config, ['name', 'desc'])
    let mdArr = [...this.renderTabelHeader(kt.titles)]
    for (const key in propsRes) {
      if (Object.hasOwnProperty.call(propsRes, key)) {
        const element = propsRes[key]
        let row = []
        kt.keys.map(key => {
          if (Object.keys(element).includes(key)) {
            row.push(element[key])
          } else {
            row.push('??????')
          }
        })
        mdArr.push(this.renderTabelRow(row))
      }
    }
    return mdArr
  }

  /**
   * ????????????
   * @param {*} slotsRes
   * @param {obj} config ????????????
   * @returns
   */
  slotsRender(slotsRes, config) {
    const kt = this._getKeysAndTitles(config, ['name', 'desc'])
    let mdArr = [...this.renderTabelHeader(kt.titles)]
    for (const key in slotsRes) {
      if (Object.hasOwnProperty.call(slotsRes, key)) {
        const element = slotsRes[key]
        let row = []
        kt.keys.map(key => {
          if (Object.keys(element).includes(key)) {
            row.push(element[key])
          } else {
            row.push('??????')
          }
        })
        mdArr.push(this.renderTabelRow(row))
      }
    }
    return mdArr
  }

  /**
   * ????????????
   * @param {Array} header
   * @returns
   */
  renderTabelHeader(header) {
    return [this.renderTabelRow(header), '|' + header.map(() => '------').join('|') + '|']
  }

  /**
   * ??????????????????
   * @param {Array} row
   * @returns
   */
  renderTabelRow(row) {
    return '|' + row.join('|') + '|'
  }

  /**
   * ????????????
   * @param {String} title ??????
   * @param {Bool} br ????????????
   * @param {Number} num ????????????1-6
   * @returns
   */
  renderTitle(title, br = true, num = 3) {
    const h = ["#", "##", "###", "####", "#####", "######"]
    return br ? ['', '', `${h[num - 1]} ${title}`] : [`${h[num - 1]} ${title}`]
  }

  /**
   * ??????????????????
   * @param {*} config
   * @param {*} inKeys
   * @returns
   */
  _getKeysAndTitles(config, inKeys) {
    const keys = Object.keys(config).filter(key => inKeys.includes(key))
    const titles = keys.map(key => config[key])
    return {keys, titles}
  }

  /**
   * ??????????????????
   * @param {Array}} params ??????
   * @returns
   */
  _funParam(params) {
    if (!params) return '???'
    return params.map(item => `${item.name}:${item.type}${item.desc ? '(' + item.desc + ')' : ''}`).join('<br>')
  }

  /**
   * ???????????? ???: sync???v-model
   * @param {Obj} item
   * @param {String} tag ??????
   * @returns
   */
  _tag(item, tag) {
    return item[tag] ? ` \`${tag}\` ` : ''
  }
}

module.exports = {
  RenderMd
}