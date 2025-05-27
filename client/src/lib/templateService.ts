import { google } from 'googleapis';

export interface Template {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  createdTime: string;
  description?: string;
  category?: string;
}

export const templateService = {
  async getOrCreateTemplatesFolder(accessToken: string, userId: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });

    try {
      // First, check if the user already has a templates folder
      const response = await drive.files.list({
        q: `name='SheetBills Templates' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // If no folder exists, create one
      const folderMetadata = {
        name: 'SheetBills Templates',
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Invoice templates for SheetBills'
      };

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id'
      });

      return folder.data.id;
    } catch (error) {
      console.error('Error getting/creating templates folder:', error);
      throw error;
    }
  },

  async uploadTemplate(accessToken: string, userId: string, file: File): Promise<Template> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });

    try {
      // Get or create the templates folder
      const folderId = await this.getOrCreateTemplatesFolder(accessToken, userId);

      const fileMetadata = {
        name: file.name,
        mimeType: file.type,
        parents: [folderId],
        description: 'Invoice template uploaded via SheetBills'
      };

      const media = {
        mimeType: file.type,
        body: file
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, webViewLink, thumbnailLink, createdTime'
      });

      return response.data as Template;
    } catch (error) {
      console.error('Error uploading template:', error);
      throw error;
    }
  },

  async listTemplates(accessToken: string, userId: string): Promise<Template[]> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });

    try {
      // Get the templates folder ID
      const folderId = await this.getOrCreateTemplatesFolder(accessToken, userId);

      const response = await drive.files.list({
        q: `'${folderId}' in parents and mimeType in ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') and trashed=false`,
        fields: 'files(id, name, mimeType, webViewLink, thumbnailLink, createdTime)',
        orderBy: 'createdTime desc'
      });

      return response.data.files as Template[];
    } catch (error) {
      console.error('Error listing templates:', error);
      throw error;
    }
  },

  async deleteTemplate(accessToken: string, templateId: string): Promise<void> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });

    try {
      await drive.files.delete({
        fileId: templateId
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }
}; 