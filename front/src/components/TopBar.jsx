function TopBar({ tasks }) {
  const pending = tasks.filter(t => t.status === "active").length;
  const done = tasks.filter(t => t.status === "done").length;
  const hidden = tasks.filter(t => t.status === "hidden").length;

  return (
    <div className="top-bar">
      <div className="stat">🎈 Pendientes <strong>{pending}</strong></div>
      <div className="stat">💥 Completadas <strong>{done}</strong></div>
      <div className="stat">🙈 Pospuestas <strong>{hidden}</strong></div>
    </div>
  );
}

export default TopBar;
