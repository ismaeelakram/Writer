import React, { Component } from "react";
import Editor from "draft-js-plugins-editor";
import { EditorState, ContentState } from "draft-js";
import Prism from "prismjs";
import * as createLiveMarkdownPlugin from "draft-js-live-markdown-plugin";
import createPrismPlugin from "draft-js-prism-plugin";
import "./App.css";
import Titlebar from "./components/Titlebar.jsx";

const { ipcRenderer } = window.require("electron");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      title: "Code.js",
      editorState: EditorState.createEmpty(),
      plugins: [createLiveMarkdownPlugin(), createPrismPlugin({ prism: Prism })]
    };
    this.onChange = editorState => {
      this.setState({ editorState });
    };
    this.focusEditor = () => {
      if (this.editor) {
        this.editor.focus();
      }
    };

    this.save = this.save.bind(this);
    this.open = this.open.bind(this);
  }

  componentDidMount() {
    this.focusEditor();

    this.setState({ title: "Untitled - Code.js" });
  }

  open(e) {
    try {
      let file = ipcRenderer.sendSync("open-file");
      this.setState({
        file: file,
        editorState: EditorState.createWithContent(
          ContentState.createFromText(file[2])
        ),
        title: `${file[1]} - Code.js`
      });
    } catch {}
  }

  save(e) {
    try {
      ipcRenderer.send("save-file", [
        this.state.file[0],
        this.state.editorState.getCurrentContent().getPlainText()
      ]);
    } catch {}
  }

  render() {
    return (
      <div className="App" onClick={this.focusEditor}>
        <Titlebar title={this.state.title} backgroundColor="#222" />
        <div className="app-container">
          <ul className="menu">
            <li className="menu-item">
              <span onClick={this.open}>Open</span>
            </li>
            <li className="menu-item">
              <span onClick={this.save}>Save</span>
            </li>
          </ul>
          <div className="textView">
            <Editor
              ref={this.setEditor}
              editorState={this.state.editorState}
              onChange={this.onChange}
              plugins={this.state.plugins}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
