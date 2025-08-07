// Este arquivo é mais para tipagem e pode ser usado para transformar dados.
// Com Prisma, muitas vezes você pode usar os tipos gerados diretamente:
// import { User as PrismaUser } from '@prisma/client';
// export class UserEntity implements PrismaUser { ... }
// Mas para fins de exemplo, vamos criar uma classe simples baseada no Prisma.

import { User as PrismaUser } from '@prisma/client';

export class UserEntity implements PrismaUser {
  id: string;
  email: string;
  password: string; // Cuidado ao expor a senha! Remova em DTOs de saída.
  name: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Construtor para transformar dados (opcional, mas útil)
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}