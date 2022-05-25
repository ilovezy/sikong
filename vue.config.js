const {defineConfig} = require('@vue/cli-service')
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = '司空'
        return args
      })
    config.resolve.alias
      .set('@', resolve('src/render'))
      .set('utils', resolve('src/utils'))
      .set('assets', resolve('src/render/assets'))
      .set('components', resolve('src/render/components'))
      .set('layout', resolve('src/render/layout'))
      .set('views', resolve('src/render/views'))
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      nodeModulesPath: ['../../node_modules', './node_modules'],
      builderOptions: {
        beforeBuild: "build/scripts/modifyFontFilepath.js",
        // 产品名称
        productName: '司空',
        // 修改appId是，需要同时修改backgroud.js里面设置的appUserModelId，设置见：app.setAppUserModelId(xxx)
        appId: 'shop.liaozalie.sikong',
        compression: 'normal',
        artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
        protocols: {
          name: "sikong-linking",
          schemes: ["app"]
        },
        mac: {
          icon: 'public/logo/icon.icns',
          extendInfo: {
            NSCameraUsageDescription: "This app requires camera access to record video.",
            NSMicrophoneUsageDescription: "This app requires microphone access to record audio."
          },
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: "build/mac/entitlements.mac.plist",
          entitlementsInherit: "build/mac/entitlements.mac.plist",
          target: [
            {
              target: 'default',
              arch: [
                'universal'
              ]

            }
          ]
        },
        linux: {
          category: "Chat",
          executableName: "wildfireChat",
          target: [
            'deb',
            'AppImage'
          ]
        },
        win: {
          icon: 'public/logo/icon.ico',
          target: "nsis",
        },
        nsis: {
          oneClick: false,
          installerIcon: 'public/logo/icon.ico',
          allowToChangeInstallationDirectory: true,
          artifactName: '${productName}-${version}-${os}-${arch}-setup.${ext}',
          deleteAppDataOnUninstall: true,
          perMachine: false,
          createDesktopShortcut: true,
          shortcutName: "sikong"
        }
      }
    }
  }
})
