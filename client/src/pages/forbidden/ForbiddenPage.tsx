import React from "react";

const ForbiddenPage: React.FC = () => {
  return (
    <div style={{ padding: 64, textAlign: "center" }}>
      <h1 style={{ fontSize: 48, color: "#ff4d4f" }}>403</h1>
      <p>You do not have permission to access this page.</p>
    </div>
  );
};

export default ForbiddenPage;
