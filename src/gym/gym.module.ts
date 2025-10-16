import { Module } from '@nestjs/common';
import { GymService } from './gym.service';
import { GymController } from './gym.controller';
import { UserModule } from '~/users/user.module';

@Module({
  imports: [UserModule],
  controllers: [GymController],
  providers: [GymService],
})
export class GymModule {}
