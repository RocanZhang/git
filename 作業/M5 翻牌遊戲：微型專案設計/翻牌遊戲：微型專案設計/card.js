const GAME_STATE = {
   FirstCardAwaits: 'FirstCardAwaits',
   SecondCardAwaits: 'SecondCardAwaits',
   CardsMatchFailed: 'CardsMatchFailed',
   CardsMatched: 'CardsMatched',
   GameFinished: 'GameFinished'
}

const Symbols = [
   'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
   'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
   'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
   'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

// 渲染所有牌面
const view = {
   getCardElement(index) {  //取得牌被
      return `<div data-index="${index}" class="card back"></div>`  //flipCard用到dataset，所以要綁${index}
   },

   getCardContent(index) {  //取得牌面
      const number = this.transformNumber((index % 13) + 1)  //平分13張的運算，index/13 => 餘數+1
      const symbol = Symbols[Math.floor(index / 13)]
      return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
   },

   transformNumber(number) {  //特殊數字轉換
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

   displayCards(indexes) {  //陣列出 52 張牌
      const rootElement = document.querySelector('#cards')
      // rootElement.innerHTML = utility.getRandomNumberArray(52).map(index =>
      rootElement.innerHTML = indexes.map(index =>
         this.getCardElement(index)).join('')
   },

   // flipCard(card) {
   flipCards(...cards) {  //翻牌
      cards.map(card => {
         if (card.classList.contains('back')) {  // 回傳正面  
            card.classList.remove('back')
            card.innerHTML = this.getCardContent(Number(card.dataset.index))  //印出翻開的牌面
            return
         }
         card.classList.add('back')  // 回傳背面
         card.innerHTML = null  //印回牌背
      })
   },
   // pairCard(card) {
   pairCards(...cards) {  //配對牌號
      cards.map(card => {
         card.classList.add('paired')
      })
   },
   renderScore(score) {
      document.querySelector(".score").textContent = `總分： ${score} 分`;
   },
   renderTriesTimes(times) {
      document.querySelector(".tried").textContent = `翻牌次數： ${times} 次`;
   },
   appendWrongAnimation(...cards) {
      cards.map(card => {
         card.classList.add('wrong')  //為卡片加入 .wrong 類別
         card.addEventListener('animationend', event =>  //監聽器來綁（動畫結束事件animationend)
            event.target.classList.remove('wrong'),  //動畫跑完一輪，就把 .wrong 的 class 移除
            { once: true })  //事件執行一次之後，就要卸載這個監聽器
      })
   },
   showGameFinished() {
      const div = document.createElement('div')
      div.classList.add('completed')
      div.innerHTML = `
      <p>完成!</p>
      <p>總分: ${model.score}</p>
      <p>翻牌次數: ${model.triedTimes} times</p>    `
      //    const div = document.document.querySelector("#complete").innerHTML = `
      //    <p>完成!</p>
      //    <p>總分: ${model.score}</p>
      //    <p>翻牌次數: ${model.triedTimes} times</p>
      //  `
      const header = document.querySelector('#header')
      header.before(div)
   }
}

const model = {
   revealedCards: [],  //暫存牌組「檢查完以後，這個暫存牌組就需要清空」
   isRevealedCardsMatched() {  //檢查配對成功的函式歸類在 model 裡
      return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13  //提取 revealedCards 陣列中暫存的兩個值，並用 === 比對是否相等
   },
   score: 0,
   triedTimes: 0
}

const controller = {
   currentState: GAME_STATE.FirstCardAwaits,  //目前的遊戲狀態「還沒翻牌」
   generateCards() {
      view.displayCards(utility.getRandomNumberArray(52))  //不要讓 controller 以外的內部函式暴露在 global 的區域

   },
   dispatchCardAction(card) {
      if (!card.classList.contains('back')) {  //如果卡片不包含 'back'，那麼 if 成立
         return
      }
      switch (this.currentState) {  //加入兩個 switch case
         case GAME_STATE.FirstCardAwaits:  //卡片翻開，然後進入 SecondCardAwaits 狀態
            view.flipCards(card)
            model.revealedCards.push(card)
            this.currentState = GAME_STATE.SecondCardAwaits
            break
         case GAME_STATE.SecondCardAwaits:  //卡片翻開，接著檢查翻開的兩張卡是否數字相同
            view.renderTriesTimes(++model.triedTimes)  //切換至 SecondCardAwaits，嘗試次數+1
            view.flipCards(card)
            model.revealedCards.push(card)  // 判斷配對是否成功
            if (model.isRevealedCardsMatched()) {  // 配對成功
               view.renderScore(model.score += 10)  //配對成功，分數+10
               this.currentState = GAME_STATE.CardsMatched  //若配對成功，改變遊戲狀態為CardsMatched
               // view.pairCard(model.revealedCards[0])  //翻開第一張卡
               // view.pairCard(model.revealedCards[1])  //翻開第二張卡
               view.pairCards(...model.revealedCards)  //翻開兩張卡
               model.revealedCards = []  //清空 model 的暫存卡片陣列
               // view.showGameFinished()  //測試遊戲結束畫面
               if (model.score === 260) {  //遊戲滿分完成
                  console.log('showGameFinished')
                  this.currentState = GAME_STATE.GameFinished
                  view.showGameFinished()  //遊戲結束畫面
                  return
               }
               this.currentState = GAME_STATE.FirstCardAwaits  //動作結束後，再把遊戲狀態改成 FirstCardAwaits
            } else {
               // 配對失敗
               this.currentState = GAME_STATE.CardsMatchFailed  //若配對失敗，改變遊戲狀態為 CardsMatchFailed
               view.appendWrongAnimation(...model.revealedCards)  //觸發失敗動畫
               setTimeout(this.resetCards  //呼叫瀏覽器內建的計時器
                  // () => {
                  //    view.flipCards(...model.revealedCards[0])  //重置第一張卡
                  //    view.flipCards(...model.revealedCards[1])  //重置第二張卡
                  //    model.revealedCards = []  //清空 model 的暫存卡片陣列
                  //    this.currentState = GAME_STATE.FirstCardAwaits  //動作結束後，再把遊戲狀態改成 FirstCardAwaits
                  // }
                  , 1000)  //停留參數1000毫秒
            }
            break
      }
      console.log('this.currentState', this.currentState)
      console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
   },
   resetCards() {  //呼叫瀏覽器內建的計時器
      // view.flipCards(...model.revealedCards[0])  //重置第一張卡
      // view.flipCards(...model.revealedCards[1])  //重置第二張卡
      view.flipCards(...model.revealedCards)  //重置第一張卡
      model.revealedCards = []  //清空 model 的暫存卡片陣列
      controller.currentState = GAME_STATE.FirstCardAwaits  //動作結束後，再把遊戲狀態改成 FirstCardAwaits
   }
}

// 洗牌演算法
const utility = {
   getRandomNumberArray(count) {
      const number = Array.from(Array(count).keys())
      for (let index = number.length - 1; index > 0; index--) {  //取出最後一項
         let randomIndex = Math.floor(Math.random() * (index + 1))  //找到一個隨機項目
            ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]  //解構賦值語法
      }
      // console.log(number)
      return number
   }
}

// 輸出 52 張牌的頁面
// 取代 view.displayCards()
controller.generateCards()

// 監聽點擊牌面
document.querySelectorAll('.card').forEach(card => {
   card.addEventListener('click', event => {
      // console.log(card)
      controller.dispatchCardAction(card)
   })
})
