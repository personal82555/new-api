/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { toast } from 'sonner'

import { PublicLayout } from '@/components/layout'
import { api } from '@/lib/api'

interface PlanRecord {
  id: number
  title: string
  subtitle?: string
  price_amount: number
  currency?: string
  duration_unit: string
  duration_value: number
  total_amount?: number
  quota_reset_period?: string
  upgrade_group?: string
  downgrade_group?: string
  max_purchase_per_user?: number
  allow_balance_pay?: boolean
  allow_wallet_overflow?: boolean
  sort_order?: number
}

const DURATION_UNITS: Record<string, string> = {
  month: ' 个月',
  day: ' 天',
  year: ' 年',
  hour: ' 小时',
}
const RESET_UNITS: Record<string, string> = {
  month: '月',
  day: '日',
  week: '周',
  year: '年',
  hour: '时',
}

function quotaToCny(q: number): string {
  return (q / 500000 * 7.1).toFixed(2).replace(/\.?0+$/, '')
}

export function Subscribe() {
  const { t } = useTranslation()
  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [paying, setPaying] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      // 已登录：直接走系统接口（api 客户端自动携带/刷新 JWT）
      try {
        const res = await api.get('/api/subscription/plans', {
          skipBusinessError: true,
        } as Record<string, unknown>)
        const list = (res.data?.data || []).map(
          (x: { plan?: PlanRecord } & PlanRecord) => x.plan || x
        ) as PlanRecord[]
        if (mounted && list.length) {
          setPlans(list)
          setIsAuthed(true)
          setLoading(false)
          return
        }
      } catch {
        /* 未登录，走公开列表 */
      }
      // 未登录：从公开静态列表读取（管理员定时同步）
      try {
        const r = await fetch('/plans.json?v=' + Date.now())
        const list = (await r.json()) as PlanRecord[]
        if (mounted) {
          setPlans(list.filter((p) => p && p.id))
          setIsAuthed(false)
        }
      } catch {
        if (mounted) toast.error('网络异常，请刷新重试')
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const epayBuy = async (planId: number) => {
    setPaying(planId)
    try {
      const res = await api.post('/api/subscription/epay/pay', {
        plan_id: planId,
        payment_method: 'alipay',
      })
      const j = res.data
      if (j?.message === 'success' && j.url) {
        const f = document.createElement('form')
        f.action = j.url
        f.method = 'POST'
        Object.keys(j.data || {}).forEach((k) => {
          const i = document.createElement('input')
          i.type = 'hidden'
          i.name = k
          i.value = String(j.data[k])
          f.appendChild(i)
        })
        document.body.appendChild(f)
        f.submit()
        return
      }
      toast.error(j?.data || j?.message || '支付失败')
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        toast.error('请先登录后再购买')
        setTimeout(() => {
          window.location.href = '/sign-in'
        }, 1200)
      } else {
        toast.error('网络异常，请重试')
      }
    } finally {
      setPaying(null)
    }
  }

  const balanceBuy = async (planId: number) => {
    setPaying(planId)
    try {
      const res = await api.post('/api/subscription/balance/pay', {
        plan_id: planId,
      })
      if (res.data?.success) {
        toast.success('购买成功，额度已到账！')
        setTimeout(() => window.location.reload(), 1200)
        return
      }
      toast.error(res.data?.message || '购买失败')
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        toast.error('请先登录后再购买')
        setTimeout(() => {
          window.location.href = '/sign-in'
        }, 1200)
      } else {
        toast.error('网络异常，请重试')
      }
    } finally {
      setPaying(null)
    }
  }

  return (
    <PublicLayout>
      <div className='mx-auto w-full max-w-[1200px] px-4 pt-10 pb-16 sm:px-6'>
        <h1 className='text-center text-2xl font-bold text-foreground sm:text-3xl'>
          订阅套餐
        </h1>
        <p className='text-muted-foreground mt-2 mb-8 text-center text-sm'>
          购买后自动升级分组、额度按周期重置，到期自动恢复 —— 全程无需人工操作
        </p>
        {loading ? (
          <div className='text-muted-foreground text-center text-sm'>
            加载中…
          </div>
        ) : (
          <div className='mx-auto grid max-w-[920px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {plans.map((p) => {
              const free = Number(p.price_amount) < 0.01
              const dur =
                (p.duration_value ?? 1) +
                (DURATION_UNITS[p.duration_unit] || ' ' + p.duration_unit)
              const priceStr = free
                ? '¥0'
                : '¥' +
                  Number(p.price_amount)
                    .toFixed(2)
                    .replace(/\.00$/, '')
              return (
                <div
                  key={p.id}
                  className='bg-card relative flex flex-col rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md'
                >
                  {!free && (p.max_purchase_per_user || 0) > 0 && (
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-600 px-3 py-0.5 text-xs font-bold text-white'>
                      限购 {p.max_purchase_per_user} 次
                    </div>
                  )}
                  <h3 className='text-lg font-bold text-foreground'>
                    {p.title}
                  </h3>
                  <div className='text-muted-foreground mt-1 mb-3 text-xs'>
                    {p.subtitle || ''}
                  </div>
                  <div className='text-primary text-3xl font-extrabold'>
                    {priceStr}
                    <span className='text-muted-foreground text-sm font-medium'>
                      {' '}
                      / {dur}
                    </span>
                  </div>
                  <ul className='text-foreground/80 mt-4 mb-5 flex-1 text-sm'>
                    <li className='py-1'>
                      包含额度 ¥{quotaToCny(p.total_amount || 0)}
                      {p.quota_reset_period &&
                        p.quota_reset_period !== 'never' &&
                        '（每' +
                          (RESET_UNITS[p.quota_reset_period] ||
                            p.quota_reset_period) +
                          '重置）'}
                    </li>
                    {p.upgrade_group && (
                      <li className='py-1'>购买后升级分组，解锁全部模型</li>
                    )}
                    <li className='py-1'>有效期 {dur}，到期自动恢复</li>
                  </ul>
                  <div className='mt-auto flex gap-2'>
                    {free ? (
                      isAuthed ? (
                        <button
                          className='flex-1 rounded-xl bg-muted py-2.5 text-sm font-bold text-foreground transition-opacity hover:opacity-90'
                          onClick={() => balanceBuy(p.id)}
                          disabled={paying !== null}
                        >
                          免费领取
                        </button>
                      ) : (
                        <a
                          href='/sign-up'
                          className='flex-1 rounded-xl bg-muted py-2.5 text-center text-sm font-bold text-foreground transition-opacity hover:opacity-90'
                        >
                          注册后免费领取
                        </a>
                      )
                    ) : (
                      <>
                        <button
                          className='flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90'
                          style={{
                            background:
                              'linear-gradient(90deg,#1677ff,#0e5fd8)',
                          }}
                          onClick={() => epayBuy(p.id)}
                          disabled={paying !== null}
                        >
                          {paying === p.id ? '处理中…' : '支付宝购买'}
                        </button>
                        {p.allow_balance_pay && isAuthed && (
                          <button
                            className='bg-muted hover:border-primary hover:text-primary flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-foreground/80'
                            onClick={() => balanceBuy(p.id)}
                            disabled={paying !== null}
                          >
                            余额购买
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {!loading && !isAuthed && plans.length > 0 && (
          <p className='text-muted-foreground mt-8 text-center text-sm'>
            购买前请先
            <a href='/sign-in' className='mx-1 font-semibold'>
              登录
            </a>
            ，支付方式支持支付宝
          </p>
        )}
      </div>
    </PublicLayout>
  )
}
