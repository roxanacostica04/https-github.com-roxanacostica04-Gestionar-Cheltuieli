import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import backend from '~backend/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, User, Lock } from 'lucide-react';

interface LoginFormProps {
  onLogin: (token: string, username: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: backend.auth.login,
    onSuccess: (data) => {
      onLogin(data.token, data.username);
      setError('');
    },
    onError: (error) => {
      console.error('Login error:', error);
      setError('Nume de utilizator sau parolă incorectă');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Toate câmpurile sunt obligatorii');
      return;
    }

    loginMutation.mutate({
      username: username.trim(),
      password: password.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Gestionar Cheltuieli</CardTitle>
          <CardDescription>
            Conectează-te pentru a-ți gestiona cheltuielile
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Nume utilizator</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Introdu numele de utilizator"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parolă</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introdu parola"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Se conectează...' : 'Conectează-te'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Conturi demo:</strong>
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <div>admin / admin123</div>
              <div>user / password</div>
              <div>demo / demo123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
