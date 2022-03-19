import path from 'path'
import { Configuration, Compilation, Compiler, sources, EnvironmentPlugin } from 'webpack'
import CopyPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

export default (env: string): Configuration => {
  const mode = ((env || process.env.NODE_ENV) as 'production' | 'development') || 'production'
  return {
    mode,
    entry: {
      background: path.join(__dirname, 'src', 'service', 'index.ts'),
      popup: path.join(__dirname, 'src', 'popup', 'index.ts')
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: (path) => {
        return path.chunk.name === 'background' ? 'background.js' : `js/${path.chunk.name}.js`
      }
    },
    devtool: mode === 'development' ? 'inline-source-map' : false,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
      extensions: ['.ts', '.tsx', '.js']
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          extractComments: false, // 禁止xxx.js.LICENSE.txt
          terserOptions: {
            mangle: true // 混淆破坏
          }
        })
      ]
    },
    plugins: [
      new EnvironmentPlugin(['npm_package_name', 'npm_package_version']),
      // Copy everything in context `public` to parent of output dir (dist)
      new CopyPlugin({
        patterns: [
          {
            from: '.',
            to: '.',
            context: 'public/',
            globOptions: {
              ignore: ['**/.DS_Store', '**/Thumbs.db']
            }
          }
        ]
      }),
      (compiler: Compiler): void => { // 精简插件形式
        const name = 'tagging-version' // 用于版本号标注
        // https://webpack.js.org/api/compiler-hooks/#make
        compiler.hooks.make.tap(name, compilation => {
          // https://webpack.js.org/api/compilation-hooks/#processassets { additionalAssets: true } 的简便写法
          compilation.hooks.processAdditionalAssets.tap({
            name,
            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
          }, (assets) => {
            Object.keys(assets).forEach(path => {
              if (path.endsWith('popup.html') || path.endsWith('manifest.json')) {
                // https://webpack.js.org/api/compilation-object/#updateasset
                // https://docs.npmjs.com/cli/v6/using-npm/scripts#packagejson-vars
                compilation.updateAsset(path, asset => new sources.RawSource(asset.source().toString().replace('__VERSION__', process.env.npm_package_version)))
              }
            })
          })
        })
      }
    ]
  }
}
