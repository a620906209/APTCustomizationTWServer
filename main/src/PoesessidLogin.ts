import { BrowserWindow } from 'electron'
import type { ServerEvents } from './server'

const LOGIN_URL = 'https://pathofexile.tw/login'
const COOKIE_DOMAIN = 'pathofexile.tw'
const LOGIN_TIMEOUT_MS = 5 * 60 * 1000

export class PoesessidLogin {
  private window: BrowserWindow | null = null

  constructor (
    private server: ServerEvents
  ) {
    this.server.onEventAnyClient('CLIENT->MAIN::user-action', ({ action }) => {
      if (action === 'poesessid-login') {
        this.start()
      }
    })
  }

  private start () {
    if (this.window) {
      this.window.focus()
      return
    }

    const win = new BrowserWindow({
      width: 480,
      height: 720,
      webPreferences: {
        allowRunningInsecureContent: false,
        spellcheck: false
      }
    })
    this.window = win

    let settled = false

    const finish = (payload: { status: 'success', value: string } | { status: 'cancelled' | 'timeout' | 'error' }) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      this.server.sendEventTo('broadcast', {
        name: 'MAIN->CLIENT::poesessid-login-result',
        payload
      })
      if (!win.isDestroyed()) win.close()
    }

    const timeout = setTimeout(() => {
      finish({ status: 'timeout' })
    }, LOGIN_TIMEOUT_MS)

    const checkCookie = async () => {
      if (settled) return
      const cookies = await win.webContents.session.cookies.get({
        domain: COOKIE_DOMAIN,
        name: 'POESESSID'
      })
      if (cookies[0]) {
        finish({ status: 'success', value: cookies[0].value })
      }
    }

    win.webContents.on('did-navigate', checkCookie)
    win.webContents.on('did-navigate-in-page', checkCookie)
    win.webContents.on('did-fail-load', (_event, errorCode) => {
      // -3 is ERR_ABORTED, raised for normal in-page navigations/redirects; not a real failure
      if (errorCode !== -3) finish({ status: 'error' })
    })

    win.on('closed', () => {
      this.window = null
      clearTimeout(timeout)
      finish({ status: 'cancelled' })
    })

    win.loadURL(LOGIN_URL)
  }
}
