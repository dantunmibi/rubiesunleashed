import { addNotification } from '@/lib/notificationManager';

/**
 * Add project lifecycle notifications
 */

export function notifyProjectCreated(project) {
  addNotification({
    type: 'project_created',
    message: `Project "${project.title}" created successfully`,
    icon: '🚀',
    actionData: {
      type: 'project_created',
      projectId: project.id,
      projectSlug: project.slug,
      projectTitle: project.title,
      status: project.status || 'draft'  // ✅ ADD STATUS
    }
  });
}

export function notifyProjectUpdated(project) {
  addNotification({
    type: 'project_updated',
    message: `Project "${project.title}" saved`,
    icon: '💾',
    actionData: {
      type: 'project_updated',
      projectId: project.id,
      projectSlug: project.slug,
      projectTitle: project.title,
      status: project.status  // ✅ ADD STATUS
    }
  });
}

export function notifyProjectDeleted(project, isHardDelete = false) {
  addNotification({
    type: 'project_deleted',
    message: `Project "${project.title}" ${isHardDelete ? 'deleted permanently' : 'archived'}`,
    icon: isHardDelete ? '🗑️' : '📦',
    actionData: {
      type: isHardDelete ? 'project_deleted' : 'project_archived',
      projectId: project.id,
      projectTitle: project.title,
      status: 'deleted'  // ✅ ADD STATUS
      // Don't include slug for deleted projects since they're no longer accessible
    }
  });
}

export function notifyProjectPublished(project) {
  addNotification({
    type: 'project_published',
    message: `Project "${project.title}" is now live!`,
    icon: '🌟',
    actionData: {
      type: 'project_published',
      projectId: project.id,
      projectSlug: project.slug,
      projectTitle: project.title,
      status: 'published'  // ✅ ADD STATUS
    }
  });
}

export function notifyProjectUnpublished(project) {
  addNotification({
    type: 'project_updated',
    message: `Project "${project.title}" unpublished`,
    icon: '📝',
    actionData: {
      type: 'project_unpublished',
      projectId: project.id,
      projectSlug: project.slug,
      projectTitle: project.title,
      status: 'draft'  // ✅ ADD STATUS (unpublished = back to draft)
    }
  });
}