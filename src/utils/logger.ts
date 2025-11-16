// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\utils\logger.ts

import * as vscode from 'vscode';

export class Logger {
    private static outputChannel: vscode.OutputChannel | undefined;

    public static setOutputChannel(channel: vscode.OutputChannel) {
        this.outputChannel = channel;
    }

    public static log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
        const config = vscode.workspace.getConfiguration('pascal');
        const debugEnabled = config.get<boolean>('debugMode', false);

        if (!debugEnabled && level === 'info') {
            return;
        }

        const timestamp = new Date().toISOString();
        const prefix = this.getLevelPrefix(level);
        const formattedMessage = `[${timestamp}] ${prefix} ${message}`;

        if (this.outputChannel) {
            this.outputChannel.appendLine(formattedMessage);
        }

        // Also log to console in development
        if (debugEnabled) {
            console.log(formattedMessage);
        }
    }

    public static info(message: string) {
        this.log(message, 'info');
    }

    public static warn(message: string) {
        this.log(message, 'warn');
    }

    public static error(message: string) {
        this.log(message, 'error');
    }

    private static getLevelPrefix(level: string): string {
        switch (level) {
            case 'info': return 'ℹ️ INFO';
            case 'warn': return '⚠️ WARN';
            case 'error': return '❌ ERROR';
            default: return 'INFO';
        }
    }
}