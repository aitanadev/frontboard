// https://en.wikipedia.org/wiki/Color_wheel
// https://en.wikipedia.org/wiki/Tertiary_color
// https://htmlcolorcodes.com/color-chart/

import Color from '#models/palette/Color'
import ColorShadow from '#models/palette/ColorShadow'
import ColorTone from '#models/palette/ColorTone'
import CSSVar from '#models/palette/CSSVar'
import StaticDB from '#services/StaticDB'

const configDatabase = StaticDB.databases.palette.collections
const colors = configDatabase.colors.data
const colorShadowsDefault = configDatabase.colorShadowsDefault.data
const colorShadowsDarkMode = configDatabase.colorShadowsDarkMode.data
const colorTones = configDatabase.colorTones.data
const baseCSSVars = configDatabase.baseCSSVars.data

const paletteActive = localStorage.getItem('palette') === 'true'
const cssVarsAccesor = {}
let currentColorShadows = colorShadowsDefault
let darkmode = false

const palette = {
  miniVariation: true,
  inlineExpand: true,
  showBoth: true,
  baseCSSVars,
  cssVars: cssVarsAccesor,
  colors,
  colorTones,
  colorShadowsDefault,
  colorShadowsDarkMode,
  showFixedStatuses: false,
  active: paletteActive,
  get statuses() {
    const statuses = ['default', 'disabled']
    if (this.showFixedStatuses) {
      statuses.push('hover', 'focus')
    }
    return statuses
  },
  get colorShadows() {
    return currentColorShadows
  },
  set colorShadows(value) {
    currentColorShadows = value
    this.refresh()
  },
  get darkmode() {
    return darkmode
  },
  set darkmode(value) {
    darkmode = !!value
    this.colorShadows = darkmode ? colorShadowsDarkMode : colorShadowsDefault
  },
  toggle() {
    palette.active = !palette.active
    localStorage.setItem('palette', palette.active)
  },
  addColorTone() {
    this.colorTones.push(new ColorTone())
  },
  addColor() {
    this.colors.push(new Color())
  },
  refreshTimeout: undefined,
  refresh() {
    clearTimeout(this.refreshTimeout)
    this.refreshTimeout = setTimeout(() => this.generate(), 0)
  },
  generate() {
    // console.warn('· Palette refresh')
    styleVars.textContent = [makeVars(), makeColorVars(currentColorShadows), makeColorVars(colorShadowsDarkMode, 'v-darkmode')].join('\n')
    styleClasses.textContent = [makeClasses(colorShadowsDefault), makeClasses(colorShadowsDarkMode)].join('\n')
  }
}

function makeVars(scoped) {
  const cssVars = [...baseCSSVars]

  const contents = cssVars.map(cssVar => {
    cssVarsAccesor[cssVar.name.toCamelCase()] = cssVar
    return cssVar.asCSS() // `\t--${cssVar.name}: ${cssVar.value};\n`
  }).join('')

  return `/* CSS Vars */\n.--ds ${scoped ? `.${scoped}` : ''} {\n${contents}}\n`
}

function makeColorVars(colorShadows, scoped) {
  const cssVars = []

  // Colors
  for (const color of colors) {
    cssVars.push(new CSSVar({
      name: `color-${color.name}`,
      value: color.hsl()
    }))
  }

  // Colors shadows
  for (const color of colors) {
    for (const colorShadow of colorShadows) {
      const colorShadowFlag = colorShadow.name !== 'default' ? `--${colorShadow.name}` : ''
      cssVars.push(new CSSVar({ name: `color--${color.name}${colorShadowFlag}`, value: color.hsl(colorShadow) }))
    }
  }

  // Tone shadows
  for (const colorTone of colorTones) {
    for (const colorShadow of colorShadows) {
      if (!colorTone.color) return
      const colorShadowFlag = colorShadow.name !== 'default' ? `--${colorShadow.name}` : ''
      cssVars.push(new CSSVar({ name: `color--${colorTone.name}${colorShadowFlag}`, value: colorTone.color.hsl(colorShadow) }))
    }
  }

  // Shadows
  for (const colorShadow of colorShadows) {
    // if (colorShadow.name === 'default') continue
    const colorShadowFlag = colorShadow.name !== 'default' ? `--${colorShadow.name}` : ''
    cssVars.push(new CSSVar({ name: `color${colorShadowFlag}`, value: `var(--color--default${colorShadowFlag})` }))
  }

  const contents = cssVars.map(cssVar => {
    cssVarsAccesor[cssVar.name.toCamelCase()] = cssVar
    return cssVar.asCSS() // `\t--${cssVar.name}: ${cssVar.value};\n`
  }).join('')

  return `/* CSS Color vars */\n.--ds ${scoped ? `.${scoped}` : ''} {\n${contents}}\n`
}

function makeClasses(colorShadows) {
  const styleContent = []
  styleContent.push('/* Color classes */\n' + colors
  .map(color => {
    const colorVars = colorShadows.map(colorShadow => {
      const colorShadowFlag = colorShadow.name !== 'default' ? ('--' + colorShadow.name) : ('')
      return `\t--color${colorShadowFlag}: var(--color--${color.name}${colorShadowFlag});\n`
    }).join('')
    return `.t-${color.name} {\n` + colorVars + '}\n'
  }).join('\n'))

  styleContent.push('/* Tone classes */\n' + colorTones
  .filter(tone => tone.name !== 'default')
  .map(tone => {
    const toneVars = colorShadows.map(colorShadow => {
      const colorShadowFlag = colorShadow.name !== 'default' ? ('--' + colorShadow.name) : ('')
      return `\t--color${colorShadowFlag}: var(--color--${tone.name}${colorShadowFlag});\n`
    }).join('')
    return `.t-${tone.name} {\n` + toneVars + '}\n'
  }).join('\n'))

  return styleContent.join('\n')
}

const styleVars = document.createElement('style')
const styleClasses = document.createElement('style')
styleVars.type = 'text/css'
styleClasses.type = 'text/css'
document.body.appendChild(styleVars)
document.body.appendChild(styleClasses)

palette.refresh()

export default palette
