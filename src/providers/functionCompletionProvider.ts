import * as vscode from 'vscode';
import * as path from 'path';
import { DebugtalkParser, FunctionInfo } from '../utils/debugtalkParser';

export class FunctionCompletionProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {

        const lineText = document.lineAt(position).text;
        const textBeforeCursor = lineText.substring(0, position.character);

        // 检查是否输入了 $
        if (!textBeforeCursor.match(/\$$/)) {
            return [];
        }

        // 查找项目根目录
        const rootDir = DebugtalkParser.findProjectRoot(document.uri.fsPath);
        if (!rootDir) {
            return [];
        }

        // 解析 debugtalk.py
        const debugtalkPath = path.join(rootDir, 'debugtalk.py');
        const functions = DebugtalkParser.parseFunctions(debugtalkPath);

        if (functions.length === 0) {
            return [];
        }

        // 创建补全项
        const items: vscode.CompletionItem[] = functions.map(func => {
            return this.createCompletionItem(func);
        });

        return items;
    }

    /**
     * 创建函数补全项
     */
    private createCompletionItem(func: FunctionInfo): vscode.CompletionItem {
        const item = new vscode.CompletionItem(
            func.name,
            vscode.CompletionItemKind.Function
        );

        // 构建插入文本
        if (func.params.length === 0) {
            // 无参数函数：插入完整的 ${function_name()}
            item.insertText = '{' + func.name + '()}';
        } else {
            // 有参数函数：使用 Snippet 格式，方便用户填写参数
            const snippetParams = func.params
                .map((param, index) => `\${${index + 1}:${param}}`)
                .join(', ');
            item.insertText = new vscode.SnippetString(
                '{' + func.name + '(' + snippetParams + ')}'
            );
        }

        // 设置详细信息
        item.detail = `debugtalk.py: ${func.fullSignature}`;

        // 设置文档说明
        if (func.params.length > 0) {
            item.documentation = new vscode.MarkdownString(
                `调用 debugtalk.py 中的 \`${func.name}\` 函数\n\n` +
                `**参数:** ${func.params.join(', ')}\n\n` +
                `使用 Tab 键在参数之间跳转`
            );
        } else {
            item.documentation = new vscode.MarkdownString(
                `调用 debugtalk.py 中的 \`${func.name}\` 函数（无参数）`
            );
        }

        return item;
    }
}
