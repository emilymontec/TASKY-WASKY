import { useRef, useState } from "react";

const rand = (min, max) =>
  Math.random() * (max - min) + min;

function TaskBubble({ task, onToggle }) {
  const bubbleRef = useRef(null);

  const [pos, setPos] = useState({
    x: rand(10, 80),
    y: rand(10, 80)
  });

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const startDrag = (e) => {
    dragging.current = true;

    const rect = bubbleRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    offset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const onDrag = (e) => {
    if (!dragging.current) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - offset.current.x) / window.innerWidth) * 100;
    const y = ((clientY - offset.current.y) / window.innerHeight) * 100;

    setPos({ x, y });
  };

  const endDrag = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={bubbleRef}
      className={`bubble ${task.status === "done" ? "done" : ""}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        animationDuration: `${rand(6, 12)}s`
      }}
      onMouseDown={startDrag}
      onMouseMove={onDrag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={startDrag}
      onTouchMove={onDrag}
      onTouchEnd={endDrag}
      onClick={() => onToggle(task)}
    >
      <div className="emoji">
        {task.status === "done" ? "💥" : "😊"}
      </div>
      <span>{task.title}</span>
    </div>
  );
}

export default TaskBubble;
