'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Wrench } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [formFocused, setFormFocused] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleLogin = async () => {
    setErrors({});
    try {
      await login(email.trim(), password);
      toast.success('Login successful');
    } catch (err: any) {
      const fieldErrors: Partial<Record<string, string>> = {};
      if (err.email) fieldErrors.email = err.email;
      if (err.password) fieldErrors.password = err.password;
      if (err.error) toast.error(err.error);
      setErrors(fieldErrors);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Left side - Form */}
      <motion.div
        className="flex w-full flex-col items-center justify-center p-6 md:w-1/2 md:p-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}>
        <motion.div
          className="absolute top-4 left-4 flex items-center gap-2 md:top-8 md:left-8"
          variants={logoVariants}>
          <Link
            href="/"
            className="text-primary hover:text-primary/90 flex items-center gap-2 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
        </motion.div>

        <motion.div className="w-full max-w-md space-y-8" variants={containerVariants}>
          <motion.div className="space-y-2 text-center" variants={itemVariants}>
            <div className="mx-auto h-12 w-12">
              <Image
                src="/icon-light.png"
                width={500}
                height={500}
                alt="Icon"
                className="dark:hidden"
              />
              <Image
                src="/icon-dark.png"
                width={500}
                height={500}
                alt="Icon"
                className="hidden dark:inline"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
          </motion.div>

          <motion.div className="space-y-4" variants={itemVariants}>
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={`text-sm transition-colors duration-200 ${formFocused === 'email' ? 'text-primary' : ''}`}>
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFormFocused('email')}
                  onBlur={() => setFormFocused(null)}
                  className={`transition-all duration-200 ${errors.email ? 'border-destructive' : formFocused === 'email' ? 'border-primary ring-primary ring-1' : ''}`}
                />
                {errors.email && (
                  <motion.p
                    className="text-destructive mt-1 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}>
                    {errors.email}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={`text-sm transition-colors duration-200 ${formFocused === 'password' ? 'text-primary' : ''}`}>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFormFocused('password')}
                  onBlur={() => setFormFocused(null)}
                  className={`transition-all duration-200 ${errors.password ? 'border-destructive' : formFocused === 'password' ? 'border-primary ring-primary ring-1' : ''}`}
                />
                {errors.password && (
                  <motion.p
                    className="text-destructive mt-1 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}>
                    {errors.password}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-primary hover:text-primary/90 text-sm transition-colors">
                Forgot password?
              </Link>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              className="group relative w-full overflow-hidden"
              onClick={handleLogin}
              disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  <span>Sign in</span>
                  <motion.span
                    className="absolute inset-0 bg-white/10"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                </>
              )}
            </Button>
            <div className="text-muted-foreground mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-primary hover:text-primary/90 transition-colors">
                Sign up
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right side - Image/Decoration */}
      <motion.div
        className="bg-muted/50 hidden items-center justify-center p-12 md:flex md:w-1/2"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}>
        <div className="max-w-md space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Link href="/" className="w-28 md:w-40">
              <Image
                src="/logo-light.png"
                width={500}
                height={500}
                alt="Logo"
                className="dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                width={500}
                height={500}
                alt="Logo"
                className="hidden dark:inline"
              />
            </Link>
            <p className="text-muted-foreground">Your trusted platform for all repair services</p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src="/auth.png"
              width={600}
              height={400}
              alt="Repair service illustration"
              className="object-cover"
            />
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div>
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                    <Wrench className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Quick and reliable repairs</p>
                  <p className="text-muted-foreground text-sm">
                    Connect with skilled technicians to get your items fixed fast
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}