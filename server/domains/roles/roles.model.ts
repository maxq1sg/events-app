import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Permission from "../permisssions/permissions.model";
import User from "../users/user.model";

@Entity("roles")
export default class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Permission, (per) => per.roles, { cascade: true })
  @JoinTable({
    name: "roles_and_permissions",
  })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
