import React, { Suspense } from "react";
import Router from "./router";
import "./i18n";
import Loading from "./components/Loading";

const App: React.FC = () => {
  return (
    <Suspense fallback={<Loading fullPage />}>
      <Router />
    </Suspense>
  );
};

export default App;
