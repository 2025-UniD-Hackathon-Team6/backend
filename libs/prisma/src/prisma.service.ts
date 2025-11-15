import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type Paginator<T> = {
  skip?: number;
  cursor?: T extends number ? { id: number } : T;
};

@Injectable()
export class PrismaService extends PrismaClient {
  /* eslint-disable @typescript-eslint/require-await */
  async enableShutdownHooks(app: INestApplication) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  getPaginator(cursor: number | null): Paginator<number>;
  getPaginator<T>(
    cursor: number | null,
    transform: (arg: number) => T,
  ): Paginator<T>;

  getPaginator<T>(cursor: number | null, transform?: (arg: number) => T) {
    if (cursor == null) {
      return {};
    }
    if (transform) {
      return {
        skip: 1,
        cursor: transform(cursor),
      };
    }
    return {
      skip: 1,
      cursor: {
        id: cursor,
      },
    };
  }
}
