import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnAgentService } from './sn-agent.service';
import { SnAgentController } from './sn-agent.controller';
import { AiService } from '../ai/ai.service';
import { User } from '../entities/user.entity';
import { TableSemantics } from '../entities/table-semantics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, TableSemantics])],
  controllers: [SnAgentController],
  providers: [SnAgentService, AiService],
  exports: [SnAgentService],
})
export class SnAgentModule {}
