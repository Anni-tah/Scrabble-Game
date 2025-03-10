import React, { useState, useEffect } from "react";
import "./Scrabbleboard.css";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import TileSource from "./components/TileSource";
import BoardTarget from "./components/BoardTarget";

const BOARD_SIZE = 15;

// Define special tiles directly since API is not working
const DEFAULT_SPECIAL_TILES = {
  tripleWordSquares: [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]],
  doubleWordSquares: [[1, 1], [2, 2], [3, 3], [4, 4], [10, 10], [11, 11], [12, 12], [13, 13], [1, 13], [2, 12], [3, 11], [4, 10], [10, 4], [11, 3], [12, 2], [13, 1]],
  tripleLetters: [[1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]],
  doubleLetters: [[0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12], [7, 3], [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]]
};

// Define letter scores directly
const LETTER_SCORES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2,
  H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1,
  O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1,
  V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const ScrabbleBoard = () => {
  const [specialTiles, setSpecialTiles] = useState(DEFAULT_SPECIAL_TILES);
  
  // Try to fetch special tiles, fall back to defaults if API fails
  useEffect(() => {
    fetch("http://localhost:3000/specialTiles")
      .then((r) => r.json())
      .then((data) => setSpecialTiles(data))
      .catch((err) => {
        console.error("Error fetching data, using defaults", err);
        setSpecialTiles(DEFAULT_SPECIAL_TILES);
      });
  }, []);

  const getTileClass = (row, col) => {
    if (specialTiles.tripleWordSquares.some(([r, c]) => r === row && c === col)) return "board-cell triple-word";
    if (specialTiles.doubleWordSquares.some(([r, c]) => r === row && c === col)) return "board-cell double-word";
    if (specialTiles.tripleLetters.some(([r, c]) => r === row && c === col)) return "board-cell triple-letter";
    if (specialTiles.doubleLetters.some(([r, c]) => r === row && c === col)) return "board-cell double-letter";
    return "board-cell";
  };

  const getRandomLetters = (count) => {
    const LETTERS_POOL = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ".split("");
    return Array.from({ length: count }, () => LETTERS_POOL[Math.floor(Math.random() * LETTERS_POOL.length)]);
  };

  const [rackTiles, setRackTiles] = useState({
    1: getRandomLetters(7),
    2: getRandomLetters(7)
  });
  
  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  
  const [playerTurn, setPlayerTurn] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });

  const getLetterScore = (letter) => {
    return LETTER_SCORES[letter] || 0;
  };

  function moveTile(letter, position) {
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      newBoard[position.row][position.col] = { letter, player: playerTurn };
      return newBoard;
    });

    setRackTiles((prevRacks) => ({
      ...prevRacks,
      [playerTurn]: prevRacks[playerTurn].filter((tile) => tile !== letter)
    }));
  }

  function returnTilesToRack(letter) {
    setRackTiles((prevRacks) => ({
      ...prevRacks,
      [playerTurn]: [...prevRacks[playerTurn], letter]
    }));

    setBoard((prevBoard) =>
      prevBoard.map((row) => 
        row.map((tile) => 
          (tile?.letter === letter && tile?.player === playerTurn) ? null : tile
        )
      )
    );
  }

  function submitTurn() {
    // Calculate score for the current turn
    let turnScore = 0;
    
    // Check horizontal words
    for (let row = 0; row < BOARD_SIZE; row++) {
      let word = "";
      let wordMultiplier = 1;
      let wordScore = 0;
      let isNewWord = false;
      
      for (let col = 0; col < BOARD_SIZE; col++) {
        const tile = board[row][col];
        
        if (tile) {
          word += tile.letter;
          let letterScore = getLetterScore(tile.letter);
          
          // Apply letter multipliers
          const cellClass = getTileClass(row, col);
          if (cellClass.includes("triple-letter") && tile.player === playerTurn) {
            letterScore *= 3;
            isNewWord = true;
          } else if (cellClass.includes("double-letter") && tile.player === playerTurn) {
            letterScore *= 2;
            isNewWord = true;
          }
          
          // Track word multipliers
          if (cellClass.includes("triple-word") && tile.player === playerTurn) {
            wordMultiplier *= 3;
            isNewWord = true;
          } else if (cellClass.includes("double-word") && tile.player === playerTurn) {
            wordMultiplier *= 2;
            isNewWord = true;
          }
          
          wordScore += letterScore;
        } else if (word.length > 1) {
          // End of a word
          if (isNewWord) {
            turnScore += wordScore * wordMultiplier;
          }
          word = "";
          wordMultiplier = 1;
          wordScore = 0;
          isNewWord = false;
        } else {
          word = "";
          wordMultiplier = 1;
          wordScore = 0;
          isNewWord = false;
        }
      }
      
      // Check for word at the end of a row
      if (word.length > 1 && isNewWord) {
        turnScore += wordScore * wordMultiplier;
      }
    }
    
    // Similar logic for vertical words (omitted for brevity)
    
    setScores((prevScores) => ({
      ...prevScores,
      [playerTurn]: prevScores[playerTurn] + turnScore
    }));

    const nextPlayer = playerTurn === 1 ? 2 : 1;
    setPlayerTurn(nextPlayer);

    // Refill rack
    setRackTiles((prevRacks) => ({
      ...prevRacks,
      [playerTurn]: [...prevRacks[playerTurn], ...getRandomLetters(7 - prevRacks[playerTurn].length)]
    }));

    alert(`Player ${playerTurn} scored ${turnScore} points! Player ${nextPlayer}, it's your turn!`);
  }

  const renderCell = (row, col) => {
    const tile = board[row][col];
    const cellClass = `${getTileClass(row, col)} ${row === 7 && col === 7 ? 'center-star' : ''}`;
    
    return (
      <BoardTarget key={`${row}-${col}`} row={row} col={col} position={{ row, col }} moveTile={moveTile}>
        <div className={cellClass}>
          {tile ? (
            <TileSource 
              id={tile.letter} 
              letter={tile.letter} 
              position={{ row, col }} 
              removeTile={() => returnTilesToRack(tile.letter)} 
            />
          ) : (
            row === 7 && col === 7 ? "★" : ""
          )}
        </div>
      </BoardTarget>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="scrabble-game">
        <h1>Scrabble Game</h1>
        <div className="player-info">
          <div className={`player-score ${playerTurn === 1 ? 'active' : ''}`}>
            Player 1: {scores[1]}
          </div>
          <div className={`player-score ${playerTurn === 2 ? 'active' : ''}`}>
            Player 2: {scores[2]}
          </div>
        </div>
        
        <div className="game-board">
          {Array(BOARD_SIZE).fill().map((_, row) =>
            Array(BOARD_SIZE).fill().map((_, col) => renderCell(row, col))
          )}
        </div>
        
        <div className="player-controls">
          <h3>Player {playerTurn}'s Rack</h3>
          <div className="rack">
            {rackTiles[playerTurn].map((letter, index) => (
              <TileSource 
                key={`rack-${index}`} 
                id={letter} 
                letter={letter} 
                position={null}
                removeTile={null}
              />
            ))}
          </div>
          <button onClick={submitTurn} className="submit-button">Submit Turn</button>
        </div>
      </div>
    </DndProvider>
  );
};

export default ScrabbleBoard;
