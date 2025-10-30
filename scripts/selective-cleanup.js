#!/usr/bin/env node

/**
 * Selective Data Cleanup Script
 * Allows you to clean specific types of data
 */

const mongoose = require('mongoose')
const { createClient } = require('redis')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    const envFile = fs.readFileSync(envPath, 'utf8')
    
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  } catch (error) {
    console.log('⚠️  Could not load .env.local file, using system environment variables')
  }
}

loadEnv()

const args = process.argv.slice(2)

function showHelp() {
  console.log(`
Selective Data Cleanup

Usage: node scripts/selective-cleanup.js [options]

Options:
  --evaluations     Delete all evaluations
  --hackathons      Delete all hackathons  
  --redis           Clear Redis cache
  --failed          Delete only failed evaluations
  --processing      Delete stuck processing evaluations
  --user <userId>   Delete data for specific user
  --domain <domain> Delete evaluations for specific domain
  --help            Show this help

Examples:
  node scripts/selective-cleanup.js --evaluations --redis
  node scripts/selective-cleanup.js --failed
  node scripts/selective-cleanup.js --user user_12345
  node scripts/selective-cleanup.js --domain "AI/ML"
`)
}

// Define Mongoose schemas (simplified versions)
const EvaluationSchema = new mongoose.Schema({}, { strict: false })
const HackathonSchema = new mongoose.Schema({}, { strict: false })

async function connectMongoDB() {
  await mongoose.connect(process.env.MONGODB_URI)
  
  // Get or create models
  const Evaluation = mongoose.models.Evaluation || mongoose.model('Evaluation', EvaluationSchema)
  const Hackathon = mongoose.models.Hackathon || mongoose.model('Hackathon', HackathonSchema)
  
  return { Evaluation, Hackathon }
}

async function connectRedis() {
  const redis = createClient({ url: process.env.REDIS_URL })
  await redis.connect()
  return redis
}

async function deleteEvaluations(filter = {}) {
  const { Evaluation } = await connectMongoDB()
  
  try {
    const count = await Evaluation.countDocuments(filter)
    if (count === 0) {
      console.log('✅ No evaluations found matching criteria')
      return
    }
    
    console.log(`🔍 Found ${count} evaluations to delete`)
    const result = await Evaluation.deleteMany(filter)
    console.log(`🗑️  Deleted ${result.deletedCount} evaluations`)
    
  } finally {
    await mongoose.disconnect()
  }
}

async function deleteHackathons(filter = {}) {
  const { Hackathon } = await connectMongoDB()
  
  try {
    const count = await Hackathon.countDocuments(filter)
    if (count === 0) {
      console.log('✅ No hackathons found matching criteria')
      return
    }
    
    console.log(`🔍 Found ${count} hackathons to delete`)
    const result = await Hackathon.deleteMany(filter)
    console.log(`🗑️  Deleted ${result.deletedCount} hackathons`)
    
  } finally {
    await mongoose.disconnect()
  }
}

async function clearRedis(pattern = '*') {
  const redis = await connectRedis()
  
  try {
    const keys = await redis.keys(pattern)
    
    if (keys.length === 0) {
      console.log('✅ No Redis keys found matching pattern')
      return
    }
    
    console.log(`🔍 Found ${keys.length} Redis keys to delete`)
    console.log('Keys:', keys.slice(0, 10).join(', ') + (keys.length > 10 ? '...' : ''))
    
    const result = await redis.del(...keys)
    console.log(`🗑️  Deleted ${result} Redis keys`)
    
  } finally {
    await redis.disconnect()
  }
}

async function showStats() {
  const { Evaluation, Hackathon } = await connectMongoDB()
  const redis = await connectRedis()
  
  try {
    console.log('📊 Current Database Stats:')
    
    // MongoDB stats
    const totalEvals = await Evaluation.countDocuments()
    const processingEvals = await Evaluation.countDocuments({ status: 'processing' })
    const completedEvals = await Evaluation.countDocuments({ status: 'completed' })
    const failedEvals = await Evaluation.countDocuments({ status: 'failed' })
    const totalHackathons = await Hackathon.countDocuments()
    
    console.log(`   MongoDB:`)
    console.log(`     - Total Evaluations: ${totalEvals}`)
    console.log(`     - Processing: ${processingEvals}`)
    console.log(`     - Completed: ${completedEvals}`)
    console.log(`     - Failed: ${failedEvals}`)
    console.log(`     - Hackathons: ${totalHackathons}`)
    
    // Redis stats
    const redisKeys = await redis.keys('*')
    console.log(`   Redis:`)
    console.log(`     - Total Keys: ${redisKeys.length}`)
    
    if (redisKeys.length > 0) {
      const cacheKeys = redisKeys.filter(k => k.startsWith('pitch:'))
      const queueKeys = redisKeys.filter(k => k.includes('queue'))
      console.log(`     - Cache Keys: ${cacheKeys.length}`)
      console.log(`     - Queue Keys: ${queueKeys.length}`)
    }
    
  } finally {
    await mongoose.disconnect()
    await redis.disconnect()
  }
}

async function main() {
  if (args.includes('--help') || args.length === 0) {
    showHelp()
    return
  }
  
  console.log('Starting selective cleanup...\n')
  
  try {
    // Show current stats
    await showStats()
    console.log('')
    
    // Process arguments
    if (args.includes('--evaluations')) {
      console.log('🗑️  Deleting all evaluations...')
      await deleteEvaluations()
    }
    
    if (args.includes('--hackathons')) {
      console.log('🗑️  Deleting all hackathons...')
      await deleteHackathons()
    }
    
    if (args.includes('--failed')) {
      console.log('🗑️  Deleting failed evaluations...')
      await deleteEvaluations({ status: 'failed' })
    }
    
    if (args.includes('--processing')) {
      console.log('🗑️  Deleting stuck processing evaluations...')
      await deleteEvaluations({ status: 'processing' })
    }
    
    const userIndex = args.indexOf('--user')
    if (userIndex !== -1 && args[userIndex + 1]) {
      const userId = args[userIndex + 1]
      console.log(`🗑️  Deleting data for user: ${userId}`)
      await deleteEvaluations({ userId })
      await deleteHackathons({ userId })
    }
    
    const domainIndex = args.indexOf('--domain')
    if (domainIndex !== -1 && args[domainIndex + 1]) {
      const domain = args[domainIndex + 1]
      console.log(`🗑️  Deleting evaluations for domain: ${domain}`)
      await deleteEvaluations({ domain })
    }
    
    if (args.includes('--redis')) {
      console.log('🗑️  Clearing Redis cache...')
      await clearRedis()
    }
    
    console.log('\n✅ Selective cleanup completed!')
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message)
    process.exit(1)
  }
}

main()