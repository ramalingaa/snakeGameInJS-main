const mainContainer = document.querySelector("#main-container");
const userScoreEle = document.querySelector("#user-score")
const highScoreEle = document.querySelector("#high-score")
const gameOverEle = document.querySelector('#game-over')
const userGuideEle = document.querySelector('#user-guide-text')

userScoreEle.textContent = 0
if(!localStorage.getItem("highestScore")){
  localStorage.setItem("highestScore", 0)
}
highScoreEle.textContent = localStorage.getItem("highestScore")

//generates the board aka environment boundaries for game
const generateBoxEnvironment = (width, height) => {
  const table = document.createElement("table");

  for (let i = 0; i < height; i++) {
    const singleRow = document.createElement("tr");
    singleRow.setAttribute("id", `${i + 1}`);
    for (let j = 0; j < width; j++) {
      const tableCell = document.createElement("td");
      tableCell.classList.add("single-box");
      tableCell.setAttribute("id", `${i + 1}-${j + 1}`);
      singleRow.appendChild(tableCell);
    }
    table.appendChild(singleRow);
  }
  mainContainer.appendChild(table);

};
generateBoxEnvironment(30, 20);
//generates snake with no.of blocks
const generateSnake = (length) => {
  const getRowForSnake = document.getElementById("20");
  const childBlocks = getRowForSnake.querySelectorAll("td");
  for (let i = 0; i < length; i++) {
    childBlocks[i].classList.add("snakeBlock");
  }
};
generateSnake(5);
//cleans state values for every start
const cleanPreviousState = () =>{
  localStorage.removeItem("direction");
}
//move the snake with arrow keys direction
const moveTheSnake = (direction) => {
  
  localStorage.setItem("direction", direction);
  if(!localStorage.getItem('userScore')){
    localStorage.setItem('userScore', 0)
  }

  let setIntervalId;
  let nextElementId;
  let foodLocationId;

  if (localStorage.getItem("timerId")) {
    clearInterval(localStorage.getItem("timerId"));
  }
  //updates the user score 
  const updateUserScore = (currentScore) => {
    let newScore = parseInt(localStorage.getItem('userScore')) + currentScore
    localStorage.setItem('userScore', newScore)
  }
  //removes snake food on hit or miss

  
  if (localStorage.getItem("direction") === "start") {
    localStorage.removeItem("snakeFood");
    localStorage.removeItem("snakeFoodId");
    userGuideEle.textContent = ''
  }
  const generateFoodForSnake = () => {
    foodLocationId = `${parseInt(Math.random() * (20 - 1) + 1)}-${parseInt(
      Math.random() * (30 - 1) + 1
    )}`;
    const foodLocation = document.getElementById(foodLocationId);
    foodLocation.classList.add("foodBlock");
    localStorage.setItem("snakeFood", foodLocationId);
    let foodTimeoutId = setTimeout(() => {
        removeSnakeFood()
        generateFoodForSnake()
    }, 50000)
    userScoreTimer = Date.now()
    localStorage.setItem('snakeFoodId',foodTimeoutId)
  };
  const removeSnakeFood = () => {
    removeSnakeFoodBlock();
    updateUserScoreWhenGameStarted(updateUserScore);

  }
  //function to handle game over events
  const gameOver = () => {
      gameOverEle.textContent = "Game Over";      
      clearInterval(localStorage.getItem("timerId"))
      clearInterval(localStorage.getItem("snakeFoodId"))
      sessionStorage.setItem("gameStatus", "Ended")
      userGuideEle.textContent = "Press Enter or Space to Play Again"
  }
  
  if (!localStorage.getItem("snakeFood")) {
    generateFoodForSnake();
  }
  setIntervalId = setInterval(() => {
    let getNextElementForSnake;
    let currentCordinates;
    let snakeCords;
    //this should only work when we start and in all other cases it should fetch the prevcords from localstorage
    if (localStorage.getItem("direction") === "start") {
      snakeCords = document.querySelectorAll(".snakeBlock");
      localStorage.removeItem("lastnode");
      localStorage.removeItem("snakePrevCords");
      localStorage.removeItem("userScore");
      localStorage.removeItem("timerId");
    }
    let getPreviousCordinates = [];
    const snakeCordsExists = localStorage.getItem("snakePrevCords");

    if (snakeCordsExists) {
      getPreviousCordinates = JSON.parse(snakeCordsExists);
      const newCordsForSnake = [];
      for (let i = 1; i < getPreviousCordinates.length; i++) {
        newCordsForSnake.push(getPreviousCordinates[i]);
      }
      currentCordinates = newCordsForSnake;
      currentCordinates.push(localStorage.getItem("lastnode"));
    } else {
      const currentCordinatesFirst = [];
      snakeCords?.forEach((snakeBlock) => {
        return currentCordinatesFirst.push(snakeBlock.id);
      });
      currentCordinates = currentCordinatesFirst;
    }
    const setDirection = (direction) => {
      localStorage.setItem("timerId", setIntervalId);
      localStorage.setItem("direction", direction);
    }

    //get the snake current head coordinates
    const snakeHeadCords = currentCordinates[currentCordinates.length - 1] && currentCordinates[currentCordinates.length - 1].split("-");

    if (localStorage.getItem("direction") === "up") {
      setDirection('up')
      nextElementId = `${Number(snakeHeadCords[0]) - 1}-${snakeHeadCords[1]}`;
    } else if (localStorage.getItem("direction") === "down") {
      setDirection('down')
      nextElementId = `${Number(snakeHeadCords[0]) + 1}-${snakeHeadCords[1]}`;
    } else if (localStorage.getItem("direction") === "left") {
      setDirection('left')
      nextElementId = `${snakeHeadCords[0]}-${Number(snakeHeadCords[1]) - 1}`;
    } else if (localStorage.getItem("direction") === "right") {
      setDirection('right')
      nextElementId = `${snakeHeadCords[0]}-${Number(snakeHeadCords[1]) + 1}`;
    } else if (localStorage.getItem("direction") === "start") {
      setDirection('start')
      nextElementId = `${snakeHeadCords[0]}-${Number(snakeHeadCords[1]) + 1}`;
    }

    
    for(let i = 0; i < currentCordinates.length; i++){
      if(nextElementId === currentCordinates[i]){
        gameOver()
      }
    }
    
    getNextElementForSnake = document.getElementById(nextElementId);
    //check if the snake can move to next block
    if (getNextElementForSnake) {
      //remove snake head
      const snakeHead = document.getElementsByClassName("snakeHead")[0];
      if (snakeHead) {
        snakeHead.classList.remove("snakeHead");
      }
      //remove the snake from environment
      currentCordinates.forEach((id) => {
        const snakeId = document.getElementById(id);
        snakeId.classList.remove("snakeBlock");
      });
      //add snake to next element
      for (let i = currentCordinates.length - 1; i > 0; i--) {
        if (i === 4) {
          getNextElementForSnake.classList.add("snakeBlock");
          getNextElementForSnake.classList.add("snakeHead");
          localStorage.setItem("lastnode", getNextElementForSnake.id);
          localStorage.setItem(
            "snakePrevCords",
            JSON.stringify(currentCordinates)
          );
        }
        const prevElement = currentCordinates[i];
        const getNextElement = document.getElementById(prevElement);
        getNextElement.classList.add("snakeBlock");
      }
      //increase length of the snake
      if (
        localStorage.getItem("lastnode") === localStorage.getItem("snakeFood")
      ) {
        const tailBlock = document.getElementById(getPreviousCordinates[0]);
        currentCordinates.unshift(getPreviousCordinates[0]);
        localStorage.setItem(
          "snakePrevCords",
          JSON.stringify(currentCordinates)
        );
        removeSnakeFood()
        generateFoodForSnake();
        if(Number(localStorage.getItem('userScore'))>Number(localStorage.getItem('highestScore'))){
          localStorage.setItem("highestScore", localStorage.getItem('userScore'))
          highScoreEle.textContent = localStorage.getItem("highestScore")

        }
      }
    } else {
      gameOver()
      

    }
  }, 300);
};
const restartGame = () => {
  localStorage.getItem("snakePrevCords") && JSON.parse(localStorage.getItem("snakePrevCords")).forEach((snakeBlock) => {
    const getSnakeBlockEle = document.getElementById(snakeBlock)
    getSnakeBlockEle.classList.remove("snakeBlock")
  })
  const snakeHead = document.getElementById(localStorage.getItem("lastnode"))
  snakeHead && snakeHead.classList.remove("snakeHead")
  snakeHead && snakeHead.classList.remove("snakeBlock")
  generateSnake(5);
  sessionStorage.removeItem("gameStatus")
  removeSnakeFoodBlock()
  gameOverEle.textContent = ""
  userGuideEle.textContent = "Press Enter or Space to start the game"
}


