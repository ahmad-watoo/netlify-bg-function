import React from "react";
// import logo from "./logo.svg";
import "./App.css";
import TriggerBackground from "./components/TriggerBackground";

function App() {
  return (
    <div className="App">
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <TriggerBackground />
      </div>
    </div>
  );
}

export default App;
