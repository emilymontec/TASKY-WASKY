import TaskBubble from "./TaskBubble";

function World({ tasks, onToggle }) {
  return (
    <div className="world">
      {tasks.map(task => (
        <TaskBubble
          key={task.id}
          task={task}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export default World;
