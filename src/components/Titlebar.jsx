import React, { Component } from "react";
import "./Titlebar.css";

const remote = window.require("electron").remote;

export default class Titlebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      maximized: false
    };

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
    if (win.isMaximized()) {
      this.setState({ maximized: false });
      win.restore();
    } else {
      this.setState({ maximized: true });
      win.maximize();
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
      <header id="titlebar" className={this.props.className}>
        <div id="drag-region">
          <div id="window-title">
            <span>{this.props.title}</span>
          </div>
          <div id="window-controls">
            <div class="button" id="min-button" onClick={this.handleMinimize}>
              <span>&#xE921;</span>
            </div>
            <div class="button" id="max-button" onClick={this.handleMaximize}>
              <span>
                {this.state.maximized ? <>&#xE923;</> : <>&#xE922;</>}
              </span>
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
