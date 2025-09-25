import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BrandAsset,
  BrandGuidelines,
  BrandAssetCollection,
  BrandAssetFilters,
  BrandAssetSettings,
  BrandAssetAnalytics,
  BrandAssetState,
  BrandAssetType,
  AssetUsageContext,
  AssetUsageHistory,
  DEFAULT_COMPLIANCE_RULES,
  ComplianceRule
} from '../types/brandAssets';
import { supabaseStorage } from '../utils/supabase-storage';
import { AssetMetadata } from '../types/supabase';

interface BrandAssetActions {
  // Asset management
  setAssets: (assets: BrandAsset[]) => void;
  addAsset: (asset: Omit<BrandAsset, 'id' | 'uploadedAt' | 'updatedAt' | 'usageHistory' | 'totalDownloads'>) => void;
  updateAsset: (id: string, updates: Partial<BrandAsset>) => void;
  deleteAsset: (id: string) => void;
  deleteAssets: (ids: string[]) => void;
  approveAsset: (id: string) => void;
  rejectAsset: (id: string, reason: string) => void;
  
  // Version control
  createAssetVersion: (originalId: string, newAsset: Omit<BrandAsset, 'id' | 'uploadedAt' | 'updatedAt' | 'usageHistory' | 'totalDownloads' | 'parentAssetId' | 'versionNumber'>) => void;
  setAsPrimary: (id: string) => void;
  revertToVersion: (versionId: string) => void;
  
