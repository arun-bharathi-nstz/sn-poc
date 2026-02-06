import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TableType = 'table' | 'materialized_view';

@Entity('table_semantics')
export class TableSemantics {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: 'varchar',
    default: 'table',
  })
  type!: TableType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'simple-array', default: '' })
  columns!: string[];

  @Column({ type: 'vector', length: 1536, nullable: true })
  embed?: number[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
