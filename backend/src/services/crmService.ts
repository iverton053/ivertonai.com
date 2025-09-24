import mongoose from 'mongoose';
import Contact, { IContact } from '../models/Contact';
import { Deal, Pipeline } from '../models/Pipeline';
import LeadScoringService from './leadScoringService';
import { logger } from '../utils/logger';

export interface ContactFilters {
  leadStatus?: string;
  lifecycleStage?: string;
  contactOwner?: string;
  company?: string;
  tags?: string[];
  leadScoreMin?: number;
  leadScoreMax?: number;
  lastActivityBefore?: Date;
  lastActivityAfter?: Date;
  source?: string;
}

export interface ContactSearchOptions {
  query?: string;
  filters?: ContactFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class CRMService {
  private static instance: CRMService;
  private leadScoringService: LeadScoringService;

  constructor() {
    this.leadScoringService = LeadScoringService.getInstance();
  }

  public static getInstance(): CRMService {
    if (!CRMService.instance) {
      CRMService.instance = new CRMService();
    }
    return CRMService.instance;
  }

  // Contact Management
  async createContact(userId: string, contactData: Partial<IContact>): Promise<IContact> {
    try {
      // Check for duplicates
      const existingContact = await Contact.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        email: contactData.email
      });

      if (existingContact && existingContact.isActive) {
        throw new Error('Contact with this email already exists');
      }

      const contact = new Contact({
        ...contactData,
        userId: new mongoose.Types.ObjectId(userId),
        contactOwner: contactData.contactOwner || userId,
        activities: [{
          type: 'note',
          content: 'Contact created',
          createdBy: new mongoose.Types.ObjectId(userId),
          createdAt: new Date()
        }]
      });

      await contact.save();

      // Calculate initial lead score
      if (contactData.company || contactData.jobTitle) {
        try {
          await this.leadScoringService.calculateLeadScore(contact._id.toString(), {
            userId,
            jobTitle: contactData.jobTitle,
            companySize: this.estimateCompanySize(contactData.company),
            industry: this.estimateIndustry(contactData.company),
            location: contactData.address?.country || 'Unknown'
          });
        } catch (scoreError) {
          logger.warn('Lead scoring failed for new contact:', scoreError);
        }
      }

      logger.info(`Contact created: ${contact.email} for user ${userId}`);
      return contact;
    } catch (error) {
      logger.error('Error creating contact:', error);
      throw error;
    }
  }

  async updateContact(userId: string, contactId: string, updateData: Partial<IContact>): Promise<IContact | null> {
    try {
      const contact = await Contact.findOne({
        _id: contactId,
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      });

      if (!contact) {
        throw new Error('Contact not found');
      }

      // Track what fields changed for activity log
      const changedFields = this.getChangedFields(contact, updateData);

      // Update contact
      Object.assign(contact, updateData);
      await contact.save();

      // Add property change activity if significant fields changed
      if (changedFields.length > 0) {
        contact.activities.push({
          type: 'property_change',
          content: `Updated: ${changedFields.join(', ')}`,
          createdBy: new mongoose.Types.ObjectId(userId),
          createdAt: new Date(),
          metadata: { changedFields, previousValues: this.getPreviousValues(contact, changedFields) }
        });
        await contact.save();
      }

      // Recalculate lead score if relevant fields changed
      const scoringFields = ['jobTitle', 'company', 'lifecycleStage', 'leadStatus'];
      if (changedFields.some(field => scoringFields.includes(field))) {
        try {
          await this.leadScoringService.calculateLeadScore(contactId, {
            userId,
            jobTitle: contact.jobTitle,
            companySize: this.estimateCompanySize(contact.company),
            industry: this.estimateIndustry(contact.company),
            location: contact.address?.country || 'Unknown'
          });
        } catch (scoreError) {
          logger.warn('Lead scoring update failed:', scoreError);
        }
      }

      logger.info(`Contact updated: ${contactId} for user ${userId}`);
      return contact;
    } catch (error) {
      logger.error('Error updating contact:', error);
      throw error;
    }
  }

  async getContacts(userId: string, options: ContactSearchOptions = {}): Promise<{
    contacts: IContact[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const {
        query,
        filters = {},
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        limit = 50,
        offset = 0
      } = options;

      // Build query
      const searchQuery: any = {
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      };

      // Text search
      if (query) {
        searchQuery.$or = [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { company: { $regex: query, $options: 'i' } },
          { jobTitle: { $regex: query, $options: 'i' } }
        ];
      }

      // Apply filters
      if (filters.leadStatus) searchQuery.leadStatus = filters.leadStatus;
      if (filters.lifecycleStage) searchQuery.lifecycleStage = filters.lifecycleStage;
      if (filters.contactOwner) searchQuery.contactOwner = new mongoose.Types.ObjectId(filters.contactOwner);
      if (filters.company) searchQuery.company = { $regex: filters.company, $options: 'i' };
      if (filters.tags && filters.tags.length > 0) searchQuery.tags = { $in: filters.tags };
      if (filters.source) searchQuery.originalSource = filters.source;

      // Lead score range
      if (filters.leadScoreMin !== undefined || filters.leadScoreMax !== undefined) {
        searchQuery.leadScore = {};
        if (filters.leadScoreMin !== undefined) searchQuery.leadScore.$gte = filters.leadScoreMin;
        if (filters.leadScoreMax !== undefined) searchQuery.leadScore.$lte = filters.leadScoreMax;
      }

      // Activity date range
      if (filters.lastActivityBefore || filters.lastActivityAfter) {
        searchQuery.lastActivityDate = {};
        if (filters.lastActivityBefore) searchQuery.lastActivityDate.$lte = filters.lastActivityBefore;
        if (filters.lastActivityAfter) searchQuery.lastActivityDate.$gte = filters.lastActivityAfter;
      }

      // Execute query
      const sortDirection = sortOrder === 'desc' ? -1 : 1;
      const contacts = await Contact.find(searchQuery)
        .sort({ [sortBy]: sortDirection })
        .limit(limit)
        .skip(offset)
        .populate('contactOwner', 'firstName lastName email')
        .lean();

      const total = await Contact.countDocuments(searchQuery);

      return {
        contacts,
        total,
        page: Math.floor(offset / limit) + 1,
        limit
      };
    } catch (error) {
      logger.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async getContactById(userId: string, contactId: string): Promise<IContact | null> {
    try {
      const contact = await Contact.findOne({
        _id: contactId,
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      })
      .populate('contactOwner', 'firstName lastName email')
      .populate('associatedDeals');

      return contact;
    } catch (error) {
      logger.error('Error fetching contact:', error);
      throw error;
    }
  }

  async deleteContact(userId: string, contactId: string): Promise<boolean> {
    try {
      const contact = await Contact.findOne({
        _id: contactId,
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      });

      if (!contact) {
        throw new Error('Contact not found');
      }

      // Soft delete
      contact.isActive = false;
      contact.activities.push({
        type: 'note',
        content: 'Contact deleted',
        createdBy: new mongoose.Types.ObjectId(userId),
        createdAt: new Date()
      });
      await contact.save();

      logger.info(`Contact deleted: ${contactId} for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting contact:', error);
      throw error;
    }
  }

  async addActivity(userId: string, contactId: string, activity: {
    type: string;
    subject?: string;
    content: string;
    metadata?: any;
  }): Promise<IContact | null> {
    try {
      const contact = await Contact.findOne({
        _id: contactId,
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      });

      if (!contact) {
        throw new Error('Contact not found');
      }

      contact.activities.push({
        ...activity,
        createdBy: new mongoose.Types.ObjectId(userId),
        createdAt: new Date()
      } as any);

      await contact.save();

      logger.info(`Activity added to contact: ${contactId}`);
      return contact;
    } catch (error) {
      logger.error('Error adding activity:', error);
      throw error;
    }
  }

  async getContactAnalytics(userId: string): Promise<any> {
    try {
      const analytics = await Contact.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            isActive: true
          }
        },
        {
          $facet: {
            totalContacts: [{ $count: 'count' }],
            byLifecycleStage: [
              { $group: { _id: '$lifecycleStage', count: { $sum: 1 } } }
            ],
            byLeadStatus: [
              { $group: { _id: '$leadStatus', count: { $sum: 1 } } }
            ],
            bySource: [
              { $group: { _id: '$originalSource', count: { $sum: 1 } } }
            ],
            avgLeadScore: [
              { $group: { _id: null, avg: { $avg: '$leadScore' } } }
            ],
            topCompanies: [
              { $match: { company: { $ne: null, $ne: '' } } },
              { $group: { _id: '$company', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],
            recentActivity: [
              { $sort: { lastActivityDate: -1 } },
              { $limit: 5 },
              { $project: { firstName: 1, lastName: 1, email: 1, lastActivityDate: 1 } }
            ]
          }
        }
      ]);

      return analytics[0];
    } catch (error) {
      logger.error('Error getting contact analytics:', error);
      throw error;
    }
  }

  async mergeContacts(userId: string, primaryContactId: string, secondaryContactId: string): Promise<IContact> {
    try {
      const primaryContact = await Contact.findOne({
        _id: primaryContactId,
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      });

      const secondaryContact = await Contact.findOne({
        _id: secondaryContactId,
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      });

      if (!primaryContact || !secondaryContact) {
        throw new Error('One or both contacts not found');
      }

      // Merge activities
      primaryContact.activities.push(...secondaryContact.activities);

      // Merge tags
      const allTags = [...new Set([...primaryContact.tags, ...secondaryContact.tags])];
      primaryContact.tags = allTags;

      // Merge custom fields
      for (const [key, value] of secondaryContact.customFields) {
        if (!primaryContact.customFields.has(key)) {
          primaryContact.customFields.set(key, value);
        }
      }

      // Merge deals
      primaryContact.associatedDeals.push(...secondaryContact.associatedDeals);

      // Update deals to point to primary contact
      await Deal.updateMany(
        { contactId: secondaryContactId },
        { contactId: primaryContactId }
      );

      // Mark secondary contact as merged
      secondaryContact.isActive = false;
      secondaryContact.mergedInto = primaryContact._id;

      // Add merge activity
      primaryContact.activities.push({
        type: 'note',
        content: `Merged with contact: ${secondaryContact.firstName} ${secondaryContact.lastName} (${secondaryContact.email})`,
        createdBy: new mongoose.Types.ObjectId(userId),
        createdAt: new Date()
      } as any);

      await primaryContact.save();
      await secondaryContact.save();

      logger.info(`Contacts merged: ${secondaryContactId} into ${primaryContactId}`);
      return primaryContact;
    } catch (error) {
      logger.error('Error merging contacts:', error);
      throw error;
    }
  }

  // Helper methods
  private getChangedFields(original: IContact, update: Partial<IContact>): string[] {
    const changed: string[] = [];
    const fieldsToCheck = ['firstName', 'lastName', 'email', 'phone', 'company', 'jobTitle', 'leadStatus', 'lifecycleStage'];
    
    fieldsToCheck.forEach(field => {
      if (update[field as keyof IContact] !== undefined && 
          update[field as keyof IContact] !== original[field as keyof IContact]) {
        changed.push(field);
      }
    });

    return changed;
  }

  private getPreviousValues(contact: IContact, fields: string[]): any {
    const previous: any = {};
    fields.forEach(field => {
      previous[field] = contact[field as keyof IContact];
    });
    return previous;
  }

  private estimateCompanySize(company?: string): string {
    if (!company) return 'Unknown';
    
    // Simple heuristics - in real implementation, you'd use enrichment APIs
    const companyLower = company.toLowerCase();
    if (companyLower.includes('corp') || companyLower.includes('inc') || companyLower.includes('ltd')) {
      return '201-1000';
    }
    return '11-50';
  }

  private estimateIndustry(company?: string): string {
    if (!company) return 'Other';
    
    const companyLower = company.toLowerCase();
    if (companyLower.includes('tech') || companyLower.includes('software')) return 'Technology';
    if (companyLower.includes('health') || companyLower.includes('medical')) return 'Healthcare';
    if (companyLower.includes('bank') || companyLower.includes('finance')) return 'Finance';
    
    return 'Other';
  }
}

export default CRMService;