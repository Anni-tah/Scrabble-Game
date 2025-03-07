import { useDrop } from "react-dnd";
function BoardTarget (props){
   const [{isOver}, drop]=useDrop({
    accept: "TILE",
    drop: function (item) {
      props.moveTile(item.id, props.position);
    },
    collect: function(monitor){
        return{
            isOver: monitor.isOver(),
        };
    },
   });
    return (
        <div ref={drop} style={{backgroundColor: isOver ? "lightblue": "white"}}>
            {props.children}
        </div>

    );
}
export default BoardTarget;