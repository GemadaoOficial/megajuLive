import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const schema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha obrigatória'),
});

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    const onSubmit = async (data) => {
        try {
            setError('');
            await login(data.email, data.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Falha no login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">ShopeeLive</h1>
                    <p className="text-gray-500 mt-2">Entre para gerenciar suas lives</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            {...register('email')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            placeholder="seu@email.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            {...register('password')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Entrar
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Não tem conta?{' '}
                    <Link to="/register" className="text-primary hover:underline">
                        Cadastre-se
                    </Link>
                </div>
            </div>
        </div>
    );
}
