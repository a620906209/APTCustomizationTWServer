<template>
  <div class="max-w-md p-2">
    <div class="mb-2">
      <div class="flex-1 mb-1">{{ t(':language') }}</div>
      <select v-model="language" class="p-1 rounded bg-gray-700 w-24">
        <option value="en">English</option>
        <option value="ru">Русский</option>
        <option value="cmn-Hant">正體中文</option>
        <option value="ko">한국어</option>
      </select>
    </div>
    <div class="mb-2" v-if="language === 'cmn-Hant'">
      <div class="flex-1 mb-1">{{ t('realm') }}</div>
      <div class="flex gap-x-4">
        <ui-radio v-model="realm" value="pc-ggg">{{ t('realm_intl') }}</ui-radio>
        <ui-radio v-model="realm" value="pc-garena">{{ t('Hotcool') }}</ui-radio>
      </div>
    </div>
    <ui-checkbox class="mb-4" v-if="language !== 'en' && realm === 'pc-ggg'"
      v-model="useIntlSite" :disabled="forcedIntlSite"
      :class="{ 'text-gray-500': forcedIntlSite }">{{ t(':use_intl_site') }} <span class="bg-gray-200 text-gray-900 rounded px-1">www.pathofexile.com</span></ui-checkbox>
    <div class="mb-4" v-if="language === 'cmn-Hant' && realm === 'pc-garena'">
      <div class="flex-1 mb-1">POESESSID</div>
      <div class="flex gap-1">
        <input v-model.trim="poesessid" type="password"
          class="rounded bg-gray-900 px-1 block w-full font-sans" placeholder="貼上你的 POESESSID">
        <button type="button" class="rounded bg-gray-700 px-2 whitespace-nowrap"
          :disabled="poesessidLoginStatus === 'pending'"
          @click="startPoesessidLogin">登入</button>
      </div>
      <div class="text-gray-500 mt-1" v-if="poesessidLoginStatus === 'pending'">請在彈出視窗中登入 pathofexile.tw…</div>
      <div class="text-red-500 mt-1" v-else-if="poesessidLoginStatus === 'cancelled'">登入已取消</div>
      <div class="text-red-500 mt-1" v-else-if="poesessidLoginStatus === 'timeout'">登入逾時，請重試</div>
      <div class="text-red-500 mt-1" v-else-if="poesessidLoginStatus === 'error'">登入視窗發生錯誤，請重試</div>
      <div class="text-green-500 mt-1" v-else-if="poesessidLoginStatus === 'success'">已自動取得 POESESSID</div>
    </div>
    <div class="mb-4 mt-4">
      <div class="flex-1 mb-1">{{ t(':font_size') }}</div>
      <div class="flex gap-1">
        <input v-model.number="fontSize" class="rounded bg-gray-900 px-1 block w-16 font-poe text-center" />
        <span>px</span>
      </div>
    </div>
    <ui-checkbox class="mb-4"
      v-model="restoreClipboard">{{ t(':restore_clipboard') }}</ui-checkbox>
    <div class="mb-2">
      <div class="flex-1 mb-1">{{ t(':poe_log_file') }}</div>
      <input v-model.trim="clientLog"
        class="rounded bg-gray-900 px-1 block w-full font-sans" placeholder="...?/Grinding Gear Games/Path of Exile/logs/Client.txt">
    </div>
    <div class="mb-4">
      <div class="flex-1 mb-1">{{ t(':poe_cfg_file') }}</div>
      <input v-model.trim="gameConfig"
        class="rounded bg-gray-900 px-1 block w-full font-sans" placeholder="...?/My Games/Path of Exile/production_Config.ini">
    </div>
    <hr class="mb-4 mx-8 border-gray-700">
    <div class="mb-2">
      <div class="mb-1">{{ t(':overlay_bg') }}</div>
      <div class="flex gap-4 items-baseline">
        <input v-model="overlayBackground" class="rounded bg-gray-900 px-1 block w-48 font-poe text-center" />
        <ui-radio v-model="overlayBackground" value="rgba(255, 255, 255, 0)">{{ t(':overlay_bg_none') }}</ui-radio>
      </div>
    </div>
    <ui-checkbox class="mb-2" v-if="overlayBackground !== 'rgba(255, 255, 255, 0)'"
      v-model="overlayBackgroundClose">{{ t(':overlay_bg_focus_game') }}</ui-checkbox>
    <ui-checkbox class="mb-4"
      v-model="showAttachNotification">{{ t(':show_overlay_ready') }}</ui-checkbox>
    <div class="mb-4">
      <div class="flex-1 mb-1">{{ t(':window_title') }} <span class="bg-gray-200 text-gray-900 rounded px-1">{{ t('Restart required') }}</span></div>
      <input v-model="windowTitle" class="rounded bg-gray-900 px-1 block w-full mb-1 font-poe" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onUnmounted } from 'vue'
import { useI18nNs } from '@/web/i18n'
import UiRadio from '@/web/ui/UiRadio.vue'
import UiCheckbox from '@/web/ui/UiCheckbox.vue'
import { configModelValue, configProp } from './utils'
import { AppConfig } from '@/web/Config'
import { Host } from '@/web/background/IPC'

export default defineComponent({
  name: 'settings.general',
  components: { UiRadio, UiCheckbox },
  props: configProp(),
  setup (props) {
    const { t } = useI18nNs('settings')

    const poesessidLoginStatus = ref<'idle' | 'pending' | 'success' | 'cancelled' | 'timeout' | 'error'>('idle')
    function startPoesessidLogin () {
      poesessidLoginStatus.value = 'pending'
      Host.sendEvent({
        name: 'CLIENT->MAIN::user-action',
        payload: { action: 'poesessid-login' }
      })
    }
    const poesessidLoginController = Host.onEvent('MAIN->CLIENT::poesessid-login-result', (result) => {
      poesessidLoginStatus.value = result.status
      if (result.status === 'success') {
        props.config.poesessid = result.value
      }
    })
    onUnmounted(() => {
      poesessidLoginController.abort()
    })

    return {
      poesessidLoginStatus,
      startPoesessidLogin,
      t,
      fontSize: configModelValue(() => props.config, 'fontSize'),
      overlayBackgroundClose: configModelValue(() => props.config, 'overlayBackgroundClose'),
      overlayBackground: configModelValue(() => props.config, 'overlayBackground'),
      clientLog: configModelValue(() => props.config, 'clientLog'),
      gameConfig: configModelValue(() => props.config, 'gameConfig'),
      language: computed<typeof props.config.language>({
        get () { return props.config.language },
        set (value) {
          props.config.language = value
          AppConfig().language = value
          if (value !== 'cmn-Hant') {
            props.config.realm = 'pc-ggg'
          }
          props.config.useIntlSite = (props.config.realm === 'pc-ggg' && value === 'cmn-Hant')
        }
      }),
      realm: computed<typeof props.config.realm>({
        get () { return props.config.realm },
        set (value) {
          props.config.realm = value
          props.config.useIntlSite = (value === 'pc-ggg' && props.config.language === 'cmn-Hant')
        }
      }),
      useIntlSite: configModelValue(() => props.config, 'useIntlSite'),
      forcedIntlSite: computed(() => props.config.realm === 'pc-ggg' && props.config.language === 'cmn-Hant'),
      restoreClipboard: configModelValue(() => props.config, 'restoreClipboard'),
      showAttachNotification: configModelValue(() => props.config, 'showAttachNotification'),
      windowTitle: configModelValue(() => props.config, 'windowTitle'),
      poesessid: configModelValue(() => props.config, 'poesessid')
    }
  }
})
</script>
