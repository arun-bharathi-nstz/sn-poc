import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TableType = 'table' | 'material_view';

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

  @Column({ type: 'simple-json', nullable: true })
  embed?: number[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
