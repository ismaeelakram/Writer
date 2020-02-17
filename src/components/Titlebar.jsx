import React, { Component } from "react";
import "./Titlebar.css";

const remote = window.require("electron").remote;

export default class Titlebar extends Component {
  constructor(props) {
    super(props);

    this.handleClose = this.handleClose.bind(this);
    this.handleMaximize = this.handleMaximize.bind(this);
    this.handleMinimize = this.handleMinimize.bind(this);
    this.handleRestore = this.handleRestore.bind(this);
  }

  handleClose() {
    remote.getCurrentWindow().close();
  }

  handleMaximize() {
    const win = remote.getCurrentWindow();
    win.maximize();
    if (win.isMaximized()) {
      document.body.classList.add("maximized");
    } else {
      document.body.classList.remove("maximized");
    }
  }

  handleMinimize() {
    remote.getCurrentWindow().minimize();
  }

  handleRestore() {
    remote.getCurrentWindow().unmaximize();
  }

  render() {
    return (
      <header id="titlebar" className="dark">
        <div id="drag-region">
          <div id="window-title">
            <span>{this.props.title}</span>
          </div>
          <div id="window-controls">
            <div class="button" id="min-button" onClick={this.handleMinimize}>
              <span>&#xE921;</span>
            </div>
            <div class="button" id="max-button" onClick={this.handleMaximize}>
              <span>&#xE922;</span>
            </div>
            <div
              class="button"
              id="restore-button"
              onClick={this.handleRestore}
            >
              <span>&#xE923;</span>
            </div>
            <div class="button" id="close-button" onClick={this.handleClose}>
              <span>&#xE8BB;</span>
            </div>
          </div>
        </div>
      </header>
    );
  }
}
