import * as vscode from 'vscode';

async function runLabelCommand(command: string) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const selection = editor.selection;
		const userInput = await vscode.window.showInputBox({
			prompt: 'Enter label name',
			value: editor.document.getText(selection)
		});

		if (userInput !== undefined) {
			// Add import statement
			const document = editor.document;
			const text = document.getText();

			const editors: ((builder: vscode.TextEditorEdit) => void)[] = [];

			const generalMatch = text.match(/import \{([\w, ]+)} from '@apia\/util';/);
			const importedMatch = text.match(/import \{(?:[\w, ]+)?getLabel(?:[\w, ]+)?\} from '@apia\/util';/);

			if (!generalMatch && !importedMatch) {
				editors.push(async (editBuilder) => {
					const firstLine = document.lineAt(0);
					await editBuilder.insert(firstLine.range.start, `import { getLabel } from '@apia/util';\n`);
				});
			}
			else if (generalMatch && !importedMatch) {
				editors.push(async (editBuilder) => {
					const document = editor.document;
					const text = document.getText();
					const entireRange = new vscode.Range(
						document.positionAt(0),
						document.positionAt(text.length)
					);
					const generalMatch = text.match(/import \{([\w, ]+)} from '@apia\/util';/);
					const replacedText = text.replace(generalMatch![1], ` ${generalMatch![1].trim()}, getLabel `);

					await editBuilder.replace(entireRange, replacedText);
				});

			}

			await editor.edit(async (editBuilder) => {
				const selection = editor.selection;
				editBuilder.replace(selection, `getLabel('${userInput}').${command}`);
			});

			for await (const e of editors) {
				await editor.edit(e);
			}
		}

	}
}
async function runJspLabelCommand(command: string) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const selection = editor.selection;
		const userInput = await vscode.window.showInputBox({
			prompt: 'Enter label name',
			value: editor.document.getText(selection)
		});

		if (userInput !== undefined) {
			// Add import statement
			const document = editor.document;
			const text = document.getText();

			const editors: ((builder: vscode.TextEditorEdit) => void)[] = [];

			const generalMatch = text.match(/<%@ taglib prefix="system" uri="\/WEB-INF\/system-tags.tld" %>/);

			if (!generalMatch) {
				editors.push(async (editBuilder) => {
					const firstLine = document.lineAt(0);
					await editBuilder.insert(firstLine.range.start, `<%@ taglib prefix="system" uri="/WEB-INF/system-tags.tld" %>\n`);
				});
			}

			await editor.edit(async (editBuilder) => {
				const selection = editor.selection;
				editBuilder.replace(selection, `<system:label show="${command}" label="${userInput}" />`);
			});

			for await (const e of editors) {
				await editor.edit(e);
			}
		}

	}
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('label-inserter.addLabel', async () => {
		await runLabelCommand('text');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('label-inserter.addTooltip', async () => {
		await runLabelCommand('tooltip');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('label-inserter.jspAddText', async () => {
		await runJspLabelCommand('text');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('label-inserter.jspAddTooltip', async () => {
		await runJspLabelCommand('tooltip');
	}));
}

export function deactivate() {
}
