// 保留 PakePlus 原有的调试输出
console.log(
  '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
  'color:orangered;font-weight:bolder'
)

// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
  const origin = e.target.closest('a')
  const isBaseTargetBlank = document.querySelector('head base[target="_blank"]')
  console.log('origin', origin, isBaseTargetBlank)
  if (
    (origin && origin.href && origin.target === '_blank') ||
    (origin && origin.href && isBaseTargetBlank)
  ) {
    e.preventDefault()
    console.log('handle origin', origin)
    location.href = origin.href
  } else {
    console.log('not handle origin', origin)
  }
}

document.addEventListener('click', hookClick, { capture: true })

// —— 在这里开始新增：置顶按钮逻辑 ——

;(async () => {
  // 先尝试从全局注入的 Tauri API 拿窗口对象
  let appWindow
  if (window.__TAURI__ && window.__TAURI__.window) {
    // 当 tauri.conf.json 中 build.withGlobalTauri = true 时可用
    appWindow = window.__TAURI__.window.getCurrent()
  } else {
    // 否则走动态 import（需项目中已安装 @tauri-apps/api）
    try {
      const { appWindow: importedAppWindow } = await import('@tauri-apps/api/window')
      appWindow = importedAppWindow
    } catch (e) {
      console.error('无法加载 Tauri 窗口 API，置顶功能不可用：', e)
      return
    }
  }

  // 创建按钮
  const btn = document.createElement('button')
  btn.id = 'tauri-pin-btn'
  btn.textContent = '置顶'
  btn.dataset.pinned = 'false'
  Object.assign(btn.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: '9999',
    padding: '6px 10px',
    fontSize: '14px',
    cursor: 'pointer'
  })

  btn.addEventListener('click', async () => {
    const pinned = btn.dataset.pinned === 'true'
    try {
      await appWindow.setAlwaysOnTop(!pinned)
      btn.dataset.pinned = String(!pinned)
      btn.textContent = pinned ? '置顶' : '取消置顶'
    } catch (e) {
      console.error('置顶操作失败：', e)
    }
  })

  document.body.appendChild(btn)
})()
