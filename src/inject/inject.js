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

  const getValuesFromTitles = (titles, callback) => {
    const titleSiblings = document.querySelectorAll('.info-table__title')
    titleSiblings.forEach(titleElement => {
      const index = titles.indexOf(titleElement.innerText)
      if (index < 0) {
        return
      }
      callback(titles[index], titleElement.parentNode.querySelector('.info-table__value').innerText)
    })
  }

  const doCostsDisplay = (costs) => {
    const matchTitles = [
      'Rahoitusvastike',
      'Hoitovastike',
      'Vesimaksu'
    ]
    getValuesFromTitles(matchTitles, (matchedTitle, value) => {
      notifications.push(matchedTitle + ' (' + value + ')')
      costs += parseInt(value.split('€')[0].replace(',', '.'))
    })
    return getMonthlyLoanCosts(costs)
  }

  const doRenovationWarnings = () => {
    const matchTitles = [
      'Tehdyt remontit',
      'Tulevat remontit'
    ]
    const matchContentStrings = [
      'linjasaneeraus',
      'putkire',
      'viemärijärjestelmän',
      'viemärisaneeraus',
      'runkolinjasaneerau',
      'runkolinja',
      'LVIS saneeraus',
      'LVI saneeraus',
      'LVI-saneeraus',
      'putkien kunnostus',
      'putkien saneerau',
      'n kuntotutkimus',
    ]
    getValuesFromTitles(matchTitles, (matchedTitle, value) => {
      const matches = matchContentStrings.filter(needle => {
        return value.toLowerCase().indexOf(needle.toLowerCase()) > -1
      })
      if (matches.length < 1) {
        return
      }
      if (matchedTitle === 'Tulevat remontit') {
        notifications.push(`<span class='warning'>Putkiremppa may be incoming!</span>`)
      } else {
        notifications.push(`<span class='positive'>Putkiremppa probably done!</span>`)
      }
    })
  }

  const doCrappyConditionWarnings = () => {
    getValuesFromTitles(['Kunto'], (matchedTitle, value) => {
      if (value === 'Tyydyttävä') {
        notifications.push(`<span class='warning'>Probably a dump...</span>`)
      }
    })
  }

  const init = () => {
    if (!document.querySelector('.listing-overview__title')) {
      return
    }
    costs = doCostsDisplay(0)
    doRenovationWarnings()
    doCrappyConditionWarnings()

    const displayElement = document.createElement('div')
    displayElement.className = 'oikotie-computed-extra-costs-wrapper'
    displayElement.innerText = parseInt(costs) + ' € / kk'
    displayElement.addEventListener('click', e => {
      notifications.length = 0
      document.body.removeChild(displayElement)
      init()
    })
    notifications.forEach(n => {
      displayElement.innerHTML += `<div class='oikotie-chrome-extension-notification'>${n}</div>`
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
