import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../src/index.js'
import { prisma } from '../setup.js'
import bcrypt from 'bcryptjs'

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.user).toHaveProperty('email', 'test@example.com')
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('should not register with existing email', async () => {
      // Create existing user
      await prisma.user.create({
        data: {
          name: 'Existing User',
          email: 'existing@example.com',
          password: await bcrypt.hash('password123', 10),
        },
      })

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message')
    })

    it('should require all fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await prisma.user.create({
        data: {
          name: 'Login Test User',
          email: 'login@example.com',
          password: await bcrypt.hash('password123', 10),
        },
      })
    })

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.user).toHaveProperty('email', 'login@example.com')
    })

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })

      expect(response.status).toBe(401)
    })

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // Register a user to get tokens
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Refresh Test User',
          email: 'refresh@example.com',
          password: 'password123',
        })

      const { refreshToken } = registerResponse.body

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
    })

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })

      expect(response.status).toBe(401)
    })
  })
})
