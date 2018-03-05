/**
 * Chrome extension for automatically displaying monthly costs for a home on the oikotie.fi website.
 */
const Oikotie = function() {

  const config = {
    startMoney: 24000
  }
  const notifications = []

  const getMonthlyLoanCosts = (costs) => {
    const calculatorResultElement = document.querySelector('.listing-sidepanel-calculator h2')
    if (!calculatorResultElement) {
      return costs
    }
    const savingsInput = document.querySelector('#loan-savings')
    savingsInput.click()
    savingsInput.value = config.startMoney
    const evt = document.createEvent('HTMLEvents')
    evt.initEvent('change', false, true)
    savingsInput.dispatchEvent(evt)
    notifications.push('Lainalaskuri applied with ' + config.startMoney + ' € own savings.')
    costs += parseFloat(calculatorResultElement.innerText.split('€')[0])
    return costs
  }

  const doCostsDisplay = () => {
    const matchTitles = [
      'Rahoitusvastike',
      'Hoitovastike',
      'Vesimaksu'
    ]
    const titleSiblings = document.querySelectorAll('.info-table__title')
    let costs = 0
    Array.from(titleSiblings).forEach(titleElement => {
      const index = matchTitles.indexOf(titleElement.innerText)
      if (index > -1) {
        const valueString = titleElement.parentNode.querySelector('.info-table__value').innerText.split('€')[0].replace(',', '.')
        const add = parseFloat(valueString)
        costs += add
        notifications.push(matchTitles[index] + ' (' + add + ')')
      }
    })
    costs = getMonthlyLoanCosts(costs)
    const displayElement = document.createElement('div')
    displayElement.className = 'oikotie-computed-extra-costs-wrapper'
    displayElement.innerText = parseInt(costs) + ' € / kk'
    displayElement.addEventListener('click', e => {
      displayElement.remove()
      init()
    })
    notifications.forEach(n => {
      displayElement.innerHTML += `<div class='oikotie-chrome-extension-notification'>${n}</div>`
    })
    document.body.appendChild(displayElement)
  }

  const init = () => {
    doCostsDisplay()
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
