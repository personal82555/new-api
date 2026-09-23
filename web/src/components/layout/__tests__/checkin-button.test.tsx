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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth-store'

import { CheckinButton } from '../components/checkin-button'

const { getCheckinStatusMock, performCheckinMock } = vi.hoisted(() => ({
  getCheckinStatusMock: vi.fn(),
  performCheckinMock: vi.fn(),
}))

vi.mock('@/hooks/use-status', () => ({
  useStatus: () => ({
    status: {
      checkin_enabled: true,
      turnstile_check: false,
      turnstile_site_key: '',
    },
    loading: false,
    error: null,
  }),
}))

vi.mock('@/features/profile/api', async () => {
  const actual = await vi.importActual('@/features/profile/api')
  return {
    ...(actual as object),
    getCheckinStatus: getCheckinStatusMock,
    performCheckin: performCheckinMock,
  }
})

const user = {
  id: 1,
  username: 'alice',
  display_name: 'Alice',
  role: 1,
}

function renderWithRouter(ui: React.ReactNode) {
  const rootRoute = createRootRoute({ component: () => ui })
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(<RouterProvider router={router} />)
}

let checkedInToday = false

function setupStatus(initialCheckedInToday: boolean) {
  checkedInToday = initialCheckedInToday
  getCheckinStatusMock.mockImplementation(() => ({
    success: true,
    data: {
      stats: {
        records: [],
        checked_in_today: checkedInToday,
        total_checkins: checkedInToday ? 1 : 0,
        total_quota: 0,
        checkin_count: checkedInToday ? 1 : 0,
      },
    },
  }))
}

function renderButton() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderWithRouter(
    <QueryClientProvider client={client}>
      <CheckinButton />
    </QueryClientProvider>
  )
}

describe('CheckinButton', () => {
  beforeEach(() => {
    performCheckinMock.mockImplementation(() => {
      checkedInToday = true
      return Promise.resolve({
        success: true,
        data: { quota_awarded: 50000 },
      })
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    useAuthStore.getState().auth.reset()
    getCheckinStatusMock.mockReset()
    performCheckinMock.mockReset()
  })

  it('shows the check-in prompt when the user has not checked in today', async () => {
    useAuthStore.getState().auth.setUser(user)
    setupStatus(false)
    renderButton()
    const button = await screen.findByRole('button', { name: 'Check in now' })
    expect(button).toBeEnabled()
  })

  it('prompts guests to sign in before checking in', async () => {
    useAuthStore.getState().auth.reset()
    setupStatus(false)
    renderButton()
    const button = await screen.findByRole('button', {
      name: 'Sign in to check in',
    })
    expect(button).toBeEnabled()
    expect(getCheckinStatusMock).not.toHaveBeenCalled()
  })

  it('performs check-in from the header and reflects the checked-in state', async () => {
    useAuthStore.getState().auth.setUser(user)
    setupStatus(false)
    renderButton()
    await userEvent.click(
      await screen.findByRole('button', { name: 'Check in now' })
    )
    await waitFor(() => {
      expect(performCheckinMock).toHaveBeenCalledWith(undefined)
    })
    await screen.findByRole('button', { name: 'Checked in' })
  })

  it('stays disabled and labelled as checked in once today check-in is recorded', async () => {
    useAuthStore.getState().auth.setUser(user)
    setupStatus(true)
    renderButton()
    const button = await screen.findByRole('button', { name: 'Checked in' })
    expect(button).toBeDisabled()
    await waitFor(() => {
      expect(getCheckinStatusMock).toHaveBeenCalledWith(
        (() => {
          const d = new Date()
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        })()
      )
    })
  })
})
