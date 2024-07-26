import * as vscode from 'vscode';

async function runCommand(command: string,) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const userInput = await vscode.window.showInputBox({
			prompt: 'Enter label name'
		});


		if (userInput !== undefined) {
			// Add label
			const selection = editor.selection;

			// Add import statement
			const document = editor.document;
			const text = document.getText();

			const editors: ((builder:vscode.TextEditorEdit) => void)[] = [];

			const generalMatch = text.match(/import \{([\w, ]+)} from '@apia\/util';/);
			const importedMatch = text.match(/import \{(?:[\w, ]+)?getLabel(?:[\w, ]+)?\} from '@apia\/util';/);

			if(!generalMatch && !importedMatch) {
				editors.push(editBuilder => {
					// Insert the import statement at the top of the file
					const firstLine = document.lineAt(0);
					editBuilder.insert(firstLine.range.start, `import { getLabel } from '@apia/util';\n`);
				});
			}
			else if(generalMatch && !importedMatch) {
				const entireRange = new vscode.Range(
					document.positionAt(0),
					document.positionAt(text.length)
				);
				const replacedText = text.replace(generalMatch[1], ` ${generalMatch[1].trim()}, getLabel `);

				editors.push(editBuilder => {
					editBuilder.replace(entireRange, replacedText);
				});

			} 

			editor.edit(editBuilder => {
				editors.forEach(c => c(editBuilder));
				editBuilder.replace(selection, `getLabel('${userInput}').${command}`);
			});
		}

	} 
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push( vscode.commands.registerCommand('label-inserter.addLabel', async () => {
    await runCommand('text');
  }));
	context.subscriptions.push( vscode.commands.registerCommand('label-inserter.addTooltip', async () => {
    await runCommand('tooltip');
  }));
}

export function deactivate() {
}
