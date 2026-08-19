import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { Button, TextField } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { validateEmail, validatePassword } from '../lib/validation'

type Field = 'email' | 'password'

export function SignIn() {
  const { login } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<Field, string | null>>>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function messageFor(field: Field, value: string): string | null {
    return field === 'email' ? validateEmail(value) : validatePassword(value)
  }

  // Blur and submit only. Marking a field invalid while someone is still typing
  // the first character of it is a well-known irritation.
  function handleBlur(field: Field) {
    setErrors((current) => ({ ...current, [field]: messageFor(field, values[field]) }))
  }

  function handleChange(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    // Drop the message as soon as its field is edited, so a correction in
    // progress is not still being told it is wrong.
    setErrors((current) => ({ ...current, [field]: null }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const found = {
      email: messageFor('email', values.email),
      password: messageFor('password', values.password),
    }
    setErrors(found)
    if (found.email || found.password) return

    setFailure(null)
    setIsSubmitting(true)
    try {
      // No navigate on success: AuthLayout redirects once `user` is set.
      await login(values.email, values.password)
    } catch (cause) {
      setFailure(cause instanceof Error ? cause.message : 'Could not sign you in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      error={failure}
      subtitle="Enter your credentials to reach your notes."
      title="Welcome back"
    >
      {/* `noValidate` hands validation to the validators from the data layer.
          Without it the browser's own bubble fires first on a malformed email
          and the field never gets to show the message it was given. */}
      <form className="mt-8 flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
        <TextField
          autoComplete="email"
          error={errors.email}
          label="Email address"
          onBlur={() => handleBlur('email')}
          onChange={(event) => handleChange('email', event.target.value)}
          placeholder="name@company.com"
          type="email"
          value={values.email}
        />

        <TextField
          autoComplete="current-password"
          error={errors.password}
          label="Password"
          onBlur={() => handleBlur('password')}
          onChange={(event) => handleChange('password', event.target.value)}
          placeholder="At least 8 characters"
          type="password"
          value={values.password}
        />

        {/* Never disabled for being invalid — that hides why it cannot be
            submitted. Submitting is what surfaces the messages. */}
        <Button className="mt-2 w-full" isLoading={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in' : 'Continue'}
        </Button>
      </form>

      <p className="mt-8 text-center text-body-md text-on-surface-variant">
        Need an account?{' '}
        <Link className="font-semibold text-primary hover:underline" to="/signup">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
