import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const result = await pool.query(`
  SELECT migration_name, finished_at 
  FROM "_prisma_migrations"
  ORDER BY finished_at DESC
`)

console.log('Applied Prisma migrations:')
result.rows.forEach(row => {
  console.log(`  - ${row.migration_name} (${row.finished_at})`)
})

await pool.end()
