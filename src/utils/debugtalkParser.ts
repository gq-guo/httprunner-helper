import * as fs from 'fs';
import * as path from 'path';

export interface FunctionInfo {
    name: string;
    params: string[];
    fullSignature: string;
}

export class DebugtalkParser {
    /**
     * 解析 debugtalk.py 文件，提取所有函数定义
     */
    static parseFunctions(debugtalkPath: string): FunctionInfo[] {
        if (!fs.existsSync(debugtalkPath)) {
            return [];
        }

        try {
            const content = fs.readFileSync(debugtalkPath, 'utf-8');
            return this.extractFunctions(content);
        } catch (error) {
            console.error('Error parsing debugtalk.py:', error);
            return [];
        }
    }

    /**
     * 从 Python 代码中提取函数定义
     */
    private static extractFunctions(content: string): FunctionInfo[] {
        const functions: FunctionInfo[] = [];

        // 匹配 Python 函数定义：def function_name(params):
        // 支持多行参数定义
        const functionRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\):/gs;

        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            const funcName = match[1];
            const paramsStr = match[2].trim();

            // 跳过私有函数（以 _ 开头）
            if (funcName.startsWith('_')) {
                continue;
            }

            // 解析参数
            const params = this.parseParameters(paramsStr);

            // 构建完整签名
            const fullSignature = `${funcName}(${paramsStr})`;

            functions.push({
                name: funcName,
                params,
                fullSignature
            });
        }

        return functions;
    }

    /**
     * 解析函数参数
     */
    private static parseParameters(paramsStr: string): string[] {
        if (!paramsStr) {
            return [];
        }

        // 简单的参数分割（忽略复杂的默认值等）
        const params = paramsStr
            .split(',')
            .map(p => p.trim())
            .filter(p => p && p !== 'self')
            .map(p => {
                // 提取参数名（去除默认值和类型注解）
                const paramName = p.split('=')[0].split(':')[0].trim();
                return paramName;
            });

        return params;
    }

    /**
     * 查找项目根目录（包含 debugtalk.py 的目录）
     */
    static findProjectRoot(filePath: string): string | null {
        let currentDir = path.dirname(filePath);
        const maxDepth = 10;
        let depth = 0;

        while (depth < maxDepth) {
            const debugtalkPath = path.join(currentDir, 'debugtalk.py');
            if (fs.existsSync(debugtalkPath)) {
                return currentDir;
            }

            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) {
                break;
            }
            currentDir = parentDir;
            depth++;
        }

        return null;
    }
}
