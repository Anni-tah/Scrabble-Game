import React, { useState } from "react";
import "./Scrabbleboard.css";
import { HTML5Backend } from "react-dnd-html5-backend";
import TileSource from "./components/TileSource";
import BoardTarget from "./components/BoardTarget";
import { DndProvider } from "react-dnd";

const BOARD_SIZE = 15;

const SPECIAL_TILES = {
  tripleWordSquares: [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]],
  doubleWordSquares: [[1, 1], [2, 2], [3, 3], [4, 4], [10, 10], [11, 11], [12, 12], [13, 13],
                      [1, 13], [2, 12], [3, 11], [4, 10], [10, 4], [11, 3], [12, 2], [13, 1]],
  tripleLetters: [[5, 1], [9, 1], [1, 5], [5, 5], [9, 5], [13, 5],
                  [1, 9], [5, 9], [9, 9], [13, 9], [5, 13], [9, 13]],
  doubleLetters: [[3, 0], [11, 0], [6, 2], [8, 2], [0, 3], [7, 3], [14, 3],
                  [2, 6], [6, 6], [8, 6], [12, 6], [3, 7], [11, 7],
                  [2, 8], [6, 8], [8, 8], [12, 8], [0, 11], [7, 11], [14, 11],
                  [6, 12], [8, 12], [3, 14], [11, 14]]
};

const getTileClass = (row, col) => {
  if (SPECIAL_TILES.tripleWordSquares.some(([r, c]) => r === row && c === col)) return "triple-word";
  if (SPECIAL_TILES.doubleWordSquares.some(([r, c]) => r === row && c === col)) return "double-word";
  if (SPECIAL_TILES.tripleLetters.some(([r, c]) => r === row && c === col)) return "triple-letter";
  if (SPECIAL_TILES.doubleLetters.some(([r, c]) => r === row && c === col)) return "double-letter";
  return "board-cell"; // Default tile
};

const ScrabbleBoard = () => {
  // TODO: Implement rack tile management
  // eslint-disable-next-line no-unused-vars
  const [rackTiles, setRackTiles] = useState(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  // TODO: Implement board state management
  // eslint-disable-next-line no-unused-vars
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
  
  // Add letter score function
  const getLetterScore = (letter) => {
    const scores = {
      'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
      'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
      'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
    };
    return scores[letter] || 0;
  };

  // move tile to a board
  function moveTile(id, position){
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      const letter = rackTiles.find(tile => tile === id);

      if (!letter) return prevBoard;  
      newBoard[position.row][position.col] = { id, letter };
      return newBoard;

  });
  setRackTiles((prevTiles) => prevTiles.filter((tile) => tile !== id));
  }

  function returnTilesToRack(tileId){
    setRackTiles((prevTiles)=>[...prevTiles, tileId]);
    setBoard((prevBoard)=>
      prevBoard.map((row)=>row.map((tile)=>(tile?.id===tileId? null: tile)))

    );
  }

  const renderCell = (row, col) => {
    const tile = board[row][col];
    return (
      <BoardTarget key={`${row} - ${col}`} row={row} col={col} position={{row,col}} moveTile={moveTile}>
         <div className={`board-cell ${getTileClass(row, col)} ${row === 7 && col === 7 ? 'center-star' : ''}`}>
          {tile ? <TileSource id={tile.id} letter={tile.letter} position={{row, col}} removeTile={()=>returnTilesToRack(tile.id)}/>: 
            row===7 && col ===7 ? "★" : ""
          }
         </div>
         </BoardTarget>
    );
  }


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
          {rackTiles.map((letter, index) => (
             <TileSource key={index} id={letter} letter={letter} position={null} removeTile={()=>returnTilesToRack(letter)}>
              <div className="letter-tile">
              <span className="tile-score">{getLetterScore(letter)}</span>
              </div>
            
             </TileSource>
          ))}
        </div>
        <div className="player-score active">Player 1: 0</div>
        <div className="player-score">Player 2: 0</div>
      </div>
    </div>
    </DndProvider>
  );
};

export default ScrabbleBoard; 