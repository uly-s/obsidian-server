import {
    App,
    normalizePath,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
} from 'obsidian';
import {Link} from './types';
import {replaceIllegalFileNameCharactersInString} from './file';
import {
    applyTemplateTransformations,
    executeInlineScriptsTemplates,
    getTemplateContents,
    replaceVariableSyntax,
    useTemplaterPluginInFile,
} from './template';

async sync() {
    const api = getAPI(
      this.settings.accessToken,
      this.settings.customServerURL,
    );
    try {
      const response = await api.get('/api/links');

      console.log('[LinkStowr] Got response: ', response);
      const links: Array<Link> | undefined = response.json;

      if (links) {
        const createdLinksPromises = links.map(async (link) => {
          const renderedContent = await this.getRenderedContent(link);

          const fileName = replaceIllegalFileNameCharactersInString(link.title);
          const filePath = this.getUniqueFilePath(fileName);
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

        await api.post('/api/links/clear');

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