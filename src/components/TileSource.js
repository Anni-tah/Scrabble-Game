import { useDrag } from "react-dnd";

function TileSource(props){
   const [{isDragging}, drag] =useDrag({
        type: "TILE",
        item:{id:props.id, letter:props.letter, position:props.position},
        end:(item, monitor)=>{
            if(!monitor.didDrop() && props.removeTile){
                props.removeTile(item.id); //moves the tile back to the rack if dropped outside
            }
        },
        collect:(monitor)=>({
                isDragging:monitor.isDragging(),
        }),
});
return(
    <div ref={drag} style={{opacity:isDragging ? 0.5 : 1}}>
        {props.letter}

    </div>
   
)
}
export default TileSource;