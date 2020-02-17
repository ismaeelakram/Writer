import React, { Component } from "react";
import "./App.css";

import Editor from "./components/Editor.jsx";

const { ipcRenderer } = window.require("electron");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      title: "Writer"
    };

    this.save = this.save.bind(this);
    this.open = this.open.bind(this);
  }

  componentDidMount() {
    this.setState({ title: "Untitled - Writer" });
  }

  open(e) {
    try {
      let file = ipcRenderer.sendSync("open-file");
      this.setState({
        file: file,
        title: `${file[1]} - Writer`
      });
    } catch {}
  }

  save(e) {
    try {
      ipcRenderer.send("save-file", [
        this.state.file[0] // this.state.editorState.getCurrentContent().getPlainText()
      ]);
    } catch {}
  }

  render() {
    return (
      <div className="App" onClick={this.focusEditor}>
        <Editor />
      </div>
    );
  }
}

export default App;
