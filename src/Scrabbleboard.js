import React, { useState, useEffect } from "react";
import "./Scrabbleboard.css";
import { HTML5Backend } from "react-dnd-html5-backend";
import TileSource from "./components/TileSource";
import BoardTarget from "./components/BoardTarget";
import { DndProvider } from "react-dnd";
const baseUrl="http://localhost:5000/specialTiles"

const BOARD_SIZE = 15;


const ScrabbleBoard = () => {
  const [SPECIAL_TILES, setSpecialTiles]= useState(null);

  useEffect(()=>{
    fetch(baseUrl)
    .then((r)=>r.json())
    .then((data)=>setSpecialTiles(data))
    .catch((err)=>console.error("Error fetching data", err));
  
  }, []);

const getTileClass = (row, col) => {
  if (!SPECIAL_TILES) return "board-cell";
  if (SPECIAL_TILES.tripleWordSquares.some(([r, c]) => r === row && c === col)) return "triple-word";
  if (SPECIAL_TILES.doubleWordSquares.some(([r, c]) => r === row && c === col)) return "double-word";
  if (SPECIAL_TILES.tripleLetters.some(([r, c]) => r === row && c === col)) return "triple-letter";
  if (SPECIAL_TILES.doubleLetters.some(([r, c]) => r === row && c === col)) return "double-letter";
  return "board-cell";
};

const getRandomLetters = (count) => {
  const LETTERS_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return Array.from({ length: count }, () => LETTERS_POOL[Math.floor(Math.random() * LETTERS_POOL.length)]);
};

  

  const [rackTiles, setRackTiles] = useState({
    1: getRandomLetters(7),
    2: getRandomLetters(7)
  });
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
  const [playerTurn, setPlayerTurn] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });

  const getLetterScore = (letter) => {
    const scores = {
      'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
      'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
      'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
    };
    return scores[letter] || 0;
  };

  function moveTile(id, position) {
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      const letter = rackTiles[playerTurn].find(tile => tile === id);
      if (!letter) return prevBoard;
      newBoard[position.row][position.col] = { id, letter, player: playerTurn };
      return newBoard;
    });

    setRackTiles((prevRacks) => ({
      ...prevRacks,
      [playerTurn]: prevRacks[playerTurn].filter((tile) => tile !== id)
    }));
  }

  function returnTilesToRack(tileId) {
    setRackTiles((prevRacks) => ({
      ...prevRacks,
      [playerTurn]: [...prevRacks[playerTurn], tileId]
    }));

    setBoard((prevBoard) =>
      prevBoard.map((row) => row.map((tile) => (tile?.id === tileId ? null : tile)))
    );
  }

  function submitTurn() {
    let score = 0;
    board.forEach(row => {
      row.forEach(tile => {
        if (tile && tile.player === playerTurn) {
          score += getLetterScore(tile.letter);
        }
      });
    });

    setScores((prevScores) => ({
      ...prevScores,
      [playerTurn]: prevScores[playerTurn] + score
    }));

    const nextPlayer = playerTurn === 1 ? 2 : 1;
    setPlayerTurn(nextPlayer);

    setRackTiles((prevRacks) => ({
      ...prevRacks,
      [nextPlayer]: [...prevRacks[nextPlayer], ...getRandomLetters(7 - prevRacks[nextPlayer].length)]
    }));

    alert(`Player ${nextPlayer}, it's your turn!`);
  }

  const renderCell = (row, col) => {
    const tile = board[row][col];
    return (
      <BoardTarget key={`${row}-${col}`} row={row} col={col} position={{ row, col }} moveTile={moveTile}>
        <div className={`board-cell ${getTileClass(row, col)} ${row === 7 && col === 7 ? 'center-star' : ''}`}>
          {tile ? (
            <TileSource id={tile.id} letter={tile.letter} position={{ row, col }} removeTile={() => returnTilesToRack(tile.id)} />
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
        <div className="game-board">
          {[...Array(BOARD_SIZE)].map((_, row) =>
            [...Array(BOARD_SIZE)].map((_, col) => renderCell(row, col))
          )}
        </div>
        <div className="score-keeper">
          <div className="rack">
            {rackTiles[playerTurn].map((letter, index) => (
              <TileSource key={index} id={letter} letter={letter} position={null} removeTile={() => returnTilesToRack(letter)}>
                <div className="letter-tile">
                  <span className="tile-score">{getLetterScore(letter)}</span>
                </div>
              </TileSource>
            ))}
          </div>
          <div className="player-score">Player 1: {scores[1]}</div>
          <div className="player-score">Player 2: {scores[2]}</div>
          <button onClick={submitTurn}>Submit Turn</button>
        </div>
      </div>
    </DndProvider>
  );
};

export default ScrabbleBoard;
