import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IS_DEMO_MODE, errorMessage } from '@/api';
import { DEMO_ACCOUNT } from '@/api/demo-data';
import { useLogin } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/field';
import styles from './auth.module.css';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});
type Values = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
  const { register, handleSubmit, setValue, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: Values) => {
    login.mutate(values, { onSuccess: () => navigate(from, { replace: true }) });
  };

  return (
    <div className={styles.wrap}>
      <Card className={styles.card} as="section" aria-labelledby="login-title">
        <div className={styles.head}>
          <h1 id="login-title" style={{ fontSize: '1.5rem' }}>
            Welcome back
          </h1>
          <p>Sign in to place and track orders.</p>
        </div>
        {IS_DEMO_MODE ? (
          <div className={styles.demoHint}>
            <span>
              Demo account: <code>{DEMO_ACCOUNT.email}</code>
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setValue('email', DEMO_ACCOUNT.email);
                setValue('password', DEMO_ACCOUNT.password);
              }}
            >
              Fill demo credentials
            </Button>
          </div>
        ) : null}
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={formState.errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={formState.errors.password?.message}
            {...register('password')}
          />
          {login.isError ? (
            <p className={styles.formError} role="alert">
              {errorMessage(login.error)}
            </p>
          ) : null}
          <Button type="submit" block size="lg" loading={login.isPending}>
            Sign in
          </Button>
        </form>
        <p className={styles.switch}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
