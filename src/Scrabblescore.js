import React, { useState } from "react"; // ✅ Added missing import

// Step 1: Define the letter scores
const letterScores = {
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2,
  h: 4, i: 1, j: 8, k: 5, l: 1, m: 3, n: 1,
  o: 1, p: 3, q: 10, r: 1, s: 1, t: 1, u: 1,
  v: 4, w: 4, x: 8, y: 4, z: 10
};

// Step 2: Function to calculate the Scrabble score
const calculateScrabbleScore = (word) => {
  return word
    .toLowerCase()
    .split("")
    .reduce((total, letter) => total + (letterScores[letter] || 0), 0);
};

// Step 3: React component
const ScrabbleScoreCalculator = () => {
  const [word, setWord] = useState("");
  const [score, setScore] = useState(0);

  const handleChange = (event) => {
    const inputWord = event.target.value;
    setWord(inputWord);
    setScore(calculateScrabbleScore(inputWord));
  };

  return (
    <div>
      <h1>Scrabble Score Calculator</h1>
      <input
        type="text"
        value={word}
        onChange={handleChange}
        placeholder="Enter a word"
      />
      <p>Score: {score}</p>
    </div>
  );
};

export default ScrabbleScoreCalculator;