//snake key controls function
const controlSnakeMovementthroughyKeys = (e) => {
 if(sessionStorage.getItem("gameStatus") === "Started"){
  if (e.keyCode === 37) {
    //logic for up arrow key
    moveTheSnake("left");
  }  else if (e.keyCode === 38) {
    moveTheSnake("up");
  } else if (e.keyCode === 39) {
    moveTheSnake("right");
  } else if (e.keyCode === 40) {
    moveTheSnake("down");
  }
 }
 else if (sessionStorage.getItem("gameStatus") === "Ended"){
  if ((e.keyCode === 13) | (e.keyCode === 32)) {
    restartGame()
  }
 }
 else {
   if ((e.keyCode === 13) | (e.keyCode === 32)) {
    //logic to start and stop the snake
    cleanPreviousState()
    sessionStorage.setItem("gameStatus", "Started")
    moveTheSnake("start");
  }

 }
};
//make it move
document.addEventListener("keydown", controlSnakeMovementthroughyKeys);
//update the user score based on the timer and updates the score text as well
function updateUserScoreWhenGameStarted(updateUserScore) {
  if (localStorage.getItem('snakeFoodId') && sessionStorage.getItem('gameStatus') === "Started") {
    let singleFoodTime = Date.now() - userScoreTimer;
    if (singleFoodTime < 10000) {
      updateUserScore(10);
    }
    else if (20000 > singleFoodTime && singleFoodTime > 10000) {
      updateUserScore(8);
    }
    else if (30000 > singleFoodTime && singleFoodTime > 20000) {
      updateUserScore(5);
    }
    else if (40000 > singleFoodTime && singleFoodTime > 30000) {
      updateUserScore(3);
    } else if (50000 > singleFoodTime && singleFoodTime > 40000) {
      updateUserScore(1);
    }

    clearTimeout(localStorage.getItem('snakeFoodId'));
    localStorage.removeItem('snakeFoodId');
    userScoreEle.textContent = `${localStorage.getItem('userScore') ? localStorage.getItem('userScore') : 0}`;
  }
}
//removes snake Food block when it's not needed on the screen
function removeSnakeFoodBlock() {
  const snakeFoodItem = document.getElementById(
    localStorage.getItem("snakeFood")
  );
  snakeFoodItem && snakeFoodItem.classList.remove("foodBlock");
  localStorage.removeItem("snakeFood");
}

