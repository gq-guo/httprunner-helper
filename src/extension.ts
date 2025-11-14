import * as vscode from 'vscode';
import { PathCompletionProvider } from './providers/pathCompletionProvider';
import { FunctionCompletionProvider } from './providers/functionCompletionProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('HttpRunner Helper is now active!');

    // 注册路径补全提供者（用于 apis/, data/ 等目录）
    // 支持所有文件类型，支持多个触发字符：/, a-z, A-Z
    const pathCompletionProvider = new PathCompletionProvider();
    const pathTriggerChars = '/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file' }, // 移除 language 限制，支持所有文件类型
            pathCompletionProvider,
            ...pathTriggerChars
        )
    );

    // 注册函数补全提供者（用于 debugtalk.py 中的方法）
    // 支持所有文件类型
    const functionCompletionProvider = new FunctionCompletionProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file' }, // 移除 language 限制，支持所有文件类型
            functionCompletionProvider,
            '$'
        )
    );
}

export function deactivate() {}
