# Supabase Integration for Brand Asset Management

This dashboard now includes full Supabase integration for cloud-based file storage and management.

## Setup Instructions

### 1. Create a Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new project
- Wait for the project to be fully initialized (this may take a few minutes)

### 2. Get Your Credentials
- Navigate to **Project Settings** → **API**
- Copy your **Project URL** (looks like `https://your-project.supabase.co`)
- Copy your **anon/public key** (the long JWT token)

### 3. Enable Storage
- In your Supabase dashboard, go to **Storage**
- Storage should be enabled by default, but verify it's available

### 4. Configure in the Dashboard
- Go to **Brand Asset Management** → **Settings** tab
- Scroll down to the **Supabase Configuration** section
- Enter your Project URL and anon key
- Choose a bucket name (default: `brand-assets`)
- Click **Connect to Supabase**

## Features Enabled

Once configured, the following features become available:

### File Storage
- **Secure cloud storage**: All files are stored securely in Supabase Storage
- **Large file support**: Upload files up to 100MB
- **CDN delivery**: Fast file access through Supabase's CDN

### File Operations
- **Upload**: Files are automatically uploaded to organized folders by client and asset type
- **Download**: Direct download from cloud storage
- **Version Control**: File versions are stored separately for history tracking
- **Thumbnail Generation**: Automatic thumbnail creation for images (coming soon)

### Organization Structure
Files are automatically organized in the following structure:
```
/{clientId}/
  ├── logos/           # Logo assets
  ├── icons/           # Icon assets
  ├── images/          # General images
  ├── documents/       # PDF and document files
  ├── templates/       # Template files
  ├── thumbnails/      # Auto-generated thumbnails
  └── versions/        # Version history files
    ├── v2/
    ├── v3/
    └── ...
```

## Technical Implementation

### Store Integration
The Zustand store (`brandAssetsStore.ts`) includes:
- `initializeSupabase()`: Connect to Supabase with credentials
- `uploadFileToSupabase()`: Upload files with metadata
- `getSupabaseStatus()`: Check connection status

### Storage Service
The `supabaseStorage` service (`utils/supabase-storage.ts`) handles:
- File upload/download operations
- Path generation and organization
- Error handling and progress tracking
- Bucket management

### Components
- **SupabaseConfig**: Configuration interface for setup
- **BrandAssetUpload**: Enhanced to use Supabase when configured
- **AssetVersionControl**: File version management with cloud storage

## Local Development vs. Production

### Local Development
- Files are stored locally in the browser's storage for development
- Sample data is used for testing
- No Supabase configuration required for basic functionality

### Production with Supabase
- All files are stored in Supabase Storage
- Real file upload/download functionality
- Version control with actual file copies
- Secure access with signed URLs for private files

## Security Considerations

- The anon key is safe to expose in frontend applications
- Row Level Security (RLS) should be configured in Supabase for production
- Consider setting up proper access policies for different user roles
- File access can be controlled through Supabase's built-in security features

## Troubleshooting

### Connection Issues
- Verify your Project URL is correct and accessible
- Ensure the anon key is copied correctly (it's a long JWT token)
- Check that Storage is enabled in your Supabase project

### Upload Issues
- Verify file size is under 100MB limit
- Check that the file type is supported
- Ensure the storage bucket exists (it should be created automatically)

### Permission Issues
- Check Supabase Storage policies
- Verify the bucket is set to public for public assets
- Review RLS policies if implemented

## Next Steps

Future enhancements planned:
- [ ] Automatic thumbnail generation for images
- [ ] Advanced file transformation options
- [ ] Bulk upload with progress tracking
- [ ] Integration with Supabase Auth for user-specific access
- [ ] Advanced file search and indexing
- [ ] File compression and optimization options