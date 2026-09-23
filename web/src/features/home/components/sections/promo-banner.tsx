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
import { Link } from '@tanstack/react-router'

export function PromoBanner() {
  return (
    <div className='relative z-30 flex justify-center px-4 pt-[200px] pb-[200px]'>
      <Link
        to='/docs'
        className='animate-pulse rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 px-8 py-3 shadow-[0_0_40px_rgba(168,85,247,0.6),0_0_80px_rgba(34,211,238,0.35)] ring-1 ring-white/30 backdrop-blur-sm transition-transform duration-300 hover:scale-105 active:scale-95'
        title='前往文档'
      >
        <p className='text-center text-4xl font-black tracking-[0.2em] sm:text-5xl'>
          <span className='text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.95)]'>
            全网热门
          </span>
          <span className='text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.95)]'>
            大模型
          </span>
          <span className='text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.95)]'>
            限时
          </span>
          <span className='text-rose-300 drop-shadow-[0_0_12px_rgba(251,113,133,0.95)]'>
            免费
          </span>
        </p>
      </Link>
    </div>
  )
}
