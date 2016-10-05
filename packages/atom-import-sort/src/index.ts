import "atom";

import {allowUnsafeEval, allowUnsafeNewFunction} from "loophole";
import {dirname, extname} from "path";
import sortImports, {ICodeChange} from "import-sort";

import {getConfig} from "import-sort-config";

// tslint:disable-next-line
const CompositeDisposable = require("atom").CompositeDisposable;

export class Plugin {
  public bufferWillSaveDisposables?;
  public editorObserverDisposable?;

  public config = {
    sortOnSave: {
      title: "Sort on save",
      description: "Automatically sort your Javascript files when you save them.",
      type: "boolean",
      default: false,
    },
  };

  public activate(state) {
    (atom.config as any).observe("atom-import-sort.sortOnSave", (sortOnSave: boolean) => {
      if (sortOnSave) {
        this.observeEditors();
      } else {
        this.unobserveEditors();
      }
    });

    // tslint:disable-next-line
    atom.commands.add(
      'atom-text-editor[data-grammar~="source"][data-grammar~="js"],atom-text-editor[data-grammar~="source"][data-grammar~="ts"]',
      "import-sort:sort",
      () => this.sortCurrentEditor(),
    );
  }

  public deactivate() {
    this.unobserveEditors();
  }

  private observeEditors() {
    if (!this.editorObserverDisposable) {
      this.bufferWillSaveDisposables = new CompositeDisposable();

      this.editorObserverDisposable = atom.workspace.observeTextEditors(editor => {
        this.bufferWillSaveDisposables.add(editor.getBuffer().onWillSave(() => {
          this.sortEditor(editor, true);
        }));
      });
    }
  }

  private unobserveEditors() {
    if (this.editorObserverDisposable) {
      this.bufferWillSaveDisposables.dispose();

      this.editorObserverDisposable.dispose();
      this.editorObserverDisposable = null;
    }
  }

  private sortEditor(editor, notifyErrors = false) {
    const scopeDescriptor = editor.getRootScopeDescriptor();

    if (!scopeDescriptor) {
      return;
    }

    const scope = scopeDescriptor.scopes[0];

    let extension: string | undefined;
    let directory: string | undefined;

    const path = editor.getPath();

    if (path) {
      const rawExtension = extname(path);

      if (rawExtension.indexOf(".") !== -1) {
        extension = rawExtension;
      }

      directory = dirname(path);
    } else {
      // TODO: Refactor the following if statements

      if (scope.split(".").some(part => part === "js")) {
        extension = ".js";
      }

      if (scope.split(".").some(part => part === "ts")) {
        extension = ".ts";
      }

      directory = (atom.project as any).getPaths()[0];
    }

    if (!extension) {
      return;
    }

    try {
      const sortConfig = getConfig(extension, directory);

      if (!sortConfig) {
        if (!notifyErrors) {
          atom.notifications.addWarning(`No configuration found for this file type`);
        }

        return;
      }

      const {parser, style} = sortConfig;

      if (!parser || !style) {
        if (!parser && !notifyErrors) {
            atom.notifications.addWarning(`Parser '${sortConfig.config.parser}' not found`);
        }

        if (!style && !notifyErrors) {
          atom.notifications.addWarning(`Style '${sortConfig.config.style}' not found`);
        }

        return;
      }

      const cursor = editor.getCursorBufferPosition();
      const unsorted = editor.getText();

      let changes: Array<ICodeChange>;

      allowUnsafeNewFunction(() => {
        allowUnsafeEval(() => {
          changes = sortImports(unsorted, parser!, style!).changes;
        });
      });

      (editor as AtomCore.IEditor).transact(() => {
        for (const change of changes) {
          const start = editor.buffer.positionForCharacterIndex(change.start);
          const end = editor.buffer.positionForCharacterIndex(change.end);

          editor.setTextInBufferRange([start, end], change.code);
        }
      });

      editor.setCursorBufferPosition(cursor);
    } catch (e) {
      if (!notifyErrors) {
        atom.notifications.addWarning(`Failed to sort imports:\n${e.toString()}`);
      }
    }
  }

  private sortCurrentEditor() {
    const editor = atom.workspace.getActiveTextEditor();

    if (editor) {
      this.sortEditor(editor);
    }
  }
}

module.exports = new Plugin();
