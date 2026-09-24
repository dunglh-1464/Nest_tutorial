import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true })
  name: string;
}