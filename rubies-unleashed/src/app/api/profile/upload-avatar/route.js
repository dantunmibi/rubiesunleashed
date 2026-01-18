import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'avatar' or 'cover'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!['avatar', 'cover'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be avatar or cover' }, { status: 400 });
    }

    // ✅ Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 });
    }

    // ✅ Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // ✅ DELETE OLD FILES OF THIS TYPE (avatar or cover)
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(user.id);

    if (existingFiles && existingFiles.length > 0) {
      // ✅ Filter files by type prefix (avatar_ or cover_)
      const oldFilesOfType = existingFiles
        .filter(f => f.name.startsWith(`${type}_`))
        .map(f => `${user.id}/${f.name}`);

      if (oldFilesOfType.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(oldFilesOfType);

        if (deleteError) {
          console.warn('Delete old files warning:', deleteError);
        } else {
          console.log(`✅ Deleted ${oldFilesOfType.length} old ${type} file(s)`);
        }
      }
    }

    // ✅ Generate proper filename with type prefix
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}_${Date.now()}.${fileExt}`; // avatar_123456.jpg or cover_123456.jpg
    const filePath = `${user.id}/${fileName}`;

    // ✅ Convert file to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Upload new file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // ✅ Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // ✅ Update profile with new URL
    const updateField = type === 'avatar' ? 'avatar_url' : 'cover_url';
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        [updateField]: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      url: publicUrl,
      message: `${type === 'avatar' ? 'Avatar' : 'Cover'} uploaded successfully`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}