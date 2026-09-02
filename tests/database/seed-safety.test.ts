import { afterAll,beforeAll,expect,test } from 'vitest';
import { readFile } from 'node:fs/promises';
import type { PGlite } from '@electric-sql/pglite';
import { testDatabase } from './harness';

let db:PGlite;
let seed:string;
beforeAll(async()=>{
 db=await testDatabase();
 seed=await readFile('supabase/seed.sql','utf8');
 await db.exec(seed);
});
afterAll(async()=>db?.close());

test('remote seed contains pending candidates but never approvals, identities or evidence',async()=>{
 const versions=await db.query<{status:string;verified_by:string|null;published_at:string|null}>('select status,verified_by,published_at from regulatory_rule_versions');
 expect(versions.rows.length).toBeGreaterThan(0);
 for(const version of versions.rows) expect(version).toEqual({status:'PENDING_REVIEW',verified_by:null,published_at:null});
 for(const table of ['auth.users','source_snapshots','rule_source_evidence','orders','companies']) {
  expect((await db.query(`select count(*)::int as count from ${table}`)).rows).toEqual([{count:0}]);
 }
});

test('reapplying the remote seed preserves catalog IDs and existing prices',async()=>{
 await db.exec('update billing_prices set amount_minor=12300');
 const before=await db.query('select id,billing_product_id,amount_minor from billing_prices order by id');
 expect(before.rows).toHaveLength(1);
 const catalogBefore=await db.query('select id,rule_id,version from regulatory_rule_versions order by id');
 await db.exec(seed);
 expect((await db.query('select id,billing_product_id,amount_minor from billing_prices order by id')).rows).toEqual(before.rows);
 expect((await db.query('select id,rule_id,version from regulatory_rule_versions order by id')).rows).toEqual(catalogBefore.rows);
 expect((await db.query('select count(*)::int as count from jurisdictions')).rows).toEqual([{count:4}]);
});

test('anonymous clients cannot read seeded unpublished regulatory facts',async()=>{
 await db.transaction(async tx=>{
  await tx.exec('set local role anon');
  expect((await tx.query('select * from regulatory_rule_versions')).rows).toEqual([]);
  expect((await tx.query('select * from regulatory_rules')).rows).toEqual([]);
 });
});
