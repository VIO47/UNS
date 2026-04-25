import { t } from '../init.js';
import { z } from 'zod';
import { dbAll, dbGet, dbRun } from '../db-helpers.js';

interface DesignOption {
  id: number;
  title: string;
  description?: string;
  area?: number;
  embodied_carbon?: number;
  daylight_score?: number;
  cost_estimate?: number;
  program_fit?: string;
  tags?: string;
  notes?: string;
  deleted: string | null;
  created: string;
  updated: string;
}

export const designOptionsProcedures = {
    /** 
     * options.getOptions -> GET /options 
     * Supports pagination and filtering
     */
    

  getOptions: t.procedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      search: z.string().optional(),
      minCost: z.number().optional(),
      maxCost: z.number().optional(),
      minCarbon: z.number().optional(),
      maxCarbon: z.number().optional(),
    }))
    .query(async ({ input }): Promise<{ data: DesignOption[], pagination: any }> => {
      const { page, limit, search, minCost, maxCost, minCarbon, maxCarbon } = input;

      let query = 'SELECT id, title, area, cost_estimate, embodied_carbon, daylight_score, description FROM design_options WHERE deleted IS NULL';
      let countQuery = 'SELECT COUNT(*) as count FROM design_options WHERE deleted IS NULL';
      const params: any[] = [];

      if (search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        countQuery += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (minCost !== undefined) {
        query += ' AND cost_estimate >= ?';
        countQuery += ' AND cost_estimate >= ?';
        params.push(minCost);
      }

      if (maxCost !== undefined) {
        query += ' AND cost_estimate <= ?';
        countQuery += ' AND cost_estimate <= ?';
        params.push(maxCost);
      }

      if (minCarbon !== undefined) {
        query += ' AND embodied_carbon >= ?';
        countQuery += ' AND embodied_carbon >= ?';
        params.push(minCarbon);
      }

      if (maxCarbon !== undefined) {
        query += ' AND embodied_carbon <= ?';
        countQuery += ' AND embodied_carbon <= ?';
        params.push(maxCarbon);
      }

      const countResult: any = await dbGet(countQuery, params);
      const totalCount = countResult.count;

      const pageNum = Math.max(1, page);
      const limitNum = Math.max(1, limit);
      const offset = (pageNum - 1) * limitNum;

      query += ' ORDER BY created DESC LIMIT ? OFFSET ?';
      const queryParams = [...params, limitNum, offset];

      const options = await dbAll(query, queryParams);

      return {
        data: options,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
          hasMore: offset + limitNum < totalCount,
        },
      };
    }),

    /**
     * options.createOption -> POST /options
     * Creates a new design option with mandatory title
     */
 createOption: t.procedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    area: z.number().optional(),
    embodied_carbon: z.number().optional(),
    daylight_score: z.number().optional(),
    cost_estimate: z.number().optional(),
    program_fit: z.string().optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ input }): Promise<DesignOption> => {
    try {
      const {
         title, description, area, embodied_carbon,
        daylight_score, cost_estimate, program_fit, notes,
      } = input;

      console.log('Creating option with:', input); // Log input

      const id = await dbRun(
        `INSERT INTO design_options 
        (title, description, area, embodied_carbon, daylight_score, cost_estimate, program_fit, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description || null, area || null, embodied_carbon || null, daylight_score || null, cost_estimate || null, program_fit || null, notes || null]
      );

      console.log('Created option with id:', id); // Log result

      return dbGet('SELECT * FROM design_options WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error creating option:', error); // Log error
      throw error;
    }
  }),

  updateOption: t.procedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      area: z.number().optional(),
      embodied_carbon: z.number().optional(),
      daylight_score: z.number().optional(),
      cost_estimate: z.number().optional(),
      program_fit: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }): Promise<DesignOption> => {
      const { id, title, description, area, embodied_carbon, daylight_score, cost_estimate, program_fit, notes } = input;

      await dbRun(
        `UPDATE design_options 
        SET title = ?, description = ?, area = ?, embodied_carbon = ?, daylight_score = ?, cost_estimate = ?, program_fit = ?, notes = ?, updated = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [title, description || null, area || null, embodied_carbon || null, daylight_score || null, cost_estimate || null, program_fit || null, notes || null, id]
      );

      return dbGet('SELECT * FROM design_options WHERE id = ?', [id]);
    }),

    /**
     * options.deleteOption -> DELETE /options/:id
     * Soft deletes a design option by setting the deleted timestamp
     */
  deleteOption: t.procedure
  .input(z.number())
  .mutation(async ({ input }): Promise<void> => {
    const now = new Date().toISOString();

    await dbRun(
      'UPDATE design_options SET deleted = ? WHERE id = ?',
      [now, input]
    );
  }),
};