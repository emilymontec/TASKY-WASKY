import TaskCard from "./TaskCard";

function Board({ tasks, onToggle, onDelete }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#f0f0ff",
        borderRadius: 16,
        overflow: "hidden"
      }}
    >
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default Board;
