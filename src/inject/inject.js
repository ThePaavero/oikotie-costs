const Oikotie = function() {

  const init = () => {
    const matchTitles = ['Rahoitusvastike', 'Hoitovastike']
    const titleSiblings = document.querySelectorAll('.info-table__title')
    let extraCosts = 0
    Array.from(titleSiblings).forEach(titleElement => {
      const index = matchTitles.indexOf(titleElement.innerText)
      if (index > -1) {
        const valueString = titleElement.parentNode.querySelector('.info-table__value').innerText.split('€')[0].replace(',', '.')
        extraCosts += parseFloat(valueString)
      }
    })

    const displayElement = document.createElement('div')
    displayElement.className = 'oikotie-computed-extra-costs-wrapper'
    displayElement.innerText = '+ ' + extraCosts + ' € / kk'
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
