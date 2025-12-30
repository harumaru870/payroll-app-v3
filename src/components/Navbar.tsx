'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Home, Users, Calendar, Settings, LogOut, LogIn, Briefcase, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { user, isLoading } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 画面遷移時にメニューを閉じる
    const closeMenu = () => setIsMenuOpen(false);

    // ウィンドウリサイズ時にメニューを閉じる（デスクトップサイズになった時用）
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navLinks = [
        { href: "/", label: "ダッシュボード", icon: Home },
        { href: "/employees", label: "従業員管理", icon: Users },
        { href: "/shifts", label: "シフト管理", icon: Calendar },
        { href: "/settings", label: "設定", icon: Settings },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-[100]">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 shrink-0" onClick={closeMenu}>
                        <Briefcase className="w-6 h-6" />
                        <span className="hidden xs:inline">時給管理 App</span>
                    </Link>

                    {user && (
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                                >
                                    <link.icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* PC用ユーザー情報 */}
                    <div className="hidden sm:flex items-center gap-4">
                        {isLoading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-4">
                                <div className="text-right text-sm">
                                    <p className="font-semibold text-gray-900 leading-none">{user.name}</p>
                                    <p className="text-gray-500 text-[10px] mt-1">{user.email}</p>
                                </div>
                                <a
                                    href="/auth/logout"
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="ログアウト"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden lg:inline">Logout</span>
                                </a>
                            </div>
                        ) : (
                            <a
                                href="/auth/login"
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-shadow shadow-sm font-medium text-sm"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Login</span>
                            </a>
                        )}
                    </div>

                    {/* モバイル用ハンバーガーボタン */}
                    {user && (
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="メニューを開く"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    )}

                    {!user && !isLoading && (
                        <a
                            href="/auth/login"
                            className="sm:hidden flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-shadow shadow-sm font-medium text-xs"
                        >
                            <LogIn className="w-3 h-3" />
                            <span>Login</span>
                        </a>
                    )}
                </div>
            </div>

            {/* モバイルメニューオーバーレイ */}
            {isMenuOpen && user && (
                <div className="md:hidden fixed inset-0 top-16 bg-white z-[90] animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-4 space-y-4">
                        <div className="px-4 py-3 bg-gray-50 rounded-2xl mb-6">
                            <p className="font-bold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeMenu}
                                    className="flex items-center gap-4 p-4 text-gray-700 font-bold hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all active:scale-[0.98]"
                                >
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                        <link.icon className="w-5 h-5" />
                                    </div>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <a
                                href="/auth/logout"
                                className="flex items-center gap-4 p-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all"
                            >
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-red-50">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                <span>ログアウト</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
