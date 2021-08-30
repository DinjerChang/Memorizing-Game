// finite-state Machine
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}
//Define Controller
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomCardArray(52))
  },
  dispatchCardAction(card) {
    // 讓使用者無法覆蓋以翻開的牌
    if (!card.matches(".back")) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTimes(model.triedTimes += 1)
        view.flipCards(card)
        model.revealedCards.push(card)
        console.log(model.isRevealedCardsMatched())
        if (model.isRevealedCardsMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          view.appendWrongAnimation(...model.revealedCards)
          this.currentState = GAME_STATE.CardsMatchFailed
          setTimeout(this.resetCards, 1000)
        }
    }
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}
// Define Model
const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}
// 撲克牌花色
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]
//VIEW
const view = {
  displayCards(random_index_array) {
    const rootElement = document.querySelector('#card-table')
    rootElement.innerHTML = random_index_array.map(index => this.getCardElement(index)).join('')
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
    <img src="${symbol}" alt="">
    <p>${number}</p>`
  }
  ,
  getCardElement(index) {
    return `
    <div class="card back" data-index="${index}" ></div>`
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  flipCards(...cards) {
    cards.map(card => {
      if (card.matches('.back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add("paired")
    })
  },
  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`
  },
  renderTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong")
      card.addEventListener("animationend", event => {
        event.target.classList.remove('wrong'), { once: true }
      })
    })
  },
  showGameFinished() {
    Swal.fire({
      icon: 'success',
      title: 'Well done !!!',
      text: `you scored 260 out of ${model.triedTimes} tries`
    }).then(relaod => window.location.reload())
  }
}
// 外部程式
const utility = {
  getRandomCardArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      // 解構賦值
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}
controller.generateCards()
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", event => {
    controller.dispatchCardAction(card)
  })
})