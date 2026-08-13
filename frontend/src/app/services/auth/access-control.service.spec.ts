import { RESOURCE_ACCESS } from './access-control.service';

describe('Notification access policy', () => {
  it('allows every authenticated role to view notifications', () => {
    expect(RESOURCE_ACCESS.notifications.view).toEqual([
      'admin',
      'teacher',
      'secretary',
      'student',
      'parent'
    ]);
  });

  it('matches the API authoring and deletion permissions', () => {
    expect(RESOURCE_ACCESS.notifications.create).toEqual(['admin', 'teacher', 'secretary']);
    expect(RESOURCE_ACCESS.notifications.delete).toEqual(['admin']);
  });
});
