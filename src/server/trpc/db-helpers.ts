import db from '../db/index.ts';

export const dbAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: any, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

export const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: any, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbRun = (sql: string, params: any[] = []): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(this: any, err: any) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};