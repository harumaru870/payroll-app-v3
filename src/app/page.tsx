import { auth0 } from '@/lib/auth0';
import { getDashboardData } from '@/app/actions';
import { LogIn, Users, Calendar, TrendingUp, Download, Plus, ArrowRight, History, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getJSTNow } from '@/utils/date';

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            給与管理を、<br />
            <span className="text-indigo-600 dark:text-indigo-400">もっとスマートに。</span>
          </h1>
          <p className="max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            従業員の追加、シフト管理、深夜手当の自動計算からPDF出力まで。
            小規模店舗や事業所に最適な給与管理ソリューション。
          </p>
        </div>
        <a
          href="/auth/login"
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 font-bold text-lg group"
        >
          <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          <span>今すぐはじめる（ログイン）</span>
        </a>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mt-16 px-4">
          {[
            { icon: Users, title: '従業員管理', desc: '昇給履歴もしっかり管理' },
            { icon: Calendar, title: 'シフト管理', desc: '夜勤や日またぎにも対応' },
            { icon: Download, title: 'PDF出力', desc: '綺麗な明細書を即座に作成' },
          ].map((feature, i) => (
            <div key={i} className="bg-card p-6 rounded-2xl border border-card-border shadow-sm text-left">
              <feature.icon className="w-10 h-10 text-indigo-500 dark:text-indigo-400 mb-4" />
              <h3 className="font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = await getDashboardData();
  const now = getJSTNow();
  const monthName = now.toLocaleDateString('ja-JP', { month: 'long' });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ダッシュボード</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">お疲れ様です、{user.name}さん。</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          本日: {now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: '稼働中の従業員',
            value: stats.activeEmployeeCount.toString(),
            unit: '名',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/employees'
          },
          {
            label: `${monthName}の労働時間`,
            value: stats.totalHours.toLocaleString(),
            unit: '時間',
            icon: Calendar,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/shifts'
          },
          {
            label: `${monthName}の概算人件費`,
            value: (stats.totalSalary / 10000).toFixed(1),
            unit: '万円',
            icon: TrendingUp,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            href: '/shifts'
          },
        ].map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="bg-card p-8 rounded-3xl border border-card-border shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10 hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.bg} dark:bg-opacity-10 p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-foreground tracking-tight">{stat.value}</span>
                <span className="text-lg font-bold text-gray-400 dark:text-gray-500">{stat.unit}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-card-border shadow-xl overflow-hidden">
          <div className="p-8 border-b border-card-border flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              <span>直近のシフト入力</span>
            </h2>
            <Link href="/shifts" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group">
              すべて表示
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-card-border">
            {stats.recentShifts.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto border border-card-border">
                  <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 font-medium">登録されたシフトがまだありません。</p>
              </div>
            ) : (
              stats.recentShifts.map((shift) => (
                <div key={shift.id} className="p-6 flex items-center justify-between hover:bg-indigo-50/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl shadow-sm">
                      {shift.employeeName[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-foreground">{shift.employeeName}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(shift.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
                    NEW
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground px-2 flex items-center gap-2">
            <Plus className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            <span>クイックアクション</span>
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/employees/new"
              className="flex items-center justify-between p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg">従業員を追加</p>
                  <p className="text-indigo-100/80 text-xs">新しいスタッフを登録</p>
                </div>
              </div>
              <Plus className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/shifts"
              className="flex items-center justify-between p-6 bg-card border border-card-border rounded-3xl shadow-lg hover:shadow-xl dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 group border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                  <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg text-foreground">シフトを入力</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs text-medium">勤怠実績を記録・確認</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-indigo-200 dark:text-indigo-900 group-hover:text-indigo-500 transition-colors" />
            </Link>

            <div className="p-8 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-card rounded-3xl border border-indigo-100 dark:border-indigo-950 mt-4">
              <h3 className="font-black text-indigo-900 dark:text-indigo-300 text-lg mb-2">Tips</h3>
              <p className="text-indigo-700 dark:text-indigo-400 text-sm leading-relaxed font-medium">
                深夜時間帯や締め日は「設定」画面から変更できます。
                変更内容は即座に計算に反映されます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
