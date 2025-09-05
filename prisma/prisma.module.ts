import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // để PrismaService dùng được ở mọi module mà không cần import lại
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
