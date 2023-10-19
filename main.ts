/* eslint-disable no-mixed-spaces-and-tabs */
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, normalizePath } from 'obsidian';
import {
    applyTemplateTransformations,
    executeInlineScriptsTemplates,
    getTemplateContents,
    replaceVariableSyntax,
    useTemplaterPluginInFile,
  } from './template';
import {Link} from './types';
import {replaceIllegalFileNameCharactersInString} from './file';
// Remember to rename these classes and interfaces!
//
// TODO
//
// In the larger plugin, I would ****ing love literally just a texpane that I can copy paste js into and have it be in global scope
//
// For here I want to make it so an express server is launched onload
// 
// Settings wise I can choose the folders in my vault it sinks to
// 
// Hey I could reuse a bookmark deduping algo for Dani! Almost kind of...

//import { exec } from 'node:child_process';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { listen } from 'server.js';


interface MyPluginSettings {
    accessToken: string;
    linksFolderPath: string;
    templateFilePath: string;
    syncOnLoad: boolean;
    customServerURL: string;
	pluginFolderPath: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	accessToken: '',
	linksFolderPath: 'Sync',
    templateFilePath: '',
	syncOnLoad: false,
	customServerURL: '',
	pluginFolderPath: 'C:\\Users\\grant\\iCloudDrive\\iCloud~md~obsidian\\Shakka\\.obsidian\\plugins\\obsidian-server\\'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		//exec('node server.js', (error, output) => {	})

		// start the `ping google.com` command
		this.run()

		//await this.sync();
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');
		

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-bookmark-modal-simple',
			name: 'Open bookmark modal',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});



		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'DOMContentLoaded', (event) => {
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));


		
	}

	onunload() {

	}

	async loadSettings() { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());}
	async saveSettings() { await this.saveData(this.settings); 	}

	run() {
		const path = this.settings.pluginFolderPath;
		const server = spawn('node', ['server.js'], {'shell':true, 'cwd':path});
		
		server.stdout.on('data', output => {
			// the output data is captured and printed in the callback
			console.log("Output: ", output.toString())
		})
	}


	async sync() {
		
		
		try {
		  // need to read from the bookmarks.json file in the main obsidian folder
		  const response = JSON.parse(fs.readFileSync(this.settings.pluginFolderPath+"bookmarks.json", "utf8"));
	
		  console.log('[LinkStowr] Got response: ', response);
		  const links: Array<Link> | undefined = response.children;
		  console.log(links);
		  if (links) {
			const createdLinksPromises = links.map(async (link) => {
			  const renderedContent = await this.getRenderedContent(link);
			  console.log("test");
			  const fileName = replaceIllegalFileNameCharactersInString(link.title);
			  console.log("test2");
			  const filePath = this.getUniqueFilePath(fileName);
			  console.log("test3");
			  try {
				const targetFile = await this.app.vault.create(
				  filePath,
				  renderedContent,
				);
				
	
				await useTemplaterPluginInFile(this.app, targetFile);
			  } catch (err) {
				console.error(`Failed to create file: ${fileName}`, err);
				throw new Error('Failed when creating file');
			  }
			});
	
			await Promise.all(createdLinksPromises);
	
			//await api.post('/api/links/clear');
	
			new Notice('LinkStowr Sync successful!', 3000);
		  }
		} catch (error) {
		  new Notice('LinkStowr Sync failed', 3000);
		}
	  }
	
	async getRenderedContent(link: Link) {
		const templateContents = await getTemplateContents(
		  this.app,
		  this.settings.templateFilePath,
		);
		const replacedVariable = replaceVariableSyntax(
		  link,
		  applyTemplateTransformations(templateContents),
		);
		return executeInlineScriptsTemplates(link, replacedVariable);
	  }
	
	getUniqueFilePath(fileName: string): string {
		let dupeCount = 0;
		const folderPath = normalizePath(this.settings.linksFolderPath);
		let path = `${folderPath}/${fileName}.md`;
	
		// Handle duplicate file names by appending a count.
		while (this.app.vault.getAbstractFileByPath(path) != null) {
		  dupeCount++;
	
		  path = `${folderPath}/${fileName}-${dupeCount}.md`;
		}
	
		return path;
	  }
}


class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}
	
	onOpen() {
		const {contentEl} = this;
		let bookmarks = JSON.parse(fs.readFileSync("C:\\Users\\grant\\iCloudDrive\\iCloud~md~obsidian\\Shakka\\.obsidian\\plugins\\obsidian-server\\bookmarks.json", 'utf8'));
		let modalText = JSON.stringify(bookmarks).slice(0, 3000);
		console.log(modalText);
		contentEl.setText(modalText);
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;
  
    constructor(app: App, plugin: MyPlugin) {
      super(app, plugin);
      this.plugin = plugin;
    }
  
    display(): void {
      const {containerEl} = this;
  
      containerEl.empty();
  
      new Setting(containerEl)
        .setName('Links folder path')
        .setDesc(
          'Path to the folder to save the links to (relative to your vault). Make sure the folder exists',
        )
        .addText((text) =>
          text
            .setPlaceholder('links')
            .setValue(this.plugin.settings.linksFolderPath)
            .onChange(async (value) => {
              this.plugin.settings.linksFolderPath = value;
              await this.plugin.saveSettings();
            }),
        );
  
      new Setting(containerEl)
        .setName('Access Token')
        .setDesc('Enter your Access Token')
        .addText((text) =>
          text
            .setPlaceholder('lshelf_XXXXXX_XXXXXXXXXXX')
            .setValue(this.plugin.settings.accessToken)
            .onChange(async (value) => {
              this.plugin.settings.accessToken = value;
              await this.plugin.saveSettings();
            }),
        );
  
      new Setting(containerEl)
        .setName('Template file path')
        .setDesc('Enter path to template file')
        .addText((text) =>
          text
            .setValue(this.plugin.settings.templateFilePath)
            .onChange(async (value) => {
              this.plugin.settings.templateFilePath = value;
              await this.plugin.saveSettings();
            }),
        );
  
      new Setting(containerEl)
        .setName('Sync on load')
        .setDesc('Run the Sync command when Obsidian loads')
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.settings.syncOnLoad)
            .onChange(async (value) => {
              this.plugin.settings.syncOnLoad = value;
              await this.plugin.saveSettings();
            }),
        );
  
      new Setting(containerEl)
        .setName('Custom server URL')
        .setDesc(
          'Add this if you are self-hosting LinkStowr and would like to use a custom server. Make sure the URL does not end in a `/` e.g. https://www.myserver.com',
        )
        .addText((text) =>
          text
            .setPlaceholder('https://www.myserver.com')
            .setValue(this.plugin.settings.customServerURL)
            .onChange(async (value) => {
              this.plugin.settings.customServerURL = value;
              await this.plugin.saveSettings();
            }),
        );
    }
}


		/*
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});
		*/