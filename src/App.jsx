import React, { useEffect } from "react";
import "./assets/styles/Main.scss";
import { Route, Routes } from "react-router-dom";
import { routes } from "./helpers/routes";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="wrapper">
      <Navbar />
      <Routes>
        {routes.map((item) => (
          <Route path={item.path} element={item.element} key={item.path} />
        ))}
      </Routes>
    </div>
  );
}

export default App;
