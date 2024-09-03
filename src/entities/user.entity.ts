import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';

@Entity()
export class User {
  constructor(username: string, email: string, password: string) {
    this.username = username;
    this.email = email;
    this.password = password;
  }
  
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;


  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = `P${this.password}`;
  }
}
