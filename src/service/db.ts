// 缓存
import Dexie from 'dexie'

export const DbName = 'SampleDB'
export const DbVersion = 1

class AppDb extends Dexie {
  messages: Dexie.Table<SampleDB, number>
  constructor () {
    super(DbName)
    this.version(DbVersion).stores({
      messages: '++id, timestamp'
    })
    this.messages = this.table('messages')
  }
}

export default new AppDb()
