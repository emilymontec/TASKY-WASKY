const random = (min, max) =>
  Math.random() * (max - min) + min;

function TaskCard({ task, onToggle, onDelete }) {
  const top = random(0, 60);
  const left = random(0, 80);
  const duration = random(6, 12);

  return (
    <div
      onClick={() => onToggle(task)}
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        padding: "12px 16px",
        background: task.status === "done" ? "#d1ffd6" : "#fff",
        borderRadius: 12,
        boxShadow: "0 8px 20px rgba(0,0,0,.15)",
        cursor: "pointer",
        animation: `float ${duration}s ease-in-out infinite`
      }}
    >
      <strong>{task.title}</strong>

      <div style={{ marginTop: 6, textAlign: "right" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          ❌
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
