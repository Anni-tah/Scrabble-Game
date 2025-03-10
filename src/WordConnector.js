import React from "react";

const findWords = () => {
    let words = [];

    //checking rows for words
    for (let row = 0; row < board.length; row++) {
        let word = "";
        let wordMultiplier = 1;
        let wordScore = 0;
        let isNewWord = false;
  
        for (let col = 0; col < board[row].length; col++) {
          const tile = board[row][col];
}