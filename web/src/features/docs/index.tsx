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

import { PublicLayout } from '@/components/layout'
import { api } from '@/lib/api'

interface DocSection {
  id: string
  no: string
  title: string
  body: React.ReactNode
}

function CopyableCode({ script }: { script: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className='relative my-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-[13px] leading-7 text-slate-200'>
      <code className='font-mono whitespace-pre'>{script}</code>
      <button
        className='absolute top-2 right-2 rounded-md bg-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-600 hover:text-white'
        onClick={() => {
          navigator.clipboard.writeText(script)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      >
        {copied ? '已复制 ✓' : '复制'}
      </button>
    </div>
  )
}

const CURL_EXAMPLE = `curl https://ai.88531.cn/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-你的密钥" \\
  -d '{
    "model": "glm-5.3-flash",
    "messages": [
      {"role": "system", "content": "你是一个乐于助人的助手"},
      {"role": "user", "content": "你好，介绍一下你自己"}
    ]
  }'`

const PY_EXAMPLE = `from openai import OpenAI

client = OpenAI(
    api_key="sk-你的密钥",
    base_url="https://ai.88531.cn/v1"
)

resp = client.chat.completions.create(
    model="glm-5.3-flash",
    messages=[{"role": "user", "content": "你好"}]
)
print(resp.choices[0].message.content)`

const NODE_EXAMPLE = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-你的密钥",
  baseURL: "https://ai.88531.cn/v1",
});

