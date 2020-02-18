import Prism from "prismjs";
import React, { useState, useCallback, useMemo } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { Text, createEditor } from "slate";
import { withHistory } from "slate-history";
import { css } from "emotion";

import Titlebar from "./Titlebar.jsx";

const { ipcRenderer, remote } = window.require("electron");

// eslint-disable-next-line
Prism.languages.markdown=Prism.languages.extend("markup",{}),Prism.languages.insertBefore("markdown","prolog",{blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},code:[{pattern:/^(?: {4}|\t).+/m,alias:"keyword"},{pattern:/``.+?``|`[^`\n]+`/,alias:"keyword"}],title:[{pattern:/\w+.*(?:\r?\n|\r)(?:==+|--+)/,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#+.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^\*\*|^__|\*\*$|__$/}},italic:{pattern:/(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*_]|[*_]$/}},url:{pattern:/!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,inside:{variable:{pattern:/(!?\[)[^\]]+(?=\]$)/,lookbehind:!0},string:{pattern:/"(?:\\.|[^"\\])*"(?=\)$)/}}}}),Prism.languages.markdown.bold.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.italic.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.bold.inside.italic=Prism.util.clone(Prism.languages.markdown.italic),Prism.languages.markdown.italic.inside.bold=Prism.util.clone(Prism.languages.markdown.bold); // prettier-ignore

const Editor = () => {
  const [value, setValue] = useState(initialValue);
  const [title, setTitle] = useState("Untitled - Writer");
  const [path, setPath] = useState("");
  const [taskBarDisappear, settaskBarDisappear] = useState(false);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const decorate = useCallback(([node, path]) => {
    const ranges = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const getLength = token => {
      if (typeof token === "string") {
        return token.length;
      } else if (typeof token.content === "string") {
        return token.content.length;
      } else {
        return token.content.reduce((l, t) => l + getLength(t), 0);
      }
    };

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;

    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;

      if (typeof token !== "string") {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end }
        });
      }

      start = end;
    }

    return ranges;
  }, []);

  const openFile = e => {
    let file = ipcRenderer.sendSync("open-file");
    setValue([
      {
        children: [
          {
            text: file[2]
          }
        ]
      }
    ]);
    setTitle(`${file[1]} - Writer`);
    setPath(file[0]);
  };

  const saveFile = e => {
    try {
      if (path === "") {
        try {
          let newFile = ipcRenderer.sendSync("save-new-file", value);
          setTitle(newFile + " - Writer");
        } catch {}
      } else {
        ipcRenderer.send("save-file", [path, value]);
      }
    } catch {}
  };

  return (
    <React.Fragment>
      <Titlebar
        title={title}
        className={"dark " + (taskBarDisappear ? "disappear" : "")}
        backgroundColor="#222"
      />
      <div className="app-container">
        <ul
          className={"menu " + (taskBarDisappear ? "disappear" : "")}
          onMouseOver={() => {
            settaskBarDisappear(false);
          }}
        >
          <li className={"menu-item " + (taskBarDisappear ? "disappear" : "")}>
            <span onClick={() => openFile()}>Open</span>
          </li>
          <li className={"menu-item " + (taskBarDisappear ? "disappear" : "")}>
            <span onClick={() => saveFile()}>Save</span>
          </li>
        </ul>
        <div className="textView">
          <Slate
            editor={editor}
            value={value}
            onChange={value => {
              settaskBarDisappear(true);
              setValue(value);
            }}
          >
            <Editable
              className={
                "editor " +
                (remote.BrowserWindow.getFocusedWindow().isMaximized()
                  ? "maxheight100pc"
                  : "maxheight600")
              }
              decorate={decorate}
              renderLeaf={renderLeaf}
              placeholder="Start writing!"
              spellCheck={true}
              autoCorrect={true}
              autoFocus={true}
            />
          </Slate>
        </div>
      </div>
    </React.Fragment>
  );
};

const Leaf = ({ attributes, children, leaf }) => {
  return (
    <span
      {...attributes}
      className={css`
        font-weight: ${leaf.bold && "bold"};
        font-style: ${leaf.italic && "italic"};
        text-decoration: ${leaf.underlined && "underline"};
        ${leaf.title &&
          css`
            display: inline-block;
            font-weight: bold;
            font-size: 30px;
            margin: 20px 0 10px 0;
          `}
        ${leaf.list &&
          css`
            padding-left: 10px;
            font-size: 20px;
            line-height: 10px;
          `}
        ${leaf.hr &&
          css`
            display: block;
            text-align: center;
            border-bottom: 2px solid #141414;
          `}
        ${leaf.blockquote &&
          css`
            display: inline-block;
            border-left: 2px solid #141414;
            padding-left: 10px;
            color: #aaa;
          `}
        ${leaf.code &&
          css`
            background-color: #141414;
            border-radius: 3px;
            padding: 3px;
          `}
      `}
    >
      {children}
    </span>
  );
};

const initialValue = [
  {
    children: [
      {
        text: ""
      }
    ]
  }
];

export default Editor;