  // Guidelines management
  setGuidelines: (guidelines: BrandGuidelines[]) => void;
  addGuideline: (guideline: Omit<BrandGuidelines, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGuideline: (id: string, updates: Partial<BrandGuidelines>) => void;
  deleteGuideline: (id: string) => void;
  
  // Collections management
  setCollections: (collections: BrandAssetCollection[]) => void;
  addCollection: (collection: Omit<BrandAssetCollection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCollection: (id: string, updates: Partial<BrandAssetCollection>) => void;
  deleteCollection: (id: string) => void;
  addAssetToCollection: (collectionId: string, assetId: string) => void;
  removeAssetFromCollection: (collectionId: string, assetId: string) => void;
  
  // Selection and filtering
  setSelectedAssets: (assetIds: string[]) => void;
  toggleAssetSelection: (assetId: string) => void;
  selectAllAssets: () => void;
  clearSelection: () => void;
  
  setFilters: (filters: Partial<BrandAssetFilters>) => void;
  clearFilters: () => void;
  
  setActiveClient: (clientId?: string) => void;
  setActiveCollection: (collectionId?: string) => void;
  
  // View controls
  setView: (view: 'grid' | 'list' | 'guidelines') => void;
  setSortBy: (sortBy: 'name' | 'date' | 'usage' | 'type' | 'size') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  
  // Usage tracking
  trackAssetUsage: (assetId: string, context: AssetUsageContext, usedBy: string, usedIn: string) => void;
  incrementDownloadCount: (assetId: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<BrandAssetSettings>) => void;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  
  // Analytics and insights
  refreshAnalytics: () => void;
  getAssetsByType: (type: BrandAssetType) => BrandAsset[];
  getAssetsByClient: (clientId: string) => BrandAsset[];
  getMostUsedAssets: (limit?: number) => BrandAsset[];
  getRecentAssets: (limit?: number) => BrandAsset[];
  getAssetVersions: (parentId: string) => BrandAsset[];
  
  // Compliance
  checkCompliance: (asset: BrandAsset) => { isCompliant: boolean; issues: string[] };
  validateAssetNaming: (name: string) => boolean;
  getComplianceRate: () => number;
  
  // Search and discovery
  searchAssets: (query: string) => BrandAsset[];
  getFilteredAssets: () => BrandAsset[];
  getSuggestedTags: () => string[];
  
  // Bulk operations
  bulkApprove: (assetIds: string[]) => void;
  bulkReject: (assetIds: string[], reason: string) => void;
  bulkMove: (assetIds: string[], collectionId: string) => void;
  bulkTag: (assetIds: string[], tags: string[]) => void;
  
  // Export and sharing
  exportAssets: (assetIds: string[], format: 'zip' | 'pdf') => Promise<void>;
  generateShareLink: (assetIds: string[], expiresIn?: number) => string;

  // Missing functions referenced in components
  downloadAsset: (assetId: string) => Promise<void>;
  toggleAssetApproval: (assetId: string) => void;
  setSorting: (sortBy: 'name' | 'date' | 'usage' | 'type' | 'size', sortOrder: 'asc' | 'desc') => void;

  // Supabase integration functions
  initializeSupabase: (url: string, anonKey: string, bucketName?: string) => Promise<void>;
  uploadFileToSupabase: (file: File, assetData: Omit<BrandAsset, 'id' | 'uploadedAt' | 'updatedAt' | 'usageHistory' | 'totalDownloads' | 'url' | 'thumbnailUrl'>) => Promise<BrandAsset | null>;
  getSupabaseStatus: () => { initialized: boolean; error?: string };
}

const defaultSettings: BrandAssetSettings = {
  autoApproval: false,
  requireGuidelines: true,
  enforceNaming: false,
  namingTemplate: '{client}_{type}_{variant}_v{version}',
  allowedFormats: ['png', 'jpg', 'svg', 'pdf', 'eps', 'ai', 'psd'],
  maxFileSize: 100 * 1024 * 1024, // 100MB
  enableVersioning: true,
  enableUsageTracking: true,
  enableExpirationReminders: true,
  defaultTags: ['brand', 'approved'],
  compressionSettings: {
    enabled: false,
    quality: 90,
    maxWidth: 2000,
    maxHeight: 2000,
  },
};

const defaultAnalytics: BrandAssetAnalytics = {
  totalAssets: 0,
  assetsByType: {
    logo: 0,
    icon: 0,
    'color-palette': 0,
    font: 0,
    template: 0,
    image: 0,
    video: 0,
    document: 0,
    guideline: 0,
  },
  assetsByClient: {},
  mostUsedAssets: [],
  recentUploads: [],
  storageUsed: 0,
  complianceRate: 100,
  averageUsagePerAsset: 0,
  topPerformingFormats: [],
};

const generateId = () => `brand_asset_${Date.now()}_${Math.random().toString(36).substring(7)}`;

export const useBrandAssetsStore = create<BrandAssetState & BrandAssetActions>()(
  persist(
    (set, get) => ({
      // Initial state
      assets: [],
      guidelines: [],
      collections: [],
      filters: {},
      selectedAssets: [],
      activeClient: undefined,
      activeCollection: undefined,
      view: 'grid',
      sortBy: 'date',
      sortOrder: 'desc',
      isLoading: false,
      error: undefined,
      settings: defaultSettings,
      analytics: defaultAnalytics,

      // Supabase state
      supabase: {
        initialized: false,
        url: undefined,
        bucketName: undefined,
        error: undefined,
      },

      // Asset management
      setAssets: (assets) => set({ assets }),

      addAsset: (assetData) => {
        const { settings } = get();
        const newAsset: BrandAsset = {
          ...assetData,
          id: generateId(),
          uploadedAt: new Date(),
          updatedAt: new Date(),
          usageHistory: [],
          totalDownloads: 0,
          isApproved: settings.autoApproval,
          guidelinesCompliant: true, // Will be validated
        };

        // Validate compliance
        const { checkCompliance } = get();
        const complianceCheck = checkCompliance(newAsset);
        newAsset.guidelinesCompliant = complianceCheck.isCompliant;
        newAsset.complianceNotes = complianceCheck.issues;

        set((state) => ({
          assets: [newAsset, ...state.assets],
          error: undefined,
        }));

        // Refresh analytics
        get().refreshAnalytics();
      },

      updateAsset: (id, updates) => {
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === id
              ? {
                  ...asset,
                  ...updates,
                  updatedAt: new Date(),
                }
              : asset
          ),
        }));
        get().refreshAnalytics();
      },

      deleteAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter((asset) => asset.id !== id),
          selectedAssets: state.selectedAssets.filter((assetId) => assetId !== id),
        }));
        get().refreshAnalytics();
      },

      deleteAssets: (ids) => {
        set((state) => ({
          assets: state.assets.filter((asset) => !ids.includes(asset.id)),
          selectedAssets: state.selectedAssets.filter((assetId) => !ids.includes(assetId)),
        }));
        get().refreshAnalytics();
      },

      approveAsset: (id) => {
        get().updateAsset(id, { isApproved: true });
      },

      rejectAsset: (id, reason) => {
        get().updateAsset(id, { 
          isApproved: false,
          complianceNotes: [reason],
        });
      },

      // Version control
      createAssetVersion: (originalId, newAssetData) => {
        const { assets } = get();
        const originalAsset = assets.find((a) => a.id === originalId);
        if (!originalAsset) return;

        const maxVersion = Math.max(
          originalAsset.versionNumber,
          ...assets
            .filter((a) => a.parentAssetId === originalId)
            .map((a) => a.versionNumber)
        );

        const newAsset: BrandAsset = {
          ...newAssetData,
          id: generateId(),
          parentAssetId: originalId,
          versionNumber: maxVersion + 1,
          uploadedAt: new Date(),
          updatedAt: new Date(),
          usageHistory: [],
          totalDownloads: 0,
          isApproved: get().settings.autoApproval,
          guidelinesCompliant: true,
        };

        set((state) => ({
          assets: [newAsset, ...state.assets],
        }));
      },

      setAsPrimary: (id) => {
        const { assets } = get();
        const asset = assets.find((a) => a.id === id);
        if (!asset) return;

        // Find all assets of the same type and client
        const relatedAssets = assets.filter(
          (a) => a.type === asset.type && a.clientId === asset.clientId
        );

        set((state) => ({
          assets: state.assets.map((a) => {
            if (relatedAssets.find((ra) => ra.id === a.id)) {
              return { ...a, isPrimary: a.id === id };
            }
            return a;
          }),
        }));
      },

      revertToVersion: (versionId) => {
        const { assets } = get();
        const versionAsset = assets.find((a) => a.id === versionId);
        if (!versionAsset) return;

        // Find the original asset (if this is a version)
        const originalId = versionAsset.parentAssetId || versionId;
        const originalAsset = assets.find((a) => a.id === originalId);
        if (!originalAsset) return;

        // Create a new version based on the selected version
        const newVersionData = {
          ...versionAsset,
          name: originalAsset.name, // Keep original name
          clientId: originalAsset.clientId, // Keep original client
          // TODO: In real implementation, copy the actual file content from Supabase
        };

        // Remove id and version-specific fields to create a new version
        const { id, uploadedAt, updatedAt, usageHistory, totalDownloads, parentAssetId, versionNumber, ...cleanData } = newVersionData;

        get().createAssetVersion(originalId, cleanData);
      },

      // Guidelines management
      setGuidelines: (guidelines) => set({ guidelines }),

      addGuideline: (guidelineData) => {
        const newGuideline: BrandGuidelines = {
          ...guidelineData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          guidelines: [newGuideline, ...state.guidelines],
        }));
      },

      updateGuideline: (id, updates) => {
        set((state) => ({
          guidelines: state.guidelines.map((guideline) =>
            guideline.id === id
              ? { ...guideline, ...updates, updatedAt: new Date() }
              : guideline
          ),
        }));
      },

      deleteGuideline: (id) => {
        set((state) => ({
          guidelines: state.guidelines.filter((guideline) => guideline.id !== id),
        }));
      },

      // Collections management
      setCollections: (collections) => set({ collections }),

      addCollection: (collectionData) => {
        const newCollection: BrandAssetCollection = {
          ...collectionData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          collections: [newCollection, ...state.collections],
        }));
      },

      updateCollection: (id, updates) => {
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.id === id
              ? { ...collection, ...updates, updatedAt: new Date() }
              : collection
          ),
        }));
      },

      deleteCollection: (id) => {
        set((state) => ({
          collections: state.collections.filter((collection) => collection.id !== id),
        }));
      },

      addAssetToCollection: (collectionId, assetId) => {
        const { collections } = get();
        const collection = collections.find((c) => c.id === collectionId);
        if (collection && !collection.assetIds.includes(assetId)) {
          get().updateCollection(collectionId, {
            assetIds: [...collection.assetIds, assetId],
          });
        }
      },

      removeAssetFromCollection: (collectionId, assetId) => {
        const { collections } = get();
        const collection = collections.find((c) => c.id === collectionId);
        if (collection) {
          get().updateCollection(collectionId, {
            assetIds: collection.assetIds.filter((id) => id !== assetId),
          });
        }
      },

      // Selection and filtering
      setSelectedAssets: (assetIds) => set({ selectedAssets: assetIds }),

      toggleAssetSelection: (assetId) => {
        set((state) => ({
          selectedAssets: state.selectedAssets.includes(assetId)
            ? state.selectedAssets.filter((id) => id !== assetId)
            : [...state.selectedAssets, assetId],
        }));
      },

      selectAllAssets: () => {
        const filteredAssets = get().getFilteredAssets();
        set({ selectedAssets: filteredAssets.map((asset) => asset.id) });
      },

      clearSelection: () => set({ selectedAssets: [] }),

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => set({ filters: {} }),

      setActiveClient: (clientId) => set({ activeClient: clientId }),
      setActiveCollection: (collectionId) => set({ activeCollection: collectionId }),

      // View controls
      setView: (view) => set({ view }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),

      // Usage tracking
      trackAssetUsage: (assetId, context, usedBy, usedIn) => {
        const { assets } = get();
        const asset = assets.find((a) => a.id === assetId);
        if (!asset) return;

        const usageRecord: AssetUsageHistory = {
          id: generateId(),
          assetId,
          usedBy,
          usedIn,
          context,
          usedAt: new Date(),
          downloadCount: 1,
        };

        get().updateAsset(assetId, {
          usageHistory: [...asset.usageHistory, usageRecord],
          totalDownloads: asset.totalDownloads + 1,
          lastUsed: new Date(),
        });
      },

      incrementDownloadCount: (assetId) => {
        const { assets } = get();
        const asset = assets.find((a) => a.id === assetId);
        if (asset) {
          get().updateAsset(assetId, {
            totalDownloads: asset.totalDownloads + 1,
            lastUsed: new Date(),
          });
        }
      },

      // Settings
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      // State management
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Analytics and insights
      refreshAnalytics: () => {
        const { assets } = get();
        
        const analytics: BrandAssetAnalytics = {
          totalAssets: assets.length,
          assetsByType: assets.reduce((acc, asset) => {
            acc[asset.type] = (acc[asset.type] || 0) + 1;
            return acc;
          }, {} as Record<any, number>),
          assetsByClient: assets.reduce((acc, asset) => {
            acc[asset.clientId] = (acc[asset.clientId] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          mostUsedAssets: assets
            .sort((a, b) => b.totalDownloads - a.totalDownloads)
            .slice(0, 10)
            .map((asset) => ({
              asset,
              usageCount: asset.totalDownloads,
            })),
          recentUploads: assets
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            .slice(0, 10),
          storageUsed: assets.reduce((total, asset) => total + asset.fileSize, 0),
          complianceRate: assets.length > 0 
            ? (assets.filter((asset) => asset.guidelinesCompliant).length / assets.length) * 100 
            : 100,
          averageUsagePerAsset: assets.length > 0 
            ? assets.reduce((total, asset) => total + asset.totalDownloads, 0) / assets.length 
            : 0,
          topPerformingFormats: Object.entries(
            assets.reduce((acc, asset) => {
              if (!acc[asset.format]) {
                acc[asset.format] = { count: 0, downloads: 0 };
              }
              acc[asset.format].count++;
              acc[asset.format].downloads += asset.totalDownloads;
              return acc;
            }, {} as Record<string, { count: number; downloads: number }>)
          ).map(([format, data]) => ({
            format: format as any,
            count: data.count,
            averageDownloads: data.downloads / data.count,
          })),
        };

        set({ analytics });
      },

      getAssetsByType: (type) => {
        const { assets } = get();
        return assets.filter((asset) => asset.type === type);
      },

      getAssetsByClient: (clientId) => {
        const { assets } = get();
        return assets.filter((asset) => asset.clientId === clientId);
      },

      getMostUsedAssets: (limit = 10) => {
        const { assets } = get();
        return assets
          .sort((a, b) => b.totalDownloads - a.totalDownloads)
          .slice(0, limit);
      },

      getRecentAssets: (limit = 10) => {
        const { assets } = get();
        return assets
          .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
          .slice(0, limit);
      },

      getAssetVersions: (parentId) => {
        const { assets } = get();
        return assets
          .filter((asset) => asset.parentAssetId === parentId || asset.id === parentId)
          .sort((a, b) => b.versionNumber - a.versionNumber);
      },

      // Compliance
      checkCompliance: (asset) => {
        const issues: string[] = [];
        let isCompliant = true;

        DEFAULT_COMPLIANCE_RULES.forEach((rule) => {
          switch (rule.type) {
            case 'file-format':
              if (rule.rule.type === asset.type && rule.rule.requiredFormats) {
                if (!rule.rule.requiredFormats.includes(asset.format)) {
                  issues.push(`${rule.name}: Expected formats ${rule.rule.requiredFormats.join(', ')}, got ${asset.format}`);
                  if (rule.severity === 'error') isCompliant = false;
                }
              }
              break;
            case 'dimensions':
              if (rule.rule.type === asset.type && asset.dimensions) {
                if (asset.dimensions.width < rule.rule.minWidth || asset.dimensions.height < rule.rule.minHeight) {
                  issues.push(`${rule.name}: Minimum ${rule.rule.minWidth}x${rule.rule.minHeight}px required`);
                  if (rule.severity === 'error') isCompliant = false;
                }
              }
              break;
            case 'naming':
              if (!rule.rule.pattern.test(asset.name)) {
                issues.push(`${rule.name}: ${rule.description}`);
                if (rule.severity === 'error') isCompliant = false;
              }
              break;
          }
        });

        return { isCompliant, issues };
      },

      validateAssetNaming: (name) => {
        const { settings } = get();
        if (!settings.enforceNaming) return true;
        
        const namingRule = DEFAULT_COMPLIANCE_RULES.find((rule) => rule.type === 'naming');
        return namingRule ? namingRule.rule.pattern.test(name) : true;
      },

      getComplianceRate: () => {
        const { analytics } = get();
        return analytics.complianceRate;
      },

      // Search and discovery
      searchAssets: (query) => {
        const { assets } = get();
        const searchTerms = query.toLowerCase().split(' ');
        
        return assets.filter((asset) =>
          searchTerms.every((term) =>
            asset.name.toLowerCase().includes(term) ||
            asset.description?.toLowerCase().includes(term) ||
            asset.tags.some((tag) => tag.toLowerCase().includes(term)) ||
            asset.type.toLowerCase().includes(term) ||
            asset.variant?.toLowerCase().includes(term)
          )
        );
      },

      getFilteredAssets: () => {
        const { assets, filters, activeClient, activeCollection, collections } = get();
        
        let filteredAssets = assets;

        // Active client filter
        if (activeClient) {
          filteredAssets = filteredAssets.filter((asset) => asset.clientId === activeClient);
        }

        // Active collection filter
        if (activeCollection) {
          const collection = collections.find((c) => c.id === activeCollection);
          if (collection) {
            filteredAssets = filteredAssets.filter((asset) => collection.assetIds.includes(asset.id));
          }
        }

        // Apply filters
        if (filters.clientId) {
          filteredAssets = filteredAssets.filter((asset) => asset.clientId === filters.clientId);
        }

        if (filters.type && filters.type.length > 0) {
          filteredAssets = filteredAssets.filter((asset) => filters.type!.includes(asset.type));
        }

        if (filters.variant && filters.variant.length > 0) {
          filteredAssets = filteredAssets.filter((asset) => 
            asset.variant && filters.variant!.includes(asset.variant)
          );
        }

        if (filters.format && filters.format.length > 0) {
          filteredAssets = filteredAssets.filter((asset) => filters.format!.includes(asset.format));
        }

        if (filters.isApproved !== undefined) {
          filteredAssets = filteredAssets.filter((asset) => asset.isApproved === filters.isApproved);
        }

        if (filters.isPrimary !== undefined) {
          filteredAssets = filteredAssets.filter((asset) => asset.isPrimary === filters.isPrimary);
        }

        if (filters.tags && filters.tags.length > 0) {
          filteredAssets = filteredAssets.filter((asset) =>
            filters.tags!.some((tag) => asset.tags.includes(tag))
          );
        }

        if (filters.searchQuery) {
          filteredAssets = get().searchAssets(filters.searchQuery);
        }

        if (filters.usageContext && filters.usageContext.length > 0) {
          filteredAssets = filteredAssets.filter((asset) =>
            asset.allowedContexts.some((context) => filters.usageContext!.includes(context))
          );
        }

        // Sort assets
        const { sortBy, sortOrder } = get();
        filteredAssets.sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'date':
              comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
              break;
            case 'usage':
              comparison = a.totalDownloads - b.totalDownloads;
              break;
            case 'type':
              comparison = a.type.localeCompare(b.type);
              break;
            case 'size':
              comparison = a.fileSize - b.fileSize;
              break;
          }

          return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filteredAssets;
      },

      getSuggestedTags: () => {
        const { assets } = get();
        const allTags = assets.flatMap((asset) => asset.tags);
        const tagCounts = allTags.reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .map(([tag]) => tag);
      },

      // Bulk operations
      bulkApprove: (assetIds) => {
        assetIds.forEach((id) => get().approveAsset(id));
      },

      bulkReject: (assetIds, reason) => {
        assetIds.forEach((id) => get().rejectAsset(id, reason));
      },

      bulkMove: (assetIds, collectionId) => {
        assetIds.forEach((assetId) => get().addAssetToCollection(collectionId, assetId));
      },

      bulkTag: (assetIds, tags) => {
        const { assets } = get();
        assetIds.forEach((id) => {
          const asset = assets.find((a) => a.id === id);
          if (asset) {
            const newTags = [...new Set([...asset.tags, ...tags])];
            get().updateAsset(id, { tags: newTags });
          }
        });
      },

      // Export and sharing
      exportAssets: async (assetIds, format) => {
        try {
          const { assets } = get();
          const selectedAssets = assets.filter(asset => assetIds.includes(asset.id));

          if (selectedAssets.length === 0) {
            throw new Error('No assets selected for export');
          }

          set({ isLoading: true, error: undefined });

          if (format === 'zip') {
            // Create ZIP file with JSZip
            if (typeof window !== 'undefined' && window.JSZip) {
              const zip = new window.JSZip();
              const folder = zip.folder('brand-assets');

              // Add assets to ZIP
              for (const asset of selectedAssets) {
                try {
                  // For demo purposes, create a text file with asset metadata
                  // In real implementation, fetch actual file from Supabase or CDN
                  const metadata = `Asset Name: ${asset.name}
Description: ${asset.description || 'No description'}
Type: ${asset.type}
Format: ${asset.format}
Size: ${asset.fileSize} bytes
Uploaded: ${asset.uploadedAt}
Tags: ${asset.tags.join(', ')}
URL: ${asset.url}

This is a demo export. In production, the actual file would be included.`;

                  folder?.file(`${asset.name}_metadata.txt`, metadata);

                  // TODO: Add actual file blob
                  // const response = await fetch(asset.url);
                  // const blob = await response.blob();
                  // folder?.file(asset.name, blob);
                } catch (error) {
                  console.warn(`Failed to add ${asset.name} to zip:`, error);
                }
              }

              // Generate and download ZIP
              const zipBlob = await zip.generateAsync({ type: 'blob' });
              const url = URL.createObjectURL(zipBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `brand-assets-${Date.now()}.zip`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            } else {
              throw new Error('JSZip library not available');
            }

          } else if (format === 'pdf') {
            // Generate PDF report with asset information
            const reportContent = `
BRAND ASSET EXPORT REPORT
Generated: ${new Date().toLocaleString()}
Total Assets: ${selectedAssets.length}

${selectedAssets.map((asset, index) => `
${index + 1}. ${asset.name}
   Type: ${asset.type}
   Format: ${asset.format}
   Size: ${(asset.fileSize / 1024).toFixed(2)} KB
   Uploaded: ${asset.uploadedAt.toLocaleDateString()}
   Tags: ${asset.tags.join(', ')}
   URL: ${asset.url}
   ${asset.description ? `Description: ${asset.description}` : ''}
`).join('\n')}

End of Report`;

            // Create a text file for demo (in production, use PDF library like jsPDF)
            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `brand-assets-report-${Date.now()}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }

          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Export failed';
          set({ isLoading: false, error: errorMessage });
          console.error('Export error:', error);
        }
      },

      generateShareLink: (assetIds, expiresIn = 7 * 24 * 60 * 60 * 1000) => {
        try {
          // Generate a secure share ID
          const shareId = `share_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          const expiryDate = new Date(Date.now() + expiresIn);

          // In production, this would be stored in a database
          const shareData = {
            id: shareId,
            assetIds,
            expiresAt: expiryDate,
            createdAt: new Date(),
            accessCount: 0,
            maxAccess: undefined as number | undefined,
            password: undefined as string | undefined
          };

          // Store in localStorage for demo (in production, use backend)
          const existingShares = JSON.parse(localStorage.getItem('brandAssetShares') || '{}');
          existingShares[shareId] = shareData;
          localStorage.setItem('brandAssetShares', JSON.stringify(existingShares));

          console.log('Generated share link:', shareId, 'expires:', expiryDate);

          return `${window.location.origin}/share/${shareId}`;
        } catch (error) {
          console.error('Failed to generate share link:', error);
          return '';
        }
      },

      // Missing function implementations
      downloadAsset: async (assetId) => {
        const { assets, incrementDownloadCount } = get();
        const asset = assets.find(a => a.id === assetId);

        if (!asset) {
          set({ error: 'Asset not found' });
          return;
        }

        try {
          // For now, trigger browser download of the asset URL
          // TODO: Replace with actual Supabase download implementation
          const link = document.createElement('a');
          link.href = asset.url;
          link.download = asset.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Track the download
          incrementDownloadCount(assetId);
        } catch (error) {
          console.error('Download failed:', error);
          set({ error: 'Download failed. Please try again.' });
        }
      },

      toggleAssetApproval: (assetId) => {
        const { assets } = get();
        const asset = assets.find(a => a.id === assetId);

        if (asset) {
          get().updateAsset(assetId, {
            isApproved: !asset.isApproved
          });
        }
      },

      setSorting: (sortBy, sortOrder) => {
        set({ sortBy, sortOrder });
      },

      // Supabase integration functions
      initializeSupabase: async (url, anonKey, bucketName = 'brand-assets') => {
        try {
          supabaseStorage.initialize({
            url,
            anonKey,
            bucketName
          });

          // Test the connection by creating bucket if needed
          const bucketResult = await supabaseStorage.createBucket(true);

          set((state) => ({
            supabase: {
              initialized: true,
              url,
              bucketName,
              error: bucketResult.error?.message
            }
          }));

          if (bucketResult.error && !bucketResult.error.message.includes('already exists')) {
            console.warn('Supabase bucket creation warning:', bucketResult.error.message);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Supabase';
          set((state) => ({
            supabase: {
              initialized: false,
              url,
              bucketName,
              error: errorMessage
            }
          }));
          console.error('Supabase initialization error:', error);
        }
      },

      uploadFileToSupabase: async (file, assetData) => {
        const { supabase: supabaseState } = get();

        if (!supabaseState.initialized) {
          console.error('Supabase not initialized');
          return null;
        }

        try {
          set({ isLoading: true, error: undefined });

          // Create asset metadata
          const metadata: AssetMetadata = {
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedBy: assetData.uploadedBy,
            clientId: assetData.clientId,
            assetType: assetData.type,
            version: assetData.versionNumber,
            parentAssetId: assetData.parentAssetId,
            tags: assetData.tags,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Upload to Supabase
          const uploadResult = await supabaseStorage.uploadBrandAsset(file, metadata);

          if (uploadResult.error) {
            set({ isLoading: false, error: uploadResult.error.message });
            return null;
          }

          if (!uploadResult.data) {
            set({ isLoading: false, error: 'Upload failed - no data returned' });
            return null;
          }

          // Create the brand asset with Supabase URLs
          const newAsset: BrandAsset = {
            ...assetData,
            id: generateId(),
            url: uploadResult.data.url,
            thumbnailUrl: uploadResult.data.thumbnailUrl || uploadResult.data.url,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            usageHistory: [],
            totalDownloads: 0,
            // Store Supabase path for future operations
            metadata: {
              ...assetData.metadata,
              supabasePath: uploadResult.data.path
            }
          };

          // Add to store
          get().addAsset(newAsset);

          set({ isLoading: false, error: undefined });
          return newAsset;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          set({ isLoading: false, error: errorMessage });
          console.error('Supabase upload error:', error);
          return null;
        }
      },

      getSupabaseStatus: () => {
        const { supabase } = get();
        return {
          initialized: supabase.initialized,
          error: supabase.error
        };
      },

      // Initialize sample data
      initializeSampleData: () => {
        const sampleAssets: BrandAsset[] = [
          {
            id: 'asset-1',
            clientId: 'client-1',
            name: 'Company Logo - Primary',
            description: 'Primary company logo for all official communications',
            type: 'logo',
            variant: 'primary',
            format: 'svg',
            fileSize: 156789,
            dimensions: { width: 500, height: 200 },
            url: '/sample-assets/logo-primary.svg',
            thumbnailUrl: '/sample-assets/logo-primary-thumb.png',
            tags: ['branding', 'official', 'primary'],
            isApproved: true,
            isPrimary: true,
            versionNumber: 1,
            usageHistory: [],
            totalDownloads: 45,
            guidelinesCompliant: true,
            uploadedBy: 'John Smith',
            uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            isPublic: true,
            allowedUsers: [],
            allowedContexts: ['website', 'email', 'print', 'social-media'],
            lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          },
          {
            id: 'asset-2',
            clientId: 'client-1',
            name: 'Brand Color Palette',
            description: 'Official brand colors with hex codes',
            type: 'color-palette',
            variant: 'primary',
            format: 'png',
            fileSize: 89123,
            dimensions: { width: 800, height: 400 },
            url: '/sample-assets/color-palette.png',
            thumbnailUrl: '/sample-assets/color-palette-thumb.png',
            tags: ['colors', 'branding', 'guidelines'],
            isApproved: true,
            isPrimary: true,
            versionNumber: 2,
            usageHistory: [],
            totalDownloads: 23,
            guidelinesCompliant: true,
            uploadedBy: 'Sarah Wilson',
            uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            isPublic: true,
            allowedUsers: [],
            allowedContexts: ['website', 'print', 'presentation'],
            lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          },
          {
            id: 'asset-3',
            clientId: 'client-1',
            name: 'Marketing Presentation Template',
            description: 'PowerPoint template for marketing presentations',
            type: 'template',
            variant: 'primary',
            format: 'psd',
            fileSize: 2456789,
            url: '/sample-assets/marketing-template.psd',
            thumbnailUrl: '/sample-assets/marketing-template-thumb.png',
            tags: ['template', 'marketing', 'presentation'],
            isApproved: false,
            isPrimary: false,
            versionNumber: 1,
            usageHistory: [],
            totalDownloads: 12,
            guidelinesCompliant: false,
            complianceNotes: ['File size exceeds recommended maximum', 'Missing required metadata'],
            uploadedBy: 'Mike Johnson',
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            isPublic: false,
            allowedUsers: ['mike.johnson@company.com', 'sarah.wilson@company.com'],
            allowedContexts: ['presentation', 'advertising'],
            lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          },
          {
            id: 'asset-4',
            clientId: 'client-1',
            name: 'Product Photos - Lifestyle',
            description: 'High-quality lifestyle product photography',
            type: 'image',
            format: 'jpg',
            fileSize: 3456789,
            dimensions: { width: 2400, height: 1600 },
            url: '/sample-assets/product-lifestyle.jpg',
            thumbnailUrl: '/sample-assets/product-lifestyle-thumb.jpg',
            tags: ['photography', 'product', 'lifestyle'],
            isApproved: true,
            isPrimary: false,
            versionNumber: 1,
            usageHistory: [],
            totalDownloads: 67,
            guidelinesCompliant: true,
            uploadedBy: 'Emma Davis',
            uploadedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
            updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            isPublic: true,
            allowedUsers: [],
            allowedContexts: ['website', 'social-media', 'advertising', 'email'],
            lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          },
          {
            id: 'asset-5',
            clientId: 'client-1',
            name: 'Typography Guidelines',
            description: 'Font families and usage guidelines',
            type: 'guideline',
            format: 'pdf',
            fileSize: 678901,
            url: '/sample-assets/typography-guide.pdf',
            thumbnailUrl: '/sample-assets/typography-guide-thumb.png',
            tags: ['typography', 'guidelines', 'fonts'],
            isApproved: true,
            isPrimary: true,
            versionNumber: 3,
            usageHistory: [],
            totalDownloads: 34,
            guidelinesCompliant: true,
            uploadedBy: 'Alex Brown',
            uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            isPublic: true,
            allowedUsers: [],
            allowedContexts: ['website', 'print', 'presentation', 'email'],
            lastUsed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          }
        ];

        const sampleGuidelines: BrandGuidelines[] = [
          {
            id: 'guideline-1',
            clientId: 'client-1',
            name: 'TechCorp Brand Guidelines',
            description: 'Complete brand guidelines including logo usage, colors, and typography',
            logoSpacing: {
              minimum: '10px',
              recommended: '20px',
              clearSpace: '50px'
            },
            colorPalettes: [
              {
                id: 'palette-1',
                name: 'Primary Brand Colors',
                primary: '#6366f1',
                secondary: '#8b5cf6',
                accent: '#06b6d4',
                background: '#f8fafc',
                text: '#1e293b',
                colors: [
                  { name: 'Purple 600', hex: '#6366f1', rgb: 'rgb(99, 102, 241)', usage: 'Primary brand color' },
                  { name: 'Purple 500', hex: '#8b5cf6', rgb: 'rgb(139, 92, 246)', usage: 'Secondary brand color' },
                  { name: 'Cyan 500', hex: '#06b6d4', rgb: 'rgb(6, 182, 212)', usage: 'Accent color' }
                ]
              }
            ],
            fonts: [
              {
                id: 'font-1',
                name: 'Inter',
                family: 'Inter, sans-serif',
                weights: ['400', '500', '600', '700'],
                styles: ['normal', 'italic'],
                webFont: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
                usage: {
                  headers: true,
                  body: true,
                  captions: false,
                  ui: true
                }
              }
            ],
            doNotUse: [
              'Do not stretch or distort the logo',
              'Do not use colors outside the approved palette',
              'Do not place logo on busy backgrounds',
              'Do not modify font weights without approval'
            ],
            usage: {
              contexts: ['website', 'email', 'print', 'social-media'],
              restrictions: [
                'Requires approval for external use',
                'Cannot be modified without permission',
                'Must maintain clear space requirements'
              ],
              approvedUses: [
                'Official company communications',
                'Marketing materials',
                'Website and digital assets',
                'Printed collateral'
              ]
            },
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          }
        ];

        set((state) => ({
          assets: [...state.assets, ...sampleAssets],
          guidelines: [...state.guidelines, ...sampleGuidelines]
        }));

        // Refresh analytics after adding sample data
        get().refreshAnalytics();
      },
    }),
    {
      name: 'brand-assets-storage',
      partialize: (state) => ({
        assets: state.assets,
        guidelines: state.guidelines,
        collections: state.collections,
        settings: state.settings,
        filters: state.filters,
        view: state.view,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);