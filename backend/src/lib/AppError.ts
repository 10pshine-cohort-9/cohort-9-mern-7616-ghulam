export class AppError extends Error {
  readonly status: number
  readonly isOperational: boolean

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.isOperational = true
  }
}
