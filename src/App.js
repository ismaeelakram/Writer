import React, { Component } from "react";
import "./App.css";

import Editor from "./components/Editor.jsx";

class App extends Component {
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
