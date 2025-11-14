import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class PathCompletionProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {

        const lineText = document.lineAt(position).text;
        const textBeforeCursor = lineText.substring(0, position.character);

        // 查找项目根目录（包含 debugtalk.py 的目录）
        const rootDir = this.findProjectRoot(document.uri.fsPath);
        if (!rootDir) {
            return [];
        }

        // 匹配路径模式：提取输入的路径部分
        // 支持在任何位置：apis/, "apis/", 'apis/', #apis/, 注释中等
        // 也支持 apis//, apis/// 等（多个斜杠会被规范化）
        // 匹配任何以 / 结尾的路径（不限制前缀字符）
        const pathMatch = textBeforeCursor.match(/([a-zA-Z0-9_\-\/\s]+\/+)$/);
        if (!pathMatch) {
            return [];
        }

        // 提取输入的路径部分
        // pathMatch[1] 是原始匹配的路径（可能包含空格和多余斜杠）
        const rawPathWithSpaces = pathMatch[1];
        const rawPath = rawPathWithSpaces.trim();
        // 将多个连续的 / 替换为单个 /
        const inputPath = rawPath.replace(/\/+/g, '/');
        const fullPath = path.join(rootDir, inputPath);

        // 检查目录是否存在
        if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
            return [];
        }

        // 计算需要替换的范围
        // 如果用户输入了 apis///，我们需要替换掉这部分，改为 apis/xxx
        // 使用原始匹配的长度（包括空格），因为这才是文本中实际占用的字符数
        const rawPathStartPos = position.character - rawPathWithSpaces.length;
        const replaceRange = new vscode.Range(
            new vscode.Position(position.line, rawPathStartPos),
            position
        );

        // 读取目录内容
        const items: vscode.CompletionItem[] = [];
        try {
            const entries = fs.readdirSync(fullPath, { withFileTypes: true });

            for (const entry of entries) {
                // 跳过隐藏文件
                if (entry.name.startsWith('.')) {
                    continue;
                }

                const item = new vscode.CompletionItem(
                    entry.name,
                    entry.isDirectory()
                        ? vscode.CompletionItemKind.Folder
                        : vscode.CompletionItemKind.File
                );

                // 插入标准化后的完整路径（包括目录部分）
                // 这样可以替换掉用户输入的多余斜杠
                // 同时保留原始路径前的空格（如果有的话）
                const leadingSpaces = rawPathWithSpaces.substring(0, rawPathWithSpaces.length - rawPath.length);
                if (entry.isDirectory()) {
                    item.insertText = leadingSpaces + inputPath + entry.name + '/';
                    item.command = {
                        command: 'editor.action.triggerSuggest',
                        title: 'Re-trigger completions'
                    };
                } else {
                    item.insertText = leadingSpaces + inputPath + entry.name;
                }

                // 设置替换范围，将原始路径（可能包含多余斜杠）替换为标准化路径
                item.range = replaceRange;

                // 设置排序文本，目录优先
                item.sortText = entry.isDirectory() ? `0${entry.name}` : `1${entry.name}`;

                // 设置 filterText 包含路径，这样即使用户输入 apis/// 也能匹配
                // 因为 VS Code 会用 filterText 进行客户端过滤
                item.filterText = rawPath + entry.name;

                // 显示详细信息（显示完整路径）
                const fullRelativePath = path.join(inputPath, entry.name);
                item.detail = fullRelativePath;

                // 强制保持此项在列表中
                item.preselect = false;

                items.push(item);
            }
        } catch (error) {
            // 静默处理错误，返回空列表
            return [];
        }

        // isIncomplete 设置为 true，告诉 VS Code 这个列表可能不完整
        // 这样可以避免 VS Code 缓存结果，确保每次都重新获取
        return new vscode.CompletionList(items, true);
    }

    /**
     * 查找项目根目录（包含 debugtalk.py 的目录）
     */
    private findProjectRoot(filePath: string): string | null {
        let currentDir = path.dirname(filePath);
        const maxDepth = 10;
        let depth = 0;

        while (depth < maxDepth) {
            // 检查当前目录是否包含 debugtalk.py
            const debugtalkPath = path.join(currentDir, 'debugtalk.py');
            if (fs.existsSync(debugtalkPath)) {
                return currentDir;
            }

            // 向上一级目录
            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) {
                // 已到达文件系统根目录
                break;
            }
            currentDir = parentDir;
            depth++;
        }

        return null;
    }
}
