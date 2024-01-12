import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";


ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
