import type { RequestHandler } from 'express'
import mongoose from 'mongoose'

const READY_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

export const getHealth: RequestHandler = (_req, res) => {
  const readyState = mongoose.connection.readyState
  res.json({
    success: true,
    data: {
      status: readyState === 1 ? 'ok' : 'degraded',
      uptime: Math.round(process.uptime()),
      database: { readyState, state: READY_STATES[readyState] ?? 'unknown' },
    },
  })
}
