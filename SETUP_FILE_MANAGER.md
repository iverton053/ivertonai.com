# File Manager Setup Guide

## Quick Setup (15 minutes total)

### Step 1: Database Setup (5 minutes)
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/file-manager-schema.sql`
4. Run the SQL script

### Step 2: Storage Setup (2 minutes)
1. In Supabase Dashboard → Storage
2. Create new bucket: `file-manager`
3. Set bucket to Public
4. Save settings

### Step 3: Update Environment (1 minute)
Add to your `.env` file:
```bash
VITE_SUPABASE_STORAGE_URL=your_supabase_storage_url
VITE_FILE_UPLOAD_MAX_SIZE=104857600  # 100MB
```

### Step 4: Connect Real API (7 minutes)
Update `src/stores/fileManagerStore.ts`:

```typescript
// Replace the mock functions with real API calls
import { fileApiService } from '../services/fileApi';

// In uploadFiles function:
uploadFiles: async (files, folderId) => {
  for (const file of files) {
    try {
      const fileId = `upload_${Date.now()}_${Math.random()}`;
      addUpload({
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });

      const uploadedFile = await fileApiService.uploadFile(
        file,
        { 
          category: get().currentCategory || 'uncategorized',
          folderId 
        },
        (progress) => updateUpload(fileId, { progress })
      );

      addFile(uploadedFile);
      updateUpload(fileId, { status: 'completed' });
      setTimeout(() => removeUpload(fileId), 2000);
    } catch (error) {
      updateUpload(fileId, { 
        status: 'error', 
        error: error.message 
      });
    }
  }
},

// In refreshFiles function:
refreshFiles: async () => {
  set({ isLoading: true });
  try {
    const files = await fileApiService.getFiles();
    set({ files });
  } catch (error) {
    set({ error: error.message });
  } finally {
    set({ isLoading: false });
  }
},
```

## What Works Immediately After Setup:

✅ **Real file uploads to cloud storage**
✅ **File organization with categories**  
✅ **Team/client sharing with permissions**
✅ **Download tracking and analytics**
✅ **Search and filtering**
✅ **Activity logging**
✅ **Storage quota management**
✅ **Version control**
✅ **Comments system**

## Test Your Setup:

1. Navigate to Operations → File Manager
2. Click "Upload Files"
3. Select a test file
4. Verify it appears in the file grid
5. Check Supabase Storage for the uploaded file

## Troubleshooting:

**Upload fails:**
- Check Supabase bucket permissions
- Verify environment variables
- Check browser console for errors

**Files don't appear:**
- Run database schema again
- Check RLS policies in Supabase
- Verify user authentication

**Storage quota issues:**
- Check storage_quotas table
- Verify trigger functions are created

## Production Considerations:

1. **Security**: Review RLS policies
2. **Performance**: Add CDN for file delivery
3. **Backup**: Set up automated backups
4. **Monitoring**: Add error tracking
5. **Scaling**: Consider file compression

## Support:

If you encounter issues:
1. Check Supabase logs
2. Review browser console
3. Verify database schema
4. Test with small files first