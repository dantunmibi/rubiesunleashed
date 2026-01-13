    import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// File constraints
const MAX_FILE_SIZE = {
  cover: 2 * 1024 * 1024, // 2MB
  screenshot: 4 * 1024 * 1024 // 4MB
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Verify Auth (Enhanced token extraction)
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get('file');
    const projectId = formData.get('projectId');
    const imageType = formData.get('type'); // 'cover' or 'screenshot'

    // 3. Validate Required Fields
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!imageType || !['cover', 'screenshot'].includes(imageType)) {
      return NextResponse.json(
        { error: 'Type must be "cover" or "screenshot"' },
        { status: 400 }
      );
    }

    // 4. Verify Project Ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this project' },
        { status: 403 }
      );
    }

    // 5. Validate File Type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // 6. Validate File Size
    const maxSize = MAX_FILE_SIZE[imageType];
    if (file.size > maxSize) {
      const maxMB = (maxSize / 1024 / 1024).toFixed(0);
      return NextResponse.json(
        { error: `File too large. Max ${maxMB}MB for ${imageType}` },
        { status: 400 }
      );
    }

    // 7. Sanitize File Extension
    const originalExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!originalExt || !ALLOWED_EXTENSIONS.includes(originalExt)) {
      return NextResponse.json(
        { error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // 8. Generate Safe File Path
    // Use consistent naming to enable overwrite (prevents orphaned files)
    const fileName = imageType === 'cover'
      ? `cover.${originalExt}`
      : `screenshot-${Date.now()}.${originalExt}`;

    const filePath = `${user.id}/${projectId}/${fileName}`;

    // 9. Optional: Delete Old Cover (if replacing)
    if (imageType === 'cover') {
      // List existing cover files to clean up
      const { data: existingFiles } = await supabase.storage
        .from('project-assets')
        .list(`${user.id}/${projectId}`, {
          search: 'cover.'
        });

      if (existingFiles && existingFiles.length > 0) {
        // Delete old covers (jpg, png, webp variants)
        const filesToDelete = existingFiles
          .filter(f => f.name.startsWith('cover.'))
          .map(f => `${user.id}/${projectId}/${f.name}`);

        if (filesToDelete.length > 0) {
          await supabase.storage
            .from('project-assets')
            .remove(filesToDelete);
        }
      }
    }

    // 10. Upload File
    const { error: uploadError } = await supabase.storage
      .from('project-assets')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      
      // Handle specific errors
      if (uploadError.message?.includes('exceeded')) {
        return NextResponse.json(
          { error: 'Storage quota exceeded. Please contact support.' },
          { status: 507 }
        );
      }
      
      throw uploadError;
    }

    // 11. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-assets')
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      type: imageType,
      size: file.size,
      message: `${imageType === 'cover' ? 'Cover' : 'Screenshot'} uploaded successfully`
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}