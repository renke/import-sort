import * as vscode from 'vscode';

export interface Config {
    sortOnSave: Boolean;
}

export function shallSortOnSave() {
    const val = vscode.workspace.getConfiguration('importSort')['sortOnSave'];
    if(typeof val !== 'undefined' && val === false) {
        return false;
    }
    return true;
}

export function shallShowNotifications() {
    const val = vscode.workspace.getConfiguration('importSort')['showNotifications'];
    return val ? val : false;
}