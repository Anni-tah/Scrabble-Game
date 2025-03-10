import React from "react";

const WordConnector = ({board, getTileClass, LETTER_SCORES, playerTurn, getScores}) => {

const findWords = () => {
    let words = [];

    // Check rows for words
    for (let row = 0; row < board.length; row++) {
      let word = "";
      let wordMultiplier = 1;
      let wordScore = 0;
      let isNewWord = false;

      for (let col = 0; col < board[row].length; col++) {
        const tile = board[row][col];

        if (tile) {
          word += tile.letter;
          let letterScore = LETTER_SCORES[tile.letter] || 0;
          let cellClass = getTileClass(row, col);

          // Apply letter multipliers
          if (cellClass.includes("triple-letter")) letterScore *= 3;
          if (cellClass.includes("double-letter")) letterScore *= 2;

          // Apply word multipliers
          if (cellClass.includes("triple-word")) wordMultiplier *= 3;
          if (cellClass.includes("double-word")) wordMultiplier *= 2;

          wordScore += letterScore;
          isNewWord = true;
        } else if (word.length > 1) {
          if (isNewWord) words.push({ word, score: wordScore * wordMultiplier });
          word = "";
          wordMultiplier = 1;
          wordScore = 0;
          isNewWord = false;
        }
      }
      if (word.length > 1 && isNewWord) words.push({ word, score: wordScore * wordMultiplier });
    }

    // Repeat logic for vertical words
    for (let col = 0; col < board.length; col++) {
      let word = "";
      let wordMultiplier = 1;
      let wordScore = 0;
      let isNewWord = false;

      for (let row = 0; row < board.length; row++) {
        const tile = board[row][col];

        if (tile) {
          word += tile.letter;
          let letterScore = LETTER_SCORES[tile.letter] || 0;
          let cellClass = getTileClass(row, col);

          if (cellClass.includes("triple-letter")) letterScore *= 3;
          if (cellClass.includes("double-letter")) letterScore *= 2;
          if (cellClass.includes("triple-word")) wordMultiplier *= 3;
          if (cellClass.includes("double-word")) wordMultiplier *= 2;

          wordScore += letterScore;
          isNewWord = true;
        } else if (word.length > 1) {
          if (isNewWord) words.push({ word, score: wordScore * wordMultiplier });
          word = "";
          wordMultiplier = 1;
          wordScore = 0;
          isNewWord = false;
        }
      }
      if (word.length > 1 && isNewWord) words.push({ word, score: wordScore * wordMultiplier });
    }

    return words;
  };

  const calculateScore = (words) => {
    return words.reduce((total, { score }) => total + score, 0);
  };

  const getTurnScore = () => {
    const words = findWords();
    const totalScore = calculateScore(words);

    setScores((prevScores) => ({
      ...prevScores,
      [playerTurn]: prevScores[playerTurn] + totalScore,
    }));

    return totalScore;
  };

  return { getTurnScore };
};

export default WordConnector;