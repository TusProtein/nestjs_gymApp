import { Module } from '@nestjs/common';
import { UserMembershipService } from './user-membership.service';
import { UserMembershipController } from './user-membership.controller';

@Module({
  controllers: [UserMembershipController],
  providers: [UserMembershipService],
})
export class UserMembershipModule {}
