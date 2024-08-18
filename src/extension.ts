// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { exec, execSync } from 'child_process';
import { readFileSync } from 'fs';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "objdumper-extension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('objdumper-extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from objdumper-extension!');
	});

	const dumpExplorerRightClick = vscode.commands.registerCommand('objdumper-extension.dumpFromExplorer', async (...commandArgs) => {
		let path: string = commandArgs[1][0].path;
		let pathSplit: string[] = path.split("/");

		let fileName: string = pathSplit[pathSplit.length - 1];

		let now: number = Date.now();

		let tmpFilename: string = `/tmp/${fileName}_${now}.txt`;

		execSync(`/usr/bin/objdump -D ${path} > ${tmpFilename}`
		// 	, (err, stdout, stderr) => {
		// 	console.log(`STDOUT: ${stdout}, STDERR: ${stderr}`);
		// }
	);
		
		const uri = vscode.Uri.parse("objdumper:" + tmpFilename);
		const doc = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(doc, {preview: false});
	});

	const myScheme = "objdumper";
	const myProvider = new (class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
			try {
				let dumpContent = readFileSync(uri.fsPath, 'utf-8');
				return dumpContent;
			} catch (err) {
				return `Error reading objdump: ${err}`;
			}
		}
	})();

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));

	context.subscriptions.push(dumpExplorerRightClick);
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
