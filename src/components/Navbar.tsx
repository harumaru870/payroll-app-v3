'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Home, Users, Calendar, Settings, LogOut, LogIn, Briefcase } from 'lucide-react';

export default function Navbar() {
    const { user, isLoading } = useUser();

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
                        <Briefcase className="w-6 h-6" />
                        <span>時給管理 App</span>
                    </Link>

                    {user && (
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                            <Link href="/" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                <Home className="w-4 h-4" />
                                <span>ダッシュボード</span>
                            </Link>
                            <Link href="/employees" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                <Users className="w-4 h-4" />
                                <span>従業員管理</span>
                            </Link>
                            <Link href="/shifts" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                <Calendar className="w-4 h-4" />
                                <span>シフト管理</span>
                            </Link>
                            <Link href="/settings" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                <Settings className="w-4 h-4" />
                                <span>設定</span>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block text-right text-sm">
                                <p className="font-semibold text-gray-900 leading-none">{user.name}</p>
                                <p className="text-gray-500 text-xs mt-1">{user.email}</p>
                            </div>
                            <a
                                href="/auth/logout"
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="ログアウト"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </a>
                        </div>
                    ) : (
                        <a
                            href="/auth/login"
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-shadow shadow-sm font-medium text-sm"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login / 従業員ログイン</span>
                        </a>
                    )}
                </div>
            </div>
        </nav>
    );
}
