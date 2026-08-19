import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { Button, TextField } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from '../lib/validation'

type Field = 'name' | 'email' | 'password' | 'confirmation'
type Values = Record<Field, string>

const EMPTY: Values = { name: '', email: '', password: '', confirmation: '' }

export function SignUp() {
  const { register } = useAuth()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<Field, string | null>>>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Takes the whole set rather than one value: the confirmation is only
  // meaningful next to the password it is being compared with.
  function messageFor(field: Field, next: Values): string | null {
    switch (field) {
      case 'name':
        return validateName(next.name)
      case 'email':
        return validateEmail(next.email)
      case 'password':
        return validatePassword(next.password)
      case 'confirmation':
        return validatePasswordConfirmation(next.password, next.confirmation)
    }
  }

  function handleBlur(field: Field) {
    setErrors((current) => ({ ...current, [field]: messageFor(field, values) }))
  }

  function handleChange(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({
      ...current,
      [field]: null,
      // "Both passwords must match" was decided against a password that has
      // just changed, so it goes with it.
      ...(field === 'password' && { confirmation: null }),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const found: Partial<Record<Field, string | null>> = {
      name: messageFor('name', values),
      email: messageFor('email', values),
      password: messageFor('password', values),
      confirmation: messageFor('confirmation', values),
    }
    setErrors(found)
    if (Object.values(found).some((message) => message !== null)) return

    setFailure(null)
    setIsSubmitting(true)
    try {
      // Registering signs the account in, so AuthLayout's redirect takes it from
      // here — there is no trip through the sign-in screen.
      await register(values.name, values.email, values.password)
    } catch (cause) {
      setFailure(cause instanceof Error ? cause.message : 'Could not create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      error={failure}
      subtitle="A few details and your notes are ready."
      title="Create your account"
    >
      <form className="mt-8 flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
        <TextField
          autoComplete="name"
          error={errors.name}
          label="Name"
          onBlur={() => handleBlur('name')}
          onChange={(event) => handleChange('name', event.target.value)}
          placeholder="Ada Lovelace"
          type="text"
          value={values.name}
        />

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
          autoComplete="new-password"
          error={errors.password}
          label="Password"
          onBlur={() => handleBlur('password')}
          onChange={(event) => handleChange('password', event.target.value)}
          placeholder="At least 8 characters"
          type="password"
          value={values.password}
        />

        <TextField
          autoComplete="new-password"
          error={errors.confirmation}
          label="Confirm password"
          onBlur={() => handleBlur('confirmation')}
          onChange={(event) => handleChange('confirmation', event.target.value)}
          placeholder="Repeat your password"
          type="password"
          value={values.confirmation}
        />

        <Button className="mt-2 w-full" isLoading={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account' : 'Create account'}
        </Button>
      </form>

      <p className="mt-8 text-center text-body-md text-on-surface-variant">
        Already have an account?{' '}
        <Link className="font-semibold text-primary hover:underline" to="/signin">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
