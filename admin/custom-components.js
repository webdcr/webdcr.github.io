;(function registerAudioPlayerComponent() {
  function setup() {
    if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') {
      return false
    }

    window.CMS.registerEditorComponent({
      id: 'audioPlayer',
      label: 'Audio Player',
      fields: [
        {
          name: 'src',
          label: 'Audio source URL',
          widget: 'string',
          hint: 'Example: /assets/audio/news/malcolmxinterview.mp3'
        }
      ],
      pattern: /\{\%\s*include\s+audio-player\.html\s+src="(?<src>[^"]+)"\s*\%\}/,
      fromBlock(match) {
        return { src: match?.groups?.src || match[1] || '' }
      },
      toBlock(values) {
        const src = values?.src?.trim() || ''
        return src ? `{% include audio-player.html src="${src}" %}` : ''
      },
      toPreview(values) {
        const src = values?.src?.trim()
        if (!src) {
          return '<em>Audio player (no source set)</em>'
        }
        return `
          <div style="padding: 1rem; border: 1px solid #555; border-radius: 6px; font-size: 0.9rem;">
            <strong>Audio player</strong><br />
            <code>${src}</code>
          </div>
        `
      }
    })

    return true
  }

  if (!setup()) {
    document.addEventListener('sveltia:ready', setup, { once: true })
  }
})()
