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
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { isFreeModel } from '../lib/model-helpers'
import type { PricingModel } from '../types'

export interface FreeModelsBannerProps {
  models: PricingModel[]
  onShowFree: () => void
  className?: string
}

export function FreeModelsBanner(props: FreeModelsBannerProps) {
  const { t } = useTranslation()
  const freeModels = props.models.filter((model) => isFreeModel(model))
  if (freeModels.length === 0) return null

  const names = freeModels
    .slice(0, 6)
    .map((model) => model.model_name)
    .join(', ')
  const suffix = freeModels.length > 6 ? ` +${freeModels.length - 6}` : ''

  return (
    <div
      role='group'
      aria-label={t("Today's Free Models")}
      className={cn(
        'relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 sm:p-4',
        props.className
      )}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_20%_50%,oklch(0.8_0.16_95/12%)_0%,transparent_70%),radial-gradient(ellipse_50%_80%_at_80%_50%,oklch(0.9_0.16_100/10%)_0%,transparent_70%)]'
      />
      <div className='relative flex flex-wrap items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <Sparkles aria-hidden className='free-banner-shine-dot size-7 shrink-0' />
          <div className='min-w-0'>
            <p className='flex items-center gap-2 text-xl leading-tight font-extrabold sm:text-3xl'>
              <span className='free-banner-shine-text'>
                {t("Today's Free Models")}
              </span>
              <span
                className='bg-muted text-muted-foreground self-center rounded-md px-2 py-0.5 text-xs font-semibold sm:text-sm'
                aria-label={t('{{count}} free models available', {
                  count: freeModels.length,
                })}
              >
                {freeModels.length}
              </span>
            </p>
            <p
              className='text-muted-foreground mt-1 truncate text-xs sm:text-[13px]'
              title={names + suffix}
            >
              {names}
              {suffix}
            </p>
          </div>
        </div>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={props.onShowFree}
          className='border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400'
          aria-label={t('View all free models')}
        >
          {t('View all free models')}
        </Button>
      </div>
    </div>
  )
}
