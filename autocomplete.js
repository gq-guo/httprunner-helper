"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownAutoCompleteProvider = void 0;
const vscode = __importStar(require("vscode"));
class MarkdownAutoCompleteProvider {
    provideCompletionItems(document, position, token, context) {
        const char = document.lineAt(position.line).text.substr(position.character - 1, position.character);
        if (char != '>' && char != '》')
            return;
        const range = getWordRange(document, position);
        const currentWord = document.getText(range);
        let result = [];
        Object.keys(RULES).forEach(regex => {
            let match = currentWord.match(regex);
            if (match) {
                console.log('matched');
                result = result.concat(RULES[regex](match, range));
            }
        });
        return result ? Promise.resolve(result) : null;
    }
}
exports.MarkdownAutoCompleteProvider = MarkdownAutoCompleteProvider;
function getWordRange(document, position) {
    let pos = position.character;
    let text = document.lineAt(position.line).text;
    while (pos > 0 && text.charAt(pos) != ' ')
        pos--;
    let firstIndex = text.charAt(pos) == ' ' ? pos + 1 : pos;
    return new vscode.Range(new vscode.Position(position.line, firstIndex), position);
}
const style = (match, range) => {
    const titleMap = { 'b': '粗体 b', 'i': '斜体 i', 'bi': '粗斜体 bi', 'd': '删除线 d', 'h': '高亮块 h' };
    const optMap = { 'b': '**', 'i': '*', 'bi': '***', 'd': '~~', 'h': '`' };
    let completionList = [];
    Object.keys(titleMap).forEach(key => {
        let item = new vscode.CompletionItem(titleMap[key], vscode.CompletionItemKind.Snippet);
        let text = optMap[key] + match[1] + optMap[key];
        item.documentation = new vscode.MarkdownString('## 插入样式\n\n' + text);
        item.detail = '样式转换';
        item.insertText = text;
        item.filterText = key;
        item.additionalTextEdits = [vscode.TextEdit.delete(range)];
        completionList.push(item);
        if (range.start.character > 0) {
            let rangeWithSpace = new vscode.Range(new vscode.Position(range.start.line, range.start.character - 1), range.end);
            if (vscode.window.activeTextEditor.document.getText(rangeWithSpace).startsWith(' ')) {
                let itemNoSpace = new vscode.CompletionItem(titleMap[key] + ' no-space', vscode.CompletionItemKind.Snippet);
                itemNoSpace.documentation = new vscode.MarkdownString('## 插入样式\n\n' + text);
                itemNoSpace.detail = '样式转换';
                itemNoSpace.insertText = text;
                itemNoSpace.filterText = key + 'nospace';
                itemNoSpace.additionalTextEdits = [vscode.TextEdit.delete(rangeWithSpace)];
                completionList.push(itemNoSpace);
            }
        }
    });
    return completionList;
};
const list = (match, range) => {
    const titleMap = { 'u': '无序列表 unorderd list', 'o': '有序列表 orderd list' };
    const filterMap = { 'u': 'ul', 'o': 'ol' };
    const optMap = { 'u': '- ' };
    let completionList = [];
    let count = parseInt(match[1]);
    Object.keys(titleMap).forEach(key => {
        let loopVar = 1;
        let item = new vscode.CompletionItem(titleMap[key], vscode.CompletionItemKind.Snippet);
        item.detail = '列表生成';
        let text = '';
        while (loopVar <= count) {
            if (key == 'o') {
                text += loopVar + '. ' + '${' + loopVar + ':item' + loopVar + '}';
            }
            else
                text += ((optMap[key]) + '${' + loopVar + ':item' + loopVar + '}');
            if (loopVar++ != count)
                text += '\n';
        }
        console.log(text);
        item.documentation = '生成 ' + count + ' 个' + titleMap[key];
        item.filterText = filterMap[key];
        item.insertText = new vscode.SnippetString(text);
        item.additionalTextEdits = [vscode.TextEdit.delete(range)];
        completionList.push(item);
    });
    return completionList;
};
const table = (match, range) => {
    const filterMap = { 'l': 'lt', 'r': 'rt' };
    const titleMap = { 'l': '左对齐表格 left table', 'c': '居中对齐表格 center table', 'r': '右对齐表格 right table' };
    const optMap = { 'l': ':-', 'c': ':-:', 'r': '-:' };
    let completionList = [];
    let m = parseInt(match[1]);
    let n = parseInt(match[2]);
    Object.keys(titleMap).forEach(key => {
        let item = new vscode.CompletionItem(titleMap[key], vscode.CompletionItemKind.Snippet);
        item.detail = '表格生成';
        item.documentation = '生成' + m + '*' + n + ' 表格';
        let text = '';
        for (let N = 1; N <= n; N++) {
            text += ("${" + N + ":TITLE" + N + "}");
            if (N != n)
                text += "|";
        }
        let count = n + 1;
        text += ("\n" + ((optMap[key]) + "|").repeat(n - 1) + (optMap[key]) + "\n");
        for (let M = 1; M <= m; M++) {
            for (let N = 1; N <= n; N++) {
                text += '${' + (count++) + ':ITEM' + M + ',' + N + '}';
                if (n != N)
                    text += '|';
            }
            text += '\n';
        }
        item.filterText = filterMap[key];
        item.insertText = new vscode.SnippetString(text);
        item.additionalTextEdits = [vscode.TextEdit.delete(range)];
        completionList.push(item);
    });
    return completionList;
};
const RULES = {
    '(\\d+)[\\>|》]': list,
    '(\\d+),(\\d+)[\\>|》]': table,
    '(.*?)[\\>|》]': style
};
//# sourceMappingURL=autocomplete.js.map