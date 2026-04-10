/**
 * 💎 RUBIES UNLEASHED - Dynamic LLMs Full Catalog
 * ------------------------------------------------
 * Auto-generated plain text catalog for AI models.
 * Updates every 24 hours via Next.js revalidation.
 * Route: /llms-full.txt (public, crawlable — not under /api/)
 *
 * Includes:
 * - All published Supabase projects (The Forge)
 */

import { createClient } from '@supabase/supabase-js';

export const revalidate = 86400; // 24 hours

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Formatter ────────────────────────────────────────────────────────────────

function formatProject(project) {
  const lines = [];

  lines.push(`### ${project.title}`);
  lines.push(`- URL: https://rubiesunleashed.app/view/${project.slug || project.id}`);
  lines.push(`- Type: ${project.type || 'Game'}`);
  lines.push(`- Source: Community (The Forge)`);

  if (project.developer) lines.push(`- Developer: ${project.developer}`);
  if (project.version)   lines.push(`- Version: ${project.version}`);
  if (project.license)   lines.push(`- License: ${project.license}`);
  if (project.size)      lines.push(`- Size: ${project.size}`);
  if (project.age_rating) lines.push(`- Age Rating: ${project.age_rating}`);

  if (project.download_links?.length > 0) {
    const platforms = [...new Set(project.download_links.map(l => l.platform))].join(', ');
    lines.push(`- Platforms: ${platforms}`);
  }

  if (project.created_at) {
    const date = new Date(project.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    lines.push(`- Published: ${date}`);
  }

  if (project.description) {
    lines.push('');
    lines.push('Description:');
    lines.push(project.description.replace(/<[^>]*>/g, '').trim());
  }

  if (project.full_description && project.full_description !== project.description) {
    lines.push('');
    lines.push('Full Description:');
    lines.push(project.full_description.replace(/<[^>]*>/g, '').trim());
  }

  if (project.features?.length > 0) {
    lines.push('');
    lines.push('Key Features:');
    project.features.forEach(f => lines.push(`- ${f}`));
  }

  if (project.tags?.length > 0) {
    lines.push('');
    lines.push(`Tags: ${project.tags.join(', ')}`);
  }

  if (
    project.content_warning &&
    project.content_warning !== '[]' &&
    project.content_warning.trim() !== ''
  ) {
    lines.push(`Content Warnings: ${project.content_warning}`);
  }

  if (project.social_links?.length > 0) {
    lines.push('');
    lines.push('Creator Links:');
    project.social_links.forEach(l => lines.push(`- ${l.label}: ${l.url}`));
  }

  return lines.join('\n');
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id, title, slug, type, developer, version, license, size,
        age_rating, description, full_description, features, tags,
        content_warning, download_links, social_links, created_at
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const generatedAt = new Date().toUTCString();
    const totalCount = projects?.length || 0;
    const sections = [];

    // Header
    sections.push('# Rubies Unleashed — Full Project Catalog');
    sections.push('> Where New Ideas Rise — Auto-generated catalog for AI models and crawlers.');
    sections.push('');
    sections.push(`- Generated: ${generatedAt}`);
    sections.push(`- Total Projects: ${totalCount}`);
    sections.push(`- Platform: https://rubiesunleashed.app`);
    sections.push(`- Summary: https://rubiesunleashed.app/llms.txt`);
    sections.push(`- Sitemap: https://rubiesunleashed.app/sitemap.xml`);
    sections.push('');
    sections.push('---');
    sections.push('');

    if (totalCount === 0) {
      sections.push('No published projects available at this time.');
    } else {
      sections.push(`## Published Projects — The Forge (${totalCount})`);
      sections.push('Published by verified creators on the Rubies Unleashed platform.');
      sections.push('');

      projects.forEach((project, i) => {
        sections.push(formatProject(project));
        if (i < projects.length - 1) sections.push('');
      });
    }

    // Footer
    sections.push('');
    sections.push('---');
    sections.push('');
    sections.push('## About This File');
    sections.push('This file is auto-generated every 24 hours.');
    sections.push('For a summary version, see: https://rubiesunleashed.app/llms.txt');
    sections.push('For structured data, see: https://rubiesunleashed.app/sitemap.xml');
    sections.push('');
    sections.push('Rubies Unleashed — Where New Ideas Rise');
    sections.push('© 2026 Rubies Unleashed. All rights reserved.');

    return new Response(sections.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('❌ llms-full.txt generation failed:', error);

    return new Response(
      '# Rubies Unleashed — Full Catalog\n\nTemporarily unavailable. See https://rubiesunleashed.app/llms.txt\n',
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }
}