/**
 * Chrome extension for automatically displaying monthly costs for a home on the oikotie.fi website.
 *
 * @returns {{init: function()}}
 * @constructor
 */
const Oikotie = function() {

  const init = () => {
    const matchTitles = ['Rahoitusvastike', 'Hoitovastike']
    const titleSiblings = document.querySelectorAll('.info-table__title')
    let costs = 0
    Array.from(titleSiblings).forEach(titleElement => {
      const index = matchTitles.indexOf(titleElement.innerText)
      if (index > -1) {
        const valueString = titleElement.parentNode.querySelector('.info-table__value').innerText.split('€')[0].replace(',', '.')
        costs += parseFloat(valueString)
      }
    })

    const calculatorResultElement = document.querySelector('.listing-sidepanel-calculator h2')
    if (calculatorResultElement) {
      costs += parseFloat(calculatorResultElement.innerText.split('€')[0])
    }

    const displayElement = document.createElement('div')
    displayElement.className = 'oikotie-computed-extra-costs-wrapper'
    displayElement.innerText = costs + ' € / kk'
    displayElement.addEventListener('click', e => {
      displayElement.remove()
      init()
    })
    document.body.appendChild(displayElement)
  }

  return {
    init
  }
}

chrome.extension.sendMessage({}, () => {
  const readyStateCheckInterval = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval)
      const oikotie = new Oikotie()
      oikotie.init()
    }
  }, 10)
})
