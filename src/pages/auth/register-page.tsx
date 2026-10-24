import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '@/api';
import { useRegister } from '@/hooks/use-api';
import { toast } from '@/lib/toast-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/field';
import styles from './auth.module.css';

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?[0-9 ()-]{7,20})?$/, 'Enter a valid phone number'),
  password: z.string().min(8, 'Use at least 8 characters'),
});
type Values = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useRegister();
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  const onSubmit = ({ phone, ...values }: Values) => {
    registerUser.mutate(phone ? { ...values, phone } : values, {
      onSuccess: (res) => {
        toast.success(
          `Welcome, ${res.user.name.split(' ')[0] ?? res.user.name}!`,
          'Your account is ready.',
        );
        navigate('/dashboard', { replace: true });
      },
    });
  };

  return (
    <div className={styles.wrap}>
      <Card className={styles.card} as="section" aria-labelledby="register-title">
        <div className={styles.head}>
          <h1 id="register-title" style={{ fontSize: '1.5rem' }}>
            Create your account
          </h1>
          <p>Takes about twenty seconds.</p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Full name"
            autoComplete="name"
            error={formState.errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={formState.errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone"
            type="tel"
            autoComplete="tel"
            hint="Optional. Used for pickup coordination."
            error={formState.errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters."
            error={formState.errors.password?.message}
            {...register('password')}
          />
          {registerUser.isError ? (
            <p className={styles.formError} role="alert">
              {errorMessage(registerUser.error)}
            </p>
          ) : null}
          <Button type="submit" block size="lg" loading={registerUser.isPending}>
            Create account
          </Button>
        </form>
        <p className={styles.switch}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
