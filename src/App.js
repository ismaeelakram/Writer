import React, { Component } from "react";
import "./App.css";

import Editor from "./components/Editor.jsx";

const { ipcRenderer } = window.require("electron");

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setState({ title: "Untitled - Writer" });
  }

  render() {
    return (
      <React.Fragment>
        <Editor />
      </React.Fragment>
    );
  }
}

export default App;
