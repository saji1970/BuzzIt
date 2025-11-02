import * as Contacts from 'expo-contacts';
import * as Linking from 'expo-linking';

/**
 * Contact Sync Service
 * Syncs user's device contacts and social connections
 * to find potential users to follow
 */
class ContactSyncService {
  /**
   * Request contacts permission and get contacts
   */
  async requestContactsPermission(): Promise<boolean> {
    try {
      const ContactsModule = loadContactsModule();
      if (!ContactsModule) {
        return false;
      }
      const { status } = await ContactsModule.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return false;
    }
  }

  /**
   * Get user's contacts from device
   */
  async getContacts(): Promise<Array<{
    name: string;
    email?: string;
    phone?: string;
  }>> {
    try {
      const ContactsModule = loadContactsModule();
      if (!ContactsModule) {
        console.warn('expo-contacts not available');
        return [];
      }

      const hasPermission = await this.requestContactsPermission();
      if (!hasPermission) {
        console.warn('Contacts permission not granted');
        return [];
      }

      const { data } = await ContactsModule.getContactsAsync({
        fields: [
          ContactsModule.Fields.Name,
          ContactsModule.Fields.Emails,
          ContactsModule.Fields.PhoneNumbers,
        ],
      });

      return data.map(contact => ({
        name: contact.name || '',
        email: contact.emails && contact.emails.length > 0 
          ? contact.emails[0].email 
          : undefined,
        phone: contact.phoneNumbers && contact.phoneNumbers.length > 0
          ? contact.phoneNumbers[0].number?.replace(/\s/g, '')
          : undefined,
      }));
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  /**
   * Get social connections from linked accounts
   */
  async getSocialConnections(userId: string): Promise<Array<{
    platform: string;
    userId?: string;
    username?: string;
  }>> {
    try {
      // This would typically call the API to get user's linked social accounts
      // For now, return empty array - will be populated by API
      return [];
    } catch (error) {
      console.error('Error getting social connections:', error);
      return [];
    }
  }

  /**
   * Sync contacts with backend
   */
  async syncContacts(): Promise<{
    contacts: Array<{name: string; email?: string; phone?: string}>;
    socialConnections: Array<{platform: string; userId?: string; username?: string}>;
  }> {
    const contacts = await this.getContacts();
    const socialConnections = await this.getSocialConnections(''); // Will be filled from API

    return {
      contacts,
      socialConnections,
    };
  }
}

export default new ContactSyncService();

