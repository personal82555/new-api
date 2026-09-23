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

For commercial licensing, please contact support@quantumnous.com
*/
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { CalendarCheck } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Dialog } from '@/components/dialog'
import { Turnstile } from '@/components/turnstile'
import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'
import { formatQuotaWithCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

import { getCheckinStatus, performCheckin } from '@/features/profile/api'

export function CheckinButton() {
  const { t } = useTranslation()
  const { auth } = useAuthStore()
  const { status } = useStatus()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const [loading, setLoading] = useState(false)
  const [turnstileModalVisible, setTurnstileModalVisible] = useState(false)
  const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0)

  const checkinEnabled = status?.checkin_enabled === true
  const turnstileEnabled = !!(status?.turnstile_check && status?.turnstile_site_key)
  const turnstileSiteKey = status?.turnstile_site_key || ''

  const currentMonthStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }, [])

  const { data: checkinData } = useQuery({
    queryKey: ['checkin-status', currentMonthStr],
    queryFn: async () => {
      const res = await getCheckinStatus(currentMonthStr)
      if (res.success && res.data) return res.data
      throw new Error(res.message || t('Failed to fetch checkin status'))
    },
    enabled: checkinEnabled && !!auth?.user,
    staleTime: 30000,
    retry: false,
  })

  const invalidateCheckinStatus = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['checkin-status'] })
  }, [queryClient])

  const checkedToday = checkinData?.stats?.checked_in_today === true

  const doCheckin = async (token?: string) => {
    setLoading(true)
    try {
      const res = await performCheckin(token)
      if (res.success && res.data) {
        toast.success(
          `${t('Check-in successful! Received')} ${formatQuotaWithCurrency(res.data.quota_awarded)}`
        )
        setTurnstileModalVisible(false)
        invalidateCheckinStatus()
        return
      }
      if (!token && turnstileEnabled) {
        if (!turnstileSiteKey) {
          toast.error(t('Turnstile is enabled but site key is empty.'))
          return
        }
        setTurnstileModalVisible(true)
        return
      }
      if (token && turnstileEnabled) {
        setTurnstileWidgetKey((v) => v + 1)
      }
      toast.error(res.message || t('Check-in failed'))
    } catch {
      toast.error(t('Check-in failed'))
    } finally {
      setLoading(false)
    }
  }

  const notifyAndGoSignIn = () => {
    toast.info(t('Please sign in to check in for quota rewards'))
    navigate({ to: '/sign-in', search: { redirect: location.href } })
  }

  if (!checkinEnabled) {
    return null
  }

  if (!auth?.user) {
    return (
      <Button
        size='sm'
        className='bg-amber-500 font-semibold text-white hover:bg-amber-500/90 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-400/90'
        onClick={notifyAndGoSignIn}
      >
        <CalendarCheck className='h-4 w-4' />
        {t('Sign in to check in')}
      </Button>
    )
  }

  return (
    <>
      <Dialog
        open={turnstileModalVisible}
        onOpenChange={(open) => {
          setTurnstileModalVisible(open)
          if (!open) {
            setTurnstileWidgetKey((v) => v + 1)
          }
        }}
        title={t('Security Check')}
        contentClassName='sm:max-w-md'
        contentHeight='auto'
        bodyClassName='space-y-4'
      >
        <div className='text-muted-foreground text-sm'>
          {t('Please complete the security check to continue.')}
        </div>
        <div className='flex justify-center py-4'>
          <Turnstile
            key={turnstileWidgetKey}
            siteKey={turnstileSiteKey}
            onVerify={(token) => {
              doCheckin(token)
            }}
            onExpire={() => {
              setTurnstileWidgetKey((v) => v + 1)
            }}
          />
        </div>
      </Dialog>

      <Button
        size='sm'
        className={cn(
          'bg-amber-500 font-semibold text-white hover:bg-amber-500/90 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-400/90',
          !checkedToday && 'animate-pulse'
        )}
        onClick={() => doCheckin()}
        disabled={loading || checkedToday}
      >
        <CalendarCheck className='h-4 w-4' />
        {checkedToday ? t('Checked in') : t('Check in now')}
      </Button>
    </>
  )
}
