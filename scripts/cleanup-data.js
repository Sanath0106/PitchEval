#!/usr/bin/env node

/**
 * Data Cleanup Script
 * Cleans up MongoDB and Redis data for fresh testing
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

// Define Mongoose schemas (simplified versions)
const EvaluationSchema = new mongoose.Schema({}, { strict: false })
const HackathonSchema = new mongoose.Schema({}, { strict: false })

async function cleanupMongoDB() {
  console.log('🗄️  Connecting to MongoDB...')
  
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    
    // Get or create models
    const Evaluation = mongoose.models.Evaluation || mongoose.model('Evaluation', EvaluationSchema)
    const Hackathon = mongoose.models.Hackathon || mongoose.model('Hackathon', HackathonSchema)
    
    // Get collection stats before cleanup
    const evaluationsCount = await Evaluation.countDocuments()
    const hackathonsCount = await Hackathon.countDocuments()
    
    console.log(`📊 Current data:`)
    console.log(`   - Evaluations: ${evaluationsCount}`)
    console.log(`   - Hackathons: ${hackathonsCount}`)
    
    if (evaluationsCount === 0 && hackathonsCount === 0) {
      console.log('✅ MongoDB is already clean!')
      return
    }
    
    // Delete all evaluations
    const evalResult = await Evaluation.deleteMany({})
    console.log(`🗑️  Deleted ${evalResult.deletedCount} evaluations`)
    
    // Delete all hackathons
    const hackResult = await Hackathon.deleteMany({})
    console.log(`🗑️  Deleted ${hackResult.deletedCount} hackathons`)
    
    console.log('✅ MongoDB cleanup completed!')
    
  } catch (error) {
    console.error('❌ MongoDB cleanup failed:', error.message)
  } finally {
    await mongoose.disconnect()
  }
}

async function cleanupRedis() {
  console.log('🔴 Connecting to Redis...')
  
  const redis = createClient({ url: process.env.REDIS_URL })
  
  try {
    await redis.connect()
    
    // Get all keys
    const keys = await redis.keys('*')
    
    console.log(`📊 Current Redis keys: ${keys.length}`)
    
    if (keys.length === 0) {
      console.log('✅ Redis is already clean!')
      return
    }
    
    // Show what we're about to delete
    console.log('🔍 Keys to delete:')
    keys.forEach(key => console.log(`   - ${key}`))
    
    // Delete all keys
    if (keys.length > 0) {
      const result = await redis.del(keys)
      console.log(`🗑️  Deleted ${result} Redis keys`)
    }
    
    console.log('✅ Redis cleanup completed!')
    
  } catch (error) {
    console.error('❌ Redis cleanup failed:', error.message)
  } finally {
    await redis.disconnect()
  }
}

async function main() {
  console.log('Starting data cleanup...\n')
  
  // Check if environment variables are set
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables')
    process.exit(1)
  }
  
  if (!process.env.REDIS_URL) {
    console.error('❌ REDIS_URL not found in environment variables')
    process.exit(1)
  }
  
  try {
    await cleanupMongoDB()
    console.log('')
    await cleanupRedis()
    
    console.log('\n🎉 All cleanup completed successfully!')
    console.log('💡 You can now test with fresh data')
    
  } catch (error) {
    console.error('\n💥 Cleanup failed:', error.message)
    process.exit(1)
  }
}

// Run the cleanup
main()