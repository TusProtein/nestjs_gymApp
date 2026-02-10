import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '~/common/interfaces/authenticated-request';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getMyNotifications(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.getUserNotifications(req.user);
  }

  @Patch(':id/read')
  markRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.notificationsService.markAsRead(id, req.user);
  }

  @Get('unread-count')
  getUnread(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.getUnreadCount(req.user);
  }

  @Patch('read-all')
  markAll(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.markAllAsRead(req.user);
  }
}
