'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-10">
        {/* ロゴ・タイトル */}
        <div className="text-center">
          <div className="text-6xl mb-4">✦</div>
          <h1 className="text-3xl font-bold text-text mb-2">バケットリスト</h1>
          <p className="text-text-muted text-lg leading-relaxed">
            これからの人生で<br />やりたいことを見つけよう
          </p>
        </div>

        {/* ログインボタン */}
        <div className="w-full flex flex-col items-center gap-4">
          <GoogleLoginButton />
          <p className="text-text-muted text-sm text-center">
            Googleアカウントで安全にログインできます
          </p>
        </div>
      </div>
    </main>
  );
}
