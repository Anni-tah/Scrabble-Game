import React from "react";
import { useDrop } from "react-dnd";

const BoardTarget = ({ children, row, col, position, moveTile }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "TILE",
    drop: (item) => {
      moveTile(item.id, position);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  return (
    <div 
      ref={drop} 
      style={{ 
        position: 'relative',
        opacity: isOver ? 0.8 : 1,
        backgroundColor: isOver && canDrop ? 'rgba(0, 255, 0, 0.2)' : 'transparent'
      }}
    >
      {children}
    </div>
  );
};

export default BoardTarget;