const resp = await client.chat.completions.create({
  model: "glm-5.3-flash",
  messages: [{ role: "user", content: "你好" }],
});
console.log(resp.choices[0].message.content);`

export function Docs() {
  const { t } = useTranslation()
  const [active, setActive] = useState('intro')

  const sections: DocSection[] = [
    {
      id: 'intro',
      no: '01',
      title: '平台简介',
      body: (
        <div className='doc-body'>
          <p>
            本站是一个{' '}
            <b>AI 大模型聚合网关</b>：一个账号、一把密钥，即可使用站内接入的全部主流大模型（GLM、DeepSeek、Kimi、MiniMax、Qwen、Grok 等 30+ 个模型），按实际用量计费。
          </p>
          <h3>你能用它做什么</h3>
          <ul>
            <li>
              在<b>网页对话</b>里直接和模型聊天、写代码（无需安装任何软件）
            </li>
            <li>
              把本站接入 <b>ChatGPT 类客户端</b>
              （Cherry Studio、NextChat、LobeChat 等）
            </li>
            <li>
              给 <b>AI 编程工具</b>（opencode、Claude Code 类 CLI）当后端
            </li>
            <li>用 <b>API</b> 开发自己的应用</li>
          </ul>
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200'>
            💡 新用户注册即送 <b>¥0.1</b> 体验金，每天签到再领 <b>¥0.5</b>
            ，不用充值就能先体验。
          </div>
        </div>
      ),
    },
    {
      id: 'quick',
      no: '02',
      title: '三分钟快速上手',
      body: (
        <div className='doc-body'>
          <ol className='ml-6 list-decimal space-y-2 text-[15px]'>
            <li>
              <b>注册账号</b> —— 打开{' '}
              <a href='https://ai.88531.cn' className='font-semibold'>
                ai.88531.cn
              </a>
              ，点右上角「注册」。<a href='#register'>详见</a>
            </li>
            <li>
              <b>领额度</b> —— 注册自动送 ¥0.1；之后每天在控制台点「签到」再领
              ¥0.5。
            </li>
            <li>
              <b>开始使用</b> —— 最快方式：控制台 → Playground
              在线对话；或者创建 API 密钥接到你喜欢的客户端里。
            </li>
          </ol>
          <p>要解锁全部模型？充值或购买包月套餐。</p>
        </div>
      ),
    },
    {
      id: 'register',
      no: '03',
      title: '注册账号',
      body: (
        <div className='doc-body'>
          <ol className='ml-6 list-decimal space-y-2 text-[15px]'>
            <li>浏览器打开 <code>https://ai.88531.cn</code></li>
            <li>
              点击右上角 <code>登录/注册</code>，切换到「注册」选项卡
            </li>
            <li>
              填写 <b>用户名</b>、<b>邮箱</b>、<b>密码</b>（也可以使用第三方登录，若站内已开启）
            </li>
            <li>
              提交后自动登录进入控制台，系统已自动把你分入
              <span className='mx-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800'>
                试用
              </span>
              分组，并到账 <b>¥0.1</b> 体验金
            </li>
          </ol>
          <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
            ⚠️ 密码请牢记。忘记密码可用注册邮箱自助找回；邮箱要填真实可收信的。
          </div>
        </div>
      ),
    },
    {
      id: 'checkin',
      no: '04',
      title: '每日签到领额度',
      body: (
        <div className='doc-body'>
          <p>每天都可以免费领 <b>¥0.5</b> 额度：</p>
          <ol className='ml-6 list-decimal space-y-2 text-[15px]'>
            <li>登录后进入控制台</li>
            <li>
              也可以直接点导航栏最右侧的{' '}
              <code className='rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700'>
                🎁 每日签到
              </code>{' '}
              按钮
            </li>
            <li>额度实时到账，每天 0 点后可再次签到</li>
          </ol>
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800'>
            💡 ¥0.5 大约够 glm-5.3-flash 聊 50 轮左右，够体验和摸底质量。
          </div>
        </div>
      ),
    },
    {
      id: 'topup',
      no: '05',
      title: '充值与包月套餐',
      body: (
        <div className='doc-body'>
          <h3>方式一：单次充值（支付宝）</h3>
          <ol className='ml-6 list-decimal space-y-2 text-[15px]'>
            <li>控制台 → <b>钱包 / 充值</b></li>
            <li>
              选择充值金额（<b>¥1 / ¥5 / ¥10 / ¥30 / ¥100</b>
              ，或自定义最低 ¥1），选择 <b>支付宝</b>
            </li>
            <li>
              跳转支付宝完成付款，付款成功后<b>余额自动到账</b>
              ，页面会自动跳回本站
            </li>
          </ol>
          <h3>方式二：包月套餐（推荐）</h3>
          <p>
            前往{' '}
            <a href='/subscribe' className='font-semibold'>
              订阅套餐页
            </a>
            ：每月固定费用 + 额度周期重置 + 解锁分组权限。购买后自动升级分组，到期自动降回，支持支付宝与余额支付。
          </p>
        </div>
      ),
    },
    {
      id: 'group',
      no: '06',
      title: '分组说明（试用 / 正式）',
      body: (
        <table className='my-4 w-full border-collapse text-sm'>
          <tr className='bg-slate-100 text-left'>
            <th className='border p-2'> </th>
            <th className='border p-2'>
              <span className='rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800'>
                试用分组
              </span>
            </th>
            <th className='border p-2'>
              <span className='rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-800'>
                正式分组
              </span>
            </th>
          </tr>
          <tr>
            <td className='border p-2 font-medium'>如何获得</td>
            <td className='border p-2'>注册自动进入</td>
            <td className='border p-2'>
              购买套餐自动升级（或管理员调整）
            </td>
          </tr>
          <tr>
            <td className='border p-2 font-medium'>可用模型</td>
            <td className='border p-2'>
              11 个高性价比模型：glm-5.3-flash、deepseek-v4-flash、qwen3.8-flash、minimax-m3、mimo-v2.5、glm-5、kimi-k2.5 等
            </td>
            <td className='border p-2'>
              全部 30+ 模型（含 kimi-k3、glm-5.3、grok 等旗舰）
            </td>
          </tr>
          <tr>
            <td className='border p-2 font-medium'>适合</td>
            <td className='border p-2'>新手体验、轻度使用</td>
            <td className='border p-2'>重度使用、需要旗舰模型</td>
          </tr>
        </table>
      ),
    },
    {
      id: 'token',
      no: '07',
      title: '创建 API 密钥',
      body: (
        <div className='doc-body'>
          <p>
            要在客户端或代码里使用本站，需要先创建一个 API 密钥（sk- 开头）：
          </p>
          <ol className='ml-6 list-decimal space-y-2 text-[15px]'>
            <li>
              控制台 → <b>令牌（API Keys）</b> → 添加令牌
            </li>
            <li>
              填写名称即可，其余建议保持默认：<b>额度</b>{' '}
              设为「无限」跟随账户余额扣费；<b>模型范围</b> 留空；<b>过期时间</b>{' '}
              留空
            </li>
            <li>提交后复制形如 <code>sk-xxxxxxxx</code> 的密钥</li>
          </ol>
          <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
            ⚠️ 密钥等于钱包密码，不要发到群里或提交到公开仓库。泄露后立即在后台删除重建。
          </div>
        </div>
      ),
    },
    {
      id: 'pricing',
      no: '08',
      title: '查看模型与价格',
      body: (
        <div className='doc-body'>
          <p>
            打开{' '}
            <a href='/pricing' className='font-semibold'>
              模型广场（/pricing）
            </a>{' '}
            查看全部模型的实时价格，页面顶部会显示当前人民币汇率。
          </p>
          <ul className='ml-6 list-disc space-y-2 text-[15px]'>
            <li>模型按 token（字元）计费，分「输入」和「输出」两档价</li>
            <li>
              实际扣费 = 输入 token × 输入价 + 输出 token ×
              输出价 + 命中缓存部分 × 缓存价（更便宜）
            </li>
            <li>1 token ≈ 0.5~0.7 个汉字，或 0.75 个英文单词</li>
          </ul>
          <h3 className='mt-4 text-base font-semibold text-blue-800'>举例</h3>
          <p>
            用 <code>glm-5.3-flash</code>{' '}
            聊一轮（约 2000 字输入 + 1000 字输出）合计约 <b>¥0.006</b>
            ，一分钱能聊好几轮。
          </p>
        </div>
      ),
    },
    {
      id: 'playground',
      no: '09',
      title: '在线对话（Playground）',
      body: (
        <div className='doc-body'>
          <ol className='ml-6 list-decimal space-y-2 text-[15px]'>
            <li>控制台 → <b>Playground（在线对话）</b></li>
            <li>顶部选择模型（试用分组可选 glm-5.3-flash 等 11 个）</li>
            <li>
              输入问题，回车发送。按 token 正常计费，可在「日志」页查看每次消耗
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'client',
      no: '10',
      title: '接入第三方客户端',
      body: (
        <div className='doc-body'>
          <p>
            所有支持「OpenAI 兼容接口」的客户端都能接入本站：
          </p>
          <table className='my-3 w-full border-collapse text-sm'>
            <tr className='bg-slate-100 text-left'>
              <th className='border p-2'>配置项</th>
              <th className='border p-2'>填写内容</th>
            </tr>
            <tr>
              <td className='border p-2'>API 地址 (Base URL)</td>
              <td className='border p-2'>
                <code>https://ai.88531.cn/v1</code>
              </td>
            </tr>
            <tr>
              <td className='border p-2'>API 密钥 (Key)</td>
              <td className='border p-2'>你的令牌 <code>sk-xxxxxxxx</code></td>
            </tr>
            <tr>
              <td className='border p-2'>模型 (Model)</td>
              <td className='border p-2'>
                如 <code>glm-5.3-flash</code>
              </td>
            </tr>
          </table>
          <h3 className='mt-3 text-base font-semibold text-blue-800'>
            Cherry Studio（桌面端）
          </h3>
          <p className='text-[15px]'>
            设置 → 模型服务 → 添加 OpenAI 兼容 Provider → API 地址填
            <code className='mx-1'>https://ai.88531.cn/v1</code>
            → 填密钥 → 获取模型列表。
          </p>
          <h3 className='mt-3 text-base font-semibold text-blue-800'>
            opencode 等 AI 编程 CLI
          </h3>
          <p className='text-[15px]'>
            配置 OpenAI 兼容 provider：base_url 填{' '}
            <code>https://ai.88531.cn/v1</code>，API key 填本站令牌。
          </p>
        </div>
      ),
    },
    {
      id: 'api',
      no: '11',
      title: 'API 调用示例',
      body: (
        <div className='doc-body'>
          <p>本站完全兼容 OpenAI 接口格式：</p>
          <CopyableCode script={CURL_EXAMPLE} />
          <h3 className='mt-4 text-base font-semibold text-blue-800'>
            Python (openai 库)
          </h3>
          <CopyableCode script={PY_EXAMPLE} />
          <h3 className='mt-4 text-base font-semibold text-blue-800'>
            Node.js (openai 库)
          </h3>
          <CopyableCode script={NODE_EXAMPLE} />
          <p className='mt-3 text-[15px]'>
            流式输出：请求里加 <code>{'"stream": true'}</code>
            ，返回 Server-Sent Events 逐段输出。
          </p>
        </div>
      ),
    },
    {
      id: 'faq',
      no: '12',
      title: '常见问题',
      body: (
        <div className='doc-body'>
          <h3 className='font-semibold'>提示 401 / 无效令牌？</h3>
          <ul className='text-muted-foreground ml-6 list-disc space-y-1 text-[15px]'>
            <li>检查密钥是否复制完整（sk- 开头，别多空格）</li>
            <li>令牌是否被删除、禁用或已过期</li>
          </ul>
          <h3 className='mt-4 font-semibold'>提示「无可用渠道」或模型不存在？</h3>
          <ul className='text-muted-foreground ml-6 list-disc space-y-1 text-[15px]'>
            <li>
              试用分组只有 11 个便宜模型，旗舰模型需要正式分组（买套餐或联系管理员）
            </li>
            <li>检查模型 ID 拼写是否与模型广场一致</li>
          </ul>
          <h3 className='mt-4 font-semibold'>提示余额不足？</h3>
          <ul className='text-muted-foreground ml-6 list-disc space-y-1 text-[15px]'>
            <li>去签到、充值，或购买套餐</li>
            <li>令牌若单独设了额度上限，令牌额度用完也会报错</li>
          </ul>
          <h3 className='mt-4 font-semibold'>扣了多少费在哪里看？</h3>
          <p className='text-[15px]'>
            控制台 → <b>日志</b>：每条请求的 token 用量和扣费明细；<b>钱包</b>{' '}
            页看余额与充值记录。
          </p>
          <h3 className='mt-4 font-semibold'>支持流式输出吗？</h3>
          <p className='text-[15px]'>
            支持。请求加 <code>{'"stream": true'}</code> 即可。
          </p>
        </div>
      ),
    },
  ]

  useEffect(() => {
    const onScroll = () => {
      const pos = window.scrollY + 100
      let cur = sections[0]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const els: { el: HTMLElement; id: string }[] = []
      Object.values(sections).forEach((s) => {
        const el = document.getElementById('doc-' + s.id)
        if (el) els.push({ el, id: s.id })
      })
      for (const s of els) {
        if (s.el.offsetTop <= pos) setActive(s.id)
      }
      void cur
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <PublicLayout>
      <div className='mx-auto flex w-full max-w-[1200px] flex-col px-4 pt-8 pb-16 sm:px-6 lg:flex-row'>
        {/* 左侧导航 */}
        <aside className='bg-card sticky top-16 mb-6 h-fit shrink-0 rounded-xl border p-2 lg:sticky lg:mb-0 lg:w-60 lg:self-start'>
          <nav className='flex flex-wrap gap-1 lg:flex-col'>
            {sections.map((s) => (
              <a
                key={s.id}
                href={'#doc-' + s.id}
                className={
                  'rounded-lg border-l-2 px-3 py-2 text-sm lg:block ' +
                  (active === s.id
                    ? 'border-blue-500 bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950'
                    : 'text-muted-foreground border-transparent hover:bg-accent')
                }
                onClick={() => {}}
              >
                <span className='mr-2 text-xs opacity-60'>{s.no}</span>
                {s.title}
              </a>
            ))}
          </nav>
        </aside>
        {/* 右侧内容 */}
        <main className='min-w-0 flex-1 lg:pl-10'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold sm:text-3xl'>
              {t('Using This Site')}
            </h1>
            <p className='text-muted-foreground mt-2 text-sm'>
              从注册到使用的新手完整指南
            </p>
          </div>
          {sections.map((s) => (
            <section key={s.id} id={'doc-' + s.id} className='mb-14'>
              <h2 className='mt-10 mb-5 border-b pb-2 text-2xl font-bold tracking-tight text-foreground'>
                <span className='mr-2 text-blue-600'>{s.no}</span>
                {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </main>
      </div>
    </PublicLayout>
  )
}

// 使用文档数据供其他组件复用
export { sections as docSections }
