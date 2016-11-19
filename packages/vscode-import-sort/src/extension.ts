'use strict';
import * as vscode from 'vscode';
import {allowUnsafeEval} from 'loophole';
import {allowUnsafeNewFunction} from 'loophole';
import {dirname, extname} from "path";
import sortImports, {ICodeChange, ISortResult} from "import-sort";
import {getConfig} from "import-sort-config";
import {shallSortOnSave, shallShowNotifications} from './configuration';

function sortCurrentEditor() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        sortEditor(editor);
    } else {
       info("No File open!");
    }
}

function sortEditor(editor : vscode.TextEditor) {
    const language = editor.document.languageId;

    if (!language || language == 'plain') {
        return;
    }

    let extension : string | undefined;
    let directory : string | undefined;

    const path = editor.document.fileName;

    // The file is existing on disk.
    if (path) {
        const rawExtension = extname(path);

        if (rawExtension.indexOf(".") !== -1) {
            extension = rawExtension;
        }

        directory = dirname(path);
    }

    if (editor.document.isUntitled) {
        // Unsaved File existing in Buffer only
        if (language === 'typescript') {
            extension = ".ts";
        }

        if (language === 'javascript') {
            extension = ".js";
        }

        // TODO root path?
        directory = vscode.workspace.rootPath;
    }

    // File Type not supported.
    if (!extension) {
        return;
    }

    try {
        const sortConfig = getConfig(extension, directory);

        if (!sortConfig) {
            error("No Sort config found.")
            return;
        }

        const {parser, style} = sortConfig;

        if (!parser || !style) {
            if (!parser) {
                warn(`Parser '${sortConfig.config.parser}' not found`);
            }

            if (!style && shallShowNotifications()) {
                warn(`Style '${sortConfig.config.style}' not found`);
            }

            return;
        }

        // nth-character n file.
        const cursorPos = editor.selection.active.character;
        const unsorted = editor.document.getText();

        let changes : Array <ICodeChange>;
        let sortResult : ISortResult;

        allowUnsafeNewFunction(() => {
            allowUnsafeEval(() => {
                sortResult = sortImports(unsorted, parser !, style !);
                changes = sortResult.changes;
            });
        });

        // TODO: This is inefficient. Migrate to ISortResult.changes soon!
        editor.edit((builder : vscode.TextEditorEdit) => {
            const range : vscode.Range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(unsorted.length));
            builder.replace(range, sortResult.code);
        });
    } catch (e) {
        warn(`Failed to sort imports:\n${e.toString()}`);
    }
}

// Hook to lifecycle.
export function activate(context : vscode.ExtensionContext) {
    vscode.commands.registerCommand('extension.importSort', () => {
            sortCurrentEditor();
    });
    vscode.workspace.onWillSaveTextDocument((e : vscode.TextDocumentWillSaveEvent) => {
      if (shallSortOnSave()) {
          info("Sorting on save...");
          sortCurrentEditor();
      }
    });
}

export function deactivate() {}

function warn(str : string) {
    if(shallShowNotifications()) {
      vscode.window.showWarningMessage(str);
    }
}

function error(str : string) {
    if(shallShowNotifications()) {
      vscode.window.showErrorMessage(str);
    }
}

function info(msg : string) {
    if(shallShowNotifications()) {
      vscode.window.showInformationMessage(msg);
    }
}